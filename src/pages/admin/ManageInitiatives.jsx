import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';

const ManageInitiatives = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    type: '',
    result: '',
    impact: '',
    status: 'published',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching initiatives:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Fetched initiatives:', data);
      setInitiatives(data || []);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      setInitiatives([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const filePath = `initiatives/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Upload failed: ${error.message || 'Please try again'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInitiative) {
        // Preserve existing data when admin doesn't change fields
        const updateData = {
          title: formData.title || editingInitiative.title,
          description: formData.description !== undefined ? formData.description : (editingInitiative.description || null),
          image_url: formData.imageUrl || editingInitiative.image_url || null,
          document_url: formData.documentUrl || editingInitiative.document_url || null,
          document_name: formData.documentName !== undefined ? formData.documentName : (editingInitiative.document_name || null),
          type: formData.type !== undefined ? formData.type : (editingInitiative.type || null),
          result: formData.result !== undefined ? formData.result : (editingInitiative.result || null),
          impact: formData.impact !== undefined ? formData.impact : (editingInitiative.impact || null),
          status: formData.status || editingInitiative.status || 'pending',
        };
        const { error } = await supabase
          .from('initiatives')
          .update(updateData)
          .eq('id', editingInitiative.id);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        fetchInitiatives(); // Refresh the list after update
      } else {
        const insertData = {
          title: formData.title,
          description: formData.description || null,
          image_url: formData.imageUrl || null,
          document_url: formData.documentUrl || null,
          document_name: formData.documentName || null,
          type: formData.type || null,
          result: formData.result || null,
          impact: formData.impact || null,
          status: formData.status || 'pending',
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('initiatives')
          .insert(insertData)
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingInitiative(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        type: '',
        result: '',
        impact: '',
        status: 'published',
      });
      fetchInitiatives();
    } catch (error) {
      console.error('Error saving initiative:', error);
      alert('Error saving initiative. Please try again.');
    }
  };

  const handleEdit = (initiative) => {
    setEditingInitiative(initiative);
    setFormData({
      title: initiative.title || '',
      description: initiative.description || '',
      imageUrl: initiative.image_url || initiative.imageUrl || '', // Map snake_case to camelCase
      documentUrl: initiative.document_url || initiative.documentUrl || '',
      documentName: initiative.document_name || initiative.documentName || '',
      type: initiative.type || '',
      result: initiative.result || '',
      impact: initiative.impact || '',
      status: initiative.status || 'pending',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      try {
        const { error } = await supabase
          .from('initiatives')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchInitiatives();
      } catch (error) {
        console.error('Error deleting initiative:', error);
        alert('Error deleting initiative. Please try again.');
      }
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        setFormData({ ...formData, imageUrl: url });
      }
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Initiatives</h1>
          <button
            onClick={() => {
              setEditingInitiative(null);
              setFormData({
                title: '',
                description: '',
                imageUrl: '',
                type: '',
                result: '',
                impact: '',
                status: 'published',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add New Initiative</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading initiatives...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {initiatives.map((initiative) => (
                  <tr key={initiative.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{initiative.title}</td>
                    <td className="px-6 py-4">{initiative.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          initiative.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {initiative.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(initiative)}
                          className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(initiative.id)}
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
                  {editingInitiative ? 'Edit Initiative' : 'Add New Initiative'}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingInitiative(null); }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Impact</label>
                  <textarea value={formData.impact} onChange={(e) => setFormData({ ...formData, impact: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Result</label>
                  <textarea value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                  <div className="flex items-center space-x-4">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="btn-secondary cursor-pointer flex items-center space-x-2">
                      <ImageIcon size={18} />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    </label>
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditingInitiative(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingInitiative ? 'Update' : 'Create'} Initiative</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInitiatives;
