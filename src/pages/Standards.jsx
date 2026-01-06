import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { BookOpen, Plus, X, CheckCircle, Upload, FileText, File, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Standards = () => {
  const { requireAuth } = useRequireAuth();
  const [showForm, setShowForm] = useState(false);
  const [showAllStandards, setShowAllStandards] = useState(false);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    category: 'DPI',
  });

  useEffect(() => {
    if (showAllStandards) {
      fetchStandards();
    }
  }, [showAllStandards]);

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection('standards', { status: 'published' });
      
      // Add demo DPI PDFs as default entries
      const demoStandards = [
        {
          id: 'demo-dpi-playbook',
          title: 'The DPI Approach: A Playbook',
          description: 'A comprehensive guide to Digital Public Infrastructure (DPI) approach, providing frameworks and best practices for designing and implementing people-centered digital transformation initiatives.',
          category: 'DPI',
          fileUrl: 'https://www.undp.org/sites/g/files/zskgke326/files/2023-08/undp-the-dpi-approach-a-playbook.pdf',
          status: 'published',
        },
        {
          id: 'demo-accelerating-sdgs',
          title: 'Accelerating the SDGs through Digital Public Infrastructure',
          description: 'This document explores how Digital Public Infrastructure can accelerate progress towards the Sustainable Development Goals (SDGs), providing insights and strategies for leveraging digital transformation for sustainable development.',
          category: 'DPI',
          fileUrl: 'https://www.undp.org/sites/g/files/zskgke326/files/2023-08/accelerating_the_sdgs_through_digital_public_infrastructure.pdf',
          status: 'published',
        },
        ...data
      ];
      
      setStandards(demoStandards);
    } catch (error) {
      console.error('Error fetching standards:', error);
      // Even if fetch fails, show the demo PDFs
      setStandards([
        {
          id: 'demo-dpi-playbook',
          title: 'The DPI Approach: A Playbook',
          description: 'A comprehensive guide to Digital Public Infrastructure (DPI) approach, providing frameworks and best practices for designing and implementing people-centered digital transformation initiatives.',
          category: 'DPI',
          fileUrl: 'https://www.undp.org/sites/g/files/zskgke326/files/2023-08/undp-the-dpi-approach-a-playbook.pdf',
          status: 'published',
        },
        {
          id: 'demo-accelerating-sdgs',
          title: 'Accelerating the SDGs through Digital Public Infrastructure',
          description: 'This document explores how Digital Public Infrastructure can accelerate progress towards the Sustainable Development Goals (SDGs), providing insights and strategies for leveraging digital transformation for sustainable development.',
          category: 'DPI',
          fileUrl: 'https://www.undp.org/sites/g/files/zskgke326/files/2023-08/accelerating_the_sdgs_through_digital_public_infrastructure.pdf',
          status: 'published',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <File size={24} />;
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FileText size={24} className="text-red-600" />;
    if (['doc', 'docx'].includes(extension)) return <File size={24} className="text-blue-600" />;
    return <File size={24} />;
  };

  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'Unknown';
    const extension = fileUrl.split('.').pop()?.toUpperCase();
    return extension || 'Unknown';
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
      alert(`Error uploading file: ${error.message || 'Please try again'}`);
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
    
    const url = await handleFileUpload(file);
    if (url) {
      setFormData({ ...formData, fileUrl: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requireAuth('submit a standard')) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        file_url: formData.fileUrl || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { data, error } = await supabase
        .from('standards')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      clearCache('standards');

      setSubmitSuccess(true);
      setFormData({
        title: '',
        description: '',
        fileUrl: '',
        category: 'DPI',
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting standard:', error);
      alert('Error submitting standard. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <BookOpen className="mx-auto mb-2" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Standards & Best Practices</h1>
          <p className="text-base max-w-3xl mx-auto">
            Access our comprehensive collection of digital transformation standards and guidelines
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="flex items-center justify-center space-x-4 mb-8">
          {!showForm && !showAllStandards && (
            <>
              <button
                onClick={() => {
                  if (requireAuth('submit a new standard')) {
                    setShowForm(true);
                  }
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Submit New Standard</span>
              </button>
              <button
                onClick={() => setShowAllStandards(true)}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Eye size={20} />
                <span>View All</span>
              </button>
            </>
          )}
          {showAllStandards && !showForm && (
            <button
              onClick={() => setShowAllStandards(false)}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <X size={20} />
              <span>Close</span>
            </button>
          )}
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="max-w-3xl mx-auto card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-undp-blue">Submit New Standard</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    title: '',
                    description: '',
                    fileUrl: '',
                    category: 'DPI',
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
                <span>Standard submitted successfully! Awaiting admin approval.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                  placeholder="Enter standard title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                  placeholder="Enter short description..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="DPI">DPI Standards</option>
                  <option value="LGI">LGI Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  File Upload <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                >
                  <Upload size={18} />
                  <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                </label>
                {formData.fileUrl && (
                  <div className="mt-4 flex items-center space-x-2">
                    <FileText size={20} className="text-undp-blue" />
                    <span className="text-sm text-gray-700">File uploaded successfully</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fileUrl: '' })}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      fileUrl: '',
                      category: 'DPI',
                    });
                    setSubmitSuccess(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || !formData.fileUrl}>
                  {submitting ? (
                    <span className="inline-flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    'Submit Standard'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View All Standards */}
        {showAllStandards && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue mb-6 sm:mb-8 text-center">All Standards</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : standards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {standards.map((standard) => (
                  <div key={standard.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            standard.category === 'DPI' 
                              ? 'bg-undp-blue text-white' 
                              : 'bg-undp-dark-blue text-white'
                          }`}>
                            {standard.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-undp-blue mb-2">{standard.title}</h3>
                        {standard.description && (
                          <p className="text-gray-600 text-sm mb-3">{standard.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {getFileIcon(standard.fileUrl)}
                          <span>{getFileType(standard.fileUrl)}</span>
                        </div>
                      </div>
                      {standard.fileUrl && (
                        <a
                          href={standard.fileUrl}
                          onClick={(e) => {
                            if (!requireAuth('download this file')) {
                              e.preventDefault();
                            }
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary ml-4 flex items-center space-x-2 whitespace-nowrap"
                        >
                          <Eye size={18} />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No standards available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Standards;
