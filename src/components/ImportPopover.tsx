import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFile } from 'react-icons/ai';

interface ImportPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

const ImportPopover: React.FC<ImportPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging
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
      <div className="bg-white rounded-xl w-96 border border-gray-200 shadow-lg">
        <div className="absolute -top-1 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        <div className="px-6 py-8 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Import FFCS Data</h3>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
                ${isDragging 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 hover:border-black'
                }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center">
                <AiOutlineFile className={`h-8 w-8 mb-2 transition-colors duration-200 ${isDragging ? 'text-black' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  or
                </p>
                <label 
                  htmlFor="csv-file-input"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 cursor-pointer text-sm font-medium transition-colors duration-200"
                >
                  Browse Files
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 text-center">
            Only CSV files that were previously exported from this application are supported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportPopover; 