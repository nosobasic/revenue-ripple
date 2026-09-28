import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../config/constants';
import { FaBullseye, FaPlus, FaCheck, FaTrash, FaEdit, FaTrophy, FaFire } from 'react-icons/fa';

export default function GoalDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'custom',
    target_value: '',
    target_date: ''
  });

  useEffect(() => {
    loadGoals();
    loadStats();
  }, []);

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/goals`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/goals/stats`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const createGoal = async () => {
    if (!user || !newGoal.title) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        },
        body: JSON.stringify(newGoal)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewGoal({
          title: '',
          description: '',
          goal_type: 'custom',
          target_value: '',
          target_date: ''
        });
        await loadGoals();
        await loadStats();
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const updateGoalStatus = async (goalId, status) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await loadGoals();
        await loadStats();
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!user || !confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (response.ok) {
        await loadGoals();
        await loadStats();
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#3b82f6';
      case 4: return '#10b981';
      case 5: return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getProgress = (goal) => {
    if (!goal.target_value || !goal.current_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading your goals...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Stats Overview */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaBullseye style={{ color: '#2563eb' }} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.active}</div>
              <div style={styles.statLabel}>Active Goals</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaTrophy style={{ color: '#10b981' }} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaFire style={{ color: '#ef4444' }} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.high_priority}</div>
              <div style={styles.statLabel}>High Priority</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Your Goals</h2>
        <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
          <FaPlus style={styles.addButtonIcon} />
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div style={styles.emptyState}>
          <FaBullseye style={styles.emptyIcon} />
          <h3 style={styles.emptyTitle}>No goals yet</h3>
          <p style={styles.emptyDescription}>
            Set your first goal and start tracking your progress!
          </p>
          <button style={styles.emptyButton} onClick={() => setShowAddModal(true)}>
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div style={styles.goalsList}>
          {goals.map(goal => (
            <div key={goal.id} style={styles.goalCard}>
              <div style={styles.goalHeader}>
                <div style={styles.goalTitleRow}>
                  <div
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(goal.priority)
                    }}
                  />
                  <h3 style={styles.goalTitle}>{goal.title}</h3>
                </div>
                <div style={styles.goalActions}>
                  {goal.status === 'active' && (
                    <button
                      style={styles.iconButton}
                      onClick={() => updateGoalStatus(goal.id, 'completed')}
                      title="Mark as completed"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    style={styles.iconButton}
                    onClick={() => deleteGoal(goal.id)}
                    title="Delete goal"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {goal.description && (
                <p style={styles.goalDescription}>{goal.description}</p>
              )}

              {goal.target_value && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressText}>
                      Progress: {goal.current_value || 0} / {goal.target_value}
                    </span>
                    <span style={styles.progressPercent}>
                      {Math.round(getProgress(goal))}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${getProgress(goal)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={styles.goalFooter}>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...(goal.status === 'completed' ? styles.statusBadgeCompleted : {}),
                    ...(goal.status === 'abandoned' ? styles.statusBadgeAbandoned : {})
                  }}
                >
                  {goal.status}
                </span>
                {goal.target_date && (
                  <span style={styles.dateText}>
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Goal</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Goal Title *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="E.g., Reach 1,000 email subscribers"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Value</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="1000"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: e.target.value }))}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.createButton}
                onClick={createGoal}
                disabled={!newGoal.title}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px'
  },
  loadingContainer: {
    padding: '48px',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    fontSize: '32px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  addButtonIcon: {
    fontSize: '12px'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '64px 32px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  emptyIcon: {
    fontSize: '64px',
    color: '#d1d5db',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  emptyDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px'
  },
  emptyButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer'
  },
  goalsList: {
    display: 'grid',
    gap: '16px'
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s'
  },
  goalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  goalTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  priorityBadge: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  goalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  goalActions: {
    display: 'flex',
    gap: '8px'
  },
  iconButton: {
    padding: '8px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  goalDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.6'
  },
  progressContainer: {
    marginBottom: '16px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  progressText: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  progressPercent: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '600'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    transition: 'width 0.3s'
  },
  goalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '12px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    textTransform: 'capitalize'
  },
  statusBadgeCompleted: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  statusBadgeAbandoned: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  dateText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer'
  },
  createButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer'
  }
};
