# Corporate Employee Ride Sharing System

A premium, secure, and automated ride-sharing platform designed specifically for corporate environments. This system ensures that employees commute safely by grouping them with colleagues from the same organization going to the same destination.

---

## 🚀 Key Features

### 🏢 1. Organization Isolation (Corporate Silos)
The system is built on a "Multi-Tenant" architecture.
- **Strict Pairing**: Employees from "Company A" are only matched with drivers assigned to "Company A".
- **Admin Privacy**: Admins can only view and manage rides, users, and SOS alerts for their specific organization.

### 🤖 2. Intelligent Matchmaking Logic
The core algorithm (`matchMaker.js`) automatically pairs employees based on four strict criteria:
1.  **Shift Time**: Employees must share the same shift (e.g., 09:00 AM).
2.  **Organization**: Must belong to the same company.
3.  **Destination**: Must be going to the same specific office branch or building.
4.  **Geographic Proximity**: Pickup points must be within **5 kilometers** of each other to ensure driver efficiency.

### 🚨 3. Targeted SOS & Emergency Response
- **Emergency Contacts**: Every user registers an emergency contact (Email/Phone).
- **Targeted Alerts**: When an SOS is triggered, only the Admins of that specific company receive a real-time notification via Socket.io.
- **External Notification**: The system simulates an immediate alert to the user's registered emergency contact.

### 🗺️ 4. Live Tracking & Maps
- **Real-time Updates**: Employees can see their driver's location live on a map.
- **Sequential Pickups**: Drivers see a map with all pickup points for their assigned group.

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React.js, Tailwind CSS (for premium UI), Socket.io-client.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Atlas) with Mongoose ODM.
- **Real-time**: Socket.io (Rooms-based isolation).

### Database Schema "The Theory"
1.  **User Model**: Stores credentials, role (Employee/Driver/Admin), `company` name, and `emergencyContact`.
2.  **RideRequest Model**: Captures an employee's intent to travel. Includes `pickupLocation` (GeoJSON), `destinationAddress`, and `shiftTime`.
3.  **Ride Model**: The "active commute" object. Links one driver to multiple employees (Max 4).

---

## 📖 The Matching Theory (With Examples)

The system avoids the common mistake of "filling seats at any cost." It prioritizes destination and corporate security.

### Scenario A: Successful Grouping (Org 1)
- **Employee A, B, C**: All from **Org 1**, going to **Main Office** at **09:00 AM**.
- **Driver P**: Available for **Org 1**.
- **Logic**: The system finds that A, B, and C are within 5km. It creates **one Ride** and assigns Driver P. All three see each other as co-passengers.

### Scenario B: Destination Split (Org 1)
- **Employee D**: From **Org 1**, same shift, but going to **Warehouse B**.
- **Logic**: Even though D is from the same company, the `destinationAddress` differs. The system **rejects** adding D to the Ride with A, B, and C. D will wait for a different free driver (Driver Q).

### Scenario C: Organization Boundary (Org 2)
- **Employee E**: From **Org 2**, same shift, same pickup location as A.
- **Logic**: The system sees the `company` field is different. E is **never** matched with Org 1's drivers. E must wait for Driver X or Y from Org 2.

---

## 🚦 How to Run the Project

### Prerequisites
- Node.js installed.
- MongoDB Atlas account (or use the provided URI in `.env`).

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- The server runs on `http://localhost:8080`.
- It will automatically connect to MongoDB and initialize collections.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- The app runs on `http://localhost:5173`.

---

## 🛡️ Administrative Control
Log in with an **Admin** account to access the System Overview:
- **Monitor**: See all active rides in your company.
- **Emergency**: Receive instant sound and visual alerts if an employee triggers SOS.
- **Audit**: View all pending requests and historical user data for your organization.

---

## 🛠️ Environment Variables
Create a `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=8080
```

---

## 📈 Future Scalability
The system is designed to eventually support:
- **Route Optimization**: Using Google Maps Directions API to order pickups.
- **Automated Emailing**: Integrating SendGrid/Nodemailer for real SOS emails.
- **Employee Rating**: Feedback system for drivers.
