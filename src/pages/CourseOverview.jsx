import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courses } from '../data/courses';
import VideoModal from '../components/VideoModal';
import '../styles/courses.css';

const CourseOverview = () => {
  const { courseSlug } = useParams();
  const [selectedModule, setSelectedModule] = useState(null);
  
  const course = courses.find(c => c.slug === courseSlug);

  if (!course) {
    return (
      <div className="course-container">
        <div className="error-container">
          <h2 className="error-title">Course Not Found</h2>
          <p className="error-message">The course you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="nav-button primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleCloseModal = () => {
    setSelectedModule(null);
  };

  return (
    <div className="course-container">
      <div className="course-header">
        <div className="course-breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span>/</span>
          <span>{course.title}</span>
        </div>
        <h1 className="course-title">{course.title}</h1>
      </div>

      <div className="course-info">
        <p className="course-description">
          {course.description || 'Master the skills you need to succeed in this comprehensive course.'}
        </p>
        <div className="course-meta">
          <div className="course-meta-item">
            <div className="course-meta-label">Modules</div>
            <div className="course-meta-value">{course.modules.length}</div>
          </div>
          <div className="course-meta-item">
            <div className="course-meta-label">Estimated Time</div>
            <div className="course-meta-value">{course.estimatedTime || '2-3 hours'}</div>
          </div>
        </div>
      </div>

      <div className="modules-section">
        <h2 className="modules-title">Course Modules</h2>
        <div className="modules-grid">
          {course.modules.map((module, index) => (
            <div
              key={module.id}
              className="module-card"
              onClick={() => handleModuleClick(module)}
            >
              <div className="module-number">Module {index + 1}</div>
              <h3 className="module-title">{module.title}</h3>
              <p className="module-description">{module.description}</p>
              <div className="module-duration">
                <span>⏱️ {module.video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && (
        <VideoModal
          isOpen={true}
          onClose={handleCloseModal}
          video={selectedModule.video}
          title={selectedModule.title}
        />
      )}
    </div>
  );
};

export default CourseOverview; 