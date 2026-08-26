import React from "react";
import srmLogo from "@/assets/images/srm_logo.png";

export interface ReceiptData {
  apptNo?: string;
  patientName?: string;
  gender?: string;
  age?: string | number;
  mobile?: string;
  email?: string;
  state?: string;
  city?: string;
  address?: string;
  status?: string;
  bookedOn?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctor?: string;
  department?: string;
  room?: string;
}

interface ReceiptDocumentProps {
  data?: ReceiptData;
  className?: string;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  data,
  className = "",
}) => {
  const apptNo = data?.apptNo ?? "—";
  const patientName = data?.patientName ?? "—";
  const gender = data?.gender ?? "—";
  const age = data?.age ?? "—";
  const mobile = data?.mobile ?? "—";
  const email = (data?.email && String(data.email).trim() !== '' && String(data.email).trim() !== '—') ? String(data.email).trim() : '—';
  const state = (data?.state && String(data.state).trim() !== '' && String(data.state).trim() !== '—') ? String(data.state).trim() : '—';
  const city = (data?.city && String(data.city).trim() !== '' && String(data.city).trim() !== '—') ? String(data.city).trim() : '—';
  const status = data?.status ?? "Upcoming";
  const bookedOn = data?.bookedOn ?? "—";
  const appointmentDate = data?.appointmentDate ?? "—";
  const appointmentTime = data?.appointmentTime ?? "—";
  const doctor = data?.doctor ?? "—";
  const department = data?.department ?? "—";
  const room = data?.room ?? "—";

  return (
    <div
      id="printable-receipt"
      className={`receipt-print print-receipt receipt-print-container bg-white text-black p-4 border border-black ${className}`}
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        color: "#000000",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
      }}
    >
      {/* 1. HOSPITAL HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-black mb-1 avoid-break">
        <div className="w-24 flex items-center justify-start shrink-0">
          <img
            src={srmLogo}
            alt="SRM Hospital Logo"
            className="h-16 w-auto object-contain grayscale"
          />
        </div>

        <div className="text-center flex-1 px-2">
          <h1 className="text-[15px] font-bold uppercase tracking-tight text-black leading-snug m-0">
            SRM MEDICAL COLLEGE HOSPITAL &amp; RESEARCH CENTRE
          </h1>
          <p className="text-[13px] font-bold text-black leading-snug mt-0.5 m-0">
            SRM Nagar, Potheri, Kattankulathur-603 203
          </p>
          <p className="text-[13px] font-bold text-black leading-snug mt-0.5 m-0">
            PHONE : 27455317 Extn: 2423 &amp; 2424.
          </p>
        </div>

        <div className="w-24 shrink-0" />
      </div>

      {/* 2. RECEIPT TITLE */}
      <div className="border-b border-black py-1 text-center mb-2 avoid-break">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-black m-0">
          Doctor Appointment Receipt
        </h2>
      </div>

      {/* 3. PATIENT INFORMATION */}
      <div className="grid grid-cols-2 gap-x-6 text-[13px] leading-tight mb-2 border-b border-black pb-2 avoid-break">
        {/* LEFT COLUMN */}
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Patient Name:</span>
            <span className="font-normal">{patientName}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Gender:</span>
            <span className="font-normal">{gender}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Age:</span>
            <span className="font-normal">{age} Yrs</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Mobile:</span>
            <span className="font-normal">+91 {mobile}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Email Address:</span>
            <span className="font-normal">{email && email !== '—' ? email : '—'}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">State:</span>
            <span className="font-normal">{state}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">City:</span>
            <span className="font-normal">{city}</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Appointment No:</span>
            <span className="font-normal">{apptNo}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Status:</span>
            <span className="font-normal">{status}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Booked On:</span>
            <span className="font-normal">{bookedOn}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Appt. Date:</span>
            <span className="font-normal">{appointmentDate}</span>
          </div>
        </div>
      </div>

      {/* 4. APPOINTMENT INFORMATION */}
      <div className="my-1 avoid-break">
        <h3 className="text-[13px] font-bold text-black m-0 mb-1">
          Appointment Information:
        </h3>
      </div>

      <table className="diagnosis-table w-full border-collapse text-[12.5px] mb-3 border border-gray-600 avoid-break">
        <thead>
          <tr className="border-b border-gray-600 bg-white">
            <th className="border border-gray-600 px-2 py-1 text-left font-bold" style={{ width: "25%" }}>
              Doctor Name
            </th>
            <th className="border border-gray-600 px-2 py-1 text-left font-bold" style={{ width: "30%" }}>
              Department
            </th>
            <th className="border border-gray-600 px-2 py-1 text-left font-bold" style={{ width: "20%" }}>
              Room No
            </th>
            <th className="border border-gray-600 px-2 py-1 text-left font-bold" style={{ width: "25%" }}>
              Appointment Time
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-600">
            <td className="border border-gray-600 px-2 py-1 font-normal">{doctor}</td>
            <td className="border border-gray-600 px-2 py-1 font-normal">{department}</td>
            <td className="border border-gray-600 px-2 py-1 font-normal">{room}</td>
            <td className="border border-gray-600 px-2 py-1 font-normal">{appointmentTime}</td>
          </tr>
        </tbody>
      </table>

      {/* 5. SIGNATURE SECTION */}
      <div className="signature-section pt-6 mt-6 border-t border-black avoid-break">
        <div className="flex justify-between items-end text-[12.5px] text-black">
          {/* Left: Issued By */}
          <div className="w-1/2 pr-4 space-y-1.5">
            <p className="font-bold m-0 mb-3">Issued By</p>
            <p className="m-0 flex items-baseline">
              <span className="font-semibold w-24 shrink-0">Name:</span>
              <span className="border-b border-black flex-1 font-normal text-slate-800">________________________</span>
            </p>
            <p className="m-0 flex items-baseline">
              <span className="font-semibold w-24 shrink-0">Date:</span>
              <span className="border-b border-black flex-1 font-normal text-slate-800">________________________</span>
            </p>
          </div>

          {/* Right: Front Desk Stamp */}
          <div className="w-1/2 pl-4 text-right flex flex-col items-end justify-end space-y-1">
            <div className="h-14 flex items-end justify-end mb-1">
              <div className="w-44 border-b border-black h-10"></div>
            </div>

            <p className="font-bold text-[13px] text-black m-0 tracking-wide uppercase">
              Authorized Signatory
            </p>
            <p className="m-0 text-[11.5px] text-slate-700">
              Front Office / Reception
            </p>
          </div>
        </div>
      </div>

      {/* 6. FOOTER */}
      <div className="document-footer pt-3 mt-6 border-t border-black text-center text-[10.5px] text-black avoid-break">
        <p className="m-0 font-bold uppercase tracking-tight">
          SRM MEDICAL COLLEGE HOSPITAL &amp; RESEARCH CENTRE &nbsp;|&nbsp; APPOINTMENT RECEIPT &nbsp;|&nbsp; No: {apptNo}
        </p>
        <p className="m-0 text-[9.5px] text-gray-700 mt-0.5 italic">
          Please carry this receipt at the time of your visit.
        </p>
      </div>
    </div>
  );
};

export default ReceiptDocument;