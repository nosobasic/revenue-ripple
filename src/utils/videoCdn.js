const DEFAULT_CDN_BASE = 'https://d3klssyvhh70us.cloudfront.net';

export function getVideoCdnBase() {
  const raw = import.meta.env?.VITE_VIDEO_CDN_BASE_URL || DEFAULT_CDN_BASE;
  return String(raw).replace(/\/$/, '');
}

/** Build a CloudFront URL from a bucket-relative path like courses/email-marketing/intro.mp4 */
export function videoCdnUrl(cdnPath) {
  if (!cdnPath) return null;
  if (/^https?:\/\//i.test(cdnPath)) return cdnPath;
  const cleaned = String(cdnPath).replace(/^\//, '');
  // Encode each path segment so spaces/special chars work; keep slashes
  const encoded = cleaned
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${getVideoCdnBase()}/${encoded}`;
}

/**
 * Prefer CDN MP4 playback; fall back to Vimeo / generic iframe URL.
 * @returns {{ type: 'cdn'|'iframe', src: string } | null}
 */
export function resolveVideoSrc(video) {
  if (!video) return null;

  if (video.cdnPath) {
    const src = videoCdnUrl(video.cdnPath);
    if (src) return { type: 'cdn', src };
  }

  if (video.url && /\.mp4(\?|$)/i.test(video.url)) {
    return { type: 'cdn', src: video.url };
  }

  if (video.vimeoId) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`,
    };
  }

  if (video.url) {
    return { type: 'iframe', src: video.url };
  }

  return null;
}
