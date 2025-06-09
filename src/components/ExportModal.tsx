import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDownload, AiOutlineCalendar } from 'react-icons/ai';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportDataToCSV: (userName?: string, message?: string) => void;
  defaultUserName?: string;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  darkMode?: boolean;
  downloadTimeTable?: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  exportDataToCSV,
  defaultUserName = '',
  triggerRef,
  darkMode = false,
  downloadTimeTable
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Handle visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Calculate position based on trigger button location
  useEffect(() => {
    if (isOpen && triggerRef?.current && modalRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + 10,
        right: window.innerWidth - triggerRect.right
      });
    }
  }, [isOpen, triggerRef]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) && 
        triggerRef?.current !== event.target && 
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleSaveToComputer = () => {
    exportDataToCSV(defaultUserName);
    onClose();
  };

  const handleDownloadTimeTable = () => {
    if (downloadTimeTable) {
      downloadTimeTable();
      onClose();
    }
  };

  return (
    <div 
      ref={modalRef}
      className={`fixed z-50 transition-all duration-200 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="bg-white rounded-xl w-72 border border-gray-200 shadow-lg">
        <div className="absolute -top-1 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        <div className="px-4 py-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>
          <button
            onClick={handleSaveToComputer}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors duration-200"
          >
            <AiOutlineDownload className="h-5 w-5" />
            <span>Download CSV</span>
          </button>
          
          <button
            onClick={handleDownloadTimeTable}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200"
          >
            <AiOutlineCalendar className="h-5 w-5" />
            <span>Download Timetable</span>
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 text-center">
            Share your timetable with friends or import their CSV to collaborate!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 