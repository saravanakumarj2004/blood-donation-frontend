import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';

const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    icon: Icon,
    required = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt =>
        (typeof opt === 'string' ? opt : opt.value) === value
    );

    const displayValue = selectedOption
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
        : "";

    const handleSelect = (option) => {
        const val = typeof option === 'string' ? option : option.value;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative group ${className}`} ref={containerRef}>
            {/* Main Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-12 pr-10 py-4 rounded-2xl border cursor-pointer
                    flex items-center justify-between transition-all
                    ${isOpen
                        ? 'bg-white border-primary ring-4 ring-primary/10'
                        : 'bg-neutral-50/50 border-neutral-200 hover:border-primary/30 hover:bg-white'
                    }
                `}
            >
                {/* Icon */}
                <div className={`absolute left-0 pl-4 flex items-center pointer-events-none transition-colors ${isOpen ? 'text-primary' : 'text-neutral-400'}`}>
                    {Icon && <Icon size={22} className={isOpen ? "fill-current" : "fill-current opacity-20"} />}
                </div>

                {/* Value / Placeholder */}
                <span className={`font-medium truncate ${displayValue ? 'text-neutral-800' : 'text-neutral-400'}`}>
                    {displayValue || placeholder}
                </span>

                {/* Arrow */}
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-[270deg] text-primary' : 'rotate-90'}`}>
                    <ChevronRight size={16} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="p-4 text-center text-neutral-400 text-sm">No options available</div>
                    ) : (
                        <div className="p-1">
                            {options.map((option, idx) => {
                                const optValue = typeof option === 'string' ? option : option.value;
                                const optLabel = typeof option === 'string' ? option : option.label;
                                const isSelected = optValue === value;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between text-base font-medium transition-colors
                                            ${isSelected
                                                ? 'bg-primary/5 text-primary'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                            }
                                        `}
                                    >
                                        <span className="truncate">{optLabel}</span>
                                        {isSelected && <Check size={16} />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Hidden native input for required validation if needed, though usually handled by state */}
            {required && (
                <input
                    type="text"
                    className="absolute opacity-0 w-0 h-0 bottom-0 left-1/2"
                    required={required}
                    value={value}
                    onChange={() => { }}
                    tabIndex={-1}
                />
            )}
        </div>
    );
};

export default CustomSelect;
