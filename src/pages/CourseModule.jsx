import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';
import VideoPlayer from '../components/VideoPlayer';
import AIAssistantWidget from '../components/AIAssistantWidget';
import ConfettiAnimation from '../components/ConfettiAnimation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import '../styles/courses.css';

const CourseModule = () => {
  const { courseSlug, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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

  // Check if this module is already completed for this user
  useEffect(() => {
    const fetchCompletion = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_module_completion')
        .select('completed')
        .eq('user_id', user.id)
        .eq('course_id', courseSlug)
        .eq('module_id', moduleId)
        .single();
      if (data && data.completed) setCompleted(true);
    };
    fetchCompletion();
  }, [user, courseSlug, moduleId]);

  // Mark module as complete and recalculate progress
  const markModuleComplete = async () => {
    if (!user) return;
    setButtonLoading(true);
    
    // Upsert completion
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
    
    setCompleted(true);
    await recalculateProgress();
    setButtonLoading(false);
    
    // Trigger confetti animation
    setShowConfetti(true);
  };

  // Recalculate course progress for this user
  const recalculateProgress = async () => {
    // Get total modules in course
    const totalModules = course.modules.length;
    // Get completed modules from Supabase
    const { data: completedModules } = await supabase
      .from('user_module_completion')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('course_id', courseSlug)
      .eq('completed', true);
    const percentDone = Math.round((completedModules.length / totalModules) * 100);
    const status = percentDone === 100 ? 'completed' : 'in_progress';
    // Upsert user_progress
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
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  if (isLoading) {
    return (
      <div className="course-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading module...</div>
        </div>
      </div>
    );
  }

  if (error || !course || !module) {
    return (
      <div className="course-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Module Not Found</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            The module you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/courses" className="nav-button primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-container">
      <AIAssistantWidget 
        showWelcomeBubble={true} 
        pageContext={`Module: ${module.title} in ${course.title} - ${module.description || 'Learning module content'}`}
      />
      
      {/* Confetti Animation */}
      <ConfettiAnimation 
        isActive={showConfetti} 
        onComplete={handleConfettiComplete}
      />
      
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
          video={module.video}
          title={module.title}
        />
      </div>

      <div className="course-info">
        <p className="course-description">{module.description}</p>
        <div style={{ marginTop: 16 }}>
          <button
            className={`nav-button primary${completed ? ' completed' : ''}`}
            onClick={markModuleComplete}
            disabled={completed || buttonLoading}
            style={{ minWidth: 160 }}
          >
            {completed ? 'Completed' : buttonLoading ? 'Marking...' : 'Mark as Complete'}
          </button>
        </div>
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