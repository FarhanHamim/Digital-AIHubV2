import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (email.toLowerCase().trim() === 'admin') {
      setError('Admin account cannot be created. Use the default admin credentials to login.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(email, password);
      
      // Check if email confirmation is required
      if (result?.requiresEmailConfirmation) {
        setSuccess(true);
        setError(''); // Clear any previous errors
        // Show success message for longer since user needs to check email
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Account created and auto-logged in
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      }
    } catch (err) {
      let errorMessage = 'Failed to create account. ';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      setSuccess(false);
      console.error(err);
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
              <UserPlus className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-undp-blue mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up for a new user account</p>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2 text-green-700">
                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Account created successfully!</p>
                  <p className="text-sm mt-1">
                    Please check your email to confirm your account before logging in. 
                    You'll be redirected to the login page shortly.
                  </p>
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
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
                placeholder="admin@undp.org"
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
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-undp-blue font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
