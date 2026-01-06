import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, Upload, X, User } from 'lucide-react';

const ManageTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    photoUrl: '',
    email: '',
    linkedin: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const filePath = `team/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('team')
          .update(formData)
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const insertData = {
          name: formData.name,
          designation: formData.designation || null,
          photo_url: formData.photoUrl || null,
          section: formData.section || 'team',
          email: formData.email || null,
          linkedin: formData.linkedin || null,
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('team')
          .insert(insertData)
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingMember(null);
      setFormData({ name: '', designation: '', photoUrl: '', email: '', linkedin: '' });
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Error saving team member. Please try again.');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      designation: member.designation || '',
      photoUrl: member.photoUrl || '',
      email: member.email || '',
      linkedin: member.linkedin || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const { error } = await supabase
          .from('team')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchTeam();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member. Please try again.');
      }
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handlePhotoUpload(file);
      if (url) {
        setFormData({ ...formData, photoUrl: url });
      }
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Team</h1>
          <button onClick={() => { setEditingMember(null); setFormData({ name: '', designation: '', photoUrl: '', email: '', linkedin: '' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Add New Member</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{member.name}</td>
                    <td className="px-6 py-4">{member.designation}</td>
                    <td className="px-6 py-4">{member.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(member)} className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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
                <h2 className="text-2xl font-bold text-undp-blue">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h2>
                <button onClick={() => { setShowModal(false); setEditingMember(null); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                  <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center space-x-4">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                    <label htmlFor="photo-upload" className="btn-secondary cursor-pointer flex items-center space-x-2">
                      <Upload size={18} />
                      <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </label>
                    {formData.photoUrl && (
                      <div className="relative">
                        <img src={formData.photoUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditingMember(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingMember ? 'Update' : 'Create'} Member</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeam;
