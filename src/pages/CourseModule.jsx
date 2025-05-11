import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';
import VideoPlayer from '../components/VideoPlayer';
import '../styles/courses.css';

const CourseModule = () => {
  const { courseSlug, moduleId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const course = courses.find(c => c.slug === courseSlug);
  const moduleNumber = parseInt(moduleId.split('-')[1]);
  const module = course?.modules.find(m => m.id === moduleNumber);
  const prevModule = course?.modules.find(m => m.id === moduleNumber - 1);
  const nextModule = course?.modules.find(m => m.id === moduleNumber + 1);

  useEffect(() => {
    if (!course || !module) {
      setError('Module not found');
    }
    setIsLoading(false);
  }, [course, module]);

  if (error) {
    return (
      <div className="course-container">
        <div className="course-breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link to={`/courses/${courseSlug}`}>{course?.title || 'Course'}</Link>
        </div>
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="nav-button primary"
          >
            Back to Course Overview
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="course-container">
        <div className="course-breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link to={`/courses/${courseSlug}`}>{course?.title || 'Course'}</Link>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading video content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-container">
      <div className="course-breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to={`/courses/${courseSlug}`}>{course.title}</Link>
        <span>/</span>
        <span>{module.title}</span>
      </div>

      <h1 className="course-title">{module.title}</h1>

      <div className="video-container">
        <VideoPlayer 
          videoUrl={module.video.url}
          title={module.title}
        />
      </div>

      <div className="course-info">
        <p className="course-description">{module.description}</p>
      </div>

      <div className="module-navigation">
        {prevModule ? (
          <Link 
            to={`/courses/${courseSlug}/module-${prevModule.id}`}
            className="nav-button secondary"
          >
            ← Previous Module: {prevModule.title}
          </Link>
        ) : (
          <div />
        )}
        <Link 
          to={`/courses/${courseSlug}`}
          className="nav-button secondary"
        >
          Back to Course Overview
        </Link>
        {nextModule ? (
          <Link 
            to={`/courses/${courseSlug}/module-${nextModule.id}`}
            className="nav-button primary"
          >
            Next Module: {nextModule.title} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default CourseModule; 