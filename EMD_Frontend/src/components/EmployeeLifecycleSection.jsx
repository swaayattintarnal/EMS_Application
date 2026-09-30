import React, { useState } from 'react';
import { 
  TrendingUp, ArrowRight, Clock, Calendar, CheckCircle2, AlertTriangle, 
  FileText, Shield, UserCheck, DollarSign, Award, X, History, Briefcase, 
  HelpCircle, ChevronRight, UserMinus
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeLifecycleSection = ({ employee, onRefresh, themeColor = 'green' }) => {
  const [activeSubTab, setActiveSubTab] = useState('timeline'); // 'timeline', 'compensation', 'employment', 'status'
  
  // Modals state
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showStipendModal, setShowStipendModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    new_salary: '',
    effective_date: new Date().toISOString().substring(0, 10),
    reason: 'Annual Increment',
    remarks: '',
  });



  const [stipendForm, setStipendForm] = useState({
    new_stipend: '',
    effective_date: new Date().toISOString().substring(0, 10),
    reason: 'Performance Increment',
    remarks: '',
  });



  const [convertForm, setConvertForm] = useState({
    new_salary: '',
    conversion_date: new Date().toISOString().substring(0, 10),
    designation: employee?.designation || '',
    reason: 'Successful Internship Completion',
    remarks: '',
  });



  const [statusForm, setStatusForm] = useState({
    status: '',
    effective_date: new Date().toISOString().substring(0, 10),
    reason: '',
    remarks: '',
    noticePeriod: {
      startDate: new Date().toISOString().substring(0, 10),
      duration: '30 Days',
      expectedLastWorkingDate: '',
      reason: '',
      remarks: '',
    },


    resignationDetails: {
      resignationDate: new Date().toISOString().substring(0, 10),
      noticePeriodStartDate: employee?.noticePeriod?.startDate ? new Date(employee.noticePeriod.startDate).toISOString().substring(0, 10) : '',
      lastWorkingDate: new Date().toISOString().substring(0, 10),
      exitDate: new Date().toISOString().substring(0, 10),
      reason: '',
      remarks: '',
    },
    last_working_date: new Date().toISOString().substring(0, 10)
  });





  const [isSubmitting, setIsSubmitting] = useState(false);

  const empType = employee?.employment_type || (employee?.category === 'Intern' ? 'Intern' : employee?.category === 'Contractual' ? 'Contract' : 'Full-Time');
  const currentStatus = employee?.status === 'Current' || employee?.status === 'Working' ? 'Working' : (employee?.status || ' Working');
  const currentSalary = employee?.current_salary || employee?.salary || 0;
  const currentStipend = employee?.current_stipend || employee?.stipend || 0;

  const adminName = localStorage.getItem('adminName') || 'HR Admin';

  const timelineList = Array.isArray(employee?.timeline) ? employee.timeline : [];
  const salaryHistoryList = Array.isArray(employee?.salaryHistory) ? employee.salaryHistory : [];
  const stipendHistoryList = Array.isArray(employee?.stipendHistory) ? employee.stipendHistory : [];
  const employmentHistoryList = Array.isArray(employee?.employmentHistory) ? employee.employmentHistory : [];
  const statusHistoryList = Array.isArray(employee?.statusHistory) ? employee.statusHistory : [];

  // Calculations for Salary Increment
  const newSalVal = Number(salaryForm.new_salary) || 0;
  const salIncrement = currentSalary > 0 && newSalVal > currentSalary ? newSalVal - currentSalary : 0;
  const salIncrementPercent = currentSalary > 0 && newSalVal > currentSalary 
    ? ((salIncrement / currentSalary) * 100).toFixed(1) 
    : 0;

  // Calculations for Stipend Increment
  const newStipVal = Number(stipendForm.new_stipend) || 0;
  const stipIncrement = currentStipend > 0 && newStipVal > currentStipend ? newStipVal - currentStipend : 0;
  const stipIncrementPercent = currentStipend > 0 && newStipVal > currentStipend 
    ? ((stipIncrement / currentStipend) * 100).toFixed(1) 
    : 0;






  // Handler for Salary Increase
  const handleSalaryIncrease = async (e) => {
    e.preventDefault();
    if (newSalVal <= currentSalary) {
      alert(`New salary must be greater than current salary (₹${currentSalary.toLocaleString('en-IN')})`);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${employee._id}/salary/increase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...salaryForm,
          new_salary: newSalVal,
          created_by: adminName
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Salary increment successfully recorded!');
        setShowSalaryModal(false);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert(data.message || 'Failed to record salary increment.');
      }
    } catch (err) {
      alert('Error updating salary: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };





  // Handler for Stipend Increase
  const handleStipendIncrease = async (e) => {
    e.preventDefault();
    if (newStipVal <= currentStipend) {
      alert(`New stipend must be greater than current stipend (₹${currentStipend.toLocaleString('en-IN')})`);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${employee._id}/stipend/increase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stipendForm,
          new_stipend: newStipVal,
          created_by: adminName
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Stipend increment successfully recorded!');
        setShowStipendModal(false);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert(data.message || 'Failed to record stipend increment.');
      }
    } catch (err) {
      alert('Error updating stipend: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };




  // Handler for Intern to Full-Time Conversion
  const handleConvertToFullTime = async (e) => {
    e.preventDefault();
    const newSal = Number(convertForm.new_salary) || 0;
    if (newSal <= 0) {
      alert('Please enter a valid starting full-time salary.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${employee._id}/convert-to-full-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...convertForm,
          new_salary: newSal,
          created_by: adminName
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Employee successfully converted to Full-Time!');
        setShowConvertModal(false);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert(data.message || 'Failed to convert employee.');
      }
    } catch (err) {
      alert('Error during conversion: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };




  // Handler for Status Update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusForm.status) {
      alert('Please select a new status.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        status: statusForm.status,
        effective_date: statusForm.effective_date,
        reason: statusForm.reason,
        remarks: statusForm.remarks,
        created_by: adminName,
        noticePeriod: statusForm.status === 'Notice Period' ? statusForm.noticePeriod : undefined,
        resignationDetails: statusForm.status === 'Resigned' ? statusForm.resignationDetails : undefined,
        last_working_date: statusForm.status === 'Left' ? statusForm.last_working_date : undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/employees/${employee._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // console.log("mil gya ",data)
      if (data.success) {
        alert(`Employee status successfully updated to ${statusForm.status}!`);
        setShowStatusModal(false);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };




  // Helper for available statuses in modal
  const getAvailableStatusOptions = () => {
    if (empType === 'Intern') {
      return ['Working', 'Internship Completion', 'Left'].filter(s => s !== currentStatus);
    }
    if (empType === 'Full-Time') {
      return ['Working', 'Notice Period', 'Resigned'].filter(s => s !== currentStatus);
    }
    return ['Working', 'Left'].filter(s => s !== currentStatus);
  };




  const isGreen = themeColor === 'green';
  const primaryBg = isGreen ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700';
  const primaryText = isGreen ? 'text-green-700' : 'text-purple-700';
  const primaryBorder = isGreen ? 'border-green-600' : 'border-purple-600';

  

  return (
    <div className="space-y-6">
      {/* Top Lifecycle Header & Actions Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                empType === 'Full-Time' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                empType === 'Intern' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {empType}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentStatus === ' Working' ? 'bg-green-100 text-green-800' :
                currentStatus === 'Notice Period' ? 'bg-amber-100 text-amber-800' :
                currentStatus === 'Resigned' ? 'bg-red-100 text-red-800' :
                currentStatus === 'Internship Completion' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                'bg-gray-100 text-gray-800'
              }`}>
                ● {currentStatus}
              </span>
              {employee?.department && (
                <span className="text-xs text-gray-500 font-medium">
                  Dept: {employee.department}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {empType === 'Intern' ? (
                <>Current Stipend: <span className="text-blue-600 font-extrabold">₹{currentStipend.toLocaleString('en-IN')}/mo</span></>
              ) : (
                <>Current Salary: <span className="text-green-600 font-extrabold">₹{currentSalary.toLocaleString('en-IN')}/mo</span></>
              )}
            </h2>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Increase Salary for Full-Time & Contract */}
            {(empType === 'Full-Time' || empType === 'Contract') && (
              <button
                onClick={() => {
                  setSalaryForm({
                    new_salary: '',
                    effective_date: new Date().toISOString().substring(0, 10),
                    reason: 'Annual Increment',
                    remarks: '',
                  });
                  setShowSalaryModal(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Increase Salary
              </button>
            )}

            {/* Increase Stipend for Intern */}
            {empType === 'Intern' && (
              <button
                onClick={() => {
                  setStipendForm({
                    new_stipend: '',
                    effective_date: new Date().toISOString().substring(0, 10),
                    reason: 'Performance Increment',
                    remarks: '',
                  });
                  setShowStipendModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Increase Stipend
              </button>
            )}

            {/* Convert to Full-Time for Intern */}
            {empType === 'Intern' && (
              <button
                onClick={() => {
                  setConvertForm({
                    new_salary: '',
                    conversion_date: new Date().toISOString().substring(0, 10),
                    designation: employee?.designation || '',
                    reason: 'Successful Internship Completion',
                    remarks: '',
                  });
                  setShowConvertModal(true);
                }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all">
                <Award className="h-4 w-4 mr-1.5" />
                Convert to Full-Time
              </button>
            )}

            {/* Update Status Button */}
            <button
              onClick={() => {
                const options = getAvailableStatusOptions();
                setStatusForm(prev => ({
                  ...prev,
                  status: options[0] || '',
                  effective_date: new Date().toISOString().substring(0, 10),
                }));
                setShowStatusModal(true);
              }}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-colors">
              <UserCheck className="h-4 w-4 mr-1.5 text-gray-600" />
              Update Status
            </button>
          </div>
        </div>

        {/* Notice Period / Resignation Info Banner if applicable */}
        {currentStatus === 'Notice Period' && employee?.noticePeriod && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Employee Currently on Notice Period</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-amber-800 text-xs">
                <span>Start Date: {employee.noticePeriod.startDate ? new Date(employee.noticePeriod.startDate).toLocaleDateString() : 'N/A'}</span>
                <span>Duration: {employee.noticePeriod.duration || '30 Days'}</span>
                <span>Expected LWD: {employee.noticePeriod.expectedLastWorkingDate ? new Date(employee.noticePeriod.expectedLastWorkingDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              {employee.noticePeriod.reason && (
                <p className="text-xs text-amber-700 mt-1">Reason: {employee.noticePeriod.reason}</p>
              )}
            </div>
          </div>
        )}

        {currentStatus === 'Resigned' && employee?.resignationDetails && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <UserMinus className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Resignation Processed</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-red-800 text-xs">
                <span>Resignation Date: {employee.resignationDetails.resignationDate ? new Date(employee.resignationDetails.resignationDate).toLocaleDateString() : 'N/A'}</span>
                <span>Last Working Date: {employee.resignationDetails.lastWorkingDate ? new Date(employee.resignationDetails.lastWorkingDate).toLocaleDateString() : 'N/A'}</span>
                <span>Exit Date: {employee.resignationDetails.exitDate ? new Date(employee.resignationDetails.exitDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              {employee.resignationDetails.reason && (
                <p className="text-xs text-red-700 mt-1">Reason: {employee.resignationDetails.reason}</p>
              )}
            </div>
          </div>

            )}
        {currentStatus === 'Internship Completion' && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start space-x-3">
            <Award className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900">Internship Successfully Completed</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-purple-800 text-xs">
                <span>Completion Date: {employee.last_working_date ? new Date(employee.last_working_date).toLocaleDateString() : (employee.dateOfLeaving ? new Date(employee.dateOfLeaving).toLocaleDateString() : 'N/A')}</span>
                <span>Joining Date: {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtabs Navigation */}
      <div className="flex border-b border-gray-200 space-x-6">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeSubTab === 'timeline' ? `${primaryBorder} ${primaryText}` : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Timeline & Events
        </button>
        <button
          onClick={() => setActiveSubTab('compensation')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeSubTab === 'compensation' ? `${primaryBorder} ${primaryText}` : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Compensation History
        </button>
        <button
          onClick={() => setActiveSubTab('employment')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeSubTab === 'employment' ? `${primaryBorder} ${primaryText}` : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Employment History
        </button>
       
      </div>

      {/* 1. TIMELINE SUBTAB */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            Chronological Employee Timeline
          </h3>

          {timelineList.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No timeline events recorded yet.</p>
          ) : (
            <div className="relative border-l-2 border-indigo-100 ml-4 space-y-6 pb-4">
              {timelineList.map((event, idx) => {
                const isConversion = event.event_type === 'INTERN_CONVERTED_TO_FULL_TIME';
                const isSalary = event.event_type === 'SALARY_INCREASED' || event.event_type === 'STIPEND_INCREASED';
                const isExit = event.event_type === 'RESIGNED' || event.event_type === 'LEFT';
                const isNotice = event.event_type === 'NOTICE_PERIOD_STARTED';

                const dotColor = isConversion ? 'bg-purple-500' :
                  isSalary ? 'bg-green-500' :
                  isExit ? 'bg-red-500' :
                  isNotice ? 'bg-amber-500' :
                  'bg-indigo-500';

                return (
                  <div key={event._id || idx} className="relative pl-6 group">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow ${dotColor}`} />
                    
                    <div className="bg-gray-50 hover:bg-gray-100/80 transition-colors p-4 rounded-xl border border-gray-200/70">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <span className="font-bold text-gray-800 text-base">{event.title || 'Event'}</span>
                        <span className="text-xs font-semibold text-gray-500">
                          {event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}

                      {event.created_by && (
                        <p className="text-[11px] text-gray-400 mt-2">
                          Logged by: {event.created_by} • {event.createdAt ? new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. COMPENSATION HISTORY SUBTAB */}
      {activeSubTab === 'compensation' && (
        <div className="space-y-6">
          {/* Salary History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Full-Time Salary History
            </h3>

            {salaryHistoryList.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No full-time salary revisions recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold">Effective Date</th>
                      <th className="py-3 px-4 font-semibold">Previous Salary</th>
                      <th className="py-3 px-4 font-semibold">New Salary</th>
                      <th className="py-3 px-4 font-semibold">Increment</th>
                      <th className="py-3 px-4 font-semibold">Reason & Remarks</th>
                      <th className="py-3 px-4 font-semibold">Updated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salaryHistoryList.map((rec, i) => (
                      <tr key={rec._id || i} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {rec.effective_date ? new Date(rec.effective_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ₹{Number(rec.previous_salary || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-green-700">
                          ₹{Number(rec.new_salary || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {rec.increment_amount > 0 ? (
                            <span className="text-green-600 font-semibold">
                              +₹{rec.increment_amount.toLocaleString('en-IN')} ({rec.increment_percentage}%)
                            </span>
                          ) : (
                            <span className="text-gray-400">Initial / Base</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <p className="font-medium">{rec.reason || 'N/A'}</p>
                          {rec.remarks && <p className="text-xs text-gray-500">{rec.remarks}</p>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{rec.created_by || 'Admin'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stipend History (Preserved even if converted to Full-Time!) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-600" />
              Intern Stipend History (Historical Records)
            </h3>

            {stipendHistoryList.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No stipend records found for this employee.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold">Effective Date</th>
                      <th className="py-3 px-4 font-semibold">Previous Stipend</th>
                      <th className="py-3 px-4 font-semibold">New Stipend</th>
                      <th className="py-3 px-4 font-semibold">Increment</th>
                      <th className="py-3 px-4 font-semibold">Reason & Remarks</th>
                      <th className="py-3 px-4 font-semibold">Updated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stipendHistoryList.map((rec, i) => (
                      <tr key={rec._id || i} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {rec.effective_date ? new Date(rec.effective_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ₹{Number(rec.previous_stipend || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-700">
                          ₹{Number(rec.new_stipend || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {rec.increment_amount > 0 ? (
                            <span className="text-blue-600 font-semibold">
                              +₹{rec.increment_amount.toLocaleString('en-IN')} ({rec.increment_percentage}%)
                            </span>
                          ) : (
                            <span className="text-gray-400">Initial / Base</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <p className="font-medium">{rec.reason || 'N/A'}</p>
                          {rec.remarks && <p className="text-xs text-gray-500">{rec.remarks}</p>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{rec.created_by || 'Admin'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. EMPLOYMENT HISTORY SUBTAB */}
      {activeSubTab === 'employment' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
            Employment Type History
          </h3>

          {employmentHistoryList.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No previous employment types recorded.</p>
          ) : (
            <div className="space-y-4">
              {employmentHistoryList.map((item, idx) => (
                <div key={item._id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 text-base">{item.employment_type}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'} → {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Present'}
                    </p>
                    {item.remarks && <p className="text-xs text-gray-600 mt-1">{item.remarks}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.end_date ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.end_date ? 'Completed' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



     

      {/* MODAL 1: SALARY INCREMENT */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                Increase Full-Time Salary
              </h3>
              <button onClick={() => setShowSalaryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalaryIncrease} className="space-y-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Current Monthly Salary:</span>
                <span className="text-base font-bold text-gray-800">₹{currentSalary.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Monthly Salary (₹) *</label>
                <input
                  type="number"
                  required
                  value={salaryForm.new_salary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, new_salary: e.target.value })}
                  placeholder={`e.g. ${currentSalary + 5000}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Dynamic live increment preview */}
              {newSalVal > currentSalary && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs">
                  <div>
                    <span className="text-green-700 font-medium">Increment Amount:</span>
                    <p className="text-sm font-bold text-green-800">+₹{salIncrement.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Increment Percentage:</span>
                    <p className="text-sm font-bold text-green-800">+{salIncrementPercent}%</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={salaryForm.effective_date}
                  onChange={(e) => setSalaryForm({ ...salaryForm, effective_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Increment</label>
                <input
                  type="text"
                  value={salaryForm.reason}
                  onChange={(e) => setSalaryForm({ ...salaryForm, reason: e.target.value })}
                  placeholder="e.g. Annual Appraisal, Promotion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={salaryForm.remarks}
                  onChange={(e) => setSalaryForm({ ...salaryForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newSalVal <= currentSalary}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Confirm Increment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STIPEND INCREMENT */}
      {showStipendModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                Increase Intern Stipend
              </h3>
              <button onClick={() => setShowStipendModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStipendIncrease} className="space-y-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Current Monthly Stipend:</span>
                <span className="text-base font-bold text-gray-800">₹{currentStipend.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Monthly Stipend (₹) *</label>
                <input
                  type="number"
                  required
                  value={stipendForm.new_stipend}
                  onChange={(e) => setStipendForm({ ...stipendForm, new_stipend: e.target.value })}
                  placeholder={`e.g. ${currentStipend + 3000}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic live increment preview */}
              {newStipVal > currentStipend && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <div>
                    <span className="text-blue-700 font-medium">Increment Amount:</span>
                    <p className="text-sm font-bold text-blue-800">+₹{stipIncrement.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Increment Percentage:</span>
                    <p className="text-sm font-bold text-blue-800">+{stipIncrementPercent}%</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={stipendForm.effective_date}
                  onChange={(e) => setStipendForm({ ...stipendForm, effective_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Increment</label>
                <input
                  type="text"
                  value={stipendForm.reason}
                  onChange={(e) => setStipendForm({ ...stipendForm, reason: e.target.value })}
                  placeholder="e.g. Performance Increment, Project Delivery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={stipendForm.remarks}
                  onChange={(e) => setStipendForm({ ...stipendForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Additional remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowStipendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newStipVal <= currentStipend}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Confirm Increment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERN TO FULL-TIME CONVERSION */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Award className="h-5 w-5 text-purple-600 mr-2" />
                Convert Intern to Full-Time
              </h3>
              <button onClick={() => setShowConvertModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConvertToFullTime} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs">
                <div>
                  <span className="text-purple-700 font-medium">Current Type:</span>
                  <p className="text-sm font-bold text-purple-900">Intern</p>
                </div>
                <div>
                  <span className="text-purple-700 font-medium">Current Stipend:</span>
                  <p className="text-sm font-bold text-purple-900">₹{currentStipend.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Employment Type</label>
                <input
                  type="text"
                  readOnly
                  value="Full-Time"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Full-Time Monthly Salary (₹) *</label>
                <input
                  type="number"
                  required
                  value={convertForm.new_salary}
                  onChange={(e) => setConvertForm({ ...convertForm, new_salary: e.target.value })}
                  placeholder="e.g. 35000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conversion / Effective Date *</label>
                <input
                  type="date"
                  required
                  value={convertForm.conversion_date}
                  onChange={(e) => setConvertForm({ ...convertForm, conversion_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Designation</label>
                <input
                  type="text"
                  value={convertForm.designation}
                  onChange={(e) => setConvertForm({ ...convertForm, designation: e.target.value })}
                  placeholder="e.g. Junior Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Conversion</label>
                <input
                  type="text"
                  value={convertForm.reason}
                  onChange={(e) => setConvertForm({ ...convertForm, reason: e.target.value })}
                  placeholder="e.g. Successful Internship Completion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={convertForm.remarks}
                  onChange={(e) => setConvertForm({ ...convertForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Additional conversion remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !convertForm.new_salary}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50">
                  {isSubmitting ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: UPDATE STATUS */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <UserCheck className="h-5 w-5 text-gray-700 mr-2" />
                Update Employee Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 mt-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs flex justify-between">
                <div>
                  <span className="text-gray-500">Employment Type:</span>
                  <p className="font-bold text-gray-800">{empType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  <p className="font-bold text-gray-800">{currentStatus}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                  <option value="" disabled>Select status</option>
                  {getAvailableStatusOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={statusForm.effective_date}
                  onChange={(e) => setStatusForm({ ...statusForm, effective_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* SPECIFIC FIELDS FOR NOTICE PERIOD */}
              {statusForm.status === 'Notice Period' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-amber-900 uppercase">Notice Period Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notice Start Date</label>
                      <input
                        type="date"
                        value={statusForm.noticePeriod.startDate}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          noticePeriod: { ...statusForm.noticePeriod, startDate: e.target.value }
                        })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notice Duration</label>
                      <input
                        type="text"
                        value={statusForm.noticePeriod.duration}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          noticePeriod: { ...statusForm.noticePeriod, duration: e.target.value }
                        })}
                        placeholder="e.g. 30 Days"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expected Last Working Date</label>
                    <input
                      type="date"
                      value={statusForm.noticePeriod.expectedLastWorkingDate}
                      onChange={(e) => setStatusForm({
                        ...statusForm,
                        noticePeriod: { ...statusForm.noticePeriod, expectedLastWorkingDate: e.target.value }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR RESIGNED */}
              {statusForm.status === 'Resigned' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-red-900 uppercase">Resignation & Exit Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Resignation Date</label>
                      <input
                        type="date"
                        value={statusForm.resignationDetails.resignationDate}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          resignationDetails: { ...statusForm.resignationDetails, resignationDate: e.target.value }
                        })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Last Working Date</label>
                      <input
                        type="date"
                        value={statusForm.resignationDetails.lastWorkingDate}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          resignationDetails: { ...statusForm.resignationDetails, lastWorkingDate: e.target.value }
                        })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Exit / Relieving Date</label>
                    <input
                      type="date"
                      value={statusForm.resignationDetails.exitDate}
                      onChange={(e) => setStatusForm({
                        ...statusForm,
                        resignationDetails: { ...statusForm.resignationDetails, exitDate: e.target.value }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR LEFT */}
              {statusForm.status === 'Left' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Last Working Date *</label>
                  <input
                    type="date"
                    required
                    value={statusForm.last_working_date}
                    onChange={(e) => setStatusForm({ ...statusForm, last_working_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Status Change</label>
                <input
                  type="text"
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  placeholder="e.g. Higher studies, Personal reasons, Better opportunity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !statusForm.status}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50">
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLifecycleSection;
