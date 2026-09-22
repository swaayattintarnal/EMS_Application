import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import EmployeeProfile from './EmployeeProfileDeepeigen';
import EmployeeProfiles from './EmployeeProfileSwaayattrobot'; 
import { ArrowLeft } from 'lucide-react'; 

const EmployeeProfileWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDeepEigen = location.pathname.includes('/deep-eigen');
  const companyName = isDeepEigen ? 'DeepEigen' : 'Swaayatt Robots';

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError(null); 

        const response = await fetch(`http://localhost:3000/get-one-emp-data/${id}`);
        console.log("kuch bhi:",response)

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
        
          setEmployeeData(data.data);
        } else {
          setError(data.message || 'Failed to fetch employee details.');
        }
      } catch (err) {
        console.error("Error fetching employee details:", err);
        setError(`Could not load employee details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    } else {
      setLoading(false);
      setError("No employee ID provided in the URL.");
    }
  }, [id]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="flex items-center text-green-700 text-lg">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading employee profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center text-red-800">
          <h2 className="text-2xl font-bold mb-2">Error!</h2>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => navigate(isDeepEigen ? '/deep-eigen' : '/swaayatt-robots')}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline-block mr-2" size={20} /> Go back to {companyName} Employee List
          </button>
        </div>
      </div>
    );
  }

 
  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Employee not found in {companyName}.</h2>
          <button
            onClick={() => navigate(isDeepEigen ? '/deep-eigen' : '/swaayatt-robots')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="inline-block mr-2" size={20} /> Go back to {companyName} Employee List
          </button>
        </div>
      </div>
    );
  }

  
  const ProfileComponent = isDeepEigen ? EmployeeProfile : EmployeeProfiles;

  return (
    <ProfileComponent
      employee={employeeData}
      onBack={() => navigate(-1)} 
    />
  );
};

export default EmployeeProfileWrapper;