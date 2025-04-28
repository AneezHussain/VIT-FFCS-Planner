import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';
import { FaWhatsapp } from 'react-icons/fa';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportDataToCSV: (userName?: string, message?: string) => string | Blob;
  defaultUserName?: string;
  triggerRef?: React.RefObject<HTMLButtonElement>; // Reference to the button that triggered the modal
  darkMode?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  exportDataToCSV,
  defaultUserName = '',
  triggerRef,
  darkMode = false
}) => {
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position based on trigger button location
  useEffect(() => {
    if (isOpen && triggerRef?.current && modalRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      // Position below and to the right of the trigger button
      setPosition({
        top: triggerRect.bottom + window.scrollY + 10, // 10px gap
        right: window.innerWidth - triggerRect.right - window.scrollX
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

  if (!isOpen) return null;

  const handleSaveToComputer = () => {
    exportDataToCSV(defaultUserName, message);
    onClose();
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsSharing(true);
      
      // Create a text message
      const shareText = encodeURIComponent(message || 'Here is my FFCS schedule');
      
      // Open WhatsApp with the message
      window.open(`https://wa.me/?text=${shareText}`, '_blank');
      
      onClose();
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      alert('Failed to share via WhatsApp.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div 
      ref={modalRef}
      className="fixed z-50 shadow-xl rounded-xl"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className={`modal-content w-80 overflow-hidden`}>
        <div className="modal-header flex justify-between items-center p-4">
          <h3 className="text-lg font-medium">
            Export Data
          </h3>
          <button 
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="message" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`form-input w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all h-20 resize-none ${darkMode ? 'focus:border-primary-400' : 'focus:border-primary-500'}`}
              placeholder="Add a message to be included with your export"
            />
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This message will be included with your CSV data and when sharing.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSaveToComputer}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${darkMode 
                ? 'bg-primary-700 text-white hover:bg-primary-600' 
                : 'bg-primary-500/20 text-primary-700 hover:bg-primary-500/30'}`}
            >
              <AiOutlineDownload size={18} />
              <span>Save to Computer</span>
            </button>
            
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-system-green text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={isSharing}
            >
              <FaWhatsapp size={18} />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 