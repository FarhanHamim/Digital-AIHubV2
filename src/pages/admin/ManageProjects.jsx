import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, Upload, X, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    supportType: '',
    documentUrl: '',
    duration: '',
    impact: '',
    status: 'published',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
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
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // Map camelCase to snake_case and preserve existing data
        const updateData = {
          title: formData.title || editingProject.title,
          support_type: formData.supportType || editingProject.support_type || null,
          document_url: formData.documentUrl || editingProject.document_url || null,
          duration: formData.duration || editingProject.duration || null,
          impact: formData.impact || editingProject.impact || null,
          status: formData.status || editingProject.status || 'pending',
        };
        const { error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', editingProject.id);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        fetchProjects(); // Refresh the list after update
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({ 
            ...formData, 
            support_type: formData.supportType,
            document_url: formData.documentUrl,
            created_at: new Date().toISOString() 
          })
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({
        title: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',
        status: 'published',
      });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      supportType: project.support_type || project.supportType || '',
      documentUrl: project.document_url || project.documentUrl || '',
      duration: project.duration || '',
      impact: project.impact || '',
      status: project.status || 'published',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleFileUpload(file);
      if (url) {
        setFormData({ ...formData, documentUrl: url });
      }
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Projects</h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({
                title: '',
                supportType: '',
                documentUrl: '',
                duration: '',
                impact: '',
                status: 'published',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Support Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{project.title}</td>
                    <td className="px-6 py-4">{project.supportType}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          project.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-undp-blue">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Support Type</label>
                  <select
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 6 months, 1 year, Q1 2024 - Q2 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Impact</label>
                  <textarea
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    rows={4}
                    placeholder="Describe the impact and outcomes of this project..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Details (Documents)</label>
                  <p className="text-xs text-gray-500 mb-2">Upload project documents, reports, or details (PDF format)</p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className={`btn-secondary cursor-pointer flex items-center space-x-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          <span>Upload Document</span>
                        </>
                      )}
                    </label>
                    {formData.documentUrl && (
                      <div className="flex items-center space-x-2">
                        <a
                          href={formData.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-undp-blue hover:underline text-sm flex items-center space-x-1"
                        >
                          <FileText size={16} />
                          <span>View Document</span>
                        </a>
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
                  >
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProject(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProject ? 'Update' : 'Create'} Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
