import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import LiveMap from '../components/LiveMap';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [shiftTime, setShiftTime] = useState(user?.shiftTime || '09:00');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);

  const fetchRides = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:8080/api/rides/my-rides', config);
      setRequests(data.requests);
      setActiveRides(data.activeRides);
    } catch (error) {
      console.error('Failed to fetch rides', error);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user]);

  useEffect(() => {
    if (socket && activeRides.length > 0) {
      activeRides.forEach(ride => {
        socket.emit('joinRide', ride._id);
      });

      socket.on('driverLocation', (data) => {
        console.log('Driver location update:', data);
        setDriverLocation(data);
      });

      return () => {
        socket.off('driverLocation');
      };
    }
  }, [socket, activeRides]);

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:8080/api/rides/request', {
              shiftTime,
              pickupAddress,
              destinationAddress,
              coordinates: coords
            }, config);
            setMessage(data.message);
            fetchRides();
          } catch (error) {
            setMessage(error.response?.data?.message || 'Error requesting ride');
          }
          setLoading(false);
        },
        (error) => {
          setMessage('Location access required to book a ride.');
          setLoading(false);
        }
      );
    } else {
      setMessage('Geolocation not supported.');
      setLoading(false);
    }
  };

  const triggerSOS = () => {
    if (socket && activeRides.length > 0) {
      socket.emit('triggerSOS', {
        userId: user._id,
        name: user.name,
        company: user.company,
        emergencyContact: user.emergencyContact,
        rideId: activeRides[0]._id,
        timestamp: new Date()
      });
      alert('SOS signal sent! Admins have been notified.');
    } else {
      alert('You are not currently in an active ride.');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Find the request ID associated with the active ride if possible, 
        // or just use the ride ID if the backend supports it.
        // In our case, the backend cancel endpoint expects the Request ID.
        const reqToCancel = requests.find(r => r.status === 'matched' || r.status === 'pending');
        if (reqToCancel) {
          await axios.post(`http://localhost:8080/api/rides/cancel/${reqToCancel._id}`, {}, config);
          setMessage('Ride cancelled successfully');
          fetchRides();
        }
      } catch (error) {
        console.error('Failed to cancel ride', error);
        setMessage('Failed to cancel ride');
      }
    }
  };

  const currentRide = activeRides.length > 0 ? activeRides[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm glass-panel">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-500">Book rides and track your daily commute.</p>
        </div>
        <button 
          onClick={triggerSOS}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse"
        >
          SOS EMERGENCY
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Book Ride Form */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Request a Ride</h2>
          {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>}
          
          <form onSubmit={handleRequestRide} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Time</label>
              <select 
                value={shiftTime} 
                onChange={(e) => setShiftTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="09:00">09:00 AM</option>
                <option value="17:00">05:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address / Fixed Point</label>
              <input 
                type="text" 
                value={pickupAddress} 
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Sector 14, Main Gate"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Address (Office Branch)</label>
              <input 
                type="text" 
                value={destinationAddress} 
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Building 5, Cyber City"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Ride'}
            </button>
          </form>
        </div>

        {/* Active Ride Info */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Current Ride Status</h2>
            {currentRide ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50/10 rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm text-blue-400 font-medium uppercase tracking-wide">Status</p>
                    <p className="text-xl font-bold text-white capitalize">{currentRide.status}</p>
                  </div>
                  <div className="text-center">
                    <button 
                      onClick={() => handleCancel(currentRide._id)}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold py-1 px-3 rounded-md transition-all"
                    >
                      CANCEL RIDE
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-400 font-medium uppercase tracking-wide">Shift Time</p>
                    <p className="text-xl font-bold text-white">{currentRide.shiftTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-1">Driver Details</p>
                    <p className="font-semibold text-white">{currentRide.driver ? currentRide.driver.name : 'Unassigned'}</p>
                    <p className="text-sm text-gray-400">{currentRide.driver ? currentRide.driver.phone : ''}</p>
                  </div>
                  <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-1">Co-Passengers</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentRide.employees.map(emp => (
                        <span key={emp._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white">
                          {emp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <LiveMap status={currentRide.status} driverLocation={driverLocation} pickupPoints={currentRide.pickupPoints} />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active rides</h3>
                <p className="mt-1 text-sm text-gray-500">Book a ride to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;