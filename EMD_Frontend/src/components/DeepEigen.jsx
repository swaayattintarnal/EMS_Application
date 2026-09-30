import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Users, Calendar, Phone, Mail, Building, Clock, UserCheck, AlertCircle, UserMinus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import deepeigenIcon from '../assets/whitelogodeep.svg';

const DeepEigen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramStatus = searchParams.get('status');
  const paramType = searchParams.get('type');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(paramType || 'All');
  const [filterStatus, setFilterStatus] = useState(paramStatus || 'All');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/get-all-employees`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('all_emp_data_:', data);
        if (data.success) {
          setEmployees(data.data);
        } else {
          setError(data.message || 'Failed to fetch employees.');
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Network error or server unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Normalize employment type from legacy category field
  const getEmpType = (emp) => {
    if (emp.employment_type) return emp.employment_type;
    const cat = (emp.category || '').toLowerCase();
    if (cat === 'intern') return 'Intern';
    if (cat === 'contractual' || cat === 'contract') return 'Contract';
    return 'Full-Time';
  };

  // Normalize status from legacy 'Current' value
  const getEmpStatus = (emp) => {
    const st = emp.status;
    if (st === 'Current' || st === 'Working') return 'Working';
    return st || ' Working';
  };

  const companyEmployees = employees.filter((e) => String(e.company) === 'DeepEigen');

  // Summary counts
  const counts = {
    total: companyEmployees.length,
    fullTime: companyEmployees.filter((e) => getEmpType(e) === 'Full-Time').length,
    interns: companyEmployees.filter((e) => getEmpType(e) === 'Intern').length,
    contract: companyEmployees.filter((e) => getEmpType(e) === 'Contract').length,
    present: companyEmployees.filter((e) => getEmpStatus(e) === 'Working').length,
    noticePeriod: companyEmployees.filter((e) => getEmpStatus(e) === 'Notice Period').length,
    resigned: companyEmployees.filter((e) => getEmpStatus(e) === 'Resigned').length,
    left: companyEmployees.filter((e) => getEmpStatus(e) === 'Left').length,
    completed: companyEmployees.filter((e) => getEmpStatus(e) === 'Internship Completion').length,
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);

  // Filtered employees: newest added employees first by default
  const filteredEmployees = companyEmployees
    .filter((employee) => {
      const type = getEmpType(employee);
      const status = getEmpStatus(employee);

      const matchesSearch =
        (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employee.designation?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employee.employee_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'All' || type === filterType;
      const matchesStatus = filterStatus === 'All' || status === filterStatus;

      const employeeDate = employee.dateOfJoining
        ? new Date(employee.dateOfJoining)
        : null;

      const matchesMonth =
        !filterMonth ||
        (employeeDate && employeeDate.getMonth() === parseInt(filterMonth));

      const matchesYear =
        !filterYear ||
        (employeeDate && employeeDate.getFullYear() === parseInt(filterYear));

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesMonth &&
        matchesYear
      );
    })
    .sort((a, b) => {
      // Primary: newly added employees first (createdAt, fallback to joining date)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.dateOfJoining ? new Date(a.dateOfJoining).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.dateOfJoining ? new Date(b.dateOfJoining).getTime() : 0);
      return timeB - timeA;
    });

  const getTypeBadgeStyle = (type) => {
    if (type === 'Full-Time') return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    if (type === 'Intern') return 'bg-blue-100 text-blue-800 border border-blue-200';
    return 'bg-amber-100 text-amber-800 border border-amber-200';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Working') return 'rgba(9, 61, 28, 0.85)';
    if (status === 'Notice Period') return 'rgba(217, 119, 6, 0.85)';
    if (status === 'Resigned') return 'rgba(197, 9, 9, 0.85)';
    if (status === 'Internship Completion') return 'rgba(124, 58, 237, 0.85)';
    return 'rgba(100, 116, 139, 0.85)';
  };

  // Dynamic Profile completeness calculator based on employment type
  const getProfileCompleteness = (emp) => {
    const type = getEmpType(emp);
    const commonChecks = [
      !!(emp.name && emp.name.trim()),
      !!(emp.companyEmail || emp.email),
      !!(emp.contact),
      !!(emp.dateOfBirth),
      !!(emp.designation && emp.designation.trim()),
      !!(emp.department && emp.department.trim()),
      !!(emp.dateOfJoining),
      !!(emp.bankDetails?.accountNumber),
    ];

    let specificChecks = [];
    if (type === 'Intern') {
      specificChecks = [
        !!(emp.documents?.personalDocs?.passportSizePhotos?.length || emp.documents?.personalDocs?.aadharCard?.length),
        !!(emp.documents?.professionalDocs?.resume?.length || emp.documents?.personalDocs?.academicMarksheets?.length)
      ];
    } else if (type === 'Contract') {
      specificChecks = [
        !!(emp.documents?.personalDocs?.panCard?.length || emp.documents?.personalDocs?.aadharCard?.length),
        !!(emp.documents?.professionalDocs?.resume?.length || emp.documents?.legalDocs?.declarationForm?.length)
      ];
    } else {
      // Full-Time
      specificChecks = [
        !!(emp.documents?.personalDocs?.panCard?.length || emp.documents?.personalDocs?.aadharCard?.length),
        !!(emp.documents?.legalDocs?.offerLetter?.length || emp.documents?.legalDocs?.declarationForm?.length || emp.documents?.professionalDocs?.resume?.length)
      ];
    }

    const checks = [...commonChecks, ...specificChecks];
    const completed = checks.filter(Boolean).length;
    const total = checks.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent, isComplete: percent === 100 };
  };

  const getProgressBarColor = (percent) => {
    if (percent === 100) return '#16a34a'; // green-600
    if (percent >= 60) return '#ca8a04';   // yellow-600
    return '#dc2626';                       // red-600
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="flex items-center text-green-700 text-lg">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-blue-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/homepage')}
                className="mr-6 p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                {/* <img src={deepeigenIcon} alt="DeepEigen" className="h-20 w-20 mr-4" /> */}
                <div>
                  <img src={deepeigenIcon} alt="DeepEigen" className="h-20 w-50 mr-4" />
                  <p className="text-green-200">Employee Lifecycle &amp; Data Management</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/add-employee')}
              className="flex items-center px-6 py-3 bg-white text-black rounded-md font-semibold hover:bg-green-50 transition-colors duration-200 shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Employee
            </button>
          </div>
        </div>
      </div>



      <div className="container mx-auto px-6 py-8">

        {/* Summary Metrics Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-8">

          {/* Total */}
          <div
            onClick={() => {
              setFilterType('All');
              setFilterStatus('All');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
           hover:shadow-md
          ${filterType === 'All' && filterStatus === 'All'
                ? 'bg-purple-50 border-purple-500 shadow-sm'
                : 'bg-white border-gray-300 hover:border-purple-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.total}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              All Employees
            </p>
          </div>


          {/* Full-Time */}
          <div
            onClick={() => {
              if (filterType === 'Full-Time') {
                setFilterType('All');
              } else {
                setFilterType('Full-Time');
                setFilterStatus('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterType === 'Full-Time'
                ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                : 'bg-white border-gray-300 hover:border-indigo-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Full-Time
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.fullTime}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Employees
            </p>
          </div>


          {/* Interns */}
          <div onClick={() => {
            if (filterType === 'Intern') {
              setFilterType('All');
            } else {
              setFilterType('Intern');
              setFilterStatus('All');
            }
          }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterType === 'Intern'
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-white border-gray-300 hover:border-blue-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Interns
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.interns}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Interns
            </p>
          </div>


          {/* Contract */}
          <div
            onClick={() => {
              if (filterType === 'Contract') {
                setFilterType('All');
              } else {
                setFilterType('Contract');
                setFilterStatus('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterType === 'Contract'
                ? 'bg-amber-50 border-amber-500 shadow-sm'
                : 'bg-white border-gray-300 hover:border-amber-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Contract
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.contract}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Employees
            </p>
          </div>


          {/* Working */}
          <div
            onClick={() => {
              if (filterStatus === 'Working') {
                setFilterStatus('All');
              } else {
                setFilterStatus('Working');
                setFilterType('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterStatus === 'Working'
                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                : 'bg-white border-gray-300 hover:border-emerald-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Working
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.present}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Active
            </p>
          </div>


          {/* Notice Period */}
          <div
            onClick={() => {
              if (filterStatus === 'Notice Period') {
                setFilterStatus('All');
              } else {
                setFilterStatus('Notice Period');
                setFilterType('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterStatus === 'Notice Period'
                ? 'bg-orange-50 border-orange-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-orange-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Notice
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.noticePeriod}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Notice Period
            </p>
          </div>


          {/* Resigned */}
          <div
            onClick={() => {
              if (filterStatus === 'Resigned') {
                setFilterStatus('All');
              } else {
                setFilterStatus('Resigned');
                setFilterType('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterStatus === 'Resigned'
                ? 'bg-red-50 border-red-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-red-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Resigned
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.resigned}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Employees
            </p>
          </div>


          {/* Left */}
          <div
            onClick={() => {
              if (filterStatus === 'Left') {
                setFilterStatus('All');
              } else {
                setFilterStatus('Left');
                setFilterType('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterStatus === 'Left'
                ? 'bg-gray-100 border-gray-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
          >
            <p className="text-sm font-semibold text-gray-700 uppercase">
              Left
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.left}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Employees
            </p>
          </div>


          {/* Completed */}
          <div
            onClick={() => {
              if (filterStatus === 'Internship Completion') {
                setFilterStatus('All');
              } else {
                setFilterStatus('Internship Completion');
                setFilterType('All');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
      hover:shadow-md
      ${filterStatus === 'Internship Completion'
                ? 'bg-purple-50 border-purple-500 shadow-sm'
                : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
          >
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Completed
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.completed}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Internships
            </p>
          </div>

        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl  border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, designation, ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
              >
                <option value="All">All Employment Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
              >
                <option value="All">All Statuses</option>
                <option value=" Working">Working</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Resigned">Resigned</option>
                <option value="Left">Left</option>
                <option value="Internship Completion">Internship Completion</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>




        {/* Employee Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const empType = getEmpType(employee);
            const empStatus = getEmpStatus(employee);
            const completeness = getProfileCompleteness(employee);
            const barColor = getProgressBarColor(completeness.percent);
            return (
              <div
                key={employee._id}
                onClick={() => navigate(`/deep-eigen/employee/${employee._id}`)}
                className="bg-white rounded-2xl border  p-6 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200 relative pt-10"
              >
                {/* Status Badge */}
                <div
                  className="absolute top-0 right-4 rounded-b-lg text-white text-[11px] font-bold flex items-center justify-center text-center shadow"
                  style={{
                    height: '4rem',
                    width: '4.8rem',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)',
                    backgroundColor: getStatusBgColor(empStatus),
                  }}
                >
                  <span className="p-1 leading-tight">{empStatus}</span>
                </div>




                <div className='flex'>
                  {/* Profile Photo */}
                  <div className="relative flex justify-center mb-4">

                    {/* Employee ID - Top Left */}
                    {employee.employee_id && (
                      <p className="absolute left-0 top-[-3vh] text-xs font-semibold text-gray-400">
                        {employee.employee_id}
                      </p>
                    )}

                    {/* Profile Photo */}
                    <div className="relative">
                      {employee.documents?.personalDocs?.passportSizePhotos?.[0] ? (
                        <img
                          src={`${API_BASE_URL}/new_uploads/${employee.documents.personalDocs.passportSizePhotos[0].fileName}`}
                          alt={employee.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-purple-200 shadow">
                          {employee.name
                            ? String(employee.name)
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                            : 'N/A'}
                        </div>
                      )}
                    </div>

                  </div>


                  {/* Employee Info */}
                  <div className="text-start ml-4   ">
                    <div className="flex items-center justify-start space-x-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-800">{employee.name || 'N/A'}</h3>
                    </div>
                    {employee.employee_id && (
                      <p className="text-xs font-semibold text-gray-400 mb-1">{employee.employee_id}</p>
                    )}
                    <p className="text-green-600 font-medium mb-1">{employee.designation || 'N/A'}</p>
                    {employee.department && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-3">
                        {employee.department}
                      </span>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1 text-sm text-gray-600 mb-2 pt-1 border-t border-gray-100">
                      <div className="flex items-center justify-start">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        <span className="truncate text-xs">{employee.companyEmail || employee.email || 'N/A'}</span>
                      </div>
                      {employee.contact && (
                        <div className="flex items-center justify-start mb-2">
                          <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          <span className="text-xs">{String(employee.contact)}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer: joining date + type badge */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeBadgeStyle(empType)}`}>
                        {empType}
                      </span>
                    </div>

                    {/* Resignation & Relieving Dates for Resigned / Notice Period */}
                    {empStatus === 'Resigned' && (
                      <div className="mt-2 text-[11px] bg-red-50/80 p-2 rounded-lg text-left space-y-1 border border-red-100">
                        <div className="flex justify-between text-red-800">
                          <span className="font-medium">Date of Resignation:</span>
                          <span className="font-bold">{employee.resignationDetails?.resignationDate ? new Date(employee.resignationDetails.resignationDate).toLocaleDateString() : (employee.dateOfLeaving ? new Date(employee.dateOfLeaving).toLocaleDateString() : 'Recorded')}</span>
                        </div>
                        <div className="flex justify-between text-red-800">
                          <span className="font-medium">Date of Relieving:</span>
                          <span className="font-bold">{employee.resignationDetails?.lastWorkingDate || employee.resignationDetails?.exitDate || employee.last_working_date ? new Date(employee.resignationDetails?.lastWorkingDate || employee.resignationDetails?.exitDate || employee.last_working_date).toLocaleDateString() : (employee.dateOfLeaving ? new Date(employee.dateOfLeaving).toLocaleDateString() : 'N/A')}</span>
                        </div>
                      </div>
                    )}

                    {empStatus === 'Notice Period' && (
                      <div className="mt-2 text-[11px] bg-amber-50/80 p-2 rounded-lg text-left space-y-1 border border-amber-100">
                        <div className="flex justify-between text-amber-800">
                          <span className="font-medium">Notice Start:</span>
                          <span className="font-bold">{employee.noticePeriod?.startDate ? new Date(employee.noticePeriod.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-amber-800">
                          <span className="font-medium">Expected Relieving:</span>
                          <span className="font-bold">{employee.noticePeriod?.expectedLastWorkingDate ? new Date(employee.noticePeriod.expectedLastWorkingDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    {empStatus === 'Internship Completion' && (
                      <div className="mt-2 text-[11px] bg-purple-50/80 p-2 rounded-lg text-left space-y-1 border border-purple-100">
                        <div className="flex justify-between text-purple-800">
                          <span className="font-medium">Completion Date:</span>
                          <span className="font-bold">{employee.last_working_date ? new Date(employee.last_working_date).toLocaleDateString() : (employee.dateOfLeaving ? new Date(employee.dateOfLeaving).toLocaleDateString() : 'Completed')}</span>
                        </div>
                      </div>
                    )}

                    {/* Profile Completeness Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                          Profile Completeness
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: barColor }}
                        >
                          {completeness.percent === 100 ? '✓ Complete' : `${completeness.percent}% (${completeness.completed}/${completeness.total})`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${completeness.percent}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  </div>

                </div>







              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow mt-6">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No employees found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>




    </div>
  );
};

export default DeepEigen;