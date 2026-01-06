import { useEffect, useState } from 'react';
import { fetchCollection } from '../utils/supabaseHelpers';
import { ChevronDown, ChevronUp, Download, Play, BookOpen, Eye } from 'lucide-react';
import { downloadAsPDF, viewAsPDF, markdownToHTML } from '../utils/downloadPDF';
import { resourceContents } from '../utils/resourceContent';
import { useRequireAuth } from '../utils/requireAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

// Download button component
const DownloadButton = ({ resource, index }) => {
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { requireAuth } = useRequireAuth();
  
  const getContent = () => {
    return resourceContents[resource] || `# ${resource.replace('.md', '').replace(/_/g, ' ')}\n\nContent for ${resource}`;
  };
  
  const handleView = async () => {
    if (!requireAuth('view this resource')) return;
    
    setViewing(true);
    try {
      const content = getContent();
      const htmlContent = markdownToHTML(content);
      const pdfFilename = resource.replace('.md', '.pdf');
      await viewAsPDF(htmlContent, pdfFilename);
    } catch (error) {
      console.error('View error:', error);
      alert('Error generating PDF preview. Please try again.');
    } finally {
      setViewing(false);
    }
  };
  
  const handleDownload = async () => {
    if (!requireAuth('download this resource')) return;
    
    setDownloading(true);
    try {
      const content = getContent();
      const htmlContent = markdownToHTML(content);
      const pdfFilename = resource.replace('.md', '.pdf');
      await downloadAsPDF(htmlContent, pdfFilename);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-undp-light-grey rounded-lg hover:bg-gray-200 transition-colors">
      <span className="text-gray-700">{resource.replace('.md', '.pdf')}</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleView}
          disabled={viewing || downloading}
          className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          title="View PDF"
        >
          {viewing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span>View</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading || viewing}
          className="btn-primary text-sm py-1 px-3 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download PDF"
        >
          {downloading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Learning = () => {
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await fetchCollection('learningModules', {}, false); // Don't cache learning modules
        if (data.length > 0) {
          setModules(data);
        } else {
          // Demo AI modules if no data in database
          setModules([
            {
              id: '1',
              moduleTitle: 'Introduction to Artificial Intelligence',
              content: 'Explore the fundamentals of AI, including machine learning, deep learning, and neural networks. Understand how AI technologies are transforming industries and development work.',
              videoUrl: '',
              resources: ['AI_Fundamentals_Guide.md', 'AI_Glossary.md', 'Introduction_to_ML.md'],
              curriculum: 'Module 1: What is AI?\nModule 2: Types of AI Systems\nModule 3: Machine Learning Basics\nModule 4: Real-World AI Applications\nModule 5: AI Ethics and Responsible Use',
            },
            {
              id: '2',
              moduleTitle: 'AI for Development Practitioners',
              content: 'Learn how to leverage AI tools and technologies in development projects. Discover practical applications of AI for data analysis, program monitoring, and impact assessment.',
              videoUrl: '',
              resources: ['AI_for_Development_Handbook.md', 'Case_Studies_Collection.md', 'AI_Tools_Checklist.md'],
              curriculum: 'Module 1: AI in Development Context\nModule 2: Data Collection and Analysis\nModule 3: Predictive Analytics for Programs\nModule 4: AI-Powered Monitoring & Evaluation\nModule 5: Building AI-Ready Organizations',
            },
            {
              id: '3',
              moduleTitle: 'Natural Language Processing (NLP) Basics',
              content: 'Understand how computers process and understand human language. Learn about text analysis, sentiment analysis, and language models for development applications.',
              videoUrl: '',
              resources: ['NLP_Fundamentals.md', 'Text_Analysis_Tutorial.md', 'NLP_Tools_Guide.md'],
              curriculum: 'Module 1: Introduction to NLP\nModule 2: Text Preprocessing\nModule 3: Sentiment Analysis\nModule 4: Language Models Overview\nModule 5: NLP in Development Projects',
            },
            {
              id: '4',
              moduleTitle: 'AI Ethics and Responsible AI',
              content: 'Explore ethical considerations in AI development and deployment. Learn about bias, fairness, transparency, and accountability in AI systems for sustainable development.',
              videoUrl: '',
              resources: ['AI_Ethics_Framework.md', 'Bias_Detection_Guide.md', 'Responsible_AI_Checklist.md'],
              curriculum: 'Module 1: Understanding AI Bias\nModule 2: Fairness and Equity\nModule 3: Transparency and Explainability\nModule 4: Privacy and Data Protection\nModule 5: Building Ethical AI Systems',
            },
            {
              id: '5',
              moduleTitle: 'Computer Vision for Development',
              content: 'Discover how computer vision technologies can analyze images and videos for development purposes. Learn about satellite imagery analysis, object detection, and image classification.',
              videoUrl: '',
              resources: ['Computer_Vision_Basics.md', 'Satellite_Imagery_Analysis.md', 'Image_Processing_Tools.md'],
              curriculum: 'Module 1: Introduction to Computer Vision\nModule 2: Image Classification\nModule 3: Object Detection\nModule 4: Satellite Imagery Analysis\nModule 5: Applications in Development',
            },
            {
              id: '6',
              moduleTitle: 'AI Project Implementation',
              content: 'Practical guide to implementing AI projects in development organizations. Learn project planning, team building, tool selection, and best practices for successful AI deployment.',
              videoUrl: '',
              resources: ['AI_Project_Planning.md', 'AI_Team_Building_Guide.md', 'AI_Tool_Selection_Matrix.md', 'Implementation_Best_Practices.md'],
              curriculum: 'Module 1: Project Planning and Scoping\nModule 2: Building AI Teams\nModule 3: Tool and Platform Selection\nModule 4: Data Preparation\nModule 5: Deployment and Monitoring\nModule 6: Scaling AI Solutions',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
        // Fallback demo AI modules
        setModules([
          {
            id: '1',
            moduleTitle: 'Introduction to Artificial Intelligence',
            content: 'Explore the fundamentals of AI, including machine learning, deep learning, and neural networks. Understand how AI technologies are transforming industries and development work.',
            videoUrl: '',
            resources: ['AI_Fundamentals_Guide.md', 'AI_Glossary.md', 'Introduction_to_ML.md'],
            curriculum: 'Module 1: What is AI?\nModule 2: Types of AI Systems\nModule 3: Machine Learning Basics\nModule 4: Real-World AI Applications\nModule 5: AI Ethics and Responsible Use',
          },
          {
            id: '2',
            moduleTitle: 'AI for Development Practitioners',
            content: 'Learn how to leverage AI tools and technologies in development projects. Discover practical applications of AI for data analysis, program monitoring, and impact assessment.',
            videoUrl: '',
            resources: ['AI_for_Development_Handbook.md', 'Case_Studies_Collection.md', 'AI_Tools_Checklist.md'],
            curriculum: 'Module 1: AI in Development Context\nModule 2: Data Collection and Analysis\nModule 3: Predictive Analytics for Programs\nModule 4: AI-Powered Monitoring & Evaluation\nModule 5: Building AI-Ready Organizations',
          },
          {
            id: '3',
            moduleTitle: 'Natural Language Processing (NLP) Basics',
            content: 'Understand how computers process and understand human language. Learn about text analysis, sentiment analysis, and language models for development applications.',
            videoUrl: '',
            resources: ['NLP_Fundamentals.md', 'Text_Analysis_Tutorial.md', 'NLP_Tools_Guide.md'],
            curriculum: 'Module 1: Introduction to NLP\nModule 2: Text Preprocessing\nModule 3: Sentiment Analysis\nModule 4: Language Models Overview\nModule 5: NLP in Development Projects',
          },
          {
            id: '4',
            moduleTitle: 'AI Ethics and Responsible AI',
            content: 'Explore ethical considerations in AI development and deployment. Learn about bias, fairness, transparency, and accountability in AI systems for sustainable development.',
            videoUrl: '',
            resources: ['AI_Ethics_Framework.md', 'Bias_Detection_Guide.md', 'Responsible_AI_Checklist.md'],
            curriculum: 'Module 1: Understanding AI Bias\nModule 2: Fairness and Equity\nModule 3: Transparency and Explainability\nModule 4: Privacy and Data Protection\nModule 5: Building Ethical AI Systems',
          },
          {
            id: '5',
            moduleTitle: 'Computer Vision for Development',
            content: 'Discover how computer vision technologies can analyze images and videos for development purposes. Learn about satellite imagery analysis, object detection, and image classification.',
            videoUrl: '',
            resources: ['Computer_Vision_Basics.md', 'Satellite_Imagery_Analysis.md', 'Image_Processing_Tools.md'],
            curriculum: 'Module 1: Introduction to Computer Vision\nModule 2: Image Classification\nModule 3: Object Detection\nModule 4: Satellite Imagery Analysis\nModule 5: Applications in Development',
          },
          {
            id: '6',
            moduleTitle: 'AI Project Implementation',
            content: 'Practical guide to implementing AI projects in development organizations. Learn project planning, team building, tool selection, and best practices for successful AI deployment.',
            videoUrl: '',
            resources: ['AI_Project_Planning.md', 'AI_Team_Building_Guide.md', 'AI_Tool_Selection_Matrix.md', 'Implementation_Best_Practices.md'],
            curriculum: 'Module 1: Project Planning and Scoping\nModule 2: Building AI Teams\nModule 3: Tool and Platform Selection\nModule 4: Data Preparation\nModule 5: Deployment and Monitoring\nModule 6: Scaling AI Solutions',
          },
        ]);
      }
      setLoading(false);
    };

    fetchModules();
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <div className="flex justify-center mb-2">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Learning & Capacity Development</h1>
          <p className="text-base max-w-3xl mx-auto">
            Build your digital transformation skills through our comprehensive learning modules
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto space-y-4 relative min-h-[400px]">
          {loading && modules.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : modules.length > 0 ? (
            modules.map((module, index) => (
              <div
                key={module.id}
                className="card border-l-4 border-undp-blue"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-undp-blue mb-2">
                      Module {index + 1}: {module.moduleTitle}
                    </h3>
                    <p className="text-gray-600">{module.content}</p>
                  </div>
                  <button className="ml-4 p-2 hover:bg-undp-light-grey rounded-full transition-colors">
                    {expandedModule === module.id ? (
                      <ChevronUp size={24} className="text-undp-blue" />
                    ) : (
                      <ChevronDown size={24} className="text-undp-blue" />
                    )}
                  </button>
                </div>

                {expandedModule === module.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {module.videoUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                            <Play size={20} className="text-undp-blue" />
                            <span>Video Content</span>
                          </h4>
                          <a
                            href={module.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-undp-blue hover:underline inline-flex items-center space-x-2"
                          >
                            <span>Watch Video</span>
                            <Play size={16} />
                          </a>
                        </div>
                      )}

                      {module.resources && module.resources.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <Download size={20} className="text-undp-blue" />
                            <span>Resources & Materials</span>
                          </h4>
                          <div className="space-y-2">
                            {module.resources.map((resource, index) => (
                              <DownloadButton key={index} resource={resource} index={index} />
                            ))}
                          </div>
                        </div>
                      )}

                      {module.curriculum && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Curriculum</h4>
                          <div className="prose max-w-none">
                            <p className="text-gray-600 whitespace-pre-line">{module.curriculum}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No learning modules available. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learning;
