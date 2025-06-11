import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courses } from '../data/courses';
import VideoModal from '../components/VideoModal';
import VideoPlayer from '../components/VideoPlayer';
import '../styles/courses.css';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const CourseOverview = () => {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [moduleCompletion, setModuleCompletion] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  
  const course = courses.find(c => c.slug === courseSlug);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      setProgressLoading(true);
      const { data } = await supabase
        .from('user_progress')
        .select('percent_done, status')
        .eq('user_id', user.id)
        .eq('course_id', courseSlug)
        .single();
      setProgress(data);
      setProgressLoading(false);
    };
    fetchProgress();
  }, [user, courseSlug]);

  useEffect(() => {
    const fetchModuleCompletion = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_module_completion')
        .select('module_id, completed')
        .eq('user_id', user.id)
        .eq('course_id', courseSlug);
      const completionMap = {};
      if (data) {
        data.forEach(row => {
          completionMap[row.module_id] = row.completed;
        });
      }
      setModuleCompletion(completionMap);
    };
    fetchModuleCompletion();
  }, [user, courseSlug]);

  const markModuleComplete = async (moduleId) => {
    if (!user) return;
    setButtonLoading(true);
    await supabase
      .from('user_module_completion')
      .upsert([
        {
          user_id: user.id,
          course_id: courseSlug,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }
      ], { onConflict: ['user_id', 'course_id', 'module_id'] });
    setModuleCompletion(prev => ({ ...prev, [moduleId]: true }));
    await recalculateProgress();
    setButtonLoading(false);
  };

  const recalculateProgress = async () => {
    const totalModules = course.modules.length;
    const { data: completedModules } = await supabase
      .from('user_module_completion')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('course_id', courseSlug)
      .eq('completed', true);
    const percentDone = Math.round((completedModules.length / totalModules) * 100);
    const status = percentDone === 100 ? 'completed' : 'in_progress';
    await supabase
      .from('user_progress')
      .upsert([
        {
          user_id: user.id,
          course_id: courseSlug,
          percent_done: percentDone,
          status,
          last_updated: new Date().toISOString(),
        }
      ], { onConflict: ['user_id', 'course_id'] });
    setProgress({ percent_done: percentDone, status });
  };

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
        {/* Progress Bar */}
        {user && (
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            {progressLoading ? (
              <div>Loading progress...</div>
            ) : progress ? (
              <div style={{ maxWidth: 400 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  Progress: {progress.percent_done}% ({progress.status.replace('_', ' ')})
                </div>
                <div style={{ height: 10, background: '#eee', borderRadius: 5 }}>
                  <div style={{ width: `${progress.percent_done}%`, height: '100%', background: '#38bdf8', borderRadius: 5, transition: 'width 0.3s' }} />
                </div>
              </div>
            ) : (
              <div style={{ color: '#888' }}>No progress yet</div>
            )}
          </div>
        )}
      </div>

      {/* Intro Video Section */}
      {course.introVideo && (
        <div className="intro-video-section" style={{ marginBottom: '2rem' }}>
          <h2 className="intro-video-title">Course Introduction</h2>
          <VideoPlayer video={course.introVideo} title={`${course.title} Introduction`} />
        </div>
      )}

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
          onMarkComplete={() => markModuleComplete(selectedModule.id)}
          completed={!!moduleCompletion[selectedModule.id]}
          buttonLoading={buttonLoading}
        />
      )}
    </div>
  );
};

export default CourseOverview; 