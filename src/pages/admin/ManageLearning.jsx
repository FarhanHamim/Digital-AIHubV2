import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const ManageLearning = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    moduleTitle: '',
    content: '',
    videoUrl: '',
    resources: '',
    curriculum: '',
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learningModules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const moduleData = {
        moduleTitle: formData.moduleTitle,
        content: formData.content || null,
        videoUrl: formData.videoUrl || null,
        resources: formData.resources ? formData.resources.split(',').map(r => r.trim()) : [],
        curriculum: formData.curriculum || null,
      };
      if (editingModule) {
        const { error } = await supabase
          .from('learningModules')
          .update(moduleData)
          .eq('id', editingModule.id);
        if (error) throw error;
      } else {
        const insertData = {
          ...moduleData,
          createdAt: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('learningModules')
          .insert(insertData)
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingModule(null);
      setFormData({ moduleTitle: '', content: '', videoUrl: '', resources: '', curriculum: '' });
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Error saving module. Please try again.');
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      moduleTitle: module.moduleTitle || '',
      content: module.content || '',
      videoUrl: module.videoUrl || '',
      resources: Array.isArray(module.resources) ? module.resources.join(', ') : '',
      curriculum: module.curriculum || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        const { error } = await supabase
          .from('learningModules')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('Error deleting module. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Learning Modules</h1>
          <button onClick={() => { setEditingModule(null); setFormData({ moduleTitle: '', content: '', videoUrl: '', resources: '', curriculum: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Add New Module</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading modules...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Module Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Content Preview</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {modules.map((module) => (
                  <tr key={module.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{module.moduleTitle}</td>
                    <td className="px-6 py-4 text-gray-600 line-clamp-2">{module.content}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(module)} className="p-2 text-undp-blue hover:bg-undp-light-grey rounded">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(module.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-undp-blue">{editingModule ? 'Edit Module' : 'Add New Module'}</h2>
                <button onClick={() => { setShowModal(false); setEditingModule(null); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Module Title *</label>
                  <input type="text" value={formData.moduleTitle} onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                  <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resources (comma-separated)</label>
                  <input type="text" value={formData.resources} onChange={(e) => setFormData({ ...formData, resources: e.target.value })} placeholder="Resource1.pdf, Resource2.zip" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Curriculum</label>
                  <textarea value={formData.curriculum} onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })} rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditingModule(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingModule ? 'Update' : 'Create'} Module</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLearning;
