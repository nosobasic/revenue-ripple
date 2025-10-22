import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FaRobot, FaPlay, FaCog, FaHistory, FaPlus, FaTrash } from 'react-icons/fa';

export default function CommandCenter() {
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [instances, setInstances] = useState([]);
  const [runs, setRuns] = useState([]);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);

  useEffect(() => {
    checkFeatureStatus();
    loadData();
  }, []);

  const checkFeatureStatus = async () => {
    try {
      const response = await fetch('/api/command-center/health');
      const data = await response.json();
      setFeatureEnabled(data.feature_enabled);
    } catch (error) {
      console.error('Error checking feature status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load agent catalog
      const catalogResponse = await fetch('/api/agents/catalog');
      const catalogData = await catalogResponse.json();
      
      // Load user instances
      const instancesResponse = await fetch('/api/agents/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const instancesData = await instancesResponse.json();
      
      // Load recent runs
      const runsResponse = await fetch('/api/agents/runs/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1, limit: 10 })
      });
      const runsData = await runsResponse.json();
      
      setAgents(catalogData.data || []);
      setInstances(instancesData.data || []);
      setRuns(runsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleRunAgent = async (instanceId) => {
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instance_id: instanceId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        alert('Agent execution started! (Simulated)');
        loadData(); // Refresh data
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error running agent:', error);
      alert('Error running agent');
    }
  };

  const handleConnectCredentials = (instance) => {
    setSelectedInstance(instance);
    setShowCredentialsModal(true);
  };

  const handleSaveCredentials = async (credentials) => {
    try {
      const response = await fetch('/api/credentials/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance_id: selectedInstance.id,
          credential_type: credentials.type,
          data: credentials.data
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Credentials saved successfully! (Simulated)');
        setShowCredentialsModal(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Error saving credentials');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  if (!featureEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Command Center</h1>
            <p className="text-gray-600 mb-8">This feature is currently disabled.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                To enable Command Center, set <code>REVRIPPLE_COMMAND_CENTER_ENABLED=true</code> in your environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Command Center</h1>
            <p className="text-gray-600">Manage your AI agents and automate your business processes</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FaRobot className="text-blue-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{instances.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FaHistory className="text-green-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Runs</p>
                  <p className="text-2xl font-bold text-gray-900">{runs.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FaCog className="text-purple-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Instances */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Agents</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <FaPlus className="inline mr-2" />
                  Create Agent
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {instances.length === 0 ? (
                <div className="text-center py-12">
                  <FaRobot className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No agents configured</h3>
                  <p className="text-gray-500 mb-6">Create your first agent to get started with automation</p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Your First Agent
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instances.map((instance) => (
                    <div key={instance.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{instance.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          instance.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {instance.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {agents.find(a => a.id === instance.catalog_id)?.description || 'Agent description'}
                      </p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRunAgent(instance.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <FaPlay className="inline mr-1" />
                          Run Now
                        </button>
                        <button
                          onClick={() => handleConnectCredentials(instance)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <FaCog className="inline mr-1" />
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Runs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Runs</h2>
            </div>
            
            <div className="p-6">
              {runs.length === 0 ? (
                <div className="text-center py-8">
                  <FaHistory className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No runs yet. Create and run your first agent!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {runs.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          run.status === 'completed' ? 'bg-green-500' :
                          run.status === 'failed' ? 'bg-red-500' :
                          run.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">Run #{run.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(run.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        run.status === 'completed' ? 'bg-green-100 text-green-800' :
                        run.status === 'failed' ? 'bg-red-100 text-red-800' :
                        run.status === 'running' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <CredentialsModal
          instance={selectedInstance}
          onSave={handleSaveCredentials}
          onClose={() => setShowCredentialsModal(false)}
        />
      )}
    </div>
  );
}

// Credentials Modal Component
function CredentialsModal({ instance, onSave, onClose }) {
  const [credentials, setCredentials] = useState({
    type: 'api_key',
    data: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(credentials);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connect Credentials for {instance?.name}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential Type
            </label>
            <select
              value={credentials.type}
              onChange={(e) => setCredentials({...credentials, type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="api_key">API Key</option>
              <option value="oauth">OAuth Token</option>
              <option value="username_password">Username/Password</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential Data
            </label>
            <textarea
              value={credentials.data}
              onChange={(e) => setCredentials({...credentials, data: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter your credentials..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Credentials
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}