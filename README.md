# Full-Stack Take-Home: Appointment Booking

This is a minimal MERN stack application for a small clinic that allows patients to book available appointments and an admin to view all bookings.

---

## Submission Checklist

* **Frontend URL:** `[YOUR_VERCEL_FRONTEND_URL]`
* **API URL:** `[YOUR_RENDER_BACKEND_URL]`
* **Patient Credentials:** `patient@example.com` / `Passw0rd!`
* **Admin Credentials:** `admin@example.com` / `Passw0rd!`
* **Repo URL:** `[YOUR_PUBLIC_GITHUB_REPO_URL]`
* **Run locally:** Steps verified and included below.
* **Postman/curl steps:** Included below.
* **Notes on trade-offs & next steps:** Included below.

---

## Tech Stack Choices

* **Backend:** Node.js, Express, Mongoose (MongoDB)
    * **Reasoning:** The MERN stack is excellent for rapid prototyping. Express is a minimal and flexible framework. Mongoose provides straightforward schema definition and validation for MongoDB, which is a good fit for the document-like structure of bookings and users.
    * **Trade-offs:** While fast to develop with, MongoDB doesn't enforce relational integrity like a SQL database. For this simple app, it's a non-issue, but for a more complex system with cancellations, rescheduling, and doctor assignments, a SQL database with transactions might be more robust.
* **Frontend:** React (Vite), Context API
    * **Reasoning:** React is the industry standard for building interactive UIs. Vite provides a fast development experience. For state management, the built-in Context API is sufficient for handling authentication state without the overhead of a larger library like Redux.
* **Deployment:**
    * **API on Render:** Render's free tier is perfect for hosting a Node.js server and integrates well with GitHub for continuous deployment.
    * **Frontend on Vercel:** Vercel is optimized for static and frontend hosting, offering a seamless deployment experience for React/Vite apps.

---

## How to Run Locally

**Prerequisites:**
* Node.js (v18+)
* npm
* A MongoDB database instance (e.g., from MongoDB Atlas)

**1. Clone the Repository:**
```bash
git clone [YOUR_REPO_URL]
cd appointment-app
```

**2. Setup Backend:**
```bash
cd server
npm install

# Create a .env file from the example
cp .env.example .env

# Edit .env and add your MongoDB connection string and a JWT secret
# DATABASE_URL="your_mongodb_string"
# JWT_SECRET="a_very_secure_secret"
# ... other vars are fine for local dev

# Run the server
npm run dev
```
The backend will be running on `http://localhost:5000`.

**3. Setup Frontend:**
```bash
# From a new terminal window
cd client
npm install

# The app points to http://localhost:5000 by default. No .env needed for local setup.
npm run dev
```
The frontend will be running on `http://localhost:5173`.

---

## Deployment Steps

**1. Backend (Render):**
1.  Push the code to a public GitHub repository.
2.  Go to the Render Dashboard and create a new "Web Service".
3.  Connect the GitHub repository.
4.  Set the following configuration:
    * **Name:** `appointment-api` (or your choice)
    * **Root Directory:** `server`
    * **Build Command:** `npm install`
    * **Start Command:** `npm start`
5.  Under "Environment Variables", add the following:
    * `DATABASE_URL`: Your MongoDB Atlas connection string.
    * `JWT_SECRET`: A long, random, secret string.
    * `FRONTEND_URL`: The URL of your deployed Vercel app (you'll get this in the next step).
    * `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: The credentials for the admin user.

**2. Frontend (Vercel):**
1.  Go to the Vercel Dashboard and create a new "Project".
2.  Connect the same GitHub repository.
3.  Vercel will auto-detect it's a Vite project. Set the **Root Directory** to `client`.
4.  Under "Environment Variables", add one variable:
    * `VITE_API_BASE_URL`: The URL of your deployed Render API (e.g., `https://appointment-api.onrender.com/api`).
5.  Deploy. After deployment, update the `FRONTEND_URL` environment variable on Render to match your Vercel URL to fix CORS issues.

---

## Architecture Notes

* **Folder Structure:** The project is organized into two distinct top-level directories: `server` and `client`. This provides a clear separation of concerns between the backend and frontend, making them independently maintainable and deployable.
* **Auth + RBAC (Role-Based Access Control):**
    * Authentication is handled using JSON Web Tokens (JWT). Upon successful login, the server issues a signed JWT containing the user's ID and role.
    * This token is stored in the browser's `localStorage` and sent in the `Authorization` header of subsequent API requests.
    * A `protect` middleware on the backend verifies the token's validity. An `isAdmin` middleware checks the decoded token's role to restrict access to admin-only endpoints (`/api/all-bookings`).
* **Concurrency/Atomicity for Booking:**
    * The primary challenge is preventing two users from booking the same slot simultaneously (a race condition).
    * This is solved at the database level, which is the most reliable approach. The `Booking` model in Mongoose has a **unique index** on the `slotStartTime` field: `{ type: Date, required: true, unique: true }`.
    * If two requests try to create a booking for the same `slotStartTime`, MongoDB's atomic operations will ensure only the first one succeeds. The second `INSERT` operation will fail with a duplicate key error (code `11000`), which the server catches and translates into a user-friendly `409 Conflict` error with the code `SLOT_TAKEN`.
* **Error Handling Strategy:**
    * The API returns consistent JSON error shapes: `{ "error": { "code": "ERROR_CODE", "message": "..." } }`. This allows the frontend to easily parse errors.
    * Backend controllers use `try...catch` blocks to handle exceptions. Specific errors (like validation or duplicate keys) are caught and mapped to appropriate HTTP status codes (400, 409).
    * The frontend's `axios` instance and component-level state (`error`) are used to display these messages to the user.

---

## Quick Verification Script (cURL)

*Replace `http://localhost:5000` with your deployed API URL if testing against production.*

```bash
# 1. Register a new patient
curl -X POST http://localhost:5000/api/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Patient",
  "email": "testpatient@example.com",
  "password": "Password123"
}'

# 2. Log in as the new patient and extract token
# NOTE: You will need to manually copy the token from the response for the next steps.
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testpatient@example.com",
  "password": "Password123"
}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "Patient Token: $TOKEN"

# 3. Get available slots
curl -X GET "http://localhost:5000/api/slots?from=$(date +%Y-%m-%d)&to=$(date -v+7d +%Y-%m-%d)"

# 4. Book a slot (replace SLOT_ID with a valid ISO string from the previous command)
# Example: "2025-08-19T09:00:00.000Z"
SLOT_ID="[PASTE_A_VALID_SLOT_ID_HERE]"
curl -X POST http://localhost:5000/api/book \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{\"slotId\": \"$SLOT_ID\"}"

# 5. Get My Bookings (as patient)
curl -X GET http://localhost:5000/api/my-bookings \
-H "Authorization: Bearer $TOKEN"

# 6. Log in as Admin and get all bookings
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@example.com",
  "password": "Passw0rd!"
}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "Admin Token: $ADMIN_TOKEN"

curl -X GET http://localhost:5000/api/all-bookings \
-H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Known Limitations & Next Steps (with 2 more hours)

* **Time Zone Handling:** The server currently operates entirely in UTC. Slots are generated from 9:00-17:00 UTC. This is not ideal for a real clinic. With more time, I would:
    * Store the clinic's time zone (e.g., `Asia/Kolkata`) as a server configuration.
    * Generate slots based on that time zone but store them in UTC.
    * Display times to the user in their local browser time zone using `moment.js` or `date-fns-tz`.
* **No Cancellation/Rescheduling:** Patients cannot cancel or change their bookings. This would be the highest priority feature to add next, involving a `DELETE` or `PATCH` endpoint and more complex business logic.
* **UI/UX Polish:** The UI is minimal. I would add a proper calendar view for selecting dates, better loading indicators (spinners), and success/error toasts for a smoother user experience.
* **Pagination:** The admin dashboard loads all bookings at once. This will not scale. I would implement pagination for the `/api/all-bookings` endpoint.
* **Testing:** The project lacks automated tests. I would add Jest/Supertest for backend integration tests (testing API endpoints, especially the booking logic) and React Testing Library for frontend component tests.