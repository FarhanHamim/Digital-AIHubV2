import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/initiatives', label: 'Initiatives' },
    { path: '/learning', label: 'Learning & Capacity' },
    { path: '/projects', label: 'Projects & Supports' },
    { path: '/events', label: 'Events & Archive' },
    { path: '/standards', label: 'Standards & Best Practices' },
    { path: '/team', label: 'Team & Advisory' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsOpen(false);
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Get user initials for avatar
  const getUserInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0];
    if (parts.length >= 2) {
      return parts.substring(0, 2).toUpperCase();
    }
    return parts.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto pl-2 sm:pl-4 lg:pl-6 pr-6 sm:pr-8 lg:pr-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/UNDP_logo.svg/1011px-UNDP_logo.svg.png" 
              alt="UNDP Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-undp-blue">Digital & AI Hub</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-undp-blue border-b-2 border-undp-blue'
                    : 'text-gray-700 hover:text-undp-blue'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-undp-light-grey transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-undp-blue text-white flex items-center justify-center text-xs font-semibold">
                    {getUserInitials(currentUser.email)}
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.email || 'User'}</p>
                      {currentUser.isAdmin && (
                        <p className="text-xs text-gray-500 mt-1">Administrator</p>
                      )}
                    </div>
                    {currentUser.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-undp-light-grey transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-undp-light-grey transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-undp-light-grey transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs py-1.5 px-3"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-undp-light-grey"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-undp-blue text-white'
                    : 'text-gray-700 hover:bg-undp-light-grey'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {currentUser ? (
              <>
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-undp-blue text-white flex items-center justify-center text-sm font-semibold">
                      {getUserInitials(currentUser.email)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{currentUser.email || 'User'}</p>
                      {currentUser.isAdmin && (
                        <p className="text-xs text-gray-500">Administrator</p>
                      )}
                    </div>
                  </div>
                </div>
                {currentUser.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-undp-light-grey"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/user/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-undp-light-grey"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block btn-primary text-center w-full mt-3 text-sm py-2 flex items-center justify-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block btn-primary text-center mt-3 text-sm py-2"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
