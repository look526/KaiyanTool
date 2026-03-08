import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Endpoint {
  method: string;
  path: string;
  status: 'active' | 'error' | 'warning';
  responseTime: number;
  lastCalled: string;
}

interface ErrorLog {
  id: string;
  code: string;
  message: string;
  endpoint: string;
  timestamp: string;
  count: number;
}

interface RateLimit {
  endpoint: string;
  current: number;
  limit: number;
  window: string;
}

export default function APIDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'errors' | 'testing' | 'docs'>('overview');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setEndpoints([
      { method: 'GET', path: '/api/projects', status: 'active', responseTime: 45, lastCalled: '2s ago' },
      { method: 'POST', path: '/api/projects', status: 'active', responseTime: 120, lastCalled: '5m ago' },
      { method: 'GET', path: '/api/projects/:id', status: 'active', responseTime: 38, lastCalled: '1m ago' },
      { method: 'PUT', path: '/api/projects/:id', status: 'warning', responseTime: 280, lastCalled: '3m ago' },
      { method: 'DELETE', path: '/api/projects/:id', status: 'active', responseTime: 95, lastCalled: '10m ago' },
      { method: 'GET', path: '/api/documents', status: 'error', responseTime: 0, lastCalled: '30s ago' },
      { method: 'POST', path: '/api/auth/login', status: 'active', responseTime: 156, lastCalled: '15s ago' },
      { method: 'GET', path: '/api/ai-providers', status: 'active', responseTime: 62, lastCalled: '45s ago' },
    ]);

    setErrors([
      { id: '1', code: 'VALIDATION_ERROR', message: 'Invalid project type', endpoint: '/api/projects', timestamp: '2m ago', count: 5 },
      { id: '2', code: 'UNAUTHORIZED', message: 'Invalid or expired token', endpoint: '/api/documents', timestamp: '5m ago', count: 12 },
      { id: '3', code: 'NOT_FOUND', message: 'Project not found', endpoint: '/api/projects/:id', timestamp: '8m ago', count: 3 },
      { id: '4', code: 'SERVICE_UNAVAILABLE', message: 'AI service timeout', endpoint: '/api/ai/generate', timestamp: '12m ago', count: 2 },
    ]);

    setRateLimits([
      { endpoint: '/api/projects', current: 45, limit: 100, window: '15m' },
      { endpoint: '/api/ai/generate', current: 8, limit: 20, window: '15m' },
      { endpoint: '/api/auth/login', current: 12, limit: 50, window: '15m' },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-cyan-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 font-mono">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-500 bg-clip-text text-transparent mb-2">
            API COMMAND CENTER
          </h1>
          <p className="text-gray-400 text-sm">Backend Architecture & Error Management Dashboard</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Endpoints"
            value={endpoints.length}
            change="+2"
            color="cyan"
            icon="🔌"
          />
          <StatCard
            title="Active Requests"
            value="1,247"
            change="+156"
            color="green"
            icon="⚡"
          />
          <StatCard
            title="Error Rate"
            value="0.3%"
            change="-0.1%"
            color="yellow"
            icon="⚠️"
          />
          <StatCard
            title="Avg Response Time"
            value="87ms"
            change="-12ms"
            color="magenta"
            icon="📊"
          />
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden mb-8">
          <div className="flex border-b border-gray-800">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'endpoints', label: 'Endpoints' },
              { id: 'errors', label: 'Errors' },
              { id: 'testing', label: 'Testing' },
              { id: 'docs', label: 'Documentation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab endpoints={endpoints} errors={errors} rateLimits={rateLimits} />}
            {activeTab === 'endpoints' && <EndpointsTab endpoints={endpoints} getStatusColor={getStatusColor} getMethodColor={getMethodColor} />}
            {activeTab === 'errors' && <ErrorsTab errors={errors} />}
            {activeTab === 'testing' && <TestingTab />}
            {activeTab === 'docs' && <DocsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, color, icon }: { title: string; value: string | number; change: string; color: string; icon: string }) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    magenta: 'from-magenta-500/20 to-magenta-600/10 border-magenta-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${change.startsWith('+') ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function OverviewTab({ endpoints, errors, rateLimits }: { endpoints: Endpoint[]; errors: ErrorLog[]; rateLimits: RateLimit[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Endpoint Health</h3>
          <div className="space-y-3">
            {endpoints.slice(0, 5).map((endpoint, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${endpoint.status === 'active' ? 'bg-green-400' : endpoint.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span className="text-sm text-gray-300">{endpoint.path}</span>
                </div>
                <span className="text-xs text-gray-500">{endpoint.responseTime}ms</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Recent Errors</h3>
          <div className="space-y-3">
            {errors.slice(0, 4).map((error) => (
              <div key={error.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-red-400">{error.code}</span>
                  <span className="text-xs text-gray-500">{error.timestamp}</span>
                </div>
                <p className="text-sm text-gray-300">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Rate Limit Status</h3>
        <div className="space-y-4">
          {rateLimits.map((limit, idx) => {
            const percentage = (limit.current / limit.limit) * 100;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{limit.endpoint}</span>
                  <span className="text-xs text-gray-500">{limit.current}/{limit.limit} ({limit.window})</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EndpointsTab({ endpoints, getStatusColor, getMethodColor }: { endpoints: Endpoint[]; getStatusColor: (s: string) => string; getMethodColor: (m: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Path</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Response Time</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Called</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint, idx) => (
            <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-mono rounded border ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-300 font-mono">{endpoint.path}</td>
              <td className="py-3 px-4">
                <span className={`text-sm ${getStatusColor(endpoint.status)}`}>{endpoint.status}</span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-400">{endpoint.responseTime}ms</td>
              <td className="py-3 px-4 text-sm text-gray-500">{endpoint.lastCalled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorsTab({ errors }: { errors: ErrorLog[] }) {
  return (
    <div className="space-y-4">
      {errors.map((error) => (
        <div key={error.id} className="bg-gray-800/50 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">{error.code}</span>
              <span className="text-xs text-gray-500 ml-3">{error.timestamp}</span>
            </div>
            <span className="text-xs text-gray-500">{error.count} occurrences</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{error.message}</p>
          <p className="text-xs text-gray-500 font-mono">{error.endpoint}</p>
        </div>
      ))}
    </div>
  );
}

function TestingTab() {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/projects');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setTimeout(() => {
      setResponse({
        success: true,
        data: {
          projects: [
            { id: '1', name: 'Sample Project', type: 'script' },
            { id: '2', name: 'Another Project', type: 'novel' },
          ],
          pagination: { page: 1, limit: 10, total: 2 },
        },
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">API Request Tester</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:border-cyan-500 focus:outline-none"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-2">Endpoint</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="/api/endpoint"
            />
          </div>
        </div>
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {response && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Response</h3>
          <pre className="bg-gray-900 rounded p-4 text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function DocsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Standard Response Format</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Success Response</h4>
            <pre className="bg-gray-900 rounded p-4 text-xs text-gray-300 overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}`}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Error Response</h4>
            <pre className="bg-gray-900 rounded p-4 text-xs text-gray-300 overflow-x-auto">
{`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Error Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { code: 'VALIDATION_ERROR', desc: 'Input validation failed' },
            { code: 'UNAUTHORIZED', desc: 'Authentication required' },
            { code: 'FORBIDDEN', desc: 'Insufficient permissions' },
            { code: 'NOT_FOUND', desc: 'Resource not found' },
            { code: 'CONFLICT', desc: 'Resource conflict' },
            { code: 'RATE_LIMIT_EXCEEDED', desc: 'Too many requests' },
            { code: 'SERVICE_UNAVAILABLE', desc: 'Service temporarily unavailable' },
            { code: 'INTERNAL_ERROR', desc: 'Server error' },
          ].map((error) => (
            <div key={error.code} className="p-3 bg-gray-900/50 rounded border border-gray-700">
              <span className="text-xs font-mono text-yellow-400">{error.code}</span>
              <p className="text-xs text-gray-400 mt-1">{error.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}