import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, ChevronRight, ChevronLeft, Upload, User, Briefcase, GraduationCap, Phone, CreditCard, FileText, MapPin } from 'lucide-react'; // Added more icons

// Helper component for generic text/number inputs
const InputField = ({ label, value, onChange, type = 'text', required = false }) => (
    <div>
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
const SelectField = ({ label, value, options, onChange, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="" disabled hidden>Select an option</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

// Helper component for section grouping
const FormSection = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
    </div>
);

// Component for uploading individual documents
const DocumentUploadField = ({ label, documentType, documentFiles, handleFileChange }) => (
    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
        <span className="text-sm font-medium text-gray-700">{label}</span>

        <div className="flex items-center space-x-2">
            <label
                htmlFor={`upload-${documentType}`}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full cursor-pointer transition-colors duration-200"
                title="Upload"
            >
                <Upload className="h-5 w-5" />
                <input
                    id={`upload-${documentType}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(documentType, e.target.files)}
                    multiple={documentType !== 'profilePhoto'} 
                />
            </label>

            {documentFiles[documentType] && documentFiles[documentType].length > 0 && (
                <span className="text-xs text-gray-500">
                    {documentFiles[documentType].length} file(s) selected
                </span>
            )}
        </div>
    </div>
);


const AddEmployee = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        permanentAddress:'',
        address: 'Same as above Permanent Address',
        email: '',
        companyEmail: '',
        dateOfBirth: '',
        birthPlace: '',
        nationality: 'Indian',
        fatherName: '',
        motherName: '',
        designation: '',
        dateOfJoining: '',
        category: '',
        company: '', 
        status: '',
        bloodGroup: '',
        tenth: { board: '', school: '', year: '', percentage: '' },
        twelfth: { board: '', school: '', year: '', percentage: '', },
        graduationCollege: '',
        graduationYear: '',
        graduationCGPA: '',
        postGraduationCollege: '',
        postGraduationYear: '',
        postGraduationCGPA: '',
        emergencyContact: {
            name: '',
            phoneNumber: ''
        },
        banking: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            branchNumber: ''
        },
        dateOfLeaving: '',
        employeeId: null,
        salary: null, 
        ctc: null, 
        stipend: null, 
    });

    const [documentFiles, setDocumentFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function to check response status and parse JSON
    const checkResponse = async (response) => {
        const contentType = response.headers.get("content-type");
        if (response.ok) {
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                console.warn("Successful response, but not JSON. Status:", response.status);
                return {};
            }
        } else {
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                try {
                    const errorBody = await response.json();
                    errorMessage = errorBody.message || errorMessage;
                } catch (jsonError) {
                    console.error("Error parsing JSON error response:", jsonError);
                    errorMessage = `Server sent non-JSON error response on status ${response.status}`;
                }
            } else {
                const textError = await response.text();
                console.error("Server sent non-JSON error response (raw text):", textError);
                errorMessage = `Server error (${response.status}): ${textError.substring(0, 100)}...`;
            }
            throw new Error(errorMessage);
        }
    };

    // Handler for general input field changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handler for nested object input field changes 
    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // Handler for file input changes
    const handleFileChange = (documentType, files) => {
        if (files) {
            setDocumentFiles(prev => ({
                ...prev,
                [documentType]: Array.from(files)
            }));
        }
    };

    const getStatusOptions = () => {
        switch (formData.category) {
            case 'Intern':
                return ['Current', 'Left'];
            case 'Full-time':
                return ['Current', 'Resigned', 'Notice Period'];
            case 'Contractual':
                return ['Current', 'Resigned'];
            default:
                return ['Current'];
        }
    };

    // Handles submission of personal and employment details (Step 1)
    const handlePersonalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const educationPayload = {
                tenth: {
                    board: formData.tenth.board,
                    school: formData.tenth.school,
                    year: formData.tenth.year ? Number(formData.tenth.year) : undefined,
                    percentage: formData.tenth.percentage ? Number(formData.tenth.percentage) : undefined
                },
                twelfth: {
                    board: formData.twelfth.board,
                    school: formData.twelfth.school,
                    year: formData.twelfth.year ? Number(formData.twelfth.year) : undefined,
                    percentage: formData.twelfth.percentage ? Number(formData.twelfth.percentage) : undefined
                },
                graduation: {},
                postGraduation: {}
            };

            if (formData.graduationCollege) {
                educationPayload.graduation = {
                    college: formData.graduationCollege,
                    year: formData.graduationYear ? Number(formData.graduationYear) : undefined,
                    cgpa: formData.graduationCGPA ? Number(formData.graduationCGPA) : undefined
                };
            }
            if (formData.postGraduationCollege) {
                educationPayload.postGraduation = {
                    college: formData.postGraduationCollege,
                    year: formData.postGraduationYear ? Number(formData.postGraduationYear) : undefined,
                    cgpa: formData.postGraduationCGPA ? Number(formData.postGraduationCGPA) : undefined
                };
            }

          const lowerCategory = formData.category?.toLowerCase();

const personalDetailsPayload = {
  name: formData.fullName,
  contact: formData.contactNumber,
  address: formData.address,
  email: formData.email,
  dateOfBirth: formData.dateOfBirth,
  companyEmail: formData.companyEmail,
  permanentAddress: formData.permanentAddress,
  birthPlace: formData.birthPlace,
  nationality: formData.nationality,
  fatherName: formData.fatherName,
  motherName: formData.motherName,
  bloodGroup: formData.bloodGroup,
  designation: formData.designation,
  company: formData.company,
  category: formData.category,
  dateOfJoining: formData.dateOfJoining,
  dateOfLeaving: formData.status !== 'Current' ? formData.dateOfLeaving : undefined,
  status: formData.status,
  education: {
    tenth: {
      board: formData.tenth.board,
      school: formData.tenth.school,
      year: formData.tenth.year ? Number(formData.tenth.year) : undefined,
      percentage: formData.tenth.percentage ? Number(formData.tenth.percentage) : undefined
    },
    twelfth: {
      board: formData.twelfth.board,
      school: formData.twelfth.school,
      year: formData.twelfth.year ? Number(formData.twelfth.year) : undefined,
      percentage: formData.twelfth.percentage ? Number(formData.twelfth.percentage) : undefined
    },
    graduation: formData.graduationCollege ? {
      college: formData.graduationCollege,
      year: formData.graduationYear ? Number(formData.graduationYear) : undefined,
      cgpa: formData.graduationCGPA ? Number(formData.graduationCGPA) : undefined
    } : {},
    postGraduation: formData.postGraduationCollege ? {
      college: formData.postGraduationCollege,
      year: formData.postGraduationYear ? Number(formData.postGraduationYear) : undefined,
      cgpa: formData.postGraduationCGPA ? Number(formData.postGraduationCGPA) : undefined
    } : {}
  },
  emergencyContact: {
    name: formData.emergencyContact.name,
    number: formData.emergencyContact.phoneNumber
  },
  bankDetails: {
    accountHolderName: formData.banking.accountHolderName,
    accountNumber: formData.banking.accountNumber,
    ifscCode: formData.banking.ifscCode,
    bankName: formData.banking.bankName,
    branchNumber: formData.banking.branchNumber
  },
  ...(lowerCategory === 'full-time' && {
    salary: formData.salary ? Number(formData.salary) : undefined,
    ctc: formData.ctc ? Number(formData.ctc) : undefined
  }),
  ...((lowerCategory === 'intern' || lowerCategory === 'contractual') && {
    stipend: formData.stipend ? Number(formData.stipend) : undefined
  })
};

console.log("Submitting payload:", personalDetailsPayload); 


            const response = await fetch('http://localhost:3000/add-employee-personal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personalDetailsPayload)
            });

            const result = await checkResponse(response);

            if (result.success) {
                setFormData(prev => ({ ...prev, employeeId: result.data._id }));
                alert('Employee personal details saved successfully! Proceed to documents.');
                setCurrentStep(2); 
            } else {
                alert("Failed to add employee personal details: " + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error("Submit Personal Details Error:", error);
            alert("Please fill in all required information before proceeding." + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handles submission of documents (Step 2)
    const handleDocumentUpload = async () => {
        if (!formData.employeeId) {
            alert('Employee ID is missing. Please complete personal details first.');
            return;
        }

        setIsSubmitting(true);
        const uploadData = new FormData();
        uploadData.append('employeeId', formData.employeeId);

        // Append profile photo if selected
        if (documentFiles.profilePhoto && documentFiles.profilePhoto.length > 0) {
            uploadData.append('profilePhoto', documentFiles.profilePhoto[0]);
        }

        // Append other document files
        Object.entries(documentFiles).forEach(([docType, files]) => {
            if (docType !== 'profilePhoto') { 
                files.forEach(file => {
                    uploadData.append(docType, file);
                });
            }
        });

        try {
            const response = await fetch('http://localhost:3000/add-documents', {
                method: 'POST',
                body: uploadData 
            });

            const result = await checkResponse(response);

            if (result.success) {
                alert("Documents uploaded successfully! Employee added.");
                if (formData.company === 'DeepEigen') {
                    navigate(`/deep-eigen/employee/${formData.employeeId}`);
                } else if (formData.company === 'swaayatt_robots') {
                    navigate(`/swaayatt-robots/employee/${formData.employeeId}`);
                } else {
                    navigate('/deep-eigen');
                }
            } else {
                alert("Document upload failed: " + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error("Upload Documents Error:", err);
            alert("Error uploading documents: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const companyOptions = ['DeepEigen', 'swaayatt_robots'];


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="inline-flex items-center">
                            <button
                                onClick={() => navigate('/homepage')} 
                                className="mr-2 p-2 rounded-full hover:bg-white/20 transition-colors duration-200">
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <p>Back to Home</p>
                        </div>
                        <h1 className="text-3xl font-bold">Add New Employee</h1>
                        <div className="mt-4 flex items-center">
                            <span className={`text-sm font-medium ${currentStep === 1 ? 'text-green-200' : 'text-gray-400'}`}>Step 1: Personal & Employment Details</span>
                            <ChevronRight className={`h-4 w-4 mx-2 ${currentStep === 1 ? 'text-green-200' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${currentStep === 2 ? 'text-green-200' : 'text-gray-400'}`}>Step 2: Documents Upload</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main form area */}
            <form onSubmit={(e) => { e.preventDefault(); }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        {/* Personal Information Section */}
                        <FormSection title="Personal Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(value) => handleInputChange('fullName', value)}
                                    required
                                />
                                <InputField
                                    label="Email"
                                    value={formData.email}
                                    onChange={(value) => handleInputChange('email', value)}
                                    type="email"
                                    required
                                />
                                <InputField
                                    label="Contact Number"
                                    value={formData.contactNumber}
                                    onChange={(value) => handleInputChange('contactNumber', value)}
                                    type='text' 
                                    required
                                />
                                <InputField
                                    label="Date of Birth"
                                    value={formData.dateOfBirth}
                                    onChange={(value) => handleInputChange('dateOfBirth', value)}
                                    type="date"
                                    required
                                />
                                <InputField
                                    label="Birth Place"
                                    value={formData.birthPlace}
                                    onChange={(value) => handleInputChange('birthPlace', value)}
                                />
                                <InputField
                                    label="Nationality"
                                    value={formData.nationality}
                                    onChange={(value) => handleInputChange('nationality', value)}
                                />
                            </div>
                          
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                                <textarea
                                    value={formData.permanentAddress}
                                    onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </FormSection>

                        {/* Family Information Section */}
                        <FormSection title="Family Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Father's Name"
                                    value={formData.fatherName}
                                    onChange={(value) => handleInputChange('fatherName', value)}
                                />
                                <InputField
                                    label="Mother's Name"
                                    value={formData.motherName}
                                    onChange={(value) => handleInputChange('motherName', value)}
                                />
                            </div>
                        </FormSection>

                        {/* Employment Details Section */}
                        <FormSection title="Employment Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Company selection */}
                                <SelectField
                                    label="Company"
                                    value={formData.company}
                                    options={companyOptions}
                                    onChange={(value) => handleInputChange('company', value)}
                                    required
                                />
                                {/* Employee Category selection */}
                                <SelectField
                                    label="Category"
                                    value={formData.category}
                                    options={['Intern', 'Full-time', 'Contractual']}
                                    onChange={(value) => {
                                        handleInputChange('category', value);
                                        const newStatusOptions = value === 'Intern' ? ['Current', 'Left'] :
                                            value === 'Full-time' ? ['Current', 'Resigned', 'Notice Period'] :
                                                ['Current', 'Resigned'];
                                        handleInputChange('status', newStatusOptions[0]); 
                                    }}
                                    required
                                />
                               
                                <SelectField
                                    label="Status"
                                    value={formData.status}
                                    options={getStatusOptions()}
                                    onChange={(value) => handleInputChange('status', value)}
                                    required
                                />
                                <InputField
                                    label="Designation"
                                    value={formData.designation}
                                    onChange={(value) => handleInputChange('designation', value)}
                                    required
                                />
                                 <InputField
                                    label="Company Email"
                                    value={formData.companyEmail}
                                    onChange={(value) => handleInputChange('companyEmail', value)}
                                    required
                                />
                                <InputField
                                    label="Date of Joining"
                                    value={formData.dateOfJoining}
                                    onChange={(value) => handleInputChange('dateOfJoining', value)}
                                    type="date"
                                    required
                                />
                                {/* Date of Leaving field, shown only if status is not 'Current' */}
                                {(formData.status === 'Left' || formData.status === 'Resigned' || formData.status === 'Notice Period') && (
                                    <InputField
                                        label="Date of Leaving"
                                        value={formData.dateOfLeaving || ''}
                                        onChange={(value) => handleInputChange('dateOfLeaving', value)}
                                        type="date"
                                    />
                                )}
                                <InputField
                                    label="Blood Group"
                                    value={formData.bloodGroup}
                                    onChange={(value) => handleInputChange('bloodGroup', value)}
                                />
                            </div>
                            {/* Salary/Stipend Details Section */}
                            {formData.category === 'Full-time' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <InputField
                                        label="Salary"
                                        value={formData.salary}
                                        onChange={(value) => handleInputChange('salary', value)}
                                        type="number"
                                        required
                                    />
                                    <InputField
                                        label="CTC"
                                        value={formData.ctc}
                                        onChange={(value) => handleInputChange('ctc', value)}
                                        type="text"
                                        required
                                    />
                                </div>
                            )}
                          {(formData.category === 'Intern' || formData.category === 'Contractual') && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <InputField
            label="Stipend"
            value={formData.stipend}
            onChange={(value) => handleInputChange('stipend', value)}
            type="number"
            required
        />
    </div>
)}

                        </FormSection>

                        {/* Education Section */}
                        <FormSection title="Education">
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">10th Grade</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputField label="Board" value={formData.tenth.board} onChange={(value) => handleNestedInputChange('tenth', 'board', value)} />
                                    <InputField label="School" value={formData.tenth.school} onChange={(value) => handleNestedInputChange('tenth', 'school', value)} />
                                    <InputField label="Year" value={formData.tenth.year} onChange={(value) => handleNestedInputChange('tenth', 'year', value)} type="number" />
                                    <InputField label="Percentage" value={formData.tenth.percentage} onChange={(value) => handleNestedInputChange('tenth', 'percentage', value)} type="number" />
                                </div>

                                <h4 className="font-medium text-gray-900 pt-4">12th Grade</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputField label="Board" value={formData.twelfth.board} onChange={(value) => handleNestedInputChange('twelfth', 'board', value)} />
                                    <InputField label="School" value={formData.twelfth.school} onChange={(value) => handleNestedInputChange('twelfth', 'school', value)} />
                                    <InputField label="Year" value={formData.twelfth.year} onChange={(value) => handleNestedInputChange('twelfth', 'year', value)} type="number" />
                                    <InputField label="Percentage" value={formData.twelfth.percentage} onChange={(value) => handleNestedInputChange('twelfth', 'percentage', value)} type="number" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <InputField label="Graduation College" value={formData.graduationCollege} onChange={(value) => handleInputChange('graduationCollege', value)} />
                                    <InputField label="Graduation Year" value={formData.graduationYear} onChange={(value) => handleInputChange('graduationYear', value)} type="number" />
                                    <InputField label="Graduation CGPA" value={formData.graduationCGPA} onChange={(value) => handleInputChange('graduationCGPA', value)} type="number" />
                                    <InputField label="Post Graduation College" value={formData.postGraduationCollege} onChange={(value) => handleInputChange('postGraduationCollege', value)} />
                                    <InputField label="Post Graduation Year" value={formData.postGraduationYear} onChange={(value) => handleInputChange('postGraduationYear', value)} type="number" />
                                    <InputField label="Post Graduation CGPA" value={formData.postGraduationCGPA} onChange={(value) => handleInputChange('postGraduationCGPA', value)} type="number" />
                                </div>
                            </div>
                        </FormSection>

                        {/* Emergency Contact Section */}
                        <FormSection title="Emergency Contact">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Name"
                                    value={formData.emergencyContact.name}
                                    onChange={(value) => handleNestedInputChange('emergencyContact', 'name', value)}
                                />
                                <InputField
                                    label="Phone Number"
                                    value={formData.emergencyContact.phoneNumber}
                                    onChange={(value) => handleNestedInputChange('emergencyContact', 'phoneNumber', value)}
                                    type='text' 
                                />
                            </div>
                        </FormSection>

                        {/* Banking Details Section */}
                        <FormSection title="Banking Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Account Holder Name"
                                    value={formData.banking.accountHolderName}
                                    onChange={(value) => handleNestedInputChange('banking', 'accountHolderName', value)}
                                />
                                <InputField
                                    label="Account Number"
                                    value={formData.banking.accountNumber}
                                    onChange={(value) => handleNestedInputChange('banking', 'accountNumber', value)}
                                />
                                <InputField
                                    label="IFSC Code"
                                    value={formData.banking.ifscCode}
                                    onChange={(value) => handleNestedInputChange('banking', 'ifscCode', value)}
                                />
                                <InputField
                                    label="Bank Name" 
                                    value={formData.banking.bankName}
                                    onChange={(value) => handleNestedInputChange('banking', 'bankName', value)}
                                />
                                <InputField
                                    label="Branch Number"
                                    value={formData.banking.branchNumber}
                                    onChange={(value) => handleNestedInputChange('banking', 'branchNumber', value)}
                                />
                            </div>
                        </FormSection>

                        {/* Navigation for Step 1 */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/homepage')}
                                className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white shadow hover:shadow-lg"
                            >
                                <X className="h-4 w-4 inline mr-2" />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handlePersonalSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-green-500 text-white hover:bg-green-600 hover:text-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : 'Next Step'} <ChevronRight className="h-4 w-4 inline ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        {/* Documents Upload Section */}
                        <FormSection title="Document Upload">
                            <p className="text-gray-600 mb-4">Upload relevant documents for the employee.</p>
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 pt-4">Legal Documents</h4>
                                <DocumentUploadField label="EPRA" documentType="epra" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="EA (Employment Agreement)" documentType="ea" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="NDA (Non-Disclosure Agreement)" documentType="nda" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Offer Letter" documentType="offerLetter" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="TRL (Termination/Resignation Letter)" documentType="trl" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Form 16" documentType="form16" documentFiles={documentFiles} handleFileChange={handleFileChange} />

                                <h4 className="font-medium text-gray-900 pt-4">Professional Documents</h4>
                                <DocumentUploadField label="Resume / CV" documentType="resume" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Certification" documentType="certificates" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Experience Letter" documentType="experienceLetters" documentFiles={documentFiles} handleFileChange={handleFileChange} />

                                <h4 className="font-medium text-gray-900 pt-4">Personal Documents</h4>
                                <DocumentUploadField label="Aadhaar Card" documentType="aadharCard" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="PAN Card" documentType="panCard" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Passport Photo (Size)" documentType="passportSizePhotos" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                                <DocumentUploadField label="Academic Marksheets" documentType="academicMarksheets" documentFiles={documentFiles} handleFileChange={handleFileChange} />
                            </div>
                        </FormSection>

                        {/* Navigation for Step 2 */}
                        <div className="flex justify-between space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white shadow hover:shadow-lg"
                            >
                                <ChevronLeft className="h-4 w-4 inline mr-2" />
                                Previous Step
                            </button>

                            <button
                                type="button"
                                onClick={handleDocumentUpload}
                                disabled={isSubmitting}
                                className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-green-500 text-white hover:bg-green-600 hover:text-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Uploading...' : 'Save Employee'} <Save className="h-4 w-4 inline ml-2" />
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddEmployee;