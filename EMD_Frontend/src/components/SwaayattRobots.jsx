import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notebook as Robot, ArrowLeft, Plus, Search, Filter, Users, Calendar, Phone, Mail, MapPin, User } from 'lucide-react';
import swaayattIcon from '../assets/swaayatt.png'; 

const SwaayattRobots = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/get-all-employees'); 
        // console.log(response.json,"sss")
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        if (data.success) {
          setEmployees(data.data); 
        } else {
          setError(data.message || 'Failed to fetch employees.');
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError('Network error or server unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []); 

  // Helper to get category and status counts from fetched data for Swaayatt Robots employees
  const getCategoryCount = (category, status = 'Current') => {
    return employees.filter(e => String(e.company) === 'swaayatt_robots' && String(e.category) === category && String(e.status) === status).length; 
  };

  // Categories for filtering employees
  const categories = [
    { id: 'all', name: 'All Employees', count: employees.filter(e => String(e.company) === 'swaayatt_robots').length }, 
    { id: 'full-time', name: 'Full-time (Working)', count: getCategoryCount('Full-time') }, 
    { id: 'intern', name: 'Interns (Working)', count: getCategoryCount('Intern') },
    { id: 'contractual', name: 'Contractual (Working)', count: getCategoryCount('Contractual') },
    { id: 'notice period', name: 'Notice Period Employees', count: employees.filter(e => String(e.company) === 'swaayatt_robots' && String(e.status) === 'Notice Period').length }, 
    { id: 'left', name: 'Left Interns', count: employees.filter(e => String(e.company) === 'swaayatt_robots' && String(e.status) === 'Left').length }, 
    { id: 'resigned', name: 'Resigned Employees', count: employees.filter(e => String(e.company) === 'swaayatt_robots' && String(e.status) === 'Resigned').length }, 
  ];

  // Filtering logic based on search term, active tab, month, and year
  const filteredEmployees = employees.filter(employee => {
    // Filter by company "swaayatt_robots" first
    const matchesCompany = String(employee.company) === 'swaayatt_robots'; 

    const matchesSearch = (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (employee.designation?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    let matchesCategory = false;
    if (activeTab === 'all') {
      matchesCategory = true;
    } else if (activeTab === 'notice period') {
      matchesCategory = String(employee.status) === 'Notice Period'; 
    } else if (activeTab === 'resigned') {
      matchesCategory = String(employee.status) === 'Resigned'; 
    } else if (activeTab === 'left') { 
      matchesCategory = String(employee.status) === 'Left'; 
    } else if (activeTab === 'intern') {
      matchesCategory = String(employee.category) === 'Intern' && String(employee.status) === 'Current'; 
    } else if (activeTab === 'full-time') {
      matchesCategory = String(employee.category) === 'Full-time' && String(employee.status) === 'Current'; 
    } else if (activeTab === 'contractual') {
      matchesCategory = String(employee.category) === 'Contractual' && String(employee.status) === 'Current'; 
    }

    const employeeDate = employee.dateOfJoining ? new Date(employee.dateOfJoining) : null;
    const matchesMonth = !filterMonth || (employeeDate && employeeDate.getMonth() === parseInt(filterMonth));
    const matchesYear = !filterYear || (employeeDate && employeeDate.getFullYear() === parseInt(filterYear));

    return matchesCompany && matchesSearch && matchesCategory && matchesMonth && matchesYear;
  });

  // Generate years for the filter dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center text-blue-700 text-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading employees...
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
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div
        className="bg-gradient-to-r from-indigo-300 to-purple-300 text-white"
        style={{
          '--tw-gradient-from': '#2c3459',
          '--tw-gradient-to': '#944be1',
        }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/homepage')}
                className="mr-6 p-2 rounded-full hover:bg-white/30 transition-colors duration-200">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <img src={swaayattIcon} alt="Swaayatt Robots" className="h-20 w-20 mr-4" />
               
                <div>
                  <h1 className="text-3xl font-bold">Swaayatt Robots</h1>
                  <p className="text-white text-opacity-80">Employee Management System</p>
                </div>
              </div>
            </div>
            {/* Button to navigate to Add Employee form */}
            <button 
              onClick={() => navigate('/add-employee')} 
              className="flex items-center px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors duration-200 shadow-md">
              <Plus className="h-5 w-5 mr-2" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                <option value="">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>
            {/* Year Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${activeTab === category.id
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Employee Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div
              key={employee._id} 
              onClick={() => navigate(`/swaayatt-robots/employee/${employee._id}`)}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 relative pt-10">
              {/* Employee Status Badge */}
              <div className="absolute top-0 right-4 rounded-b-lg text-white text-xs font-semibold flex items-center justify-center text-center"
                style={{
                  height: '4rem',
                  width: '4.5rem',
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)',
                  backgroundColor: String(employee.status) === 'Current' || employee.status === 'Working' ? 'rgba(9, 61, 28, 0.8)' :
                     String(employee.status) === 'Resigned' ? 'rgba(197, 9, 9, 0.8)' :
                    String(employee.status) === 'Notice Period' ? 'rgba(207, 88, 2, 0.8)' :
                      'rgba(128, 128, 128, 0.8)'
                }}>
                <span className="p-1">
                  {String(employee.status) === 'Current' ? 'Working' :
                    String(employee.status) === 'Notice Period' ? 'Notice Period' :
                      String(employee.status) === 'Resigned' ? 'Resigned' :
                        String(employee.status)}
                </span>

              </div>

              {/* Profile Photo */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {employee?.documents?.personalDocs?.passportSizePhotos[0] ? (
                    <img
                      src={`http://localhost:3000/new_uploads/${employee.documents.personalDocs.passportSizePhotos[0].fileName}`}
                      alt={employee.name}
                      className="w-40 h-40 rounded-full object-cover border-4 border-purple-100" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-purple-100">
                      {employee.name ? String(employee.name).split(' ').map(n => n[0]).join('') : 'N/A'} 
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{employee.name || 'N/A'}</h3>
                <p className="text-purple-600 font-medium mb-2">{employee.designation || 'N/A'}</p>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{employee.companyEmail || employee.email || 'N/A'}</span>

                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{String(employee.contact) || 'N/A'}</span> 
                  </div>
                   {/* <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{employee.address || 'N/A'}</span>
                  </div> */}
                </div>

                {/* Date and Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-600 font-semibold">
                    <Calendar className="h-3 w-3 mr-1" />Date Joining:
                    {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${String(employee.category) === 'Full-time' ? 'bg-green-100 text-green-800' : 
                    String(employee.category) === 'Intern' ? 'bg-blue-100 text-blue-800' : 
                      'bg-orange-100 text-orange-800'
                    }`}>
                    {employee.category ? String(employee.category) : 'N/A'} 
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message when no employees are found */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No employees found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwaayattRobots;