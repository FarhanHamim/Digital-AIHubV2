import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/config';
import { FileText, Calendar, BookOpen, Target, Clock, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState({
    initiatives: [],
    projects: [],
    events: [],
    standards: [],
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchUserSubmissions();
    }
  }, [currentUser]);

  const fetchUserSubmissions = async () => {
    try {
      setLoading(true);
      const userEmail = currentUser.email;

      // Fetch all submissions from Supabase filtered by created_by
      const [initiativesResult, projectsResult, eventsResult, standardsResult] = await Promise.all([
        supabase.from('initiatives').select('*').eq('created_by', userEmail).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('created_by', userEmail).order('created_at', { ascending: false }),
        supabase.from('events').select('*').eq('created_by', userEmail).order('created_at', { ascending: false }),
        supabase.from('standards').select('*').eq('created_by', userEmail).order('created_at', { ascending: false }),
      ]);

      // Extract data from results (handle errors gracefully)
      const initiatives = initiativesResult.data || [];
      const projects = projectsResult.data || [];
      const events = eventsResult.data || [];
      const standards = standardsResult.data || [];

      setSubmissions({ initiatives, projects, events, standards });

      // Calculate stats
      const allSubmissions = [...initiatives, ...projects, ...events, ...standards];
      const stats = {
        total: allSubmissions.length,
        pending: allSubmissions.filter(s => s.status === 'pending').length,
        approved: allSubmissions.filter(s => s.status === 'published' || s.status === 'approved').length,
        rejected: allSubmissions.filter(s => s.status === 'rejected').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching user submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-undp-blue text-white py-8">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-lg opacity-90">Manage your submissions and track their status</p>
        </div>
      </div>

      <div className="section-container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                    <p className="text-3xl font-bold text-undp-blue">{stats.total}</p>
                  </div>
                  <FileText className="text-undp-blue" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="text-yellow-600" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="text-red-600" size={32} />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-undp-blue mb-4">Account Information</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{currentUser?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-semibold">{currentUser?.isAdmin ? 'Administrator' : 'User'}</span>
                </div>
              </div>
            </div>

            {/* Submissions Sections */}
            {submissions.initiatives.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="text-undp-blue" size={24} />
                  <h2 className="text-xl font-bold text-undp-blue">My Initiatives</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-undp-light-grey">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.initiatives.map((item) => (
                        <tr key={item.id} className="hover:bg-undp-light-grey">
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600">{item.type || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {submissions.projects.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="text-undp-blue" size={24} />
                  <h2 className="text-xl font-bold text-undp-blue">My Projects</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-undp-light-grey">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Support Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.projects.map((item) => (
                        <tr key={item.id} className="hover:bg-undp-light-grey">
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600">{item.supportType || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {submissions.events.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="text-undp-blue" size={24} />
                  <h2 className="text-xl font-bold text-undp-blue">My Events</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-undp-light-grey">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Event Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.events.map((item) => (
                        <tr key={item.id} className="hover:bg-undp-light-grey">
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{item.type || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {submissions.standards.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="text-undp-blue" size={24} />
                  <h2 className="text-xl font-bold text-undp-blue">My Standards</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-undp-light-grey">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.standards.map((item) => (
                        <tr key={item.id} className="hover:bg-undp-light-grey">
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600">{item.category || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {stats.total === 0 && (
              <div className="card text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
                <p className="text-gray-600 mb-6">Start submitting content to see it here!</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/initiatives" className="btn-primary">Submit Initiative</a>
                  <a href="/projects" className="btn-primary">Submit Project</a>
                  <a href="/events" className="btn-primary">Submit Event</a>
                  <a href="/standards" className="btn-primary">Submit Standard</a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
