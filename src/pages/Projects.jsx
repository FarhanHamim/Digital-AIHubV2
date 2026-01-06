import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { Download, FileText, Filter, Search, Plus, X, CheckCircle, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const Projects = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    supportType: '',
    documentUrl: '',
    duration: '',
    impact: '',
  });

  const fetchProjects = async () => {
    try {
      const data = await fetchCollection('projects', { status: 'published' });
      // Map snake_case to camelCase for display
      const mappedData = data.map(proj => ({
        ...proj,
        supportType: proj.support_type || proj.supportType,
        documentUrl: proj.document_url || proj.documentUrl,
      }));
      setProjects(mappedData);
      setFilteredProjects(mappedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache synchronously first for instant display
    const cacheKey = `projects_${JSON.stringify({ status: 'published' })}_all`;
    const cached = getCachedData(cacheKey, true);
    
    if (cached) {
      // Map snake_case to camelCase for display
      const mappedCached = cached.map(proj => ({
        ...proj,
        supportType: proj.support_type || proj.supportType,
        documentUrl: proj.document_url || proj.documentUrl,
      }));
      setProjects(mappedCached);
      setFilteredProjects(mappedCached);
      setLoading(false);
    }
    
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (selectedType !== 'all') {
      filtered = filtered.filter(proj => proj.supportType === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(proj =>
        proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.impact?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [selectedType, searchTerm, projects]);

  const supportTypes = ['all', ...new Set(projects.map(proj => proj.supportType).filter(Boolean))];

  const handleDocumentUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const filePath = `projects/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Upload failed: ${error.message || 'Please try again'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!requireAuth('upload files')) {
      e.target.value = '';
      return;
    }
    
    const url = await handleDocumentUpload(file);
    if (url) {
      setFormData({ ...formData, documentUrl: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requireAuth('submit a project')) {
      return;
    }
    
    setSubmitting(true);

    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: formData.title,
        support_type: formData.supportType || null,
        document_url: formData.documentUrl || null,
        duration: formData.duration || null,
        impact: formData.impact || null,
        status: 'pending', // Admin will need to approve
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Clear cache so new data is fetched
      clearCache('projects');

      setSubmitSuccess(true);
      setFormData({
        title: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error submitting project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Projects & Supports</h1>
          <p className="text-base max-w-3xl mx-auto">
            Explore our portfolio of digital transformation projects and support initiatives
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Submit Project Form */}
        <div className="mb-8">
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => {
                  if (requireAuth('submit a new project')) {
                    setShowForm(true);
                  }
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Submit New Project</span>
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-undp-blue">Submit New Project</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      supportType: '',
                      documentUrl: '',
                      duration: '',
                      impact: '',
                    });
                    setSubmitSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close form"
                >
                  <X size={24} />
                </button>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle size={20} />
                  <span>Project submitted successfully! Awaiting admin approval.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="supportType" className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="supportType"
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                  >
                    <option value="">Select Support Type</option>
                    <option value="Architecture Development">Architecture Development</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Capacity Building">Capacity Building</option>
                    <option value="Training">Training</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="duration"
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="e.g., 6 months, 1 year, Q1 2024 - Q2 2024"
                  />
                </div>

                <div>
                  <label htmlFor="impact" className="block text-sm font-semibold text-gray-700 mb-2">
                    Impact <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="impact"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Describe the impact and outcomes of this project..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Details (Documents)
                  </label>
                  <input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-undp-light-grey file:text-undp-blue
                      hover:file:bg-gray-200"
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-2">Uploading document...</p>}
                  {formData.documentUrl && (
                    <div className="mt-4 flex items-center space-x-2">
                      <FileText size={20} className="text-undp-blue" />
                      <span className="text-sm text-gray-700">Document uploaded successfully</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, documentUrl: '' })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        title: '',
                        supportType: '',
                        documentUrl: '',
                        duration: '',
                        impact: '',
                      });
                      setSubmitSuccess(false);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Project</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
              >
                {supportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table/List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {loading && projects.length === 0 ? (
              <SkeletonLoader type="card" count={3} />
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className="card">
                  <div className="font-semibold text-undp-blue text-lg mb-2">{project.title}</div>
                  <div className="mb-2">
                    <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm">
                      {project.supportType}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Duration:</strong> {project.duration || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mb-4 line-clamp-3">{project.impact}</div>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="btn-primary w-full text-sm py-2.5 inline-flex items-center justify-center space-x-2"
                  >
                    <FileText size={16} />
                    <span>View Details</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No projects found. Try adjusting your filters.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700">Project Name</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700">Support Type</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700">Impact</th>
                  <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 relative min-h-[200px]">
                {loading && projects.length === 0 ? (
                  <SkeletonLoader type="table" count={5} />
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-undp-light-grey transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="font-semibold text-undp-blue">{project.title}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm">
                          {project.supportType}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-600">{project.duration || 'N/A'}</td>
                      <td className="px-4 lg:px-6 py-4 text-gray-600 line-clamp-2 max-w-md">{project.impact}</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="btn-primary text-sm py-2 px-4 inline-flex items-center space-x-2"
                        >
                          <FileText size={16} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No projects found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-undp-blue pr-2">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Project Name</h3>
                <p className="text-gray-800 text-lg">{selectedProject.title}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Support Type</h3>
                <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedProject.supportType || selectedProject.support_type}
                </span>
              </div>
              
              {selectedProject.duration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Project Duration</h3>
                  <p className="text-gray-600">{selectedProject.duration}</p>
                </div>
              )}
              
              {selectedProject.impact && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Impact</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedProject.impact}</p>
                </div>
              )}
              
              {(selectedProject.documentUrl || selectedProject.document_url) && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Project Details (Documents)</h3>
                  <a
                    href={selectedProject.documentUrl || selectedProject.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!requireAuth('download this document')) {
                        e.preventDefault();
                      }
                    }}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Download size={18} />
                    <span>Download Document</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
