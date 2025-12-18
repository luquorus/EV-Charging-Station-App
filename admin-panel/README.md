# EV Charging Stations - Admin Panel

React-based admin panel for managing EV charging stations and users.

## Features

- 🔐 **Authentication** - Login/logout with JWT
- 📊 **Dashboard** - Overview statistics
- 🔌 **Stations Management** - CRUD operations for charging stations
- 👥 **Users Management** - CRUD operations for users (ADMIN only)
- 🎨 **Modern UI** - Clean and responsive design

## Setup

### 1. Install Dependencies

```powershell
cd admin-panel
npm install
```

### 2. Start Development Server

```powershell
npm run dev
```

Admin panel will be available at: `http://localhost:5173`

### 3. Build for Production

```powershell
npm run build
```

## Usage

### Default Login Credentials

After seeding admin user:

- **Email:** `admin@example.com`
- **Password:** `Admin123!`

### Pages

1. **Dashboard** (`/dashboard`) - View statistics
2. **Stations** (`/stations`) - Manage charging stations
   - View all stations
   - Create new station
   - Edit station details
   - Delete station
3. **Users** (`/users`) - Manage users (ADMIN only)
   - View all users
   - Create new user
   - Edit user details
   - Delete user

## API Integration

The admin panel connects to the backend API at `http://localhost:3000` (configured via Vite proxy).

### Required Backend APIs

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/stations` - List stations
- `POST /api/v1/stations` - Create station (ADMIN/EDITOR)
- `PUT /api/v1/stations/:id` - Update station (ADMIN/EDITOR)
- `DELETE /api/v1/stations/:id` - Delete station (ADMIN)
- `GET /api/v1/users` - List users (ADMIN)
- `POST /api/v1/users` - Create user (ADMIN)
- `PUT /api/v1/users/:id` - Update user (ADMIN)
- `DELETE /api/v1/users/:id` - Delete user (ADMIN)

## Project Structure

```
admin-panel/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx  # Main layout with sidebar
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Stations.jsx
│   │   └── Users.jsx
│   ├── services/       # API service
│   │   └── api.js
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Technologies

- **React 18** - UI framework
- **React Router** - Routing
- **Vite** - Build tool
- **Fetch API** - HTTP requests

