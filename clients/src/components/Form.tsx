import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options = [],
  rows = 3,
  disabled = false
}) => {
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        );
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        );
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};

interface FormActionsProps {
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  disabled = false
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        disabled={loading || disabled}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : submitText}
      </button>
    </div>
  );
}; 