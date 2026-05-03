import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const fetchRides = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:8080/api/driver/rides', config);
      setRides(data);
    } catch (error) {
      console.error('Failed to fetch rides', error);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user]);

  const handleUpdateStatus = async (rideId, status) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:8080/api/driver/update-status', { rideId, status }, config);
      fetchRides();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
    setLoading(false);
  };

  const toggleLocationSharing = (rideId) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      return;
    }

    if (navigator.geolocation && socket) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('locationUpdate', {
            rideId,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error watching position", error);
          alert('Failed to get location. Please allow permissions.');
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      setWatchId(id);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm glass-panel">
        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-500">Manage your assigned rides and update statuses.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rides.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500">You currently have no assigned rides.</p>
          </div>
        ) : (
          rides.map((ride) => (
            <div key={ride._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${
                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                    ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                    ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ride.status}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">Shift: {ride.shiftTime}</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Passengers ({ride.employees.length})</h3>
                  <ul className="mt-2 space-y-2">
                    {ride.employees.map((emp, idx) => (
                      <li key={emp._id} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                        <span className="font-medium text-gray-800">{emp.name}</span>
                        <span className="text-gray-500">{ride.pickupPoints[idx]?.address || 'Unknown'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col space-y-3 min-w-[200px]">
                {ride.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(ride._id, 'ongoing')}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow transition-colors"
                    >
                      Start Ride
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(ride._id, 'cancelled')}
                      disabled={loading}
                      className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 rounded shadow-sm transition-colors"
                    >
                      Cancel Ride
                    </button>
                  </>
                )}
                
                {ride.status === 'ongoing' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(ride._id, 'completed')}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded shadow transition-colors"
                    >
                      Complete Ride
                    </button>
                    <button 
                      onClick={() => toggleLocationSharing(ride._id)}
                      className={`w-full font-medium py-2 rounded shadow transition-colors flex justify-center items-center gap-2 ${
                        watchId 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {watchId ? 'Stop Sharing Location' : 'Start Sharing Location'}
                    </button>
                  </>
                )}

                {ride.status === 'completed' && (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-medium py-2 rounded border border-gray-200 cursor-not-allowed">
                    Ride Finished
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;