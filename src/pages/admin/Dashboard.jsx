import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/config';
import { LogOut, FileText, Lightbulb, BookOpen, Calendar, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    initiatives: 0,
    learningModules: 0,
    events: 0,
    standards: 0,
    team: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const collections = ['projects', 'initiatives', 'learningModules', 'events', 'standards', 'team'];
        const statsData = {};

        for (const col of collections) {
          const { count, error } = await supabase
            .from(col)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error(`Error fetching ${col}:`, error);
            statsData[col] = 0;
          } else {
            statsData[col] = count || 0;
          }
        }

        setStats({
          projects: statsData.projects || 0,
          initiatives: statsData.initiatives || 0,
          learningModules: statsData.learningModules || 0,
          events: statsData.events || 0,
          standards: statsData.standards || 0,
          team: statsData.team || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const statCards = [
    { label: 'Projects', count: stats.projects, icon: FileText, color: 'bg-blue-500', link: '/admin/projects' },
    { label: 'Initiatives', count: stats.initiatives, icon: Lightbulb, color: 'bg-yellow-500', link: '/admin/initiatives' },
    { label: 'Learning Modules', count: stats.learningModules, icon: BookOpen, color: 'bg-green-500', link: '/admin/learning' },
    { label: 'Events', count: stats.events, icon: Calendar, color: 'bg-purple-500', link: '/admin/events' },
    { label: 'Standards', count: stats.standards, icon: Award, color: 'bg-red-500', link: '/admin/standards' },
    { label: 'Team Members', count: stats.team, icon: Users, color: 'bg-indigo-500', link: '/admin/team' },
  ];

  return (
    <div className="min-h-screen bg-undp-light-grey">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-undp-blue">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {currentUser?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary flex items-center space-x-2">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="section-container py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="card hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-undp-blue">{stat.count}</p>
                    </div>
                    <div className={`${stat.color} p-4 rounded-lg`}>
                      <Icon className="text-white" size={32} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section-container pb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/projects" className="card hover:shadow-lg transition-shadow text-center">
            <FileText className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Projects</h3>
          </Link>
          <Link to="/admin/initiatives" className="card hover:shadow-lg transition-shadow text-center">
            <Lightbulb className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Initiatives</h3>
          </Link>
          <Link to="/admin/learning" className="card hover:shadow-lg transition-shadow text-center">
            <BookOpen className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Learning Modules</h3>
          </Link>
          <Link to="/admin/events" className="card hover:shadow-lg transition-shadow text-center">
            <Calendar className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Events</h3>
          </Link>
          <Link to="/admin/standards" className="card hover:shadow-lg transition-shadow text-center">
            <Award className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Standards</h3>
          </Link>
          <Link to="/admin/team" className="card hover:shadow-lg transition-shadow text-center">
            <Users className="mx-auto mb-2 text-undp-blue" size={32} />
            <h3 className="font-semibold text-undp-blue">Manage Team</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
