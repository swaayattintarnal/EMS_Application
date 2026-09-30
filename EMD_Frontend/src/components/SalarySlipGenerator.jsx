import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  ChevronDown,
  AlertCircle,
  Edit3,
  RotateCcw,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';

// MONTHS & YEARS
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

// FORMATTING HELPERS
const fmt = (n) => {
  if (n === null || n === undefined || n === '' || isNaN(n)) return '-';
  const val = Number(n);
  if (val === 0) return '0';
  return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};
const money = (n) => Math.round(Number(n || 0));
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();



// COMPANY INFO
const COMPANY_INFO = {
  deepeigen: {
    key: 'deepeigen',
    name: 'DEEP EIGEN PRIVATE LIMITED',
    titleColor: '#174cd2',
    footerText: (
      <>
        Swaayatt Robots Pvt. Ltd , Cosmos, 2, 67 B, Narmadapuram Rd, Bhopal.
        <br />
       Madhya Pradesh 462026
      </>
    ),
  },
  swaayatt_robots: {
    key: 'swaayatt_robots',
    name: 'Swaayatt Robots Pvt. Ltd.',
    titleColor: '#ef0000',
    footerText: (
      <>
        Swaayatt Robots Pvt. Ltd , Cosmos, 2, 67 B, Narmadapuram Rd, Bhopal.
        <br />
        Madhya Pradesh 462026
      </>
    ),
  },
};


const detectCompany = (employee) => {
  const company = String(employee?.company || '').toLowerCase();
  if (company.includes('swaayatt') || company === 'swaayatt_robots') {
    return 'swaayatt_robots';
  }
  return 'deepeigen';
};




// SALARY LOGIC START 
const COMPANY_SALARY_RULES = {
  swaayatt_robots: {
    basicPercentage: 0.60,
    performancePercentage: 0.15,

    hraThreshold: 100000,
    hraAmount: 10000,

    conveyance: 2000,
    medical: 1500,
    meal: 2000,

    pf: false,
    esi: false,

    professionalTaxSlabs: [
      { upTo: 18750, amount: 0 },
      { upTo: 25000, amount: 125 },
      { upTo: 33333, amount: 167 },
      { upTo: Infinity, amount: 208 },
    ],

    // Swaayatt: TDS applicable
    tds: {
      enabled: true,
      method: "newRegime",
    },
  },

  deepeigen: {
    basicPercentage: 0.60,
    performancePercentage: 0.15,

    hraThreshold: 100000,
    hraAmount: 10000,

    conveyance: 2000,
    medical: 1500,
    meal: 2000,

    pf: false,
    esi: false,

    // No Professional Tax
    professionalTaxSlabs: [
      { upTo: Infinity, amount: 0 },
    ],

    // DeepEigen: NO TDS
    tds: {
      enabled: false,
      method: "none",
    },
  },
};




const getSalaryRules = (companyKey) =>
  COMPANY_SALARY_RULES[companyKey] || COMPANY_SALARY_RULES.deepeigen;

// TDS CALCULATION (NEW TAX REGIME)
const calculateNewRegimeIncomeTax = (annualGrossSalary) => {
  const grossSalary = Math.max(0, Number(annualGrossSalary || 0));
  if (grossSalary <= 0) return { annualTds: 0, monthlyTds: 0, taxableIncome: 0 };

  const standardDeduction = Math.min(75000, grossSalary);
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);
  let tax = 0;

  if (taxableIncome > 400000) {
    const slab = Math.min(taxableIncome, 800000) - 400000;
    if (slab > 0) tax += slab * 0.05;
  }
  if (taxableIncome > 800000) {
    const slab = Math.min(taxableIncome, 1200000) - 800000;
    if (slab > 0) tax += slab * 0.10;
  }
  if (taxableIncome > 1200000) {
    const slab = Math.min(taxableIncome, 1600000) - 1200000;
    if (slab > 0) tax += slab * 0.15;
  }
  if (taxableIncome > 1600000) {
    const slab = Math.min(taxableIncome, 2000000) - 1600000;
    if (slab > 0) tax += slab * 0.20;
  }
  if (taxableIncome > 2000000) {
    const slab = Math.min(taxableIncome, 2400000) - 2000000;
    if (slab > 0) tax += slab * 0.25;
  }
  if (taxableIncome > 2400000) {
    tax += (taxableIncome - 2400000) * 0.30;
  }

  // Section 87A rebate: no tax up to ₹12,00,000 taxable income,
  // with marginal relief just above it (tax never exceeds the excess over ₹12L).
  if (taxableIncome <= 1200000) {
    tax = 0;
  } else {
    tax = Math.min(tax, taxableIncome - 1200000);
  }

  const cess = tax * 0.04;
  const annualTds = Math.round(tax + cess);
  const monthlyTds = Math.round(annualTds / 12);

  return { annualTds, monthlyTds, taxableIncome };
};



// APPLICABLE (PRO-RATA) SALARY
const computeApplicableSalary = (monthlySalary, presentDays, totalDays) => {
  const salary = Math.max(0, Number(monthlySalary || 0));
  const total = Math.max(0, Number(totalDays || 0));
  const paidDays = Math.min(Math.max(Number(presentDays || 0), 0), total);
  if (total <= 0) return { applicableSalary: 0, ratio: 0 };
  if (paidDays === total) return { applicableSalary: money(salary), ratio: 1 };
  return {
    applicableSalary: money((salary / total) * paidDays),
    ratio: paidDays / total,
  };
};

// EARNINGS COMPUTATION (company rules driven)
const computeEarnings = (companyKey, monthlySalary, presentDays, totalDays) => {
  const rules = getSalaryRules(companyKey);
  const fullSalary = Math.max(0, Number(monthlySalary || 0));
  const { applicableSalary, ratio } = computeApplicableSalary(fullSalary, presentDays, totalDays);

  const basic = money(applicableSalary * rules.basicPercentage);
  const performance = money(applicableSalary * rules.performancePercentage);

  const hra = fullSalary >= rules.hraThreshold ? money(rules.hraAmount * ratio) : 0;
  const medicalAllowance = money(rules.medical * ratio);
  const mealAllowance = money(rules.meal * ratio);
  const conveyance = money(rules.conveyance * ratio);

  // Balancing component (intentionally NOT clamped to 0)
  const specialAllowance =
    applicableSalary - basic - performance - hra - medicalAllowance - mealAllowance - conveyance;
  return {
    basic,
    performance,
    hra,
    specialAllowance,
    medicalAllowance,
    mealAllowance,
    conveyance,
    gross: applicableSalary,
  };
};

// PROFESSIONAL TAX (company rules driven, based on full monthly salary)
const computeProfessionalTax = (companyKey, monthlySalary) => {
  const rules = getSalaryRules(companyKey);
  const salary = Math.max(0, Number(monthlySalary || 0));
  const slab = (rules.professionalTaxSlabs || []).find((s) => salary <= s.upTo);
  return slab ? slab.amount : 0;
};



// TDS (separate from PF / ESI / PT)
const computeMonthlyTds = (companyKey, monthlySalary, gross) => {
  const rules = getSalaryRules(companyKey);
  const tdsRule = rules.tds || { method: 'newRegime', exemptAnnualLimit: null };
  const annualSalary = Math.max(0, Number(monthlySalary || 0) * 12);

  if (tdsRule.exemptAnnualLimit !== null && annualSalary <= tdsRule.exemptAnnualLimit) return 0;

  if (tdsRule.method === 'flatPercent') {
    return money(Math.max(0, Number(gross || 0)) * tdsRule.percent);
  }
  return Math.max(0, calculateNewRegimeIncomeTax(annualSalary).monthlyTds);
};


// DEDUCTIONS COMPUTATION
const computeDeductions = (companyKey, monthlySalary, gross, isIntern = false) => {
  const rules = getSalaryRules(companyKey);
  const safeGross = Math.max(0, money(gross));

  const pf = 0;  // PF is never deducted (rules.pf === false)
  const esi = 0; // ESI is never deducted (rules.esi === false)
  const pt = isIntern ? 0 : computeProfessionalTax(companyKey, monthlySalary);
  const tds = Math.min(computeMonthlyTds(companyKey, monthlySalary, safeGross), safeGross);

  const totalDeductions = pf + esi + money(pt) + money(tds);

  return {
    pf,
    esi,
    pt: money(pt),
    tds: money(tds),
    totalDeductions,
    netPay: Math.max(0, safeGross - totalDeductions),
  };
};
// SALARY LOGIC END 


// DETAIL ROW COMPONENT (LABEL : VALUE)
const DetailRow = ({ label, value }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 14px 1fr',
        minHeight: '18px',
        fontSize: '9.5px',
        lineHeight: '1.6',
        color: '#000000',
      }}
    >
      <span style={{ fontWeight: '700' }}>{label}</span>
      <span>:</span>
      <span style={{ wordBreak: 'break-word', fontWeight: '500' }}>{value || '-'}</span>
    </div>
  );
};


import SlipTemplate from './SlipTemplate';

// MAIN SALARY SLIP GENERATOR COMPONENT
const SalarySlipGenerator = ({ employee, themeColor = 'green' }) => {
  const isGreen = themeColor === 'green';
  const companyKey = detectCompany(employee);
  const companyInfo = COMPANY_INFO[companyKey];

  const accentClass = isGreen ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700';
  const accentText = isGreen ? 'text-green-700' : 'text-purple-700';
  const accentBorder = isGreen ? 'border-green-500' : 'border-purple-500';
  const accentBg = isGreen ? 'bg-green-50' : 'bg-purple-50';

  const printRef = useRef(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[today.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [presentDays, setPresentDays] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);




  const empType =
    employee?.employment_type ||
    (employee?.category === 'Intern'
      ? 'Intern'
      : employee?.category === 'Contractual'
        ? 'Contract'
        : 'Full-Time');

  const isIntern = empType === 'Intern';

  const grossMonthly = isIntern
    ? Number(employee?.current_stipend || employee?.stipend || 0)
    : Number(employee?.current_salary || employee?.salary || 0);

  const monthIndex = MONTHS.indexOf(selectedMonth) + 1;
  const totalDays = daysInMonth(monthIndex, selectedYear);
  const actualPresentDays =
    presentDays === ''
      ? totalDays
      : Math.min(Math.max(Number(presentDays), 0), totalDays);

  // Default auto calculations (company rules driven)
  const defaultEarnings = useMemo(
    () => computeEarnings(companyKey, grossMonthly, actualPresentDays, totalDays),
    [companyKey, grossMonthly, actualPresentDays, totalDays]
  );

  const defaultDeductions = useMemo(
    () => computeDeductions(companyKey, grossMonthly, defaultEarnings.gross, isIntern),
    [companyKey, grossMonthly, defaultEarnings.gross, isIntern]
  );

  // Custom data state for HR editing
  const [isCustomized, setIsCustomized] = useState(false);
  const [customData, setCustomData] = useState({
    name: employee?.name || '',
    dateOfJoining: employee?.dateOfJoining || '',
    designation: employee?.designation || '',
    panNumber: employee?.panNumber || '',
    bankName: employee?.bankDetails?.bankName || '',
    accountNumber: employee?.bankDetails?.accountNumber || '',
    ifscCode: employee?.bankDetails?.ifscCode || '',
    earnings: { ...defaultEarnings },
    deductions: { ...defaultDeductions },
  });



  useEffect(() => {
    if (!isCustomized) {
      setCustomData({
        name: employee?.name || '',
        dateOfJoining: employee?.dateOfJoining || '',
        designation: employee?.designation || '',
        panNumber: employee?.panNumber || '',
        bankName: employee?.bankDetails?.bankName || '',
        accountNumber: employee?.bankDetails?.accountNumber || '',
        ifscCode: employee?.bankDetails?.ifscCode || '',
        earnings: { ...defaultEarnings },
        deductions: { ...defaultDeductions },
      });
    }
  }, [defaultEarnings, defaultDeductions, employee, isCustomized]);



  const activeSlipEmployee = useMemo(() => {
    return {
      ...employee,
      name: customData.name,
      dateOfJoining: customData.dateOfJoining,
      designation: customData.designation,
      panNumber: customData.panNumber,
      bankDetails: {
        ...employee?.bankDetails,
        bankName: customData.bankName,
        accountNumber: customData.accountNumber,
        ifscCode: customData.ifscCode,
      },
    };
  }, [employee, customData]);

  const activeEarnings = customData.earnings;
  const activeDeductions = customData.deductions;




  // PRINT ACTION
  const handlePrint = () => {
    setIsPrinting(true);
    const content = printRef.current;
    if (!content) {
      setIsPrinting(false);
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      setIsPrinting(false);
      alert('Please allow popups to open the print dialog.');
      return;
    }



    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isIntern ? 'Stipend' : 'Salary'} Slip - ${activeSlipEmployee.name || 'Employee'} - ${selectedMonth} ${selectedYear}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
            }
            #salary-slip-printable-area {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    }, 600);
  };


  // DOWNLOAD PDF ACTION
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const content = printRef.current;
      if (!content) {
        setIsDownloading(false);
        return;
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const empNameClean = (activeSlipEmployee.name || 'Employee').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${isIntern ? 'Stipend_Slip' : 'Salary_Slip'}_${empNameClean}_${selectedMonth}_${selectedYear}.pdf`;

      const opt = {
        margin: [12, 9.75, 12, 9.75],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      };

      await html2pdf().set(opt).from(content).save();
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF directly. Opening print dialog where you can choose "Save as PDF".');
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };


  // EDIT MODAL HANDLERS
  const [modalForm, setModalForm] = useState({ ...customData });
  const openEditModal = () => {
    setModalForm({
      ...customData,
      earnings: { ...customData.earnings },
      deductions: { ...customData.deductions },
    });
    setShowEditModal(true);
  };

  // Total deductions = PF + ESI + PT + TDS (PF/ESI are always 0)
  const sumDeductions = (d) =>
    (d.pf || 0) + (d.esi || 0) + (d.pt || 0) + (d.tds || 0);



  const handleModalEarningChange = (key, value) => {
    const num = Number(value || 0);
    setModalForm((prev) => {
      const nextEarnings = { ...prev.earnings, [key]: num };
      const newGross = isIntern
        ? num
        : (nextEarnings.basic || 0) +
        (nextEarnings.performance || 0) +
        (nextEarnings.hra || 0) +
        (nextEarnings.specialAllowance || 0) +
        (nextEarnings.medicalAllowance || 0) +
        (nextEarnings.mealAllowance || 0) +
        (nextEarnings.conveyance || 0);

      nextEarnings.gross = newGross;

      const totalDed = sumDeductions(prev.deductions);

      return {
        ...prev,
        earnings: nextEarnings,
        deductions: {
          ...prev.deductions,
          totalDeductions: totalDed,
          netPay: Math.max(0, newGross - totalDed),
        },
      };
    });
  };


  const handleModalDeductionChange = (key, value) => {
    const num = Number(value || 0);
    setModalForm((prev) => {
      const nextDeductions = { ...prev.deductions, [key]: num };
      const totalDed = sumDeductions(nextDeductions);

      nextDeductions.totalDeductions = totalDed;
      nextDeductions.netPay = Math.max(0, (prev.earnings.gross || 0) - totalDed);

      return {
        ...prev,
        deductions: nextDeductions,
      };
    });
  };


  const saveEditChanges = () => {
    setCustomData({ ...modalForm });
    setIsCustomized(true);
    setShowEditModal(false);
  };


  const resetToAutoCalculations = () => {
    setIsCustomized(false);
    setCustomData({
      name: employee?.name || '',
      dateOfJoining: employee?.dateOfJoining || '',
      designation: employee?.designation || '',
      panNumber: employee?.panNumber || '',
      bankName: employee?.bankDetails?.bankName || '',
      accountNumber: employee?.bankDetails?.accountNumber || '',
      ifscCode: employee?.bankDetails?.ifscCode || '',
      earnings: { ...defaultEarnings },
      deductions: { ...defaultDeductions },
    });
    setShowEditModal(false);
  };



  if (!employee) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Employee data not available.</span>
      </div>
    );
  }

  if (grossMonthly <= 0) {
    return (
      <div className={`${accentBg} border border-gray-200 rounded-2xl p-8 text-center`}>
        <AlertCircle className={`h-10 w-10 mx-auto mb-3 ${accentText}`} />
        <h3 className={`text-lg font-bold ${accentText} mb-1`}>
          {isIntern ? 'Stipend' : 'Salary'} Not Set
        </h3>
        <p className="text-gray-600 text-sm">
          Please update the employee's {isIntern ? 'stipend' : 'salary'} in the Lifecycle & History tab before generating a slip.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── TOP CONTROL CARD ── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FileText className={`h-5 w-5 ${accentText}`} />
            <h3 className="text-lg font-bold text-gray-800">
              Generate {isIntern ? 'Stipend' : 'Salary'} Slip
            </h3>
            {isCustomized && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Customized by HR
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Company: <strong className="text-gray-800">{companyInfo.name}</strong>
          </div>
        </div>



        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Pay Month */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              <Calendar className="h-3.5 w-3.5 inline mr-1" />
              Pay Month
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`w-full px-3 py-2 border-2 ${accentBorder} rounded-xl bg-white text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer`}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Pay Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              <Calendar className="h-3.5 w-3.5 inline mr-1" />
              Pay Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`w-full px-3 py-2 border-2 ${accentBorder} rounded-xl bg-white text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer`}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Days Present */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Days Present <span className="text-gray-400 font-normal">(Out of {totalDays})</span>
            </label>
            <input
              type="number"
              min="0"
              max={totalDays}
              value={presentDays}
              onChange={(e) => setPresentDays(e.target.value)}
              placeholder={`Full Month (${totalDays})`}
              className={`w-full px-3 py-2 border-2 ${accentBorder} rounded-xl text-gray-800 font-semibold focus:outline-none`}
            />
          </div>
        </div>

        {/* Live Summary Bar */}
        <div className={`${accentBg} border border-gray-200 rounded-xl p-4 mb-6`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-0.5">Monthly Salary</p>
              <p className={`font-bold ${accentText}`}>₹ {fmt(grossMonthly)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium mb-0.5">Gross Payable</p>
              <p className={`font-bold ${accentText}`}>₹ {fmt(activeEarnings.gross)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium mb-0.5">TDS</p>
              <p className="font-bold text-red-600">₹ {fmt(activeDeductions.tds)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium mb-0.5">Net Take Home</p>
              <p className={`font-extrabold ${accentText} text-base`}>
                ₹ {fmt(activeDeductions.netPay)}
              </p>
            </div>
          </div>
        </div>



        {/* Action Buttons: Preview, Edit, Print, Download PDF */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left Side */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </button>

            {/* HR Edit Slip Details Button */}
            <button
              onClick={openEditModal}
              className="flex items-center px-4 py-2.5 border-2 border-indigo-500 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
              title="Edit slip details before printing or downloading"
            >
              <Edit3 className="h-4 w-4 mr-1.5 text-indigo-600" />
              Edit Slip
            </button>

            {isCustomized && (
              <button
                onClick={resetToAutoCalculations}
                className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 underline transition-colors"
                title="Reset to default calculations"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Auto
              </button>
            )}
          </div>

          {/* Right Side: Separate Print and Download PDF Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-60"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              {isPrinting ? 'Opening Print...' : 'Print'}
            </button>

            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`flex items-center px-5 py-2.5 ${accentClass} text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-60`}
            >
              <Download className="h-4 w-4 mr-1.5" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>



      {/* ── PREVIEW SECTION ── */}
      {previewMode && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gray-50 px-6 py-3.5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Slip Preview
              </h4>
              {isCustomized && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Customized
                </span>
              )}
            </div>

            {/* Quick Action Buttons inside Preview Toolbar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={openEditModal}
                className="flex items-center px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit
              </button>




            </div>
          </div>

          {/* Slip Canvas */}
          <div className="p-8 bg-gray-100 overflow-x-auto flex justify-center">
            <div className="shadow-2xl border border-gray-300 rounded bg-white">
              <SlipTemplate
                ref={printRef}
                data={activeSlipEmployee}
                companyInfo={companyInfo}
                earnings={activeEarnings}
                deductions={activeDeductions}
                presentDays={actualPresentDays}
                totalDays={totalDays}
                month={selectedMonth}
                year={selectedYear}
                isIntern={isIntern}
              />
            </div>
          </div>
        </div>
      )}


      {/* ── HIDDEN PRINT NODE ── */}
      {!previewMode && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
          <SlipTemplate
            ref={printRef}
            data={activeSlipEmployee}
            companyInfo={companyInfo}
            earnings={activeEarnings}
            deductions={activeDeductions}
            presentDays={actualPresentDays}
            totalDays={totalDays}
            month={selectedMonth}
            year={selectedYear}
            isIntern={isIntern}
          />
        </div>
      )}


      {/* HR EDIT SLIP MODAL                                                    */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Salary Slip Details
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Employee Details Inputs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Employee Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">NAME</label>
                    <input
                      type="text"
                      value={modalForm.name}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">DATE OF JOINING</label>
                    <input
                      type="date"
                      value={modalForm.dateOfJoining ? modalForm.dateOfJoining.substring(0, 10) : ''}
                      onChange={(e) => setModalForm({ ...modalForm, dateOfJoining: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">DESIGNATION</label>
                    <input
                      type="text"
                      value={modalForm.designation}
                      onChange={(e) => setModalForm({ ...modalForm, designation: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PAN NO</label>
                    <input
                      type="text"
                      value={modalForm.panNumber}
                      onChange={(e) => setModalForm({ ...modalForm, panNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">BANK NAME</label>
                    <input
                      type="text"
                      value={modalForm.bankName}
                      onChange={(e) => setModalForm({ ...modalForm, bankName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">A/C NO</label>
                    <input
                      type="text"
                      value={modalForm.accountNumber}
                      onChange={(e) => setModalForm({ ...modalForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">IFSC CODE</label>
                    <input
                      type="text"
                      value={modalForm.ifscCode}
                      onChange={(e) => setModalForm({ ...modalForm, ifscCode: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-gray-200">
                {/* Earnings */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    EARNINGS (₹)
                  </h4>
                  {isIntern ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stipend Amount</label>
                      <input
                        type="number"
                        value={modalForm.earnings.gross}
                        onChange={(e) => handleModalEarningChange('gross', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Basic Pay</label>
                        <input
                          type="number"
                          value={modalForm.earnings.basic}
                          onChange={(e) => handleModalEarningChange('basic', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Performance Allowance</label>
                        <input
                          type="number"
                          value={modalForm.earnings.performance}
                          onChange={(e) => handleModalEarningChange('performance', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">HRA</label>
                        <input
                          type="number"
                          value={modalForm.earnings.hra}
                          onChange={(e) => handleModalEarningChange('hra', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Special Allowance</label>
                        <input
                          type="number"
                          value={modalForm.earnings.specialAllowance}
                          onChange={(e) => handleModalEarningChange('specialAllowance', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Medical Allowance</label>
                        <input
                          type="number"
                          value={modalForm.earnings.medicalAllowance}
                          onChange={(e) => handleModalEarningChange('medicalAllowance', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Meal Allowance</label>
                        <input
                          type="number"
                          value={modalForm.earnings.mealAllowance}
                          onChange={(e) => handleModalEarningChange('mealAllowance', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Conveyance Allowance</label>
                        <input
                          type="number"
                          value={modalForm.earnings.conveyance}
                          onChange={(e) => handleModalEarningChange('conveyance', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    DEDUCTIONS (₹)
                  </h4>
                  <div className="space-y-2">
                    {!isIntern && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">Professional Tax</label>
                        <input
                          type="number"
                          value={modalForm.deductions.pt}
                          onChange={(e) => handleModalDeductionChange('pt', e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-600 mb-0.5">TDS</label>
                      <input
                        type="number"
                        value={modalForm.deductions.tds}
                        onChange={(e) => handleModalDeductionChange('tds', e.target.value)}
                        className="w-full px-2.5 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-xs text-gray-500 font-medium">Resulting Net Pay:</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹ {fmt(modalForm.deductions.netPay)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-between">
              <button
                type="button"
                onClick={resetToAutoCalculations}
                className="flex items-center px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1 text-gray-500" />
                Reset Auto
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditChanges}
                  className="flex items-center px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-all"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalarySlipGenerator;