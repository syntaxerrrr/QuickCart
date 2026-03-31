import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
};

export const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const CustomDatePicker = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(parseLocalDate(value));

    useEffect(() => {
        if (isOpen) {
            setViewDate(parseLocalDate(value));
        }
    }, [value, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day: number) => {
        const yyyy = viewDate.getFullYear();
        const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-sm font-bold text-gray-900 dark:text-white transition-all cursor-pointer shadow-sm"
            >
                <Calendar size={16} className={value ? "text-green-600 dark:text-green-500" : "text-gray-400"} />
                {value ? parseLocalDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'All Dates'}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 p-4 w-72 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors cursor-pointer">
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setViewDate(new Date())}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer"
                                title="Go to current month"
                            >
                                <Clock size={14} />
                            </button>
                            {(() => {
                                const isNextMonthFuture = viewDate.getFullYear() > new Date().getFullYear() || (viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() >= new Date().getMonth());
                                return (
                                    <button
                                        onClick={handleNextMonth}
                                        disabled={isNextMonthFuture}
                                        className={`p-1.5 rounded-lg transition-colors ${isNextMonthFuture
                                            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
                                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                            const isSelected = value === `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isToday = new Date().toDateString() === cellDate.toDateString();

                            const todayTimestamp = new Date();
                            todayTimestamp.setHours(0, 0, 0, 0);
                            const cellTimestamp = new Date(cellDate);
                            cellTimestamp.setHours(0, 0, 0, 0);
                            const isFuture = cellTimestamp > todayTimestamp;

                            return (
                                <button
                                    key={day}
                                    onClick={() => !isFuture && handleSelectDate(day)}
                                    disabled={isFuture}
                                    title={cellDate.toLocaleDateString()}
                                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isFuture
                                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
                                        : isSelected
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md scale-105 cursor-pointer'
                                            : isToday
                                                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:font-bold cursor-pointer'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                        <button
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-2 py-1"
                        >
                            Clear Filter
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const yyyy = today.getFullYear();
                                const mm = String(today.getMonth() + 1).padStart(2, '0');
                                const dd = String(today.getDate()).padStart(2, '0');
                                onChange(`${yyyy}-${mm}-${dd}`);
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors cursor-pointer px-2 py-1"
                        >
                            Go to Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
