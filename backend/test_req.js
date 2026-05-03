
async function test() {
  try {
    // Register
    const regRes = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Emp2',
        email: 'testemp2@test.com',
        password: 'password',
        role: 'employee'
      })
    });
    
    const regData = await regRes.json();
    const token = regData.token;
    console.log('Registered, token:', token);

    // Request Ride
    const rideRes = await fetch('http://localhost:8080/api/rides/request', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        shiftTime: '09:00',
        pickupAddress: 'Test Address',
        coordinates: [77.2090, 28.6139]
      })
    });

    const rideData = await rideRes.json();
    console.log('Ride response:', rideRes.status, rideData);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
