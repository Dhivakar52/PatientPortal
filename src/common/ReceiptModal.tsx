import React from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Receipt as ReceiptIcon } from "lucide-react";
import { ReceiptDocument } from "./ReceiptDocument";
import { type Appointment, type Patient } from '@/types/patient.types'
import { capitalizeName, calcAge, formatDateTime, formatDateFull, todayStr } from '@/utils/patient.utils'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  appt: Appointment | null
  patient: Patient | null
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  appt,
  patient,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
          modalContent.scrollLeft = 0;
        }
        const printContainers = document.querySelectorAll(
          '.print-receipt-standalone, .receipt-print, #printable-receipt'
        );
        printContainers.forEach((el) => {
          el.scrollTop = 0;
          el.scrollLeft = 0;
        });
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen || !appt || !patient) return null;

  const today = todayStr();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
    const modalContent = document.querySelector('[role="dialog"]');
    if (modalContent) {
      modalContent.scrollTop = 0;
      modalContent.scrollLeft = 0;
    }
    const printContainers = document.querySelectorAll(
      '.print-receipt-standalone, .receipt-print, #printable-receipt'
    );
    printContainers.forEach((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const receiptData = {
    apptNo: appt.apptNo,
    patientName: capitalizeName(patient.name),
    gender: patient.gender,
    age: calcAge(patient.dob) || '—',
    mobile: patient.mobile,
    status: appt.date < today ? 'Visited' : 'Upcoming',
    bookedOn: formatDateTime(appt.bookedOn),
    appointmentDate: formatDateFull(appt.date),
    appointmentTime: appt.slot,
    doctor: appt.doctor,
    department: appt.department,
    room: appt.room,
  };

  return (
    <>
      {/* Print CSS isolation: ensures only .print-receipt-standalone renders on print */}
      <style>{`
        @media screen {
          .print-receipt-standalone {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-receipt-standalone,
          .print-receipt-standalone * {
            visibility: visible !important;
          }
          .print-receipt-standalone {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
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
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="p-0 rounded-xl border border-slate-200 overflow-y-auto max-h-[90vh] print:hidden"
          style={{
            maxWidth: "850px",
          }}
        >
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <ReceiptIcon className="h-5 w-5 text-blue-600" />
                <DialogTitle className="text-base font-semibold">
                  Appointment Receipt Preview
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Formatted for standard A4 document printing
            </DialogDescription>
          </DialogHeader>

          {/* Screen Preview Container */}
          <div className="p-6 bg-slate-100 flex justify-center print:hidden">
            <ReceiptDocument data={receiptData} />
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
            <Button variant="outline" size="sm" onClick={onClose} className="text-[12.5px] cursor-pointer">
              <X className="h-3.5 w-3.5 mr-1" /> Close
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="text-[12.5px] gap-1.5 text-white cursor-pointer"
              style={{ background: "var(--blue-btn)" }}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standalone Print-Only Portal attached directly to document.body */}
      {isOpen &&
        createPortal(
          <div className="print-receipt-standalone">
            <ReceiptDocument data={receiptData} />
          </div>,
          document.body
        )}
    </>
  );
};