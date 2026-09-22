import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCog, Briefcase, Mail, Phone, X } from 'lucide-react';

const AccessControlEmployeeSelection = () => {
    const { companyId, adminName, adminId, adminLevel } = useParams();
    const navigate = useNavigate();

    const currentAdminId = adminId;
    const currentAdminLevel = parseInt(adminLevel);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [accessOptions, setAccessOptions] = useState({
        canViewOverview: false,
        canViewBankDetails: false,
        canViewProfessionalDocuments: false,
        canViewPersonalDocuments: false,
        canViewLegalDocuments: false,
        canViewConfidentialDocuments: false,
    });

    const companyName =
        companyId === 'swaayatt'
            ? 'Swaayatt Robots'
            : companyId === 'deepeigen'
                ? 'DeepEigen'
                : 'Selected Company';

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            let actualCompanyFilter =
                companyId === 'swaayatt' ? 'swaayatt_robots' : companyId === 'deepeigen' ? 'DeepEigen' : companyId;

            const response = await fetch(
                `http://localhost:3000/get-all-employees?companyFilter=${actualCompanyFilter}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                const processedEmployees = data.data.map((emp) => ({
                    ...emp,
                    accessControl: emp.accessControl || [],
                }));
                setEmployees(processedEmployees);
            } else {
                setError(data.message || 'Failed to fetch employees');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to fetch employees. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleManageAccess = async (employee) => {
        try {
            const response = await fetch(`http://localhost:3000/get-one-emp-data/${employee._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success || !data.data) {
                throw new Error(data.message || 'Failed to fetch employee details for access management.');
            }
            const latestEmployeeData = {
                ...data.data,
                accessControl: data.data.accessControl || [],
            };
            setSelectedEmployee(latestEmployeeData);

            const existingAccessForEmployeeByAdmin = (latestEmployeeData.accessControl || []).find(
                (entry) => String(entry.adminId) === String(currentAdminId)
            );

            let newAccessOptions = {};

            if (existingAccessForEmployeeByAdmin) {
                newAccessOptions = { ...existingAccessForEmployeeByAdmin };
            } else {
                switch (currentAdminLevel) {
                    case 1:
                        newAccessOptions = {
                            canViewOverview: true,
                            canViewBankDetails: false,
                            canViewProfessionalDocuments: true,
                            canViewPersonalDocuments: false,
                            canViewLegalDocuments: false,
                            canViewConfidentialDocuments: false,
                        };
                        break;
                    case 2:
                        newAccessOptions = {
                            canViewOverview: true,
                            canViewBankDetails: true,
                            canViewProfessionalDocuments: true,
                            canViewPersonalDocuments: false,
                            canViewLegalDocuments: false,
                            canViewConfidentialDocuments: false,
                        };
                        break;
                    case 3:
                        newAccessOptions = {
                            canViewOverview: true,
                            canViewBankDetails: true,
                            canViewProfessionalDocuments: true,
                            canViewPersonalDocuments: true,
                            canViewLegalDocuments: true,
                            canViewConfidentialDocuments: false,
                        };
                        break;
                    case 4:
                        newAccessOptions = {
                            canViewOverview: true,
                            canViewBankDetails: true,
                            canViewProfessionalDocuments: true,
                            canViewPersonalDocuments: true,
                            canViewLegalDocuments: true,
                            canViewConfidentialDocuments: true,
                        };
                        break;
                    default:
                        newAccessOptions = {};
                }
            }

            setAccessOptions(newAccessOptions);
            setShowModal(true);
        } catch (err) {
            console.error("Error preparing access management:", err);
            setError(`Error loading employee access: ${err.message}`);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
        setAccessOptions({});
    };

    const handleAccessOptionChange = (key) => {
        setAccessOptions((prevOptions) => {
            const newOptions = { ...prevOptions };

            if (key === 'allDocuments') {
                const allChecked = (
                    newOptions.canViewProfessionalDocuments &&
                    newOptions.canViewPersonalDocuments &&
                    newOptions.canViewLegalDocuments
                );
                const toggleValue = !allChecked;

                newOptions.canViewProfessionalDocuments = toggleValue;
                newOptions.canViewPersonalDocuments = toggleValue;
                newOptions.canViewLegalDocuments = toggleValue;
            } else {
                newOptions[key] = !newOptions[key];
            }
            return newOptions;
        });
    };

    const handleSaveChanges = async () => {
        console.log(
            `Saving access for ${selectedEmployee.name} (ID: ${selectedEmployee._id}) in ${companyName} by Admin ${adminName}:`,
            accessOptions
        );

        try {
            const response = await fetch(`http://localhost:3000/update-access-control/${selectedEmployee._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    adminId: currentAdminId,
                    adminLevel: currentAdminLevel,
                    access: accessOptions
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                throw new Error(errorData.details || errorData.message || `HTTP error! Status: ${response.status}`);
            }

            console.log("Access updated successfully on server.");
            await fetchEmployees();
            handleCloseModal();

        } catch (err) {
            console.error("Failed to save access changes:", err);
            alert(`Failed to save access changes: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Loading employees...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white animate-gradient-xy-slow">
            <div className="container mx-auto px-6 py-20 relative z-10 text-center">
                <button
                    onClick={() => navigate(`/access-control/${companyId}`)}
                    className=" top-8 left-8 flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-300 font-semibold"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to Admin Selection
                </button>

                <div className="flex justify-center items-center mb-6 mt-6">
                    <UserCog className="h-12 w-12 text-blue-700 mr-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
                        Manage Employee Access for{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {companyName}
                        </span>
                        <br />
                        by{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {adminName}
                        </span>
                    </h1>
                </div>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-12">
                    Select an employee to configure their access permissions for various data categories.
                </p>

                {employees.length === 0 ? (
                    <div className="text-center py-20">
                        <UserCog className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                        <p className="text-xl text-gray-600">No employees found for {companyName}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {employees.map((employee, index) => (
                            <div
                                key={employee._id}
                                className="group bg-white/70 backdrop-blur-md rounded-2xl p-6 cursor-pointer
                           transform transition-all duration-300 hover:scale-[1.02]
                           shadow-lg hover:shadow-xl border border-white/80
                           flex flex-col items-center text-center animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handleManageAccess(employee)}
                            >
                                <div className="w-28 h-28 mx-auto mb-4 rounded-full object-cover border-4 border-blue-300 flex items-center justify-center shadow-md overflow-hidden">
                                    {employee.documents.personalDocs.passportSizePhotos[0] ? (
                                        <img
                                            src={`http://localhost:3000/new_uploads/${employee.documents.personalDocs.passportSizePhotos[0].fileName}`}
                                            alt={employee.name}
                                            className="w-40 h-40 rounded-full object-cover border-4 border-blue-200"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-blue-200">
                                            {employee.name ? String(employee.name).split(' ').map(n => n[0]).join('') : 'N/A'}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2 truncate w-full">
                                    {employee.name}
                                </h2>
                                <p className="text-gray-600 text-sm mb-1 flex items-center justify-center w-full truncate">
                                    <Briefcase className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    {employee.designation || 'N/A'}
                                </p>
                                <p className="text-gray-600 text-sm mb-1 flex items-center justify-center w-full truncate">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    {employee.companyEmail}
                                </p>
                                <p className="text-gray-600 text-sm mb-4 flex items-center justify-center w-full truncate">
                                    <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    {employee.contact}
                                </p>
                                <button
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-600
                           text-white font-semibold rounded-full shadow-md hover:shadow-lg
                          hover:from-blue-600 hover:to-indigo-700 transition-all duration-300
                           group-hover:translate-y-1 group-hover:scale-105 hover:border-blue-300"
                                >
                                    Configure Access
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full mx-4 transform scale-in border border-blue-200 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                            Set Access for{' '}
                            <span className="text-blue-600">{selectedEmployee?.name}</span>
                        </h2>

                        <div className="space-y-6">
                            {/* Overview */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="flex items-center text-lg font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                        checked={accessOptions.canViewOverview || false}
                                        onChange={() => handleAccessOptionChange('canViewOverview')}
                                    />
                                    Overview
                                </label>
                                <p className="text-sm text-gray-500 ml-8 mt-1">
                                    Access to general employee information (Personal Information,Family Information,Employment Details,Education, etc.).
                                </p>
                            </div>

                            {/* Bank Details */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="flex items-center text-lg font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                        checked={accessOptions.canViewBankDetails || false}
                                        onChange={() => handleAccessOptionChange('canViewBankDetails')}
                                    />
                                    Bank Details
                                </label>
                                <p className="text-sm text-gray-500 ml-8 mt-1">
                                    Access to sensitive employee bank account information.
                                </p>
                            </div>

                            {/* Documents Section */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="flex items-center text-lg font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                        checked={
                                            accessOptions.canViewProfessionalDocuments &&
                                            accessOptions.canViewPersonalDocuments &&
                                            accessOptions.canViewLegalDocuments
                                        }
                                        onChange={() => handleAccessOptionChange('allDocuments')}
                                    />
                                    All Documents
                                </label>
                                <p className="text-sm text-gray-500 ml-8 mt-1 mb-3">
                                    Grants access to all categories of employee documents.
                                </p>
                                <div className="ml-8 space-y-2">
                                    <label className="flex items-center text-base text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-500 rounded mr-2"
                                            checked={accessOptions.canViewLegalDocuments || false}
                                            onChange={() => handleAccessOptionChange('canViewLegalDocuments')}
                                            disabled={accessOptions.canViewProfessionalDocuments && accessOptions.canViewPersonalDocuments && accessOptions.canViewLegalDocuments}
                                        />
                                        Legal Documents
                                    </label>
                                    <p className="text-sm text-gray-500 ml-8 mt-1">
                                        Like EPRA,EA,NDA,Offer Letter and TRL etc.
                                    </p>
                                    <label className="flex items-center text-base text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-500 rounded mr-2"
                                            checked={accessOptions.canViewPersonalDocuments || false}
                                            onChange={() => handleAccessOptionChange('canViewPersonalDocuments')}
                                            disabled={accessOptions.canViewProfessionalDocuments && accessOptions.canViewPersonalDocuments && accessOptions.canViewLegalDocuments}
                                        />
                                        Personal Documents
                                    </label>
                                    <p className="text-sm text-gray-500 ml-8 mt-1">
                                        Like Pancard, Adharcard, Academic Marksheets, etc.
                                    </p>
                                    <label className="flex items-center text-base text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-500 rounded mr-2"
                                            checked={accessOptions.canViewProfessionalDocuments || false}
                                            onChange={() => handleAccessOptionChange('canViewProfessionalDocuments')}
                                            disabled={accessOptions.canViewProfessionalDocuments && accessOptions.canViewPersonalDocuments && accessOptions.canViewLegalDocuments}
                                        />
                                        Professional Documents
                                    </label>
                                    <p className="text-sm text-gray-500 ml-8 mt-1">
                                        Like Resume / CV, Certification, Experience Letter, etc.
                                    </p>
                                </div>
                            </div>

                            {/* Confidential Documents */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="flex items-center text-lg font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                        checked={accessOptions.canViewConfidentialDocuments || false}
                                        onChange={() => handleAccessOptionChange('canViewConfidentialDocuments')}
                                    />
                                    Confidential Documents
                                </label>
                                <p className="text-sm text-gray-500 ml-8 mt-1">
                                    Access to highly sensitive and confidential employee documents.
                                </p>
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                @keyframes gradient-xy-slow {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient-xy-slow {
                    background-size: 300% 300%;
                    animation: gradient-xy-slow 25s ease infinite;
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                }
                `}
            </style>
        </div>
    );
};

export default AccessControlEmployeeSelection;