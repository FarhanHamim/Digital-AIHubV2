import { useEffect, useState } from 'react';
import { fetchCollection } from '../utils/supabaseHelpers';
import { Mail, Linkedin, User } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [advisoryMembers, setAdvisoryMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo Team Members
  const demoTeamMembers = [
    {
      id: 'team-1',
      name: 'Dr. Sarah Johnson',
      designation: 'Director of Digital Transformation',
      photoUrl: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 'team-2',
      name: 'Michael Chen',
      designation: 'Lead AI Solutions Architect',
      photoUrl: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 'team-3',
      name: 'Priya Sharma',
      designation: 'Senior Digital Policy Advisor',
      photoUrl: 'https://i.pravatar.cc/150?img=45',
    },
    {
      id: 'team-4',
      name: 'James Anderson',
      designation: 'Head of Innovation Lab',
      photoUrl: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 'team-5',
      name: 'Fatima Al-Mansouri',
      designation: 'Data Governance Specialist',
      photoUrl: 'https://i.pravatar.cc/150?img=32',
    },
    {
      id: 'team-6',
      name: 'David Kim',
      designation: 'Technology Integration Manager',
      photoUrl: 'https://i.pravatar.cc/150?img=68',
    },
  ];

  // Demo Advisory Members
  const demoAdvisoryMembers = [
    {
      id: 'advisory-1',
      name: 'Prof. Maria Rodriguez',
      designation: 'Advisory Board Chair - Digital Governance',
      photoUrl: 'https://i.pravatar.cc/150?img=60',
    },
    {
      id: 'advisory-2',
      name: 'Dr. Ahmed Hassan',
      designation: 'Senior Advisor - Public Sector Innovation',
      photoUrl: 'https://i.pravatar.cc/150?img=51',
    },
    {
      id: 'advisory-3',
      name: 'Dr. Emily Watson',
      designation: 'Strategic Advisor - AI Ethics & Policy',
      photoUrl: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 'advisory-4',
      name: 'Prof. Kenji Tanaka',
      designation: 'Technical Advisor - Digital Infrastructure',
      photoUrl: 'https://i.pravatar.cc/150?img=11',
    },
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await fetchCollection('team', {});
        // Separate team and advisory members based on a type field, or use all as team
        const fetchedTeam = data.filter(m => !m.type || m.type === 'team');
        const fetchedAdvisory = data.filter(m => m.type === 'advisory');
        
        // Combine with demo data
        setTeamMembers([...demoTeamMembers, ...fetchedTeam]);
        setAdvisoryMembers([...demoAdvisoryMembers, ...fetchedAdvisory]);
      } catch (error) {
        console.error('Error fetching team:', error);
        // If fetch fails, show demo data
        setTeamMembers(demoTeamMembers);
        setAdvisoryMembers(demoAdvisoryMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <User className="mx-auto mb-2" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Team & Advisory</h1>
          <p className="text-base max-w-3xl mx-auto">
            Meet our dedicated team of digital transformation experts and advisors
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Team Section */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-undp-blue rounded-lg flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Team</h2>
          </div>
          {loading && teamMembers.length === 0 ? (
            <SkeletonLoader type="team" count={6} />
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="card text-center group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative mb-4">
                    {member.photoUrl ? (
                      <img
                        loading="lazy"
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-undp-light-grey group-hover:border-undp-blue transition-colors"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto bg-undp-light-grey flex items-center justify-center border-4 border-undp-light-grey group-hover:border-undp-blue transition-colors">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-undp-blue mb-2">{member.name}</h3>
                  <p className="text-gray-600 mb-4">{member.designation}</p>
                  
                  {/* Hover reveal contact info */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                      >
                        <Mail size={16} />
                        <span className="text-sm">Email</span>
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                      >
                        <Linkedin size={16} />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No team members available. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Advisory Section */}
        <section className="bg-undp-light-grey py-12 rounded-lg">
          <div className="px-8">
            <div className="flex items-center space-x-3 mb-6 sm:mb-8">
              <div className="w-12 h-12 bg-undp-dark-blue rounded-lg flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Advisory</h2>
            </div>
            {advisoryMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {advisoryMembers.map((member) => (
                  <div
                    key={member.id}
                    className="card text-center group hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    <div className="relative mb-4">
                      {member.photoUrl ? (
                        <img
                          loading="lazy"
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-undp-light-grey group-hover:border-undp-dark-blue transition-colors"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto bg-undp-light-grey flex items-center justify-center border-4 border-undp-light-grey group-hover:border-undp-dark-blue transition-colors">
                          <User size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-undp-blue mb-2">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.designation}</p>
                    
                    {/* Hover reveal contact info */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                        >
                          <Mail size={16} />
                          <span className="text-sm">Email</span>
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                        >
                          <Linkedin size={16} />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No advisory members available. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;
