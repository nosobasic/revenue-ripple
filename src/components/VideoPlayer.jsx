import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, title }) => {
  let embedUrl = '';
  if (video?.vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
  } else if (video?.url) {
    embedUrl = video.url;
  }
  return (
    <div className="video-player">
      <div className="video-player__container">
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          className="video-player__iframe"
        />
      </div>
      <div className="video-player__info">
        <h3 className="video-player__title">{title}</h3>
      </div>
    </div>
  );
};

export default VideoPlayer; 