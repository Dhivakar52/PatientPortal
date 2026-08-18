import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface HospitalEvent {
  id: string;
  title: string;
  patientName: string;
  uhid: string;
  opNo?: string;
  department: string;
  doctor: string;
  eventType: "op" | "revisit" | "cancel" | "anc" | "appointment" | "referral" | "document";
  date: string; // YYYY-MM-DD
  time: string;
  status: "Completed" | "Scheduled" | "In Progress" | "Cancelled" | "Pending";
}

const EVENT_TYPE_STYLES: Record<HospitalEvent["eventType"], { bg: string; text: string; dot: string; label: string }> = {
  op: { bg: "bg-slate-50", text: "text-blue-700 border-blue-200", dot: "bg-blue-600", label: "OP Registration" },
  revisit: { bg: "bg-slate-50", text: "text-slate-700 border-slate-200", dot: "bg-slate-600", label: "Revisit Appointment" },
  cancel: { bg: "bg-red-50", text: "text-red-700 border-red-200", dot: "bg-red-600", label: "Revisit Cancellation" },
  anc: { bg: "bg-slate-50", text: "text-blue-700 border-blue-200", dot: "bg-blue-600", label: "ANC Registration" },
  appointment: { bg: "bg-slate-50", text: "text-emerald-700 border-emerald-200", dot: "bg-emerald-600", label: "Doctor Appointment" },
  referral: { bg: "bg-slate-50", text: "text-slate-700 border-slate-200", dot: "bg-slate-600", label: "Referral Follow-up" },
  document: { bg: "bg-slate-50", text: "text-slate-700 border-slate-200", dot: "bg-slate-600", label: "Document Reminder" },
};

const MOCK_HOSPITAL_EVENTS: HospitalEvent[] = [
  {
    id: "EVT-101",
    title: "OP Patient Consultation",
    patientName: "NITESH KUMAR",
    uhid: "3995988",
    opNo: "26602286",
    department: "General Medicine",
    doctor: "Dr. Kavitha R",
    eventType: "op",
    date: "2026-08-04",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    id: "EVT-102",
    title: "Orthopedic Revisit Consultation",
    patientName: "SUVETHA",
    uhid: "3489205",
    opNo: "26602285",
    department: "Urology",
    doctor: "Dr. Sundar M",
    eventType: "revisit",
    date: "2026-08-04",
    time: "10:30 AM",
    status: "In Progress",
  },
  {
    id: "EVT-103",
    title: "Antenatal Check-up (Trimester 2)",
    patientName: "AMUTHA",
    uhid: "4282176",
    opNo: "263208",
    department: "Obstetrics",
    doctor: "Dr. Priya S",
    eventType: "anc",
    date: "2026-08-04",
    time: "11:15 AM",
    status: "Scheduled",
  },
  {
    id: "EVT-104",
    title: "Specialist Appointment",
    patientName: "ERGAMREDDY SHARMILA",
    uhid: "4137281",
    opNo: "26602284",
    department: "Psychiatry",
    doctor: "Dr. Ramesh K",
    eventType: "appointment",
    date: "2026-08-04",
    time: "02:00 PM",
    status: "Scheduled",
  },
  {
    id: "EVT-105",
    title: "Revisit Cancellation Request",
    patientName: "PRIYANSHU PANDA",
    uhid: "3709448",
    opNo: "26602281",
    department: "Dermatology",
    doctor: "Dr. Deepa V",
    eventType: "cancel",
    date: "2026-08-04",
    time: "03:30 PM",
    status: "Cancelled",
  },
  {
    id: "EVT-106",
    title: "Referral Follow-up Visit",
    patientName: "MURUGESAN",
    uhid: "2879469",
    opNo: "26602280",
    department: "Family Medicine",
    doctor: "Dr. Meena Kumar",
    eventType: "referral",
    date: "2026-08-05",
    time: "09:30 AM",
    status: "Scheduled",
  },
  {
    id: "EVT-107",
    title: "Antenatal Ultrasonography Clinic",
    patientName: "MANJUPRIYA",
    uhid: "4285500",
    opNo: "263207",
    department: "Obstetrics",
    doctor: "Dr. Priya S",
    eventType: "anc",
    date: "2026-08-06",
    time: "10:00 AM",
    status: "Scheduled",
  },
  {
    id: "EVT-108",
    title: "Cardiology Review Consultation",
    patientName: "RAJENDRAN",
    uhid: "26588923",
    opNo: "26588923",
    department: "Cardiology",
    doctor: "Dr. Sundar M",
    eventType: "revisit",
    date: "2026-08-07",
    time: "11:30 AM",
    status: "Scheduled",
  },
];

export const DashboardCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 4));
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-08-04");
  const [selectedEvent, setSelectedEvent] = useState<HospitalEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 4);
    setCurrentDate(today);
    setSelectedDateStr("2026-08-04");
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, HospitalEvent[]> = {};
    MOCK_HOSPITAL_EVENTS.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, []);

  const selectedDateEvents = eventsByDate[selectedDateStr] || [];

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <CalendarIcon className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">
              Calendar
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Hospital Schedule & Activities Overview
          </CardDescription>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs px-3 font-medium cursor-pointer"
          >
            Today
          </Button>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold text-slate-900 min-w-28 text-center px-1">
              {monthNames[month]} {year}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 rounded-xl bg-slate-50/40 dark:bg-slate-800/40" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
                const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

                const isToday = dateStr === "2026-08-04";
                const isSelected = dateStr === selectedDateStr;
                const dayEvents = eventsByDate[dateStr] || [];

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-12 rounded-xl border p-1 flex flex-col justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? "border border-blue-500 font-bold"
                        : isToday
                        ? "border-blue-300 font-bold text-blue-800 dark:text-blue-300"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    style={
                      isSelected || isToday
                        ? { background: "var(--side-menu)", color: "var(--blue-text-color)" }
                        : undefined
                    }
                  >
                    <span
                      className={`text-xs ${
                        isToday ? "h-5 w-5 rounded-full text-white flex items-center justify-center font-bold" : ""
                      }`}
                      style={isToday ? { background: "var(--blue-text-color)" } : undefined}
                    >
                      {dayNum}
                    </span>

                    <div className="flex items-center gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <span
                          key={evt.id}
                          className={`h-1.5 w-1.5 rounded-full ${EVENT_TYPE_STYLES[evt.eventType].dot}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] font-extrabold text-slate-600 dark:text-slate-400">+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="lg:col-span-5 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Schedule for {selectedDateStr}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {selectedDateEvents.length} Events
                </Badge>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <CalendarIcon className="h-8 w-8 mb-2 opacity-50" />
                  No hospital events scheduled for this date
                </div>
              ) : (
                selectedDateEvents.map((evt) => {
                  const style = EVENT_TYPE_STYLES[evt.eventType];
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-xs bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{evt.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {evt.patientName} • <span className="font-mono text-slate-500 dark:text-slate-400">{evt.uhid}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {evt.department} • {evt.doctor}
                          </p>
                        </div>
                        <Badge className={`text-[10px] font-semibold border ${style.bg} dark:bg-slate-800 ${style.text}`}>
                          {style.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Event Details Dialog */}
      <Dialog open={Boolean(selectedEvent)} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Event Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of the selected hospital appointment or registration
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 pt-2 text-xs text-slate-700 dark:text-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Event Title</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedEvent.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Patient Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedEvent.patientName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">UHID / OP No</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">{selectedEvent.uhid}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.department}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Attending Doctor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEvent.doctor}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Date & Time</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEvent.date} - {selectedEvent.time}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Status</span>
                  <Badge variant="outline" className="mt-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10.5px]">
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="text-xs">
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
