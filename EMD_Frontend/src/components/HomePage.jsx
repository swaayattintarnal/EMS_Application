import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, ArrowRight, Key } from 'lucide-react';
import swaayattIcon from '../assets/swaayatt.png';
import deepeigenIcon from '../assets/deepeigen.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [adminLevel, setAdminLevel] = useState(null);

  useEffect(() => {
    // Retrieve admin level from localStorage
    const level = localStorage.getItem('adminLevel');
    if (level) {
      setAdminLevel(parseInt(level, 10)); // Parse as integer
    }
  }, []);

  const baseCompanies = [
    {
      id: 'swaayatt',
      name: 'Swaayatt Robots',
      icon: swaayattIcon,
      color: 'from-indigo-300 to-purple-300',
      hoverColor: 'hover:from-blue-300 hover:via-purple-300 hover:to-pink-300',
      path: '/swaayatt-robots',
    },
    {
      id: 'deepeigen',
      name: 'DeepEigen',
      icon: deepeigenIcon,
      color: 'from-green-400 to-teal-400 ',
      hoverColor: 'hover:from-green-300 hover:via-teal-300 hover:to-blue-300',
      path: '/deep-eigen',
    }
  ];

  const accessControlCard = {
    id: 'access-control',
    name: 'Access Control',
    icon: Key, 
    color: 'from-orange-300 to-red-300', 
    hoverColor: 'hover:from-orange-200 hover:via-red-200 hover:to-yellow-200',
    path: '/access-control', 
  };

  // Conditionally add the Access Control card based on adminLevel
  const companiesToDisplay = adminLevel === 4
    ? [...baseCompanies, accessControlCard]
    : baseCompanies;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50 to-purple-50 animate-gradient-xy"></div>
      <div className="absolute inset-0 z-0 opacity-50 bg-gradient-to-tr from-pink-50 via-yellow-50 to-green-50 animate-gradient-xy delay-1000"></div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center items-center mb-6">
            <Building className="h-12 w-12 text-purple-700 mr-4" /> 
            <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
              Employee Data Management
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
             Select your organization to access employee data, profiles, and documents.
          </p>
        </div>

        {/* Company Cards */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {companiesToDisplay.map((company) => {
            const IconComponent = company.icon;
            return (
              <div
                key={company.id}
                onClick={() => navigate(company.path)}
                className={`
                  bg-white/70 backdrop-blur-md rounded-3xl p-8 cursor-pointer
                  transform transition-all duration-500 hover:scale-[1.03]
                  shadow-xl hover:shadow-2xl border border-white/80
                  group relative overflow-hidden
                `}
              >
                <div className={`absolute inset-0 -z-10 rounded-3xl opacity-30 ${company.color} transition-opacity duration-500 group-hover:opacity-60`}></div>

                <div className="text-center relative z-10">
                  {/* Company Icon */}
                  <div
                    className={`w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br ${company.color} flex items-center justify-center transform transition-transform duration-500  group-hover:scale-110 shadow-lg`}
                  >
                    {typeof IconComponent === 'string' ? (
                      <img src={IconComponent} alt={company.name} className="h-16 w-16 object-contain filter drop-shadow-md" />
                    ) : (
                      <IconComponent className="h-16 w-16 text-white" />
                    )}
                  </div>

                  {/* Company Name */}
                  <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">{company.name}</h2>

                  {/* Action Button */}
                  <button
                    className={`inline-flex items-center px-10 py-4 bg-gradient-to-r ${company.color} ${company.hoverColor}
                      text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl
                      transition-all duration-300 group-hover:translate-y-1 group-hover:scale-[1.02]
                      border border-transparent hover:border-gray-300
                    `}
                  >
                    {company.id === 'access-control' ? ( 
                      <>
                        <Key className="h-5 w-5 mr-3 text-gray-700" />
                        Manage Access
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-3 text-gray-700" /> 
                        Access Employee Data
                      </>
                    )}
                    <ArrowRight className="h-5 w-5 ml-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      <style>
        {`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        `}
      </style>
    </div>
  );
};

export default HomePage;