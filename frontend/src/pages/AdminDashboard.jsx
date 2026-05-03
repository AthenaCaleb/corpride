import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [activeTab, setActiveTab] = useState('rides');
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [ridesRes, usersRes, reqsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/rides', config),
        axios.get('http://localhost:8080/api/admin/users', config),
        axios.get('http://localhost:8080/api/admin/requests', config)
      ]);
      setRides(ridesRes.data);
      setUsers(usersRes.data);
      setRequests(reqsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('emergencyAlert', (data) => {
        setAlerts(prev => [data, ...prev]);
        // Ideally play a sound here
      });

      return () => {
        socket.off('emergencyAlert');
      };
    }
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm glass-panel gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System overview and management.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-500 font-bold uppercase block">Total Users</span>
            <span className="text-xl font-bold text-gray-900">{users.length}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-xs text-green-500 font-bold uppercase block">Active Rides</span>
            <span className="text-xl font-bold text-gray-900">
              {rides.filter(r => r.status === 'ongoing').length}
            </span>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">EMERGENCY ALERTS ({alerts.length})</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx}>
                      <strong>{alert.name}</strong> triggered SOS in ride <span className="font-mono bg-red-100 px-1 rounded">{alert.rideId}</span> at {new Date(alert.timestamp).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('rides')}
              className={`${
                activeTab === 'rides' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
            >
              All Rides
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`${
                activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
            >
              Ride Requests
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
            >
              Users
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rides' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rides.map(ride => (
                    <tr key={ride._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{ride._id.slice(-6)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ride.driver?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ride.shiftTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                          ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.employees.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map(req => (
                    <tr key={req._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.employee?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.shiftTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{req.pickupLocation.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'matched' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    u.role === 'admin' ? 'bg-purple-500' : 
                    u.role === 'driver' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{u.name}</h3>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <span className="text-xs font-medium text-gray-500 uppercase mt-1 inline-block">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;