import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { ArrowRight, ExternalLink, Upload, Image as ImageIcon, Plus, X, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const Initiatives = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    documentUrl: '',
    documentName: '',
    type: '',
    result: '',
    impact: '',
  });

  useEffect(() => {
    // Check cache synchronously first for instant display
    const cacheKey = `initiatives_${JSON.stringify({ status: 'published' })}_all`;
    const cached = getCachedData(cacheKey, true);
    
    if (cached) {
      // Map snake_case to camelCase for display
      const mappedCached = cached.map(init => ({
        ...init,
        imageUrl: init.image_url || init.imageUrl,
        documentUrl: init.document_url || init.documentUrl,
        documentName: init.document_name || init.documentName,
      }));
      setInitiatives(mappedCached);
      setLoading(false);
    }
    
    // Fetch fresh data (will use cache if available)
    const fetchInitiatives = async () => {
      try {
        const data = await fetchCollection('initiatives', { status: 'published' });
        // Map snake_case to camelCase for display
        const mappedData = data.map(init => ({
          ...init,
          imageUrl: init.image_url || init.imageUrl,
          documentUrl: init.document_url || init.documentUrl,
          documentName: init.document_name || init.documentName,
        }));
        setInitiatives(mappedData);
      } catch (error) {
        console.error('Error fetching initiatives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  const filteredInitiatives = selectedType === 'all' 
    ? initiatives 
    : initiatives.filter(init => init.type === selectedType);

  // Filter out unwanted types like 'Test' and get unique types
  const excludedTypes = ['test'];
  const types = ['all', ...new Set(
    initiatives
      .map(init => init.type)
      .filter(Boolean)
      .filter(type => !excludedTypes.includes(type.toLowerCase()))
  )];

  // Debug logging
  useEffect(() => {
    console.log('Selected type:', selectedType);
    console.log('Total initiatives:', initiatives.length);
    console.log('Filtered initiatives:', filteredInitiatives.length);
    console.log('Available types:', types);
  }, [selectedType, initiatives, filteredInitiatives, types]);

  const handleFileUpload = async (file) => {
    if (!file) return null;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return null;
    }
    
    setUploading(true);
    
    try {
      console.log('=== UPLOAD START ===');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Determine file type and folder
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const folder = isImage ? 'initiatives/images' : 'initiatives/documents';
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('Storage path:', filePath);
      
      // Upload file to Supabase Storage
      console.log('Uploading to Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      console.log('Upload complete:', uploadData);
      
      // Get public URL
      console.log('Getting public URL...');
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      const url = urlData.publicUrl;
      console.log('=== UPLOAD SUCCESS ===');
      console.log('URL:', url);
      
      return { url, type: isImage ? 'image' : isPDF ? 'pdf' : 'document', fileName: file.name };
    } catch (error) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Upload failed: ';
      
      if (error.message?.includes('new row violates row-level security') || error.message?.includes('permission denied')) {
        errorMessage += 'Permission denied. Please check Supabase Storage policies allow uploads.';
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage += 'Storage bucket not found. Please create a bucket named "files" in Supabase Storage.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Check internet connection and Supabase configuration.';
      }
      
      alert(errorMessage);
      return null;
    } finally {
      setUploading(false);
      console.log('Upload state reset to false');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!requireAuth('upload files')) {
      e.target.value = '';
      return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    
    // Reset file input immediately to allow re-selection
    e.target.value = '';
    
    try {
      const result = await handleFileUpload(file);
      if (result) {
        console.log('Upload result:', result);
        if (result.type === 'image') {
          setFormData({ ...formData, imageUrl: result.url });
        } else {
          setFormData({ ...formData, documentUrl: result.url, documentName: result.fileName });
        }
      } else {
        console.log('Upload returned null');
      }
    } catch (error) {
      console.error('Error in handleFileChange:', error);
      alert('An error occurred during file upload. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requireAuth('submit an initiative')) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl || null,
        document_url: formData.documentUrl || null,
        document_name: formData.documentName || null,
        type: formData.type || null,
        result: formData.result || null,
        impact: formData.impact || null,
        status: 'pending', // Admin will need to approve
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { data, error } = await supabase
        .from('initiatives')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

              // Clear cache so new data is fetched
              clearCache('initiatives');

              setSubmitSuccess(true);
              setFormData({
                title: '',
                description: '',
                imageUrl: '',
                documentUrl: '',
                documentName: '',
                type: '',
                result: '',
                impact: '',
              });

              setTimeout(() => {
                setSubmitSuccess(false);
                setShowForm(false);
              }, 3000);
    } catch (error) {
      console.error('Error submitting initiative:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert(`Error submitting initiative: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

          return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Our Initiatives</h1>
          <p className="text-base max-w-3xl mx-auto">
            Discover our digital transformation initiatives that drive sustainable development
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Submit Initiative Form */}
        <div className="mb-8">
          {!showForm ? (
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  if (requireAuth('submit a new initiative')) {
                    setShowForm(true);
                  }
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Submit New Initiative</span>
              </button>
              
              {/* Filter - Only show "View All Initiatives" button */}
              <div className="flex gap-4">
                {types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Filter clicked:', type);
                      setSelectedType(type);
                    }}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                      selectedType === type
                        ? 'bg-undp-blue text-white'
                        : 'bg-undp-light-grey text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'View All Initiatives' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-undp-blue">Submit New Initiative</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      imageUrl: '',
                      type: '',
                      result: '',
                      impact: '',
                    });
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
                  <span>Initiative submitted successfully! It will be reviewed by admin.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base"
                    placeholder="Enter initiative title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base"
                    placeholder="Enter a short description of the initiative"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`btn-secondary cursor-pointer flex items-center justify-center space-x-2 py-2.5 min-h-[44px] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} />
                          <span>Upload Image</span>
                        </>
                      )}
                    </label>
                    {formData.imageUrl && (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Document/PDF (Optional)
                  </label>
                  <div className="flex items-center space-x-4 flex-wrap">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className={`btn-secondary cursor-pointer flex items-center justify-center space-x-2 py-2.5 min-h-[44px] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <div className="flex items-center space-x-2 px-3 py-2 bg-undp-light-grey rounded-lg">
                        <FileText size={18} className="text-undp-blue" />
                        <span className="text-sm text-gray-700">{formData.documentName || 'Document'}</span>
                        <a
                          href={formData.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-undp-blue hover:underline text-sm"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, documentUrl: '', documentName: '' })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, TXT, XLS, XLSX (Max 10MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initiative Type *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="e.g., Digital Transformation, Capacity Building"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Result
                  </label>
                  <textarea
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Describe the results achieved"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Impact *
                  </label>
                  <textarea
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base"
                    placeholder="Describe the impact of this initiative"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        title: '',
                        description: '',
                        imageUrl: '',
                        type: '',
                        result: '',
                        impact: '',
                      });
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
                      <span>Submit Initiative</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>


        {/* Initiatives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative min-h-[400px]">
          {loading && initiatives.length === 0 ? (
            <SkeletonLoader type="card" count={6} />
          ) : filteredInitiatives.length > 0 ? (
            filteredInitiatives.map((initiative) => (
              <div
                key={initiative.id}
                className="card group cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedInitiative(initiative)}
              >
                        {initiative.imageUrl && (
                          <div className="relative overflow-hidden rounded-lg mb-4">
                            <img
                              src={initiative.imageUrl}
                              alt={initiative.title}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white text-undp-blue px-3 py-1 rounded-full text-sm font-semibold">
                        {initiative.type}
                      </span>
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-bold text-undp-blue mb-2">{initiative.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{initiative.description}</p>
                
                {/* Hover reveal */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Impact:</p>
                    <p className="text-gray-600 text-sm">{initiative.impact}</p>
                  </div>
                  {initiative.result && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Result:</p>
                      <p className="text-gray-600 text-sm">{initiative.result}</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInitiative(initiative);
                  }}
                  className="btn-primary w-full mt-4 flex items-center justify-center space-x-2 py-2.5 min-h-[44px]"
                >
                  <span>Read More</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No initiatives found. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Initiative Details Modal */}
      {selectedInitiative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-undp-blue pr-2">{selectedInitiative.title}</h2>
              <button
                onClick={() => setSelectedInitiative(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedInitiative.imageUrl && (
                <div>
                  <img
                    src={selectedInitiative.imageUrl}
                    alt={selectedInitiative.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Initiative Name</h3>
                <p className="text-gray-800 text-lg">{selectedInitiative.title}</p>
              </div>

              {selectedInitiative.type && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Type</h3>
                  <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedInitiative.type}
                  </span>
                </div>
              )}

              {selectedInitiative.description && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedInitiative.description}</p>
                </div>
              )}

              {selectedInitiative.impact && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Impact</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedInitiative.impact}</p>
                </div>
              )}

              {selectedInitiative.result && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Result</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedInitiative.result}</p>
                </div>
              )}

              {selectedInitiative.documentUrl && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Document</h3>
                  <a
                    href={selectedInitiative.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <FileText size={18} />
                    <span>{selectedInitiative.documentName || 'View Document'}</span>
                    <ExternalLink size={16} />
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

export default Initiatives;
