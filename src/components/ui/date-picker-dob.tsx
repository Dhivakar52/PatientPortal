"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerDobProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  defaultLabel?: string;
  fromYear?: number;
  toYear?: number;
  disabled?: boolean;
  className?: string;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function DatePickerDob({
  value,
  onChange,
  placeholder = "Select Date of Birth",
  defaultLabel,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  disabled = false,
  className,
}: DatePickerDobProps) {
  const [open, setOpen] = React.useState(false);

  // Initial display month: selected date's month/year, or fallback to year 2000
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => {
    if (value) return value;
    const defaultYear = Math.min(2000, toYear);
    return new Date(defaultYear, 0, 1);
  });

  // Sync displayMonth when controlled `value` changes
  React.useEffect(() => {
    if (value) {
      setDisplayMonth(value);
    }
  }, [value]);

  // Generate list of years (descending for easy birth year selection)
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = toYear; y >= fromYear; y--) {
      list.push(y);
    }
    return list;
  }, [fromYear, toYear]);

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonthIdx = parseInt(e.target.value, 10);
    setDisplayMonth((prev) => setMonth(prev, newMonthIdx));
  };

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setDisplayMonth((prev) => setYear(prev, newYear));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onChange?.(selectedDate);
    if (selectedDate) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 dark:text-slate-200 rounded-[4px] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
            !value && !defaultLabel && "text-slate-400 dark:text-slate-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
          {value ? format(value, "dd-MM-yyyy") : (defaultLabel ?? placeholder)}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl"
        align="start"
      >
        {/* Custom Header matching exact UI layout: [<]  [Aug ⌄] [2026 ⌄]  [>] */}
        <div className="flex items-center justify-between px-1 mb-2">
          {/* Previous Month Arrow */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Center Month & Year Dropdowns */}
          <div className="flex items-center gap-1.5">
            {/* Short Month Dropdown */}
            <div className="relative inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
              <span>{MONTHS_SHORT[displayMonth.getMonth()]}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={displayMonth.getMonth()}
                onChange={handleMonthSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-base bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {MONTHS_SHORT.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="relative inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
              <span>{displayMonth.getFullYear()}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={displayMonth.getFullYear()}
                onChange={handleYearSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-base bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Next Month Arrow */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid — hide ANY built-in caption/nav regardless of react-day-picker version */}
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          disabled={(date) => date > new Date()}
          className={cn(
            "p-0 border-0",
            // v8 class names
            "[&_.rdp-caption]:hidden [&_.rdp-nav]:hidden [&_.rdp-vhidden]:hidden",
            // v9 class names
            "[&_.rdp-month_caption]:hidden [&_.rdp-nav_button]:hidden [&_.rdp-months_dropdown]:hidden",
            // shadcn wrapper fallbacks (data-slot based)
            "[&_[data-slot=calendar-caption]]:hidden [&_[data-slot=calendar-nav]]:hidden",
            // catch-all: any element literally containing month/year nav buttons at top
            "[&_.rdp-caption_dropdowns]:hidden"
          )}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePickerDob;