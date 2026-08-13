import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

const TableSearch: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [inputValue, delay, onChange]);

  return (
    <div className="w-full sm:w-72 relative">

      {/* 🔍 Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

      {/* Input */}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
};

export default TableSearch;