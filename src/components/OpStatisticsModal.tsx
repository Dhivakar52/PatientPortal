import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  UsersRound,
  CalendarClock,
  Building,
  TrendingUp,
  Activity,
  X,
  UserCheck,
} from "lucide-react";

type LucideIcon = React.ComponentType<any>;

interface OpStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPatients?: number;
  newToday?: number;
  revisitsToday?: number;
}

type DepartmentStat = {
  name: string;
  count: number;
  percentage: number;
};

type MetricCardData = {
  label: string;
  value: number;
  suffix: string;
  helper: string;
  icon: LucideIcon;
  iconClassName: string;
  trend?: string;
  valueClassName?: string;
};

const departmentStats: DepartmentStat[] = [
  { name: "General Medicine", count: 124, percentage: 32 },
  { name: "Orthopedics", count: 86, percentage: 22 },
  { name: "Cardiology", count: 65, percentage: 17 },
  { name: "Obstetrics & Gynaecology", count: 58, percentage: 15 },
  { name: "Dermatology", count: 32, percentage: 8 },
  { name: "Urology", count: 24, percentage: 6 },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);

const StatCard: React.FC<MetricCardData> = ({
  label,
  value,
  suffix,
  helper,
  icon: Icon,
  iconClassName,
  trend,
  valueClassName = "text-slate-900",
}) => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm transition-colors duration-200 hover:border-slate-300">
    <div className="flex items-center justify-between text-slate-500">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</span>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
    </div>

    <div className="mt-3 flex items-baseline gap-2">
      <span className={`text-2xl font-extrabold ${valueClassName}`}>
        {formatNumber(value)}
      </span>
      {trend ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-500">{suffix}</span>
      )}
    </div>

    <p className="mt-2 text-[11px] text-slate-500">{helper}</p>
  </div>
);

export const OpStatisticsModal: React.FC<OpStatisticsModalProps> = ({
  isOpen,
  onClose,
  totalPatients = 2480,
  newToday = 142,
  revisitsToday = 385,
}) => {
  const metricCards = useMemo<MetricCardData[]>(
    () => [
      {
        label: "Total Registered",
        value: totalPatients,
        suffix: "Records",
        helper: "Cumulative patient records in EMR",
        icon: UsersRound,
        iconClassName: "text-blue-600",
        trend: "+12.4%",
        valueClassName: "text-slate-900",
      },
      {
        label: "New Registrations Today",
        value: newToday,
        suffix: "Patients",
        helper: "First-time OP visits recorded today",
        icon: UserCheck,
        iconClassName: "text-emerald-600",
      },
      {
        label: "Revisits Today",
        value: revisitsToday,
        suffix: "Consultations",
        helper: "Follow-up revisit tokens issued",
        icon: CalendarClock,
        iconClassName: "text-purple-600",
      },
    ],
    [newToday, revisitsToday, totalPatients],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
        style={{ maxWidth: "min(920px, 90vw)" }}
      >
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Outpatient (OP) Statistics Overview
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Real-time registration, revisit, and departmental metrics
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="secondary"
              className="border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
            >
              Live EMR Data
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metricCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <Building className="h-4 w-4 text-slate-600" />
              Department-wise Today OPD Volume
            </h4>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700">
                    <span className="truncate">{dept.name}</span>
                    <span className="font-bold text-slate-900">
                      {dept.count} patients ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            Auto-synced with active registration queue
          </span>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            <X className="mr-1 h-3.5 w-3.5" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
