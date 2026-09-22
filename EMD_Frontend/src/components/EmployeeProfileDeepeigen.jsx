import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, User, Briefcase, GraduationCap, Heart, CreditCard, Phone as PhoneIcon, Users,
    Download, Upload, FileText, CheckCircle, XCircle, Clock, File, Edit, Save, X, Lock, HandCoins
} from 'lucide-react';


// Helper component for generic text/number inputs
const InputField = ({ label, value, onChange, type = 'text', required = false, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    </div>
);

// Helper component for select inputs
const SelectField = ({ label, value, options, onChange, required = false, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="">Select an option</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);


// Display component for information rows
const InfoRow = ({ label, value }) => {
    const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{label}:</span>
            <span className="text-sm text-gray-800 font-medium">{displayValue}</span>
        </div>
    );
};


const InfoSection = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
            {icon}
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const EmployeeProfile = ({ employee: employee, onBack, onEmployeeUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingFile, setUploadingFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableEmployeeData, setEditableEmployeeData] = useState({});
    const [adminLevel, setAdminLevel] = useState(null);
    const [currentAdminId, setCurrentAdminId] = useState(null);
    const [currentAdminAccess, setCurrentAdminAccess] = useState({});
    const [confidentialFiles, setConfidentialFiles] = useState([]);


    useEffect(() => {
        if (employee) {
            setEditableEmployeeData(JSON.parse(JSON.stringify(employee)));
            fetchConfidentialFiles(employee._id);
        }
        const level = localStorage.getItem('adminLevel');
        if (level) {
            setAdminLevel(parseInt(level));
            // console.log('Admin Level from localStorage:', level);
        }
        const adminId = localStorage.getItem('adminId');
        if (adminId) {
            setCurrentAdminId(adminId);
            // console.log('Current Admin ID from localStorage:', adminId);
        }
    }, [employee]);

    useEffect(() => {
        if (employee && currentAdminId !== null && adminLevel !== null) {

            // console.log('Employee accessControl (full content):', JSON.stringify(employee.accessControl, null, 2));
            const calculatedAccess = findAdminAccess(employee.accessControl, currentAdminId, adminLevel);
            setCurrentAdminAccess(calculatedAccess);
            // console.log('Calculated currentAdminAccess:', calculatedAccess);
        }
    }, [employee, currentAdminId, adminLevel]);


    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
                <p className="text-xl text-gray-700">Loading employee data...</p>
            </div>
        );
    }

    const findAdminAccess = (accessControlArray, adminId, defaultAdminLevel) => {
        // console.log('findAdminAccess called with:');
        // console.log('  accessControlArray:', accessControlArray);
        // console.log('  adminId:', adminId);
        // console.log('  defaultAdminLevel:', defaultAdminLevel);

        const existingAccess = (accessControlArray || []).find(
            (entry) => String(entry.adminId) === String(adminId)
        );

        if (existingAccess) {
            // console.log('  Found existing access:', existingAccess);
            return { ...existingAccess };
        } else {
            switch (defaultAdminLevel) {
                case 1:
                    const defaultAccessLevel1 = {
                        canViewOverview: true,
                        canViewBankDetails: false,
                        canViewProfessionalDocuments: true,
                        canViewPersonalDocuments: false,
                        canViewLegalDocuments: false,
                        canViewConfidentialDocuments: false,
                    };
                    // console.log('  Using default access for adminLevel 1:', defaultAccessLevel1);
                    return defaultAccessLevel1;
                case 2:
                    const defaultAccessLevel2 = {
                        canViewOverview: true,
                        canViewBankDetails: true,
                        canViewProfessionalDocuments: true,
                        canViewPersonalDocuments: false,
                        canViewLegalDocuments: false,
                        canViewConfidentialDocuments: false,
                    };
                    // console.log('  Using default access for adminLevel 2:', defaultAccessLevel2);
                    return defaultAccessLevel2;
                case 3:
                    const defaultAccessLevel3 = {
                        canViewOverview: true,
                        canViewBankDetails: true,
                        canViewProfessionalDocuments: true,
                        canViewPersonalDocuments: true,
                        canViewLegalDocuments: true,
                        canViewConfidentialDocuments: false,
                    };
                    console.log('  Using default access for adminLevel 3:', defaultAccessLevel3);
                    return defaultAccessLevel3;
                case 4:
                    const defaultAccessLevel4 = {
                        canViewOverview: true,
                        canViewBankDetails: true,
                        canViewProfessionalDocuments: true,
                        canViewPersonalDocuments: true,
                        canViewLegalDocuments: true,
                        canViewConfidentialDocuments: true,
                    };
                    console.log('  Using default access for adminLevel 4:', defaultAccessLevel4);
                    return defaultAccessLevel4;
                default:
                    console.log('  No existing access, no default match. Returning empty object.');
                    return {};
            }
        }
    };

    const fetchConfidentialFiles = async (employeeId) => {
        try {
            const res = await fetch(`http://localhost:3000/get-confidential-documents/${employeeId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch confidential documents');
            }
            const data = await res.json();
            setConfidentialFiles(data.confidentialDocs || []);
        } catch (error) {
            console.error('Error fetching confidential files:', error);
            setConfidentialFiles([]);
        }
    };


    const getDocumentCategory = (docName) => {
        if (employee.documents.legal?.some(d => d.name === docName)) return 'legal';
        if (employee.documents.professional?.some(d => d.name === docName)) return 'professional';
        if (employee.documents.personal?.some(d => d.name === docName)) return 'personal';
        return '';
    };


    const getCategoryColor = (category) => {
        const lowerCategory = category ? category.toLowerCase() : '';
        switch (lowerCategory) {
            case 'intern':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'full-time':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'contractual':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploaded':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'not-uploaded':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <File className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'uploaded':
                return 'Uploaded';
            case 'not-uploaded':
                return 'Not Uploaded';
            default:
                return 'Unknown';
        }
    };


    const handleNewFileUpload = async (docName, isConfidential = false) => {
        let category = '';
        let endpoint = '';
        let formDataFieldName = '';

        if (isConfidential) {
            endpoint = `http://localhost:3000/upload-confidential-document/${employee._id}`;
            formDataFieldName = 'confidentialFiles';
        } else {
            category = getDocumentCategory(docName);
            if (!category || !employee || !employee._id) {
                alert("Missing required information (category or employee ID)");
                return;
            }
            endpoint = "http://localhost:3000/upload-document";
            formDataFieldName = "file";
        }


        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "*/*";

        input.onchange = async () => {
            const files = Array.from(input.files);
            if (!files.length) return;

            const formData = new FormData();
            for (let file of files) {
                formData.append(formDataFieldName, file);
            }

            if (!isConfidential) {
                formData.append("employeeId", employee._id);
                formData.append("category", category);
                formData.append("docName", docName);
            }

            try {
                setUploadingFile(`${docName}-${isConfidential ? 'confidential' : 'normal'}-new-file`);

                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Upload failed");
                }

                alert("File(s) uploaded successfully.");
                if (isConfidential) {
                    fetchConfidentialFiles(employee._id);
                } else {
                    window.location.reload();
                }

            } catch (err) {
                console.error("Upload error:", err);
                alert(`Upload failed. ${err.message}. Try again.`);
            } finally {
                setUploadingFile(null);
            }
        };

        input.click();
    };

    const handleDownload = (fileName) => {
        if (fileName) {
            const fileUrl = `http://localhost:3000/new_uploads/${fileName}`;
            window.open(fileUrl, '_blank');
        } else {
            console.warn("No file name provided for download.");
        }
    };

    const handleDelete = async (docName, fileName, isConfidential = false) => {
        let category = '';
        let endpoint = '';

        if (isConfidential) {
            endpoint = `http://localhost:3000/delete-confidential-document/${employee._id}/${encodeURIComponent(fileName)}`;
        } else {
            category = getDocumentCategory(docName);
            if (!category) {
                alert('Invalid document category or docName could not be mapped.');
                return;
            }
            endpoint = `http://localhost:3000/delete-employee-document/${employee._id}/${category}/${encodeURIComponent(fileName)}`;
        }

        if (!employee || !employee._id) {
            alert('Employee ID not available');
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete');
            }

            alert('File deleted successfully.');
            if (isConfidential) {
                fetchConfidentialFiles(employee._id);
            } else {
                window.location.reload();
            }

        } catch (err) {
            console.error('Delete error:', err);
            alert(`Error deleting file: ${err.message}`);
        }
    };

    const DocumentSection = ({ title, documents, isConfidential = false }) => {
        const documentsToDisplay = Array.isArray(documents) ? documents : [];

        if (documentsToDisplay.length === 0 && !isConfidential) {
            return (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">{title}</h4>
                    <p className="text-gray-500">No documents in this category.</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">{title}</h4>
                <div className="space-y-3">
                    {documentsToDisplay.length === 0 && isConfidential ? (
                        <p className="text-gray-500">No confidential files uploaded.</p>
                    ) : (
                        documentsToDisplay.map((doc, index) => {
                            const docNameToPass = isConfidential ? doc.originalName : doc.name;
                            const filesToMap = isConfidential ? [doc.fileName] : (doc.files || []);

                            return (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex items-center space-x-4 mb-3">
                                        {isConfidential ? <Lock className="h-5 w-5 text-red-500" /> : getStatusIcon(doc.status)}
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{isConfidential ? doc.fileName : (doc.displayName || doc.name)}</h4>
                                            {!isConfidential && <span className="text-sm text-gray-500">Status: {getStatusText(doc.status)}</span>}
                                            {isConfidential && <span className="text-sm text-gray-500">Uploaded on: {new Date(doc.uploadDate).toLocaleDateString()}</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {filesToMap.length > 0 ? (
                                            filesToMap.map((fileName, fileIndex) => {
                                                const uniqueFileId = `${docNameToPass}-${fileName}`;
                                                return (
                                                    <div key={fileIndex} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                                        <span className="text-sm text-gray-700 font-medium truncate max-w-[calc(100%-100px)]">
                                                            {isConfidential ? fileName : fileName}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleDownload(isConfidential ? doc.fileName : fileName)}
                                                                className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                                                                title="Download"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                            {!isConfidential && (
                                                                <button
                                                                    onClick={() => handleNewFileUpload(doc.name, false)}
                                                                    disabled={uploadingFile === `${doc.name}-${fileName}`}
                                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                                                                    title="Upload"
                                                                >
                                                                    {uploadingFile === `${doc.name}-${fileName}` ? (
                                                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <Upload className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(docNameToPass, isConfidential ? doc.fileName : fileName, isConfidential)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                                                                title="Delete"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                                <span className="text-sm text-gray-700">No file uploaded</span>
                                                <button
                                                    onClick={() => handleNewFileUpload(docNameToPass, isConfidential)}
                                                    disabled={uploadingFile === `${docNameToPass}-${isConfidential ? 'confidential' : 'normal'}-new-file`}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                                                    title={uploadingFile === `${docNameToPass}-${isConfidential ? 'confidential' : 'normal'}-new-file` ? 'Uploading...' : 'Upload File'}
                                                >
                                                    {uploadingFile === `${docNameToPass}-${isConfidential ? 'confidential' : 'normal'}-new-file` ? (
                                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                {isConfidential && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => handleNewFileUpload('confidentialFiles', true)}
                            disabled={uploadingFile === 'confidentialFiles-confidential-new-file'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title={uploadingFile === 'confidentialFiles-confidential-new-file' ? 'Uploading...' : 'Upload New File'}
                        >
                            {uploadingFile === 'confidentialFiles-confidential-new-file' ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload New File
                        </button>
                    </div>
                )}
            </div>
        );
    };


    const handleChange = (fieldPath, value) => {
        setEditableEmployeeData(prevData => {
            const newData = { ...prevData };
            const pathParts = fieldPath.split('.');
            let current = newData;
            for (let i = 0; i < pathParts.length - 1; i++) {
                if (!current[pathParts[i]]) {
                    current[pathParts[i]] = {};
                }
                current = current[pathParts[i]];
            }
            current[pathParts[pathParts.length - 1]] = value;
            return newData;
        });
    };


    const handleSave = async () => {
        try {
            const payload = {
                name: editableEmployeeData.name,
                email: editableEmployeeData.email,
                contact: editableEmployeeData.contact,
                address: editableEmployeeData.address,
                permanentAddress: editableEmployeeData.permanentAddress,
                dateOfBirth: editableEmployeeData.dateOfBirth,
                companyEmail: editableEmployeeData.companyEmail,
                birthPlace: editableEmployeeData.birthPlace,
                nationality: editableEmployeeData.nationality,
                fatherName: editableEmployeeData.fatherName,
                motherName: editableEmployeeData.motherName,
                company: editableEmployeeData.company,
                designation: editableEmployeeData.designation,
                category: editableEmployeeData.category,
                status: editableEmployeeData.status,

                dateOfJoining: editableEmployeeData.dateOfJoining,
                dateOfLeaving: editableEmployeeData.dateOfLeaving,
                bloodGroup: editableEmployeeData.bloodGroup,

                bankDetails: {
                    accountHolderName: editableEmployeeData.bankDetails?.accountHolderName,
                    accountNumber: editableEmployeeData.bankDetails?.accountNumber,
                    ifscCode: editableEmployeeData.bankDetails?.ifscCode,
                    bankName: editableEmployeeData.bankDetails?.bankName,
                    branchNumber: editableEmployeeData.bankDetails?.branchNumber,
                },
                salary: editableEmployeeData.salary,
                ctc: editableEmployeeData.ctc,
                stipend: editableEmployeeData.stipend,
                emergencyContact: {
                    name: editableEmployeeData.emergencyContact?.name,
                    number: editableEmployeeData.emergencyContact?.number,
                },
                education: {
                    tenth: {
                        board: editableEmployeeData.education?.tenth?.board,
                        school: editableEmployeeData.education?.tenth?.school,
                        year: editableEmployeeData.education?.tenth?.year,
                        percentage: editableEmployeeData.education?.tenth?.percentage,
                    },
                    twelfth: {
                        board: editableEmployeeData.education?.twelfth?.board,
                        school: editableEmployeeData.education?.twelfth?.school,
                        year: editableEmployeeData.education?.twelfth?.year,
                        percentage: editableEmployeeData.education?.twelfth?.percentage,
                    },
                    graduation: {
                        college: editableEmployeeData.education?.graduation?.college,
                        year: editableEmployeeData.education?.graduation?.year,
                        cgpa: editableEmployeeData.education?.graduation?.cgpa,
                    },
                    postGraduation: editableEmployeeData.education?.postGraduation ? {
                        college: editableEmployeeData.education?.postGraduation?.college,
                        year: editableEmployeeData.education?.postGraduation?.year,
                        cgpa: editableEmployeeData.education?.postGraduation?.cgpa,
                    } : undefined,
                },
            };

            const response = await fetch(`http://localhost:3000/update-employee/${employee._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update employee details');
            }

            alert('Employee details updated successfully!');
            setIsEditing(false);
            window.location.reload();

        } catch (error) {
            console.error('Error updating employee details:', error);
            alert(`Error saving changes: ${error.message}`);
        }
    };

    const handleCancelEdit = () => {
        setEditableEmployeeData(JSON.parse(JSON.stringify(employee)));
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white relative">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="mr-6 p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>

                        <div className="flex items-center space-x-4">
                           {employee.documents.personal[3].files[0] ? (
                                <img
                                    src={`http://localhost:3000/new_uploads/${employee.documents.personal[3].files[0]}`}
                                    alt={employee.name}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-purple-200"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-green-200">
                                    {employee.name ? employee.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white">{employee.name}</h1>
                                <p className="text-green-200 text-lg">{employee.designation}</p>
                                <div className="flex items-center space-x-3 mt-2">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryColor(employee.category)}`}>
                                        {employee.category ? employee.category.charAt(0).toUpperCase() + employee.category.slice(1) : 'N/A'}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-green-700 border border-green-200">
                                        {employee.company}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Employee Status */}
                <div className="
                    absolute top-0 right-8 rounded-b-lg text-white text-sm font-semibold
                    flex items-center justify-center text-center
                    "
                    style={{
                        height: '4.5rem',
                        width: '5.5rem',
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)',
                        backgroundColor: employee.status === 'Current' || employee.status === 'Working' ? 'rgba(9, 61, 28, 0.8)' :
                             employee.status === 'Resigned' ? 'rgba(197, 9, 9, 0.8)' :
                                employee.status === 'Notice Period' ? 'rgba(207, 88, 2, 0.8)' :
                                    'rgba(128, 128, 128, 0.8)'
                    }}
                >
                    <span className="p-1">
                        {String(employee.status) === 'Current' ? 'Working' :
                            String(employee.status) === 'Resigned' ? 'Resigned' :
                                String(employee.status) === 'Notice Period' ? 'Notice Period' :
                                    String(employee.status)}
                    </span>

                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-6">
                    <nav className="flex space-x-8">
                        {currentAdminAccess.canViewOverview && (
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-4 font-semibold text-base transition-colors duration-200 ${activeTab === 'overview'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300'
                                    }`}
                            >
                                Overview
                            </button>
                        )}

                        {currentAdminAccess.canViewBankDetails && (
                            <button
                                onClick={() => setActiveTab('bankDetails')}
                                className={`py-4 px-1 border-b-4 font-semibold text-base transition-colors duration-200 ${activeTab === 'bankDetails'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300'
                                    }`}
                            >
                                Bank Details
                            </button>
                        )}

                        {(currentAdminAccess.canViewProfessionalDocuments || currentAdminAccess.canViewPersonalDocuments || currentAdminAccess.canViewLegalDocuments) && (
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`py-4 px-1 border-b-4 font-semibold text-base transition-colors duration-200 ${activeTab === 'documents'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300'
                                    }`}
                            >
                                Documents
                            </button>
                        )}

                        {currentAdminAccess.canViewConfidentialDocuments && (
                            <button
                                onClick={() => setActiveTab('confidential')}
                                className={`py-4 px-1 border-b-4 font-semibold text-base transition-colors duration-200 ${activeTab === 'confidential'
                                    ? 'border-green-600 text-green-700'
                                    : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300'
                                    }`}
                            >
                                Confidential Files
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Overview Tab */}
            <div className="container mx-auto px-6 py-8">
                {activeTab === 'overview' && currentAdminAccess.canViewOverview && (
                    <div className="space-y-6">
                        {/* Edit/Save/Cancel Buttons */}
                        <div className="flex justify-end mb-6 space-x-3">
                            {!isEditing && currentAdminAccess.canViewOverview ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                </button>
                            ) : (
                                isEditing && (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Cancel
                                        </button>
                                    </>
                                )
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <InfoSection title="Personal Information" icon={<User className="h-5 w-5 text-green-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <>
                                            <InputField label="Full Name" value={editableEmployeeData.name || ''} onChange={(val) => handleChange('name', val)} />
                                            <InputField label="Email" value={editableEmployeeData.email || ''} onChange={(val) => handleChange('email', val)} type="email" />
                                            <InputField label="Phone" value={editableEmployeeData.contact || ''} onChange={(val) => handleChange('contact', val)} type="tel" />
                                            <InputField label="Permanent Address" value={editableEmployeeData.permanentAddress || ''} onChange={(val) => handleChange('permanentAddress', val)} />

                                            <InputField label="Current Address" value={editableEmployeeData.address || ''} onChange={(val) => handleChange('address', val)} />
                                            <InputField label="Date of Birth" value={editableEmployeeData.dateOfBirth ? editableEmployeeData.dateOfBirth.substring(0, 10) : ''} onChange={(val) => handleChange('dateOfBirth', val)} type="date" />
                                            <InputField label="Birth Place" value={editableEmployeeData.birthPlace || ''} onChange={(val) => handleChange('birthPlace', val)} />
                                            <InputField label="Nationality" value={editableEmployeeData.nationality || ''} onChange={(val) => handleChange('nationality', val)} />
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow label="Full Name" value={employee.name} />
                                            <InfoRow label="Email" value={employee.email} />
                                            <InfoRow label="Phone" value={employee.contact} />
                                            <InfoRow label="Permanent Address" value={employee.permanentAddress} />

                                            <InfoRow label="Current Address" value={employee.address} />

                                            <InfoRow label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                            <InfoRow label="Birth Place" value={employee.birthPlace} />
                                            <InfoRow label="Nationality" value={employee.nationality} />
                                        </>
                                    )}
                                </div>
                            </InfoSection>

                            {/* Family Information */}
                            <InfoSection title="Family Information" icon={<Users className="h-5 w-5 text-teal-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <>
                                            <InputField label="Father's Name" value={editableEmployeeData.fatherName || ''} onChange={(val) => handleChange('fatherName', val)} />
                                            <InputField label="Mother's Name" value={editableEmployeeData.motherName || ''} onChange={(val) => handleChange('motherName', val)} />
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow label="Father's Name" value={employee.fatherName} />
                                            <InfoRow label="Mother's Name" value={employee.motherName} />
                                        </>
                                    )}
                                </div>
                            </InfoSection>

                            {/* Employment Details */}
                            <InfoSection title="Employment Details" icon={<Briefcase className="h-5 w-5 text-purple-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <>
                                            <InputField label="Company" value={editableEmployeeData.company || ''} onChange={(val) => handleChange('company', val)} />
                                            <InputField label="Designation" value={editableEmployeeData.designation || ''} onChange={(val) => handleChange('designation', val)} />

                                            <SelectField
                                                label="Category"
                                                value={editableEmployeeData.category || ''}
                                                onChange={(val) => handleChange('category', val)}
                                                options={['Full-Time', 'Contractual', 'Intern']}
                                            />

                                            <InputField label="Status" value={editableEmployeeData.status || ''} onChange={(val) => handleChange('status', val)} />

                                            <InputField
                                                label="Company Email"
                                                value={editableEmployeeData.companyEmail || ''}
                                                onChange={(val) => handleChange('companyEmail', val)}
                                                type="email"
                                                required
                                            />

                                            <InputField
                                                label="Date of Joining"
                                                value={editableEmployeeData.dateOfJoining ? editableEmployeeData.dateOfJoining.substring(0, 10) : ''}
                                                onChange={(val) => handleChange('dateOfJoining', val)}
                                                type="date"
                                            />

                                            <InputField
                                                label={
                                                    editableEmployeeData.category?.toLowerCase() === 'intern'
                                                        ? 'Date of Releasing'
                                                        : 'Date of Leaving'
                                                }
                                                value={editableEmployeeData.dateOfLeaving ? editableEmployeeData.dateOfLeaving.substring(0, 10) : ''}
                                                onChange={(val) => handleChange('dateOfLeaving', val)}
                                                type="date"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow label="Company" value={employee.company} />
                                            <InfoRow label="Designation" value={employee.designation} />
                                            <InfoRow label="Company Email" value={employee.companyEmail || 'N/A'} />
                                            <InfoRow label="Category" value={employee.category ? employee.category.charAt(0).toUpperCase() + employee.category.slice(1) : 'N/A'} />
                                            <InfoRow label="Status" value={employee.status} />
                                            <InfoRow
                                                label="Date of Joining"
                                                value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                                            />
                                            {employee.dateOfLeaving && (
                                                <InfoRow
                                                    label={employee.category?.toLowerCase() === 'intern' ? 'Date of Releasing' : 'Date of Leaving'}
                                                    value={new Date(employee.dateOfLeaving).toLocaleDateString()}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </InfoSection>


                            {/* Health Information */}
                            <InfoSection title="Health Information" icon={<Heart className="h-5 w-5 text-red-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <InputField label="Blood Group" value={editableEmployeeData.bloodGroup || ''} onChange={(val) => handleChange('bloodGroup', val)} />
                                    ) : (
                                        <InfoRow label="Blood Group" value={employee.bloodGroup} />
                                    )}
                                </div>
                            </InfoSection>

                            {/* Education */}
                            <InfoSection title="Education" icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <>
                                            <InputField label="10th Board" value={editableEmployeeData.education?.tenth?.board || ''} onChange={(val) => handleChange('education.tenth.board', val)} />
                                            <InputField label="10th School" value={editableEmployeeData.education?.tenth?.school || ''} onChange={(val) => handleChange('education.tenth.school', val)} />
                                            <InputField label="10th Year" value={editableEmployeeData.education?.tenth?.year || ''} onChange={(val) => handleChange('education.tenth.year', val)} type="number" />
                                            <InputField label="10th Percentage" value={editableEmployeeData.education?.tenth?.percentage || ''} onChange={(val) => handleChange('education.tenth.percentage', val)} type="number" />

                                            <InputField label="12th Board" value={editableEmployeeData.education?.twelfth?.board || ''} onChange={(val) => handleChange('education.twelfth.board', val)} />
                                            <InputField label="12th School" value={editableEmployeeData.education?.twelfth?.school || ''} onChange={(val) => handleChange('education.twelfth.school', val)} />
                                            <InputField label="12th Year" value={editableEmployeeData.education?.twelfth?.year || ''} onChange={(val) => handleChange('education.twelfth.year', val)} type="number" />
                                            <InputField label="12th Percentage" value={editableEmployeeData.education?.twelfth?.percentage || ''} onChange={(val) => handleChange('education.twelfth.percentage', val)} type="number" />

                                            <InputField label="Graduation College" value={editableEmployeeData.education?.graduation?.college || ''} onChange={(val) => handleChange('education.graduation.college', val)} />
                                            <InputField label="Graduation Year" value={editableEmployeeData.education?.graduation?.year || ''} onChange={(val) => handleChange('education.graduation.year', val)} type="number" />
                                            <InputField label="Graduation CGPA" value={editableEmployeeData.education?.graduation?.cgpa || ''} onChange={(val) => handleChange('education.graduation.cgpa', val)} type="number" />

                                            {editableEmployeeData.education?.postGraduation && (
                                                <>
                                                    <InputField label="Post-Graduation College" value={editableEmployeeData.education?.postGraduation?.college || ''} onChange={(val) => handleChange('education.postGraduation.college', val)} />
                                                    <InputField label="Post-Graduation Year" value={editableEmployeeData.education?.postGraduation?.year || ''} onChange={(val) => handleChange('education.postGraduation.year', val)} type="number" />
                                                    <InputField label="Post-Graduation CGPA" value={editableEmployeeData.education?.postGraduation?.cgpa || ''} onChange={(val) => handleChange('education.postGraduation.cgpa', val)} type="number" />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow
                                                label="10th Grade"
                                                value={employee.education && employee.education.tenth ?
                                                    `${employee.education.tenth.board || 'N/A'} - ${employee.education.tenth.school || 'N/A'} (${employee.education.tenth.year || 'N/A'}) - ${employee.education.tenth.percentage || 'N/A'}%`
                                                    : 'N/A'}
                                            />
                                            <InfoRow
                                                label="12th Grade"
                                                value={employee.education && employee.education.twelfth ?
                                                    `${employee.education.twelfth.board || 'N/A'} - ${employee.education.twelfth.school || 'N/A'} (${employee.education.twelfth.year || 'N/A'}) - ${employee.education.twelfth.percentage || 'N/A'}%`
                                                    : 'N/A'}
                                            />
                                            <InfoRow
                                                label="Graduation"
                                                value={employee.education && employee.education.graduation ?
                                                    `${employee.education.graduation.college || 'N/A'} (${employee.education.graduation.year || 'N/A'}) - CGPA: ${employee.education.graduation.cgpa || 'N/A'}`
                                                    : 'N/A'}
                                            />
                                            {employee.education && employee.education.postGraduation && (
                                                <InfoRow
                                                    label="Post Graduation"
                                                    value={`${employee.education.postGraduation.college || 'N/A'} (${employee.education.postGraduation.year || 'N/A'}) - CGPA: ${employee.education.postGraduation.cgpa || 'N/A'}`}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </InfoSection>

                            {/* Emergency Contact */}
                            <InfoSection title="Emergency Contact" icon={<PhoneIcon className="h-5 w-5 text-orange-600" />}>
                                <div className="space-y-0">
                                    {isEditing ? (
                                        <>
                                            <InputField label="Name" value={editableEmployeeData.emergencyContact?.name || ''} onChange={(val) => handleChange('emergencyContact.name', val)} />
                                            <InputField label="Phone Number" value={editableEmployeeData.emergencyContact?.number || ''} onChange={(val) => handleChange('emergencyContact.number', val)} type="tel" />
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow label="Name" value={employee.emergencyContact ? employee.emergencyContact.name : 'N/A'} />
                                            <InfoRow label="Phone Number" value={employee.emergencyContact ? employee.emergencyContact.number : 'N/A'} />
                                        </>
                                    )}
                                </div>
                            </InfoSection>
                        </div>
                    </div>
                )}

                {/* Documents Tab  */}
                {activeTab === 'documents' && employee.documents && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Legal Documents */}
                        {currentAdminAccess.canViewLegalDocuments && (
                            <DocumentSection
                                title="Legal Documents"
                                documents={employee.documents.legal}
                                uploadingFile={uploadingFile}
                                handleNewFileUpload={handleNewFileUpload}
                                handleDelete={handleDelete}
                                handleDownload={handleDownload}
                            />
                        )}
                        {/* Professional Documents */}
                        {currentAdminAccess.canViewProfessionalDocuments && (
                            <DocumentSection
                                title="Professional Documents"
                                documents={employee.documents.professional}
                                uploadingFile={uploadingFile}
                                handleNewFileUpload={handleNewFileUpload}
                                handleDelete={handleDelete}
                                handleDownload={handleDownload}
                            />
                        )}

                        {/* Personal Documents */}
                        {currentAdminAccess.canViewPersonalDocuments && (
                            <DocumentSection
                                title="Personal Documents"
                                documents={employee.documents.personal}
                                uploadingFile={uploadingFile}
                                handleNewFileUpload={handleNewFileUpload}
                                handleDelete={handleDelete}
                                handleDownload={handleDownload}
                            />
                        )}


                    </div>
                )}

                {/* Bank Details Tab  */}
                {activeTab === 'bankDetails' && currentAdminAccess.canViewBankDetails && (
                    <div className="space-y-6">
                        {/* Edit / Save / Cancel Buttons */}
                        <div className="flex justify-end mb-6 space-x-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Bank Details
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Bank Info */}
                        <InfoSection title="Bank Details" icon={<CreditCard className="h-5 w-5 text-indigo-600" />}>
                            <div className="space-y-0">
                                {isEditing ? (
                                    <>
                                        <InputField label="Account Holder Name" value={editableEmployeeData.bankDetails?.accountHolderName || ''} onChange={(val) => handleChange('bankDetails.accountHolderName', val)} />
                                        <InputField label="Account Number" value={editableEmployeeData.bankDetails?.accountNumber || ''} onChange={(val) => handleChange('bankDetails.accountNumber', val)} />
                                        <InputField label="IFSC Code" value={editableEmployeeData.bankDetails?.ifscCode || ''} onChange={(val) => handleChange('bankDetails.ifscCode', val)} />
                                        <InputField label="Bank Name" value={editableEmployeeData.bankDetails?.bankName || ''} onChange={(val) => handleChange('bankDetails.bankName', val)} />
                                        <InputField label="Branch Number" value={editableEmployeeData.bankDetails?.branchNumber || ''} onChange={(val) => handleChange('bankDetails.branchNumber', val)} />
                                    </>
                                ) : (
                                    <>
                                        <InfoRow label="Account Holder Name" value={employee.bankDetails?.accountHolderName} />
                                        <InfoRow label="Account Number" value={employee.bankDetails?.accountNumber} />
                                        <InfoRow label="IFSC Code" value={employee.bankDetails?.ifscCode} />
                                        <InfoRow label="Bank Name" value={employee.bankDetails?.bankName} />
                                        <InfoRow label="Branch Number" value={employee.bankDetails?.branchNumber} />
                                    </>
                                )}
                            </div>
                        </InfoSection>

                        {/* Salary / Stipend Info */}
                        {(employee.category?.toLowerCase() === 'full-time') && (
                            <InfoSection title="Salary Details" icon={<HandCoins className="h-5 w-5 text-green-600" />}>
                                {isEditing ? (
                                    <>
                                        <InputField
                                            label="Monthly Salary"
                                            type="number"
                                            value={editableEmployeeData.salary || ''}
                                            onChange={(val) => handleChange('salary', val)}
                                        />
                                        <InputField
                                            label="Annual CTC"
                                            type="text"
                                            value={editableEmployeeData.ctc || ''}
                                            onChange={(val) => handleChange('ctc', val)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <InfoRow label="Monthly Salary" value={employee.salary} />
                                        <InfoRow label="Annual CTC" value={employee.ctc} />
                                    </>
                                )}
                            </InfoSection>
                        )}

                        {(employee.category?.toLowerCase() === 'intern' || employee.category?.toLowerCase() === 'contractual') && (
                            <InfoSection title="Stipend Information" icon={<CreditCard className="h-5 w-5 text-blue-600" />}>
                                {isEditing ? (
                                    <InputField
                                        label="Monthly Stipend"
                                        type="number"
                                        value={editableEmployeeData.stipend || ''}
                                        onChange={(val) => handleChange('stipend', val)}
                                    />
                                ) : (
                                    <InfoRow label="Monthly Stipend" value={employee.stipend} />
                                )}
                            </InfoSection>
                        )}
                    </div>
                )}


                {/* Confidential Tab */}
                {activeTab === 'confidential' && currentAdminAccess.canViewConfidentialDocuments && (
                    <div className="grid grid-cols-1 gap-6">
                        <DocumentSection
                            title="Confidential Documents"
                            documents={confidentialFiles.map(file => ({
                                name: file.originalName,
                                displayName: file.originalName,
                                fileName: file.fileName,
                                files: [file.fileName],
                                status: 'uploaded',
                                uploadDate: file.uploadDate,
                            }))}
                            isConfidential={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeProfile;
