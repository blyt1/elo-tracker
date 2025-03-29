'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Enhanced Dropdown with search functionality
 */
const EnhancedDropdown = ({ 
  options, 
  onSelect, 
  placeholder = "Select an option",
  disabled = false,
  renderOption,
  buttonClassName = "",
  dropdownClassName = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return option.name.toLowerCase().includes(searchLower);
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-2 border rounded ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        } ${buttonClassName}`}
        disabled={disabled}
      >
        <span className={`${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
          {placeholder}
        </span>
        <svg
          className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 bg-white border rounded shadow-lg ${dropdownClassName}`}>
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {renderOption ? renderOption(option) : option.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDropdown;