import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchRoutes } from 'react-router-dom';
import { courses } from '../../src/data/courses.js';

// Read the actual route declarations, so a broken App route fails this test.
const app = readFileSync(new URL('../../src/App.jsx', import.meta.url), 'utf8');
const paths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(match => match[1]);
const routes = paths.filter(path => path.startsWith('/') || path === '*').map(path => ({path}));
function match(url) {
  const result = matchRoutes(routes, url);
  assert.ok(result, `No route for ${url}`);
  assert.notEqual(result.at(-1).route.path, '*', `${url} falls through to the homepage redirect`);
  return result.at(-1);
}

test('every course and lesson destination matches a real route', () => {
  for (const course of courses) {
    assert.equal(match(`/courses/${course.slug}`).route.path, '/courses/:courseSlug');
    for (const lesson of course.modules) {
      for (const suffix of ['', '#knowledge-check']) {
        const result = match(`/courses/${course.slug}/module-${lesson.id}${suffix}`);
        assert.equal(result.route.path, '/courses/:courseSlug/:moduleId');
        assert.equal(result.params.courseSlug, course.slug);
        assert.equal(result.params.moduleId, `module-${lesson.id}`);
      }
    }
  }
});

test('dashboard library and toolkit buttons avoid the homepage fallback', () => {
  for (const path of ['/courses', '/vault', '/ai-visibility', '/affiliate-centre/tools', '/training', '/community', '/profile']) match(path);
  assert.ok(app.includes('<Route path="tools" element={<AffiliateTools />'), 'Affiliate tools child route exists');
});
