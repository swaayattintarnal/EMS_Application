import React from 'react';

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

const SlipTemplate = React.forwardRef(
  ({ data, companyInfo, earnings, deductions, presentDays, totalDays, month, year, isIntern }, ref) => {
    const formatDate = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const fmt = (n) => {
      if (n === null || n === undefined || n === '' || isNaN(n)) return '-';
      const val = Number(n);
      if (val === 0) return '0';
      return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    const earningRows = isIntern
      ? [['Stipend', earnings.gross]]
      : [
          ['Basic Pay', earnings.basic],
          ['Performance Allowance', earnings.performance],
          ['HRA', earnings.hra],
          ['Special Allowance', earnings.specialAllowance],
          ['Medical Allowance', earnings.medicalAllowance],
          ['Meal Allowance', earnings.mealAllowance],
          ['Conveyance Allowance', earnings.conveyance],
        ];

    const deductionRows = isIntern
      ? [['TDS', deductions.tds]]
      : [
          ['Professional Tax', deductions.pt],
          ['TDS', deductions.tds],
        ];

    const totalRowsCount = Math.max(earningRows.length, deductionRows.length, 7);

    const BORDER = '1px solid #000000';

    return (
      <div
        ref={ref}
        id="salary-slip-printable-area"
        style={{
          width: '720px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Arial, Helvetica, sans-serif',
          boxSizing: 'border-box',
          padding: '24px 28px',
          margin: '0 auto',
          fontSize: '10px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: companyInfo.titleColor,
              letterSpacing: '0.2px',
            }}
          >
            {companyInfo.name}
          </div>
        </div>

        <div
          style={{
            borderTop: BORDER,
            borderBottom: BORDER,
            padding: '7px 0',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '24px',
            textTransform: 'uppercase',
          }}
        >
          {isIntern
            ? `STIPEND SLIP FOR THE MONTH - ${String(month).toUpperCase()} ${year}`
            : `PAY SLIP FOR THE MONTH - ${String(month).toUpperCase()} ${year}`}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '40px',
            marginBottom: '24px',
            padding: '0 2px',
          }}
        >
          <div>
            <DetailRow label="NAME" value={data?.name} />
            <DetailRow label="DATE OF JOINING" value={formatDate(data?.dateOfJoining)} />
            <DetailRow label="DESIGNATION" value={data?.designation} />
            <DetailRow label="PAN NO" value={data?.panNumber} />
            <DetailRow label="DAYS IN MONTH" value={totalDays} />
          </div>
          <div>
            <DetailRow label="PAY PERIOD" value={`${month} ${year}`} />
            <DetailRow label="BANK NAME" value={data?.bankDetails?.bankName} />
            <DetailRow label="A/C NO" value={data?.bankDetails?.accountNumber} />
            <DetailRow label="IFSC CODE" value={data?.bankDetails?.ifscCode} />
            <DetailRow label="PAID DAYS" value={presentDays} />
          </div>
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '9.5px',
            border: BORDER,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: '28%',
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '700',
                }}
              >
                EARNINGS
              </th>
              <th
                style={{
                  width: '22%',
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 10px',
                  textAlign: 'right',
                  fontWeight: '700',
                }}
              >
                AMOUNT
              </th>
              <th
                style={{
                  width: '28%',
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '700',
                }}
              >
                DEDUCTIONS
              </th>
              <th
                style={{
                  width: '22%',
                  borderBottom: BORDER,
                  padding: '6px 10px',
                  textAlign: 'right',
                  fontWeight: '700',
                }}
              >
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalRowsCount }).map((_, index) => {
              const earning = earningRows[index];
              const deduction = deductionRows[index];

              return (
                <tr key={index}>
                  <td
                    style={{
                      borderRight: BORDER,
                      padding: '4px 8px',
                      height: '18px',
                    }}
                  >
                    {earning ? earning[0] : ''}
                  </td>
                  <td
                    style={{
                      borderRight: BORDER,
                      padding: '4px 10px',
                      textAlign: 'right',
                    }}
                  >
                    {earning && earning[1] !== undefined && earning[1] !== null ? fmt(earning[1]) : ''}
                  </td>
                  <td
                    style={{
                      borderRight: BORDER,
                      padding: '4px 8px',
                    }}
                  >
                    {deduction ? deduction[0] : ''}
                  </td>
                  <td
                    style={{
                      padding: '4px 10px',
                      textAlign: 'right',
                    }}
                  >
                    {deduction && deduction[1] !== undefined && deduction[1] !== null ? fmt(deduction[1]) : ''}
                  </td>
                </tr>
              );
            })}

            <tr>
              <td
                style={{
                  borderTop: BORDER,
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 8px',
                  fontWeight: '700',
                }}
              >
                TOTAL EARNINGS
              </td>
              <td
                style={{
                  borderTop: BORDER,
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 10px',
                  textAlign: 'right',
                  fontWeight: '700',
                }}
              >
                ₹ {fmt(earnings.gross)}
              </td>
              <td
                style={{
                  borderTop: BORDER,
                  borderRight: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 8px',
                  fontWeight: '700',
                }}
              >
                TOTAL DEDUCTIONS
              </td>
              <td
                style={{
                  borderTop: BORDER,
                  borderBottom: BORDER,
                  padding: '6px 10px',
                  textAlign: 'right',
                  fontWeight: '700',
                }}
              >
                ₹ {fmt(deductions.totalDeductions)}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  borderRight: BORDER,
                  padding: '6px 8px',
                  fontWeight: '700',
                }}
              >
                NET AMOUNT
              </td>
              <td
                colSpan={3}
                style={{
                  padding: '6px 10px',
                  fontWeight: '700',
                  textAlign: 'right',
                }}
              >
                ₹ {fmt(deductions.netPay)}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            textAlign: 'center',
            marginTop: '45px',
            fontSize: '9.5px',
            color: '#000000',
          }}
        >
          This is a system-generated payslip and does not require a signature.
        </div>

        <div
          style={{
            marginTop: '36px',
            borderTop: BORDER,
            borderBottom: BORDER,
            padding: '7px 0',
            textAlign: 'center',
            fontSize: '9px',
            lineHeight: '1.4',
            fontWeight: '600',
            color: '#000000',
          }}
        >
          {companyInfo.footerText}
        </div>
      </div>
    );
  }
);

SlipTemplate.displayName = 'SlipTemplate';

export default SlipTemplate;
