import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCog, ArrowLeft, X } from 'lucide-react';
import axios from 'axios'; 

const AccessControlAdminSelection = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [accessOptions, setAccessOptions] = useState({
    overview: false,
    bankDetails: false,
    documents: {
      all: false,
      legal: false,
      personal: false,
      professional: false,
    },
    confidentialDocuments: false,
  });

  const companyName = companyId === 'swaayatt' ? 'Swaayatt Robots' : 'DeepEigen';

  useEffect(() => {
  const fetchAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admins');

      console.log('Fetched:', res.data);
      setAdminList(res.data); 
    } catch (err) {
      console.error('Fetch failed', err);
    }
  };
  fetchAdmins();
}, []);

  const handleManageAccess = (admin) => {
  navigate(`/access-control/${companyId}/${admin.name}/${admin._id}/${admin.level}/employees`);
};


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
    setAccessOptions({
      overview: false,
      bankDetails: false,
      documents: {
        all: false,
        legal: false,
        personal: false,
        professional: false,
      },
      confidentialDocuments: false,
    });
  };

  const handleAccessOptionChange = (category, type = null) => {
    setAccessOptions((prevOptions) => {
      const newOptions = { ...prevOptions };
      if (type === 'all') {
        const currentAll = newOptions.documents.all;
        newOptions.documents.all = !currentAll;
        newOptions.documents.legal = !currentAll;
        newOptions.documents.personal = !currentAll;
        newOptions.documents.professional = !currentAll;
      } else if (type) {
        newOptions[category][type] = !newOptions[category][type];
        if (category === 'documents') {
          newOptions.documents.all =
            newOptions.documents.legal &&
            newOptions.documents.personal &&
            newOptions.documents.professional;
        }
      } else {
        newOptions[category] = !newOptions[category];
      }
      return newOptions;
    });
  };

  const handleSaveChanges = () => {
    console.log(
      `Saving access for ${selectedAdmin} in ${companyName}:`,
      accessOptions
    );
    handleCloseModal();
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center animate-gradient-xy-slow">
      <div className="container mx-auto px-6 py-20 relative z-10 text-center">
        <button
          onClick={() => navigate('/access-control')}
          className="absolute top-8 left-8 flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-300 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Company Selection
        </button>

        <div className="flex justify-center items-center mb-6">
          <UserCog className="h-12 w-12 text-blue-700 mr-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            Manage Access for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {companyName}
            </span>
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-12">
          Select an administrator to manage their access permissions for employee information.
        </p>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
         {Array.isArray(adminList) && adminList.map((admin, index) => (
            <div
              key={admin._id}
              className="group bg-white/70 backdrop-blur-md rounded-2xl p-8 cursor-pointer
                         transform transition-all duration-300 hover:scale-[1.02]
                         shadow-lg hover:shadow-xl border border-white/80
                         flex flex-col items-center justify-center text-center w-64 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleManageAccess(admin)}
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-200 to-indigo-400 flex items-center justify-center shadow-md">
                <UserCog className="h-16 w-16 text-white animate-bounce-subtle" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{admin.name}</h2>
              <p className="text-sm text-gray-600 mb-4">Level {admin.level}</p>
              <button
                className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-blue-200 to-indigo-400
                           text-white font-semibold rounded-full shadow-md hover:shadow-lg
                           hover:from-blue-300 hover:to-indigo-500 transition-all duration-300
                           group-hover:translate-y-1 group-hover:scale-105 ">
                Manage Access
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AccessControlAdminSelection;
