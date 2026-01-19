import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, X } from 'lucide-react';

const MultiSelect = ({
    options,
    value = [], // Array of selected values
    onChange,
    placeholder = "Select options",
    icon: Icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = typeof option === 'string' ? option : option.value;
        if (value.includes(val)) {
            onChange(value.filter(v => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const removeTag = (e, val) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== val));
    };

    return (
        <div className={`relative group ${className}`} ref={containerRef}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-12 pr-10 py-3 min-h-[56px] rounded-2xl border cursor-pointer
                    flex items-center flex-wrap gap-2 transition-all
                    ${isOpen
                        ? 'bg-white border-primary ring-4 ring-primary/10'
                        : 'bg-neutral-50/50 border-neutral-200 hover:border-primary/30 hover:bg-white'
                    }
                `}
            >
                {/* Icon */}
                <div className={`absolute left-0 pl-4 h-full flex items-center pointer-events-none transition-colors ${isOpen ? 'text-primary' : 'text-neutral-400'}`}>
                    {Icon && <Icon size={22} className={isOpen ? "fill-current" : "fill-current opacity-20"} />}
                </div>

                {/* Selected Tags */}
                {value.length > 0 ? (
                    value.map((val, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            {val}
                            <X size={14} className="cursor-pointer hover:text-red-600" onClick={(e) => removeTag(e, val)} />
                        </span>
                    ))
                ) : (
                    <span className="text-neutral-400 font-medium">{placeholder}</span>
                )}

                {/* Arrow */}
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-[270deg] text-primary' : 'rotate-90'}`}>
                    <ChevronRight size={16} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="p-4 text-center text-neutral-400 text-sm">No options available</div>
                    ) : (
                        <div className="p-1">
                            {options.map((option, idx) => {
                                const optValue = typeof option === 'string' ? option : option.value;
                                const optLabel = typeof option === 'string' ? option : option.label;
                                const isSelected = value.includes(optValue);

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
        </div>
    );
};

export default MultiSelect;
