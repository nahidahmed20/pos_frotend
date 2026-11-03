'use client';

import { useState, useEffect, useRef, useMemo, Children } from 'react';

/**
 * Modern Select2 searchable dropdown component for React / Next.js
 *
 * Supports:
 * - Direct options array: [{ value, label, sublabel }] or ['Option 1', 'Option 2']
 * - Children `<option>` tags: `<Select2><option value="1">One</option></Select2>`
 * - Searchable with instant filtering
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Click-outside to close
 * - Clear button
 * - Drop-in replacement for native `<select>` (dispatches synthetic change event)
 */
export default function Select2({
    options: rawOptions,
    children,
    value,
    defaultValue,
    onChange,
    name,
    id,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    isSearchable = true,
    isClearable = true,
    required = false,
    disabled = false,
    className = '',
    size = 'md',
    autoFocusSearch = true,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [internalValue, setInternalValue] = useState(value !== undefined ? value : (defaultValue || ''));
    const [highlightIndex, setHighlightIndex] = useState(0);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    // Sync controlled value
    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value ?? '');
        }
    }, [value]);

    // Parse options from either `options` prop or `children`
    const parsedOptions = useMemo(() => {
        if (rawOptions && Array.isArray(rawOptions)) {
            return rawOptions.map((opt) => {
                if (typeof opt === 'object' && opt !== null) {
                    return {
                        value: opt.value !== undefined ? String(opt.value) : '',
                        label: opt.label !== undefined ? String(opt.label) : String(opt.value ?? ''),
                        sublabel: opt.sublabel ? String(opt.sublabel) : null,
                        disabled: Boolean(opt.disabled),
                    };
                }
                return {
                    value: String(opt),
                    label: String(opt),
                    sublabel: null,
                    disabled: false,
                };
            });
        }

        // Parse children (<option>)
        if (children) {
            const opts = [];
            Children.forEach(children, (child) => {
                if (!child) return;
                if (child.type === 'option') {
                    opts.push({
                        value: child.props.value !== undefined ? String(child.props.value) : '',
                        label: child.props.children ? String(child.props.children) : (child.props.value ? String(child.props.value) : ''),
                        sublabel: null,
                        disabled: Boolean(child.props.disabled),
                    });
                }
            });
            return opts;
        }

        return [];
    }, [rawOptions, children]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return parsedOptions;
        const q = search.toLowerCase();
        return parsedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(q) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
            opt.value.toLowerCase().includes(q)
        );
    }, [parsedOptions, search]);

    // Currently selected option
    const selectedOption = useMemo(() => {
        const valStr = String(internalValue ?? '');
        return parsedOptions.find((opt) => opt.value === valStr) || null;
    }, [parsedOptions, internalValue]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && autoFocusSearch && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 30);
        }
        if (isOpen) {
            // Find current selected index to highlight
            const selIdx = filteredOptions.findIndex((o) => o.value === String(internalValue));
            setHighlightIndex(selIdx >= 0 ? selIdx : 0);
        }
    }, [isOpen]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current) {
            const activeEl = listRef.current.querySelector(`[data-index="${highlightIndex}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightIndex, isOpen]);

    const triggerChange = (newVal) => {
        setInternalValue(newVal);
        if (onChange) {
            // Pass both standard event-like object (so `e.target.value` works)
            const syntheticEvent = {
                target: { name: name || '', value: newVal },
                currentTarget: { name: name || '', value: newVal },
                preventDefault: () => {},
                stopPropagation: () => {},
            };
            onChange(syntheticEvent);
        }
    };

    const handleSelect = (option) => {
        if (option.disabled) return;
        triggerChange(option.value);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        triggerChange('');
        setSearch('');
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightIndex]) {
                    handleSelect(filteredOptions[highlightIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearch('');
                break;
            case 'Tab':
                setIsOpen(false);
                setSearch('');
                break;
            default:
                break;
        }
    };

    // Height & padding styles based on size
    const sizeClasses = {
        sm: 'min-h-[34px] py-1 px-2.5 text-xs',
        md: 'min-h-[42px] py-2 px-3 text-[13px]',
        lg: 'min-h-[48px] py-2.5 px-3.5 text-sm',
    }[size] || 'min-h-[42px] py-2 px-3 text-[13px]';

    return (
        <div
            ref={containerRef}
            className={`select2-container relative inline-block w-full text-left font-sans select-none ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Native hidden select for form submission & HTML5 validation */}
            <select
                name={name}
                id={id}
                value={internalValue ?? ''}
                required={required}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only pointer-events-none absolute -bottom-1 left-2 h-0 w-0 opacity-0"
                onChange={() => {}}
            >
                <option value="">{placeholder}</option>
                {parsedOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Select2 Trigger Control */}
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`select2-control w-full flex items-center justify-between gap-2 bg-white rounded-lg border transition-all duration-150 outline-none text-left cursor-pointer ${sizeClasses} ${
                    isOpen
                        ? 'border-[#f47721] ring-3 ring-[rgba(244,119,33,0.2)] shadow-sm'
                        : 'border-[#94a3b8] hover:border-[#64748b]'
                } ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : 'text-[#0f172a]'}`}
            >
                <span className="select2-label-wrap truncate flex-1 flex items-center gap-1.5">
                    {selectedOption && selectedOption.value !== '' ? (
                        <>
                            <span className="font-semibold text-gray-900 truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.sublabel && (
                                <span className="text-xs text-gray-400 truncate">
                                    {selectedOption.sublabel}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400 font-normal">{placeholder}</span>
                    )}
                </span>

                <span className="flex items-center gap-1 shrink-0 ml-1">
                    {isClearable && !required && !disabled && selectedOption && selectedOption.value !== '' && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            title="Clear"
                            className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <i className="ti ti-x text-xs" />
                        </span>
                    )}
                    <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#f47721]' : ''}`}>
                        <i className="ti ti-chevron-down text-sm" />
                    </span>
                </span>
            </button>

            {/* Select2 Dropdown Menu */}
            {isOpen && (
                <div
                    className="select2-dropdown absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#e2e8f0] rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
                    style={{ minWidth: '100%' }}
                >
                    {/* Live Search Input Box */}
                    {isSearchable && (
                        <div className="p-2 border-b border-gray-100 bg-[#f8fafc]">
                            <div className="relative flex items-center">
                                <i className="ti ti-search absolute left-2.5 text-gray-400 text-xs pointer-events-none" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setHighlightIndex(0);
                                    }}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md outline-none focus:border-[#f47721] focus:ring-2 focus:ring-[rgba(244,119,33,0.15)] text-gray-800 transition-all placeholder:text-gray-400"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2 text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        <i className="ti ti-x" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Option List */}
                    <div
                        ref={listRef}
                        role="listbox"
                        className="select2-options-list max-h-56 overflow-y-auto p-1 divide-y divide-gray-50 scrollbar-thin"
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-400 italic">
                                <i className="ti ti-search-off mr-1" /> No options found
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = String(internalValue) === opt.value && opt.value !== '';
                                const isHighlighted = idx === highlightIndex;

                                return (
                                    <div
                                        key={opt.value || `empty-${idx}`}
                                        data-index={idx}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(opt)}
                                        onMouseEnter={() => setHighlightIndex(idx)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                                            opt.disabled
                                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                                : isSelected
                                                ? 'bg-[#fff0e6] text-[#f47721] font-bold'
                                                : isHighlighted
                                                ? 'bg-[#fff7f0] text-gray-900 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="truncate flex-1">
                                            <span className="block truncate">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="block text-[11px] font-normal text-gray-400 truncate">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <i className="ti ti-check text-[#f47721] text-xs font-bold ml-2 shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

