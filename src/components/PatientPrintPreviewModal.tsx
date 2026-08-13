import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText, Phone, Mail } from "lucide-react";
import Logo from "@/assets/images/srm_logo.png";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { QRCodeGenerator } from "./QRCodeGenerator";

interface PatientPrintPreviewModalProps {
  patient: {
    id: string; // UHID
    opNo?: string;
    patientName: string;
    title?: string;
    fhwo?: string;
    gender?: string;
    age?: number | string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    doctor?: string;
    registrationDate?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientPrintPreviewModal: React.FC<PatientPrintPreviewModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Print-only fix: isolates #printable-patient-card and neutralizes
          Radix Dialog's fixed/transform positioning so print output lands
          top-left on the A4 page instead of floating in whitespace. */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-patient-card,
          #printable-patient-card * {
            visibility: visible;
          }
          #printable-patient-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          [data-radix-dialog-overlay],
          [data-radix-dialog-content] {
            position: static !important;
            transform: none !important;
            inset: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            background: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <DialogContent 
        className="p-0 rounded-xl border border-slate-200"
        style={{
          maxWidth: "55%",
        }}
      >
        <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-semibold">
                Patient Registration Print Preview
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Formatted for standard A4 document printing
          </DialogDescription>
        </DialogHeader>

        {/* Printable A4 Container */}
        <div id="printable-patient-card" className="p-8 bg-white space-y-6 text-slate-900">
          {/* Header section with Hospital Logo */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="SRM Logo" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                  SRM Global Hospitals
                </h1>
                <p className="text-xs text-slate-600">
                  Vadapalani & Kattankulathur Campus, Chennai, Tamil Nadu
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 044-45923000</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> info@srmhospitals.ac.in</span>
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                OUTPATIENT CARD
              </span>
              <span className="text-sm font-extrabold text-blue-950 font-mono">
                {patient.id}
              </span>
            </div>
          </div>

          {/* Registration Slip Title */}
          <div className="text-center bg-slate-100 py-1.5 rounded border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              Outpatient Registration & Identification Card
            </h2>
          </div>

          {/* Patient Details & Barcodes Grid */}
          <div className="grid grid-cols-3 gap-6 items-start">
            {/* Column 1 & 2: Patient Info */}
            <div className="col-span-2 grid grid-cols-2 gap-y-3 gap-x-4 text-[12.5px] border border-slate-200 rounded-lg p-4 bg-slate-50/30">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Patient Name</span>
                <span className="font-bold text-slate-900 text-[14px]">
                  {patient.title ? `${patient.title}. ` : ""}{patient.patientName}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">UHID Number</span>
                <span className="font-semibold text-slate-900 font-mono">{patient.id}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">OP Number</span>
                <span className="font-semibold text-slate-900 font-mono">{patient.opNo || "26602286"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Father / Husband Name</span>
                <span className="font-medium text-slate-800">{patient.fhwo || "Self"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Gender / Age</span>
                <span className="font-medium text-slate-800">
                  {patient.gender || "Male"} / {patient.age || "28 Yrs"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Mobile Number</span>
                <span className="font-medium text-slate-800 font-mono">{patient.phone || "9840012345"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Department</span>
                <span className="font-semibold text-blue-900">{patient.department || "General Medicine"}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Consultant Doctor</span>
                <span className="font-medium text-slate-800">{patient.doctor || "Dr. Kavitha R (Consultant)"}</span>
              </div>

              <div className="col-span-2 border-t border-slate-200 pt-2">
                <span className="text-[11px] text-slate-500 font-medium block">Address</span>
                <span className="font-normal text-slate-700 text-[12px]">
                  {patient.address || "12, Grand Trunk Road"}, {patient.city || "Chennai, Tamil Nadu"}
                </span>
              </div>
            </div>

            {/* Column 3: Barcode & QR Code */}
            <div className="flex flex-col items-center justify-between h-full border border-slate-200 rounded-lg p-4 bg-white text-center">
              <div className="w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  BARCODE IDENTIFIER
                </span>
                <BarcodeGenerator value={patient.id} height={50} width={1.8} />
              </div>

              <div className="pt-3 border-t border-slate-100 w-full flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  PATIENT QR CODE
                </span>
                <QRCodeGenerator value={`UHID:${patient.id}|NAME:${patient.patientName}`} size={70} />
              </div>
            </div>
          </div>

          {/* Audit Footer Info */}
          <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <span>Registration Date: </span>
              <strong className="text-slate-700">{patient.registrationDate || currentDate}</strong>
            </div>

            <div>
              <span>Printed On: </span>
              <strong className="text-slate-700">{currentDate} at {currentTime}</strong>
            </div>

            <div>
              <span>Printed By: </span>
              <strong className="text-slate-700">System Admin</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
          <Button variant="outline" size="sm" onClick={onClose} className="text-[12.5px]">
            <X className="h-3.5 w-3.5 mr-1" /> Close
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-[12.5px] gap-1.5 text-white"
            style={{ background: "var(--blue-btn)" }}
          >
            <Printer className="h-3.5 w-3.5" />
            Print A4 Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};