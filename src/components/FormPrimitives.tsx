import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as ShadLabel } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerDob } from "@/components/ui/date-picker-dob";
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
  value,
  defaultValue,
  onChange,
}: {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Input
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-9 text-[13px] rounded-[4px]"  // ✅ Already 4px
    />
  );
}

// ✅ Controlled SelectField - accepts value/onChange so it can be wired into filter state
export function SelectField({
  options,
  placeholder = "Select",
  value,
  onChange,
  disabled,
}: {
  options: readonly string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <NativeSelect
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="h-9 text-[13px] w-full rounded-[4px]"
      style={{
        borderRadius: "4px !important"
      }}
    >
      <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          {opt}
        </option>
      ))}
    </NativeSelect>
  );
}

// ✅ Controlled DateField - accepts value/onChange so it can be wired into filter state
export function DateField({
  placeholder = "Pick a date",
  defaultLabel,
  value,
  onChange,
  disabled,
}: {
  placeholder?: string;
  defaultLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
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
    <Popover>
      <PopoverTrigger className="w-full">
        <Button
          variant="outline"
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
        <Calendar mode="single" selected={date} onSelect={handleSelect} disabled={disabled} />
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