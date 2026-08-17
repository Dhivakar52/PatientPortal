import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, QrCode, Barcode } from "lucide-react";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { toast } from "@/components/ui/toast";

interface BarcodePreviewModalProps {
  patient: {
    id: string; // UHID
    opNo?: string;
    patientName: string;
    department?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodePreviewModal: React.FC<BarcodePreviewModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const barcodeCardRef = useRef<HTMLDivElement>(null);

  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success(`Barcode for UHID ${patient.id} downloaded successfully!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-barcode-card,
          #printable-barcode-card * {
            visibility: visible !important;
          }
          #printable-barcode-card {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }
          [data-radix-dialog-overlay],
          [data-radix-dialog-content],
          [role="dialog"] {
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
            size: auto;
            margin: 0;
          }
        }
      `}</style>
      <DialogContent 
        className="p-0 w-full rounded-xl border border-slate-200"
        style={{
          maxWidth: "35%",
        }}
      >
        <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Barcode className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-semibold">
                Patient Barcode Preview
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Generated standard Code 128 barcode and QR identification code
          </DialogDescription>
        </DialogHeader>

        {/* Printable Card Area */}
        <div ref={barcodeCardRef} id="printable-barcode-card" className="p-6 space-y-4 bg-white text-center">
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                SRM Global Hospitals
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {patient.patientName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                UHID: <span className="font-mono font-semibold">{patient.id}</span>
                {patient.opNo && (
                  <>
                    {" "}
                    | OP No: <span className="font-mono font-semibold">{patient.opNo}</span>
                  </>
                )}
              </p>
            </div>

            {/* Code 128 Barcode */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block shadow-2xs">
              <BarcodeGenerator value={patient.id} height={55} width={2.2} />
            </div>

            {/* QR Code section */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-200/80">
              <QRCodeGenerator value={`UHID:${patient.id}|NAME:${patient.patientName}`} size={75} />
              <div className="text-left text-xs space-y-1 text-slate-600">
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <QrCode className="h-3.5 w-3.5 text-blue-600" /> Patient QR Tag
                </p>
                <p>Dept: {patient.department || "General OPD"}</p>
                <p className="text-[11px] text-slate-400">Scan for Instant EMR Record</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
          <Button variant="outline" size="sm" onClick={onClose} className="text-[12.5px]">
            <X className="h-3.5 w-3.5 mr-1" /> Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-[12.5px] gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-[12.5px] gap-1.5 text-white"
              style={{ background: "var(--blue-btn)" }}
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};