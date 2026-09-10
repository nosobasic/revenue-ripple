#!/usr/bin/env node
/**
 * Normalize course MP4 keys in S3 to:
 *   courses/{slug}/intro.mp4
 *   courses/{slug}/module-N.mp4
 *
 * Usage:
 *   node scripts/normalize-course-videos.mjs           # dry-run
 *   node scripts/normalize-course-videos.mjs --apply   # perform renames
 *
 * Env:
 *   S3_VIDEO_BUCKET (default: revenue-ripple-prod-videos-359143808201)
 *   AWS_DEFAULT_REGION (default: us-east-1)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const BUCKET = process.env.S3_VIDEO_BUCKET || 'revenue-ripple-prod-videos-359143808201';
const REGION = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseCourses() {
  const text = readFileSync(join(root, 'src/data/courses.js'), 'utf8');
  const slugMatches = [...text.matchAll(/slug:\s*'([^']+)'/g)];
  const courses = [];

  for (let i = 0; i < slugMatches.length; i++) {
    const slug = slugMatches[i][1];
    const start = slugMatches[i].index;
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : text.length;
    const section = text.slice(start, end);
    const modules = [...new Set([...section.matchAll(/id:\s*(\d+)/g)].map((m) => Number(m[1])))].sort(
      (a, b) => a - b
    );
    courses.push({
      slug,
      hasIntro: /introVideo/.test(section),
      modules,
    });
  }

  return courses;
}

function awsJson(args) {
  const out = execFileSync('aws', args, {
    env: { ...process.env, AWS_DEFAULT_REGION: REGION },
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(out || 'null');
}

function listMp4s() {
  const data = awsJson([
    's3api',
    'list-objects-v2',
    '--bucket',
    BUCKET,
    '--prefix',
    'courses/',
    '--output',
    'json',
  ]);
  return (data.Contents || [])
    .filter((o) => o.Key && o.Key.toLowerCase().endsWith('.mp4') && o.Size > 0)
    .map((o) => ({ key: o.Key, size: o.Size, name: o.Key.split('/').pop() }));
}

function basename(key) {
  return key.split('/').pop() || key;
}

function detectIntro(name) {
  const n = name.toLowerCase();
  return (
    /\(intro\)/.test(n) ||
    /_intro[_.\s(]/.test(n) ||
    /-intro[_.\s(]/.test(n) ||
    /intro_v\d/.test(n) ||
    /bots_intro/.test(n)
  );
}

function detectModuleNumber(name) {
  const n = name.toLowerCase();
  let m = n.match(/\(module[_\s-]?(\d+)\)/);
  if (m) return Number(m[1]);
  m = n.match(/module[_\s-]?(\d+)/);
  if (m) return Number(m[1]);
  m = n.match(/(?:^|[_\s-])(\d+)(?:_v\d)?(?:\s*\(|\.mp4)/);
  // mindset_mastery_1_v1, mindeset_mastery_2
  m = n.match(/mastery[_\s-]?(\d+)/);
  if (m) return Number(m[1]);
  return null;
}

function mapCourse(course, files) {
  const warnings = [];
  const mapping = []; // { from, to, role }
  const expectedModuleCount = course.modules.length;
  const expectedTotal = (course.hasIntro ? 1 : 0) + expectedModuleCount;

  if (!files.length) {
    warnings.push(`No MP4s found under courses/${course.slug}/`);
    return { mapping, warnings, expectedTotal, found: 0 };
  }

  const used = new Set();
  let introFile = null;
  const moduleById = new Map();

  // Explicit intro markers
  if (course.hasIntro) {
    const intros = files.filter((f) => detectIntro(f.name));
    if (intros.length === 1) {
      introFile = intros[0];
      used.add(introFile.key);
    } else if (intros.length > 1) {
      introFile = intros.sort((a, b) => a.size - b.size)[0];
      used.add(introFile.key);
      warnings.push(`Multiple intro-like files; picked smallest: ${introFile.name}`);
    }
  }

  // Numbered 1..N with no intro marker and count === expectedTotal:
  // treat #1 as intro and shift remaining numbers down (shoestring / mindset).
  if (course.hasIntro && !introFile && files.length === expectedTotal) {
    const numbered = files
      .map((f) => ({ f, num: detectModuleNumber(f.name) }))
      .filter((x) => x.num != null)
      .sort((a, b) => a.num - b.num);
    const nums = numbered.map((x) => x.num);
    const consecutive =
      numbered.length === files.length &&
      nums[0] === 1 &&
      nums.every((n, i) => n === i + 1);

    if (consecutive) {
      introFile = numbered[0].f;
      used.add(introFile.key);
      for (let i = 1; i < numbered.length; i++) {
        const moduleId = course.modules[i - 1];
        if (moduleId == null) break;
        moduleById.set(moduleId, numbered[i].f);
        used.add(numbered[i].f.key);
      }
      warnings.push(
        `No intro marker; shifted numbered files so #1 → intro, rest → modules`
      );
    }
  }

  // Explicit module numbers for remaining files
  for (const f of files) {
    if (used.has(f.key)) continue;
    const num = detectModuleNumber(f.name);
    if (num != null && course.modules.includes(num) && !moduleById.has(num)) {
      moduleById.set(num, f);
      used.add(f.key);
    }
  }

  let leftovers = files.filter((f) => !used.has(f.key));

  // If intro still missing: use smallest leftover (typical short intros)
  if (course.hasIntro && !introFile && leftovers.length) {
    leftovers = leftovers.sort((a, b) => a.size - b.size || a.name.localeCompare(b.name));
    introFile = leftovers[0];
    used.add(introFile.key);
    leftovers = leftovers.slice(1);
    warnings.push(`No intro marker; using smallest file as intro: ${introFile.name}`);
  }

  // Assign leftovers to missing module IDs in sorted name / number order
  leftovers = leftovers.sort((a, b) => {
    const na = detectModuleNumber(a.name);
    const nb = detectModuleNumber(b.name);
    if (na != null && nb != null && na !== nb) return na - nb;
    return a.name.localeCompare(b.name);
  });

  const missingModules = course.modules.filter((id) => !moduleById.has(id));
  for (const id of missingModules) {
    if (!leftovers.length) break;
    const f = leftovers.shift();
    moduleById.set(id, f);
    used.add(f.key);
  }

  if (introFile) {
    mapping.push({
      from: introFile.key,
      to: `courses/${course.slug}/intro.mp4`,
      role: 'intro',
      size: introFile.size,
    });
  } else if (course.hasIntro) {
    warnings.push('Expected intro but none mapped');
  }

  for (const id of course.modules) {
    const f = moduleById.get(id);
    if (f) {
      mapping.push({
        from: f.key,
        to: `courses/${course.slug}/module-${id}.mp4`,
        role: `module-${id}`,
        size: f.size,
      });
    } else {
      warnings.push(`Missing mapping for module-${id}`);
    }
  }

  if (leftovers.length) {
    warnings.push(
      `Unmapped leftover file(s): ${leftovers.map((f) => f.name).join(' | ')}`
    );
  }

  if (files.length !== expectedTotal) {
    warnings.push(`File count ${files.length} vs expected ${expectedTotal}`);
  }

  return { mapping, warnings, expectedTotal, found: files.length };
}

function s3Mv(fromKey, toKey) {
  if (fromKey === toKey) return;
  const from = `s3://${BUCKET}/${fromKey}`;
  const to = `s3://${BUCKET}/${toKey}`;
  execFileSync('aws', ['s3', 'mv', from, to], {
    env: { ...process.env, AWS_DEFAULT_REGION: REGION },
    stdio: 'inherit',
  });
}

function main() {
  const courses = parseCourses();
  const allFiles = listMp4s();
  const bySlug = new Map();

  for (const f of allFiles) {
    const parts = f.key.split('/');
    const slug = parts[1];
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(f);
  }

  console.log(`Bucket: ${BUCKET}`);
  console.log(`Region: ${REGION}`);
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Courses in courses.js: ${courses.length}`);
  console.log(`MP4 objects under courses/: ${allFiles.length}\n`);

  let moveCount = 0;
  let warnCount = 0;

  for (const course of courses) {
    const files = bySlug.get(course.slug) || [];
    const { mapping, warnings } = mapCourse(course, files);
    console.log(`\n=== ${course.slug} (${files.length} files) ===`);

    for (const w of warnings) {
      warnCount += 1;
      console.log(`  WARN: ${w}`);
    }

    for (const m of mapping) {
      const same = m.from === m.to;
      console.log(
        `  ${same ? 'OK' : 'MV'} [${m.role}] ${(m.size / 1e6).toFixed(1)}MB\n     ${m.from}\n  -> ${m.to}`
      );
      if (!same) {
        moveCount += 1;
        if (APPLY) s3Mv(m.from, m.to);
      }
    }
  }

  // Slugs on S3 not in courses.js
  const known = new Set(courses.map((c) => c.slug));
  for (const slug of [...bySlug.keys()].sort()) {
    if (!known.has(slug)) {
      console.log(`\n=== ${slug} (orphan on S3, not in courses.js) ===`);
      warnCount += 1;
      console.log(`  WARN: ${bySlug.get(slug).length} file(s) not mapped`);
    }
  }

  console.log(`\nSummary: ${moveCount} rename(s)${APPLY ? ' applied' : ' planned'}, ${warnCount} warning(s)`);
  if (!APPLY && moveCount) {
    console.log('Re-run with --apply to perform renames.');
  }
}

main();
