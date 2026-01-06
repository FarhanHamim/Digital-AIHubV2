import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Initiatives from './pages/Initiatives';
import Learning from './pages/Learning';
import Projects from './pages/Projects';
import Events from './pages/Events';
import Standards from './pages/Standards';
import Team from './pages/Team';

// Admin Pages
import Login from './pages/admin/Login';
import Signup from './pages/admin/Signup';
import Dashboard from './pages/admin/Dashboard';
import ManageProjects from './pages/admin/ManageProjects';
import ManageInitiatives from './pages/admin/ManageInitiatives';
import ManageLearning from './pages/admin/ManageLearning';
import ManageEvents from './pages/admin/ManageEvents';
import ManageStandards from './pages/admin/ManageStandards';
import ManageTeam from './pages/admin/ManageTeam';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/initiatives" element={<Initiatives />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/events" element={<Events />} />
              <Route path="/standards" element={<Standards />} />
              <Route path="/team" element={<Team />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<Login />} />
              
              {/* User Dashboard - Protected for logged-in users */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/initiatives"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageInitiatives />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/learning"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageLearning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/standards"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageStandards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/team"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageTeam />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
