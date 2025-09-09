import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  error,
  required = false,
  loading = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`${isOpen ? 'mb-20' : 'mb-6'}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div
          className={`relative cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className={`flex items-center justify-between w-full px-3 py-2 border rounded-md ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
            <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center space-x-2">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto pb-4">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      option.value === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableDropdown; 