# ClinicFlow - Full-Stack Appointment Booking App

![ClinicFlow Dashboard](https://i.imgur.com/GZk1T4T.png)

ClinicFlow is a modern, full-stack web application for booking medical appointments, built from the ground up as part of a 4-hour take-home challenge. It features a sleek, dark aesthetic UI with a gradient-based design and fluid animations. The application allows patients to register, log in, view available slots, and manage their bookings, while an admin user can view all appointments across the clinic.

---

## 📋 Submission Checklist & Live Demo

* **Frontend URL:** `[YOUR_VERCEL_OR_NETLIFY_URL]`
* **API URL:** `[YOUR_RENDER_URL]`
* **Repo URL:** `[YOUR_GITHUB_REPO_URL]`

### **Test Credentials**
* **Patient:** `patient@example.com` / `Passw0rd!`
* **Admin:** `admin@example.com` / `Passw0rd!`

---

## ✨ Features

* **Patient Authentication:** Secure user registration and JWT-based login.
* **Admin Authentication:** Separate role-based access for administrative users.
* **Dynamic Slot Viewing:** Patients can see available 30-minute slots for the next 7 days.
* **Atomic Bookings:** A robust booking system that prevents double-booking at the database level.
* **Appointment Management:** Patients can view their upcoming appointments and cancel them.
* **Admin Dashboard:** A comprehensive view for administrators to see all bookings in the system.
* **Aesthetic UI/UX:** A beautiful dark-mode interface with a gradient background and smooth animations via Framer Motion.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB (via MongoDB Atlas)
* **Deployment:** Vercel (Frontend), Render (Backend)

### **Key Trade-offs**
* **NoSQL over SQL:** MongoDB was chosen for its schema flexibility and rapid development speed, which is ideal for a fast-paced project like this. The trade-off is the lack of native support for complex transactions and relations that a SQL database would provide, which might be preferable for more complex, enterprise-level scheduling systems.
* **Tailwind CSS over Component Library:** Tailwind CSS was used to create a bespoke, utility-first design that is highly customizable. This allows for a unique aesthetic but can lead to more verbose JSX compared to using a pre-styled component library like Material-UI or Ant Design.

---

## 🚀 How to Run Locally

Follow these instructions to get the project running on your local machine.

### **Prerequisites**
* Node.js (v18 or later)
* npm or yarn
* A free MongoDB Atlas account for the database connection string.

### **1. Clone the Repository**
```bash
git clone [YOUR_REPO_URL]
cd appointment-app
```

### **2. Setup Backend (`/server`)**
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file (copy from the example)
cp .env.example .env
```
Now, open the `.env` file and add your own values, especially your `DATABASE_URL` from MongoDB Atlas.

```env
# .env file content
DATABASE_URL="YOUR_MONGODB_CONNECTION_STRING"
JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JWT"
FRONTEND_URL="http://localhost:5173"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Passw0rd!"
ADMIN_NAME="Admin User"
```

Finally, start the backend development server:
```bash
npm run dev
```
The backend will be running on `http://localhost:5000`.

### **3. Setup Frontend (`/client`)**
Open a new terminal window for this step.
```bash
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```
The frontend will be running on `http://localhost:5173`.

---

## 🏗️ Architecture & Design Decisions

### **Folder Structure**
The project uses a monorepo-style structure with two distinct directories, `client` and `server`. This provides a clear separation of concerns, allowing the frontend and backend to be developed, deployed, and scaled independently.

### **Authentication & Authorization**
Authentication is handled using JSON Web Tokens (JWT). Upon successful login, the server issues a signed JWT containing the user's ID and role (`patient` or `admin`). This token is stored in `localStorage` on the client and sent with every subsequent API request in the `Authorization` header. Backend middleware verifies the token and protects routes based on the user's role.

### **Concurrency & Preventing Double Booking**
The most critical requirement is preventing two users from booking the same slot. This is solved reliably at the database level. The `bookings` collection in MongoDB has a **unique index** on the `slotStartTime` field. This makes any attempt to insert a document with a duplicate `slotStartTime` an atomic operation that will fail. The server catches this specific database error (code `11000`) and returns a user-friendly `409 Conflict` error, guaranteeing that a slot can never be double-booked.

### **UI/UX Design Philosophy**
The design goal was a modern, "aesthetic dark" theme that feels premium and professional. Instead of complex 3D libraries, this was achieved using:
* **CSS Gradients:** A subtle, multi-color radial gradient on the main body creates a sense of depth and atmosphere.
* **Solid Panels:** UI panels (forms, dashboards) have a solid, dark background with subtle borders, giving them a clean, focused appearance.
* **Fluid Animations:** `Framer Motion` is used for page transitions and staggered list animations, making the user experience feel responsive and alive.
* **Gradient Accents:** Primary call-to-action buttons use gradients and glowing hover effects to guide the user's attention.

---

## 🌐 API Verification (cURL)

Here are a few cURL commands to test the core API endpoints.

```bash
# 1. Register a new patient
curl -X POST http://localhost:5000/api/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Patient",
  "email": "testpatient-`date +%s`@example.com",
  "password": "Password123"
}'

# 2. Log in and get a token (replace with the email you just registered)
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testpatient-....@example.com",
  "password": "Password123"
}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "Patient Token: $TOKEN"

# 3. Book the first available slot (you may need to get a valid slotId from the UI or API first)
SLOT_ID="2025-08-20T09:00:00.000Z" # Example Slot ID
curl -X POST http://localhost:5000/api/book \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{\"slotId\": \"$SLOT_ID\"}"

# 4. Get "My Bookings"
curl -X GET http://localhost:5000/api/my-bookings \
-H "Authorization: Bearer $TOKEN"

# 5. Cancel a booking (get the booking ID from the previous command)
BOOKING_ID="[PASTE_BOOKING_ID_HERE]"
curl -X DELETE http://localhost:5000/api/bookings/$BOOKING_ID \
-H "Authorization: Bearer $TOKEN"
```