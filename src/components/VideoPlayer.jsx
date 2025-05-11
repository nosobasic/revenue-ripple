import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, title }) => {
  return (
    <div className="video-player">
      <div className="video-player__container">
        <iframe
          src={videoUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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