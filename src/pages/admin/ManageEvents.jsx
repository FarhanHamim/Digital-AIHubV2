import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'upcoming',
    description: '',
    outcome: '',
    location: '',
    videoUrls: [],
    galleryImages: [],
    status: 'pending',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    const urls = [];
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const filePath = `events/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
      }
      return urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title: formData.title || editingEvent?.title,
        description: formData.description !== undefined ? formData.description : (editingEvent?.description || null),
        outcome: formData.outcome !== undefined ? formData.outcome : (editingEvent?.outcome || null),
        date: formData.date ? new Date(formData.date).toISOString() : (editingEvent?.date || null),
        location: formData.location !== undefined ? formData.location : (editingEvent?.location || null),
        type: formData.type || editingEvent?.type || 'upcoming',
        video_urls: formData.videoUrls ? formData.videoUrls.filter(url => url.trim() !== '') : (editingEvent?.video_urls || []),
        gallery_images: formData.galleryImages || editingEvent?.gallery_images || [],
        status: formData.status || editingEvent?.status || 'pending',
      };
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        fetchEvents(); // Refresh the list after update
      } else {
        const insertData = {
          ...eventData,
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('events')
          .insert(insertData)
          .select();
        if (error) throw error;
      }
      setShowModal(false);
      setEditingEvent(null);
      setFormData({ title: '', date: '', type: 'upcoming', description: '', outcome: '', location: '', videoUrls: [], galleryImages: [], status: 'pending' });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const eventDate = event.date ? (event.date.toDate ? event.date.toDate().toISOString().split('T')[0] : new Date(event.date).toISOString().split('T')[0]) : '';
    // Handle both old single videoUrl and new videoUrls array
    const videoUrls = event.video_urls || event.videoUrls || (event.videoUrl ? [event.videoUrl] : []);
    const galleryImages = event.gallery_images || event.galleryImages || [];
    setFormData({
      title: event.title || '',
      date: eventDate,
      type: event.type || 'upcoming',
      description: event.description || '',
      outcome: event.outcome || '',
      location: event.location || '',
      videoUrls: videoUrls,
      galleryImages: galleryImages,
      status: event.status || 'pending',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls = await handleImageUpload(files);
      setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...urls] });
    }
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Events</h1>
          <button onClick={() => { setEditingEvent(null); setFormData({ title: '', date: '', type: 'upcoming', description: '', outcome: '', location: '', videoUrls: [], galleryImages: [], status: 'pending' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Add New Event</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-undp-light-grey">
                    <td className="px-6 py-4 font-semibold">{event.title}</td>
                    <td className="px-6 py-4">
                      {event.date ? (
                        event.date.toDate ? event.date.toDate().toLocaleDateString() : new Date(event.date).toLocaleDateString()
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${event.type === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(event)} className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(event.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-undp-blue">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                <button onClick={() => { setShowModal(false); setEditingEvent(null); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue">
                      <option value="upcoming">Upcoming</option>
                      <option value="archive">Archive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" placeholder="Enter short description..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Outcome</label>
                  <textarea value={formData.outcome} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue" placeholder="Describe the event outcome..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Videos (Multiple URLs)</label>
                  <div className="space-y-2">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...formData.videoUrls];
                            newUrls[index] = e.target.value;
                            setFormData({ ...formData, videoUrls: newUrls });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue"
                          placeholder="Enter video URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              videoUrls: formData.videoUrls.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrls: [...formData.videoUrls, ''] })}
                      className="btn-secondary text-sm py-2 px-4 inline-flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Video URL</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images</label>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
                  <label htmlFor="gallery-upload" className="btn-secondary cursor-pointer inline-flex items-center space-x-2">
                    <ImageIcon size={18} />
                    <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.galleryImages.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        <button type="button" onClick={() => setFormData({ ...formData, galleryImages: formData.galleryImages.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
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
                  <button type="button" onClick={() => { setShowModal(false); setEditingEvent(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingEvent ? 'Update' : 'Create'} Event</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
