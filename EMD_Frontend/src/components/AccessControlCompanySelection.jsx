import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowRight } from 'lucide-react';
import swaayattIcon from '../assets/swaayatt.png';
import deepeigenIcon from '../assets/deepeigen.png';
import { ArrowLeft } from 'lucide-react';

const AccessControlCompanySelection = () => {
  const navigate = useNavigate();

  const companies = [
    {
      id: 'swaayatt',
      name: 'Swaayatt Robots',
      icon: swaayattIcon,
      color: 'from-indigo-300 to-purple-300',
      hoverColor: 'hover:from-blue-300 hover:via-purple-300 hover:to-pink-300',
      path: '/access-control/swaayatt',
    },
    {
      id: 'deepeigen',
      name: 'DeepEigen',
      icon: deepeigenIcon,
      color: 'from-green-400 to-teal-400 ',
      hoverColor: 'hover:from-green-300 hover:via-teal-300 hover:to-blue-300',
      path: '/access-control/deepeigen',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50 to-purple-50 animate-gradient-xy"></div>
      <div className="absolute inset-0 z-0 opacity-50 bg-gradient-to-tr from-pink-50 via-yellow-50 to-green-50 animate-gradient-xy delay-1000"></div>

      <div className="container mx-auto px-6 py-20 relative z-10 text-center">
        <button
          onClick={() => navigate('/homepage')}
          className="absolute top-8 left-8 flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-300 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
        </button>

        <div className="flex justify-center items-center mb-6">
          <Building className="h-12 w-12 text-blue-700 mr-4" />
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
            Select Company for Access Control
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-12">
          Choose a company to begin managing employee access permissions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {companies.map((company) => {
            const IconComponent = company.icon;
            return (
              <div
                key={company.id}
                className="group bg-white/70 backdrop-blur-md rounded-2xl p-8 cursor-pointer
                           transform transition-all duration-300 hover:scale-[1.02]
                           shadow-lg hover:shadow-xl border border-white/80
                           flex flex-col items-center justify-center text-center"
                onClick={() => navigate(company.path)}
              >
                <div
                  className={`w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br ${company.color} flex items-center justify-center transform transition-transform duration-500  group-hover:scale-110 shadow-lg`}
                >
                  {typeof IconComponent === 'string' ? (
                    <img src={IconComponent} alt={company.name} className="h-16 w-16 object-contain filter drop-shadow-md" />
                  ) : (
                    <IconComponent className="h-16 w-16 text-white" />
                  )}
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">
                  {company.name}
                </h2>
                <button
                  className={`inline-flex items-center px-10 py-4 bg-gradient-to-r ${company.color} ${company.hoverColor}
                      text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl
                      transition-all duration-300 group-hover:translate-y-1 group-hover:scale-[1.02]
                      border border-transparent hover:border-gray-300
                    `}
                >
                  Select Company
                  <ArrowRight className="h-5 w-5 ml-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                </button>
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

export default AccessControlCompanySelection;