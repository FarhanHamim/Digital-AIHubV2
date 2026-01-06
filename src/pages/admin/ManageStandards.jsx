import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';

const ManageStandards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'DPI',
    description: '',
    fileUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from('standards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStandards(data || []);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const filePath = `standards/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
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
      if (editingStandard) {
        const { error } = await supabase
          .from('standards')
          .update(formData)
          .eq('id', editingStandard.id);
        if (error) throw error;
      } else {
        const insertData = {
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          file_url: formData.fileUrl || null,
          status: formData.status || 'pending',
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('standards')
          .insert(insertData)
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingStandard(null);
      setFormData({ title: '', category: 'DPI', description: '', fileUrl: '' });
      fetchStandards();
    } catch (error) {
      console.error('Error saving standard:', error);
      alert('Error saving standard. Please try again.');
    }
  };

  const handleEdit = (standard) => {
    setEditingStandard(standard);
    setFormData({
      title: standard.title || '',
      category: standard.category || 'DPI',
      description: standard.description || '',
      fileUrl: standard.fileUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this standard?')) {
      try {
        const { error } = await supabase
          .from('standards')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchStandards();
      } catch (error) {
        console.error('Error deleting standard:', error);
        alert('Error deleting standard. Please try again.');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleFileUpload(file);
      if (url) {
        setFormData({ ...formData, fileUrl: url });
      }
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Standards</h1>
          <button onClick={() => { setEditingStandard(null); setFormData({ title: '', category: 'DPI', description: '', fileUrl: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Add New Standard</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading standards...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {standards.map((standard) => (
                  <tr key={standard.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{standard.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${standard.category === 'DPI' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {standard.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(standard)} className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(standard.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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
                <h2 className="text-2xl font-bold text-undp-blue">{editingStandard ? 'Edit Standard' : 'Add New Standard'}</h2>
                <button onClick={() => { setShowModal(false); setEditingStandard(null); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue">
                    <option value="DPI">DPI</option>
                    <option value="LGI">LGI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Document File</label>
                  <div className="flex items-center space-x-4">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="btn-secondary cursor-pointer flex items-center space-x-2">
                      <Upload size={18} />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </label>
                    {formData.fileUrl && <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-undp-blue hover:underline text-sm">View File</a>}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditingStandard(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingStandard ? 'Update' : 'Create'} Standard</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStandards;
