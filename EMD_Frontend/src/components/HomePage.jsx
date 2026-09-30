import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, ArrowRight, Key, GraduationCap, X } from 'lucide-react';
import swaayattIcon from '../assets/swaayatt.png';
import deepeigenIcon from '../assets/whitelogodeep.svg';


const HomePage = () => {
  const navigate = useNavigate();
  const [adminLevel, setAdminLevel] = useState(null);
  const [showInternModal, setShowInternModal] = useState(false);

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
      buttonColor: 'bg-indigo-700',
      buttonTextColor: 'text-white',
      path: '/swaayatt-robots',
    },
    {
      id: 'deepeigen',
      name: 'DeepEigen',
      icon: deepeigenIcon,
      color: 'from-blue-800 to-blue-700',
      hoverColor: 'hover:from-green-300 hover:via-teal-300 hover:to-blue-300',
      buttonColor: 'bg-blue-700 hover:bg-blue-800',
      buttonTextColor: 'text-white',
      path: '/deep-eigen',
    },
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
  <div className="min-h-screen relative overflow-hidden bg-slate-50">

    {/* Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />

    <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

    <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">

      {/* Header */}
      <div className="text-center mb-14">

        <div className="inline-flex items-center justify-center px-4 py-2 mb-5
          rounded-full border border-purple-200 bg-white/80 shadow-sm">
          <Building className="h-4 w-4 text-purple-600 mr-2" />

          <span className="text-sm font-medium text-gray-600">
            Employee Management System
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Employee Data Management
        </h1>

        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
          Select an organization to manage employee profiles,
          documents, and records.
        </p>
      </div>


      {/* Company Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {companiesToDisplay.map((company) => {

          const IconComponent = company.icon;

          return (
            <div
              key={company.id}
              onClick={() => {
                if (company.isInternCompletion) {
                  setShowInternModal(true);
                } else {
                  navigate(company.path);
                }
              }}
              className="
                group relative overflow-hidden
                bg-white
                rounded-3xl
                border border-gray-200
                p-8 md:p-10
                cursor-pointer
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-gray-300
              "
            >

              {/* Subtle top accent */}
              <div
                className={`
                  absolute top-0 left-0 right-0 h-1
                  bg-gradient-to-r ${company.color}
                `}
              />

              {/* Company Content */}
              <div className="flex flex-col items-center text-center">

                {/* Logo */}
                <div
                  className={`
                    w-24 h-24
                    rounded-2xl
                    flex items-center justify-center
                    mb-6
                    bg-gradient-to-br ${company.color}
                    border border-gray-100
                    shadow-sm
                    transition-transform duration-300
                    group-hover:scale-105
                  `}
                >
                  {typeof IconComponent === 'string' ? (
                    <img
                      src={IconComponent}
                      alt={company.name}
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <IconComponent className="h-12 w-12 text-white" />
                  )}
                </div>


                {/* Company Name */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {company.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Employee profiles, documents &amp; records
                </p>


                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (company.isInternCompletion) {
                      setShowInternModal(true);
                    } else {
                      navigate(company.path);
                    }
                  }}
                  className={`
                    mt-7
                    inline-flex items-center justify-center
                    px-7 py-3
                    rounded-xl
                    font-semibold
                    text-sm
                    ${company.buttonColor || 'bg-gray-900 '}
                    ${company.buttonTextColor || 'text-white'}
                    shadow-sm
                    transition-all duration-300
                  `}
                >

                  {company.id === 'access-control' ? (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Manage Access
                    </>
                  ) : company.id === 'internship-completion' ? (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      View Completed Interns
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Access Employee Data
                    </>
                  )}

                  <ArrowRight
                    className="
                      h-4 w-4 ml-2
                      transition-transform duration-300
                      group-hover:translate-x-1
                    "
                  />

                </button>

              </div>
            </div>
          );
        })}

      </div>
    </div>


    {/* Internship Completion Modal */}
    {showInternModal && (
      <div className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      ">

        <div className="
          bg-white
          rounded-3xl
          max-w-md
          w-full
          p-7
          shadow-2xl
          relative
          border border-gray-200
        ">

          {/* Close */}
          <button
            onClick={() => setShowInternModal(false)}
            className="
              absolute top-5 right-5
              w-9 h-9
              flex items-center justify-center
              rounded-full
              text-gray-400
              hover:text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            <X className="h-5 w-5" />
          </button>


          {/* Modal Header */}
          <div className="text-center mb-7">

            <div className="
              w-14 h-14
              mx-auto mb-4
              rounded-2xl
              bg-purple-50
              border border-purple-100
              flex items-center justify-center
            ">
              <GraduationCap className="h-7 w-7 text-purple-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              Internship Completion
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Select an organization to view completed interns.
            </p>

          </div>


          {/* DeepEigen */}
          <button
            onClick={() => {
              setShowInternModal(false);
              navigate('/deep-eigen?status=Internship%20Completion');
            }}
            className="
              w-full flex items-center justify-between
              p-4
              rounded-2xl
              border border-gray-200
              hover:border-blue-400
              hover:bg-blue-50/50
              transition-all
              group
            "
          >

            <div className="flex items-center gap-4">

              <div className="
                w-12 h-12
                rounded-xl
                bg-blue-700
                flex items-center justify-center
              ">
                <img
                  src={deepeigenIcon}
                  alt="DeepEigen"
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div className="text-left">
                <h4 className="font-semibold text-gray-900">
                  DeepEigen
                </h4>

                <p className="text-xs text-gray-500 mt-1">
                  Completed interns &amp; certificates
                </p>
              </div>

            </div>

            <ArrowRight
              className="
                h-5 w-5
                text-gray-400
                group-hover:text-blue-600
                group-hover:translate-x-1
                transition-all
              "
            />

          </button>


          {/* Swaayatt */}
          <button
            onClick={() => {
              setShowInternModal(false);
              navigate('/swaayatt-robots?status=Internship%20Completion');
            }}
            className="
              w-full flex items-center justify-between
              p-4 mt-3
              rounded-2xl
              border border-gray-200
              hover:border-indigo-400
              hover:bg-indigo-50/50
              transition-all
              group
            "
          >

            <div className="flex items-center gap-4">

              <div className="
                w-12 h-12
                rounded-xl
                bg-indigo-50
                border border-indigo-100
                flex items-center justify-center
              ">
                <img
                  src={swaayattIcon}
                  alt="Swaayatt Robots"
                  className="h-8 w-8 object-contain"
                />
              </div>

              <div className="text-left">
                <h4 className="font-semibold text-gray-900">
                  Swaayatt Robots
                </h4>

                <p className="text-xs text-gray-500 mt-1">
                  Completed interns &amp; certificates
                </p>
              </div>

            </div>

            <ArrowRight
              className="
                h-5 w-5
                text-gray-400
                group-hover:text-indigo-600
                group-hover:translate-x-1
                transition-all
              "
            />

          </button>

        </div>
      </div>
    )}
  </div>
);
};

export default HomePage;