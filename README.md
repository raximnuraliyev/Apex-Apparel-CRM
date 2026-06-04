# Apex Apparel CRM

A comprehensive Customer Relationship Management (CRM) system tailored for apparel businesses. It handles client management, tracks orders via a Kanban board, provides dashboard analytics, and includes secure authentication.

## 🌟 Features

- 📊 **Dashboard Analytics:** Visualized sales trends, order statuses, and performance metrics using Recharts.
- 📦 **Order Management:** Interactive Kanban board for tracking order progress seamlessly.
- 👥 **Client Directory:** Manage customer relationships and history centrally.
- 🔒 **Secure Authentication:** JWT-based login and session management.
- 🚀 **Full-Stack Architecture:** Built with React (Vite) and Node.js/Express with MongoDB.
- 🐳 **Docker Deployment:** Includes Dockerfile and docker-compose.yml with Nginx reverse proxy routing.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS V4
- **UI / Charts:** Lucide React, Framer Motion, Recharts

### Backend
- **Runtime:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Security:** bcryptjs, jsonwebtoken (JWT), helmet, cors

## 📂 Project Structure

```	ext
apex-apparel-crm/
├── server/                 # Backend Node.js / Express App
│   ├── config/             # DB and Environment config
│   ├── middleware/         # Auth and security middlewares
│   ├── models/             # Mongoose schemas (Client, Order, User)
│   ├── routes/             # API routes
│   ├── index.js            # Entry point for backend
│   └── seed.js             # Database seeder script
├── src/                    # Frontend React / Vite App
│   ├── components/         # React Views (Dashboard, Kanban, etc.)
│   ├── App.tsx             # Main application component
│   └── types.ts            # TypeScript interfaces
├── docker/                 # Containerization setup (Compose, Dockerfile, Nginx)
└── package.json            # Unified scripts & dependencies
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas connection URL)

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/raximnuraliyev/Apex-Apparel-CRM.git
   cd Apex-Apparel-CRM
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Set up Environment Variables:**
   Create a .env file in the root directory and configure:
   `env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/apex_apparel
   JWT_SECRET=your_super_secret_key
   `

4. **Seed the database (Optional):**
   `ash
   npm run seed
   `

### Running the Application

The project features a unified package.json for running both servers easily:

`ash
# Start the frontend (Vite)
npm run dev

# Start the backend API server (Express)
npm run dev:server
`
- The Frontend runs on http://localhost:3000
- The Backend API runs on http://localhost:5000

## 🐳 Docker Deployment

The repository is fully configured for production deployment using Docker Compose, which spins up the backend, frontend static serving, and an Nginx reverse proxy.

1. Ensure your .env variables match the Docker configuration needs.
2. Navigate to the docker directory or run from root:
   `ash
   cd docker
   docker-compose up -d --build
   `
3. Nginx runs on ports 80 (and 443 if SSL configured), routing API hits securely to the Node app.

## 📜 License

This project is licensed under the MIT License.
