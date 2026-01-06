import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle, Info } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  
  // Get redirect path from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Check if admin login (case-insensitive)
        if (email.toLowerCase().trim() === 'admin' && password === 'admin123') {
          navigate('/admin/dashboard');
        } else {
          // Regular user - redirect to original page or home
          navigate(redirectPath || '/');
        }
      }, 100);
    } catch (err) {
      let errorMessage = 'Failed to log in. ';
      
      // Handle Supabase auth errors
      if (err.message?.includes('Email not confirmed') || 
          err.message?.includes('email_not_confirmed') ||
          err.message?.includes('check your email')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (err.message?.includes('Invalid login credentials') || 
                 err.message?.includes('invalid_credentials') ||
                 err.message?.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Invalid email address.';
      } else {
        errorMessage = err.message || 'Failed to log in. Please check your credentials.';
      }
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-undp-blue rounded-lg flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-undp-blue mb-2">
              {isAdminPage ? 'Admin Login' : 'Login'}
            </h1>
            <p className="text-gray-600">
              {isAdminPage ? 'Sign in to access the admin dashboard' : 'Sign in to access your account'}
            </p>
          </div>

          {/* Admin Credentials Info - Only show on /admin page */}
          {isAdminPage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Admin Access:</p>
                  <p>Username: <code className="bg-blue-100 px-1 rounded">admin</code></p>
                  <p>Password: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email / Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
                placeholder={isAdminPage ? "admin or your@email.com" : "your@email.com"}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-undp-blue font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
