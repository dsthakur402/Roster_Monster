'use client';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  className?: string;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  className = '',
  minDate,
  maxDate,
  placeholder = 'Select date'
}: DatePickerProps) {
  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      min={minDate}
      max={maxDate}
      placeholder={placeholder}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
} 