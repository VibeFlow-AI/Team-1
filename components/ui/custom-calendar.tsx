"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CustomCalendar({ 
  selected, 
  onSelect, 
  disabled = () => false, 
  className 
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get previous month's last days to fill the calendar
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDays = Array.from(
    { length: firstDayWeekday }, 
    (_, i) => prevMonthLastDay - firstDayWeekday + i + 1
  );
  
  // Get current month days
  const currentMonthDays = Array.from(
    { length: daysInMonth }, 
    (_, i) => i + 1
  );
  
  // Get next month days to fill remaining spots
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from(
    { length: remainingCells }, 
    (_, i) => i + 1
  );
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const handleDateClick = (day: number, isCurrentMonth: boolean = true) => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;
    
    if (!isCurrentMonth) {
      if (day > 15) { // Previous month
        targetMonth = currentMonth - 1;
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear = currentYear - 1;
        }
      } else { // Next month
        targetMonth = currentMonth + 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear = currentYear + 1;
        }
      }
    }
    
    const clickedDate = new Date(targetYear, targetMonth, day);
    
    if (!disabled(clickedDate)) {
      onSelect(clickedDate);
    }
  };
  
  const isDateSelected = (day: number, isCurrentMonth: boolean = true) => {
    if (!selected || !isCurrentMonth) return false;
    
    return selected.getDate() === day && 
           selected.getMonth() === currentMonth && 
           selected.getFullYear() === currentYear;
  };
  
  const isDateDisabled = (day: number, isCurrentMonth: boolean = true) => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;
    
    if (!isCurrentMonth) {
      if (day > 15) { // Previous month
        targetMonth = currentMonth - 1;
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear = currentYear - 1;
        }
      } else { // Next month
        targetMonth = currentMonth + 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear = currentYear + 1;
        }
      }
    }
    
    const date = new Date(targetYear, targetMonth, day);
    return disabled(date);
  };
  
  const isToday = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return false;
    
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };
  
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-4", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 hover:bg-blue-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month days */}
        {prevMonthDays.map(day => (
          <button
            key={`prev-${day}`}
            onClick={() => handleDateClick(day, false)}
            disabled={isDateDisabled(day, false)}
            className={cn(
              "h-10 w-10 text-sm rounded-md transition-colors",
              "text-gray-400 hover:bg-gray-100",
              isDateDisabled(day, false) && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {day}
          </button>
        ))}
        
        {/* Current month days */}
        {currentMonthDays.map(day => (
          <button
            key={`current-${day}`}
            onClick={() => handleDateClick(day, true)}
            disabled={isDateDisabled(day, true)}
            className={cn(
              "h-10 w-10 text-sm rounded-md transition-all duration-200 font-medium",
              "hover:bg-blue-50 hover:text-blue-600",
              isToday(day, true) && "bg-blue-100 text-blue-700 font-semibold",
              isDateSelected(day, true) && "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105",
              isDateDisabled(day, true) && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-900",
              !isDateDisabled(day, true) && !isDateSelected(day, true) && "hover:shadow-sm"
            )}
          >
            {day}
          </button>
        ))}
        
        {/* Next month days */}
        {nextMonthDays.map(day => (
          <button
            key={`next-${day}`}
            onClick={() => handleDateClick(day, false)}
            disabled={isDateDisabled(day, false)}
            className={cn(
              "h-10 w-10 text-sm rounded-md transition-colors",
              "text-gray-400 hover:bg-gray-100",
              isDateDisabled(day, false) && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {day}
          </button>
        ))}
      </div>
      
      {/* Selected date display */}
      {selected && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-gray-600 text-center">
            Selected: <span className="font-medium text-gray-900">
              {selected.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
} 