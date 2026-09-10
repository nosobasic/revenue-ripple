import React, { useState } from 'react';
import { resolveVideoSrc } from '../utils/videoCdn';
import './VideoPlayer.css';

const VideoPlayer = ({ video, title }) => {
  const [cdnFailed, setCdnFailed] = useState(false);
  const preferred = resolveVideoSrc(video);
  const useCdn = preferred?.type === 'cdn' && !cdnFailed;

  let iframeSrc = null;
  if (!useCdn) {
    if (video?.vimeoId) {
      iframeSrc = `https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
    } else if (preferred?.type === 'iframe') {
      iframeSrc = preferred.src;
    } else if (video?.url && !/\.mp4(\?|$)/i.test(video.url)) {
      iframeSrc = video.url;
    }
  }

  return (
    <div className="video-player">
      <div className="video-player__container">
        {useCdn ? (
          <video
            className="video-player__video"
            src={preferred.src}
            controls
            playsInline
            preload="metadata"
            title={title}
            onError={() => setCdnFailed(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : iframeSrc ? (
          <iframe
            src={iframeSrc}
            title={title}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
            className="video-player__iframe"
          />
        ) : (
          <div className="video-player__empty">Video unavailable</div>
        )}
      </div>
      <div className="video-player__info">
        <h3 className="video-player__title">{title}</h3>
      </div>
    </div>
  );
};

export default VideoPlayer;
