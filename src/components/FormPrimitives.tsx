import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as ShadLabel } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerDob } from "@/components/ui/date-picker-dob";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <ShadLabel className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </ShadLabel>
  );
}

export function Field({
  label,
  required,
  children,
  span = 1,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div style={{ gridColumn: `span ${span} / span ${span}` }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

// ✅ Controlled TextField - accepts value/onChange so it can be wired into filter state
export function TextField({
  placeholder,
  disabled,
  type,
  value,
  defaultValue,
  onChange,
}: {
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-9 text-[13px] rounded-[4px]"  // ✅ Already 4px
    />
  );
}

export type SelectOption = string | { value: string | number; label: string };

// ✅ Controlled SelectField - uses floating Portal select with downward orientation
export function SelectField({
  options,
  placeholder = "Select",
  value,
  onChange,
  disabled,
}: {
  options: readonly SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const strVal = value !== undefined && value !== null && String(value) !== "" ? String(value) : undefined;

  // Resolve ID/value to human-readable label if available
  const selectedOpt = strVal !== undefined
    ? options.find((opt) => {
        if (typeof opt === "object") {
          return String(opt.value) === strVal || opt.label.toLowerCase() === strVal.toLowerCase();
        }
        return String(opt).toLowerCase() === strVal.toLowerCase();
      })
    : undefined;

  const displayLabel = selectedOpt
    ? (typeof selectedOpt === "object" ? selectedOpt.label : String(selectedOpt))
    : (strVal && !/^\d+$/.test(strVal) ? strVal : undefined);

  return (
    <Select
      value={strVal}
      onValueChange={(val: string) => onChange?.(val ?? "")}
      disabled={disabled}
    >
      <SelectTrigger className="h-9 text-[13px] w-full rounded-[4px] bg-background border border-input">
        <SelectValue placeholder={placeholder}>
          {displayLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent side="bottom" align="start" sideOffset={4} className="max-h-60 overflow-y-auto z-[100]">
        {options.map((opt) => {
          const optValue = typeof opt === "object" ? String(opt.value) : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          return (
            <SelectItem key={optValue} value={optValue}>
              {optLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}


// ✅ Controlled DateField - accepts value/onChange so it can be wired into filter state
export function DateField({
  placeholder = "Pick a date",
  defaultLabel,
  value,
  onChange,
  disabled,
  fromMonth,
  toMonth,
}: {
  placeholder?: string;
  defaultLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  fromMonth?: Date;
  toMonth?: Date;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const [open, setOpen] = React.useState(false);
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
    if (d) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <Button
          variant="outline"
          type="button"
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 dark:text-slate-200 rounded-[4px] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",  // ✅ Already 4px
            !date && !defaultLabel && "text-slate-400 dark:text-slate-500"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
          {date ? format(date, "dd-MM-yyyy") : defaultLabel ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          startMonth={fromMonth}
          endMonth={toMonth}
        />
      </PopoverContent>
    </Popover>
  );
}

// ✅ Controlled DobDateField - Date of Birth picker with dropdown caption layout (Month & Year selection)
export function DobDateField({
  placeholder = "Select Date of Birth",
  defaultLabel,
  value,
  onChange,
  fromYear = 1900,
  toYear,
  disabled,
}: {
  placeholder?: string;
  defaultLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  disabled?: boolean;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
  };

  return (
    <DatePickerDob
      value={date}
      onChange={handleSelect}
      placeholder={placeholder}
      defaultLabel={defaultLabel}
      fromYear={fromYear}
      toYear={toYear}
      disabled={disabled}
      className="rounded-[4px]"  // ✅ Added rounded-[4px] prop if DatePickerDob accepts it
    />
  );
}