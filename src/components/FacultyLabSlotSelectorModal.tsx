import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';

interface FacultyLabSlotSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedSlots: string[]) => void;
  anchorElement: HTMLElement | null;
  availableLabSlots: string[];
  currentSelectedSlots: string[];
  facultyName: string;
  externallyBlockedSlots: string[];
  isFirstFaculty: boolean;
  slotConflictPairs: string[][];
}

const FacultyLabSlotSelectorModal: React.FC<FacultyLabSlotSelectorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  anchorElement,
  availableLabSlots,
  currentSelectedSlots,
  facultyName,
  externallyBlockedSlots,
  isFirstFaculty,
  slotConflictPairs
}) => {
  const [selectedSlotsInPopup, setSelectedSlotsInPopup] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Create slotConflictsMap from slotConflictPairs
  const slotConflictsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    slotConflictPairs.forEach(([slot1, slot2]) => {
      map.set(slot1, [...(map.get(slot1) || []), slot2]);
      map.set(slot2, [...(map.get(slot2) || []), slot1]);
    });
    return map;
  }, [slotConflictPairs]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlotsInPopup(currentSelectedSlots);
    }
  }, [isOpen, currentSelectedSlots]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && anchorElement !== event.target && !anchorElement?.contains(event.target as Node)) {
        // onClose(); // Removed this line to prevent closing on outside click
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorElement]);
  
  // Calculate position
  const getModalStyle = (): React.CSSProperties => {
    if (!anchorElement || !modalRef.current) return { display: 'none' };

    const anchorRect = anchorElement.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();
    
    let top = anchorRect.top + window.scrollY;
    let left = anchorRect.right + window.scrollX + 5; // 5px to the right

    // Adjust if modal goes off screen
    if (left + modalRect.width > window.innerWidth) {
      left = anchorRect.left + window.scrollX - modalRect.width - 5; // 5px to the left
    }
    if (top + modalRect.height > window.innerHeight + window.scrollY) {
      top = window.innerHeight + window.scrollY - modalRect.height - 5;
    }
     if (top < window.scrollY) {
      top = window.scrollY + 5;
    }


    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 100, // Ensure it's above other elements
    };
  };


  const toggleSlotSelection = (slot: string) => {
    setSelectedSlotsInPopup(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedSlotsInPopup);
    onClose();
  };

  if (!isOpen || !anchorElement) return null;

  // Create rows of 5 slots for display
  const slotRows: string[][] = [];
  for (let i = 0; i < availableLabSlots.length; i += 5) {
    slotRows.push(availableLabSlots.slice(i, i + 5));
  }

  return (
    <div ref={modalRef} style={getModalStyle()} className="bg-white rounded-lg shadow-xl border border-gray-200 w-96">
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-800">
          Select Lab Slots for {facultyName}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <IoClose size={20} />
        </button>
      </div>
      <div className="p-3 max-h-60 overflow-y-auto">
        {slotRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 mb-1">
            {row.map(slot => {
              const isSelected = selectedSlotsInPopup.includes(slot);
              
              // Enhanced isExternallyBlocked check
              let actualExternallyBlocked = externallyBlockedSlots.includes(slot);
              if (!actualExternallyBlocked) {
                const conflictingSlots = slotConflictsMap.get(slot) || [];
                for (const conflict of conflictingSlots) {
                  if (externallyBlockedSlots.includes(conflict)) {
                    actualExternallyBlocked = true;
                    break;
                  }
                }
              }

              let isDisabled = false;
              let buttonStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300'; // Default

              if (isSelected) {
                buttonStyle = 'bg-blue-600 text-white hover:bg-blue-700';
              } else if (isFirstFaculty) {
                if (actualExternallyBlocked) { // Use the enhanced check
                  isDisabled = true;
                  buttonStyle = 'bg-red-200 text-red-700 cursor-not-allowed opacity-70 line-through';
                } else {
                  buttonStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                }
              } else { // For other faculty
                if (actualExternallyBlocked) { // Use the enhanced check
                  buttonStyle = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'; 
                } else {
                  buttonStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                }
              }

              return (
                <button
                  key={slot}
                  onClick={() => toggleSlotSelection(slot)}
                  disabled={isDisabled}
                  className={`
                    flex-1 py-2 px-1 text-xs rounded-md transition-all
                    ${buttonStyle}
                  `}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
        >
          Confirm Slots
        </button>
      </div>
    </div>
  );
};

export default FacultyLabSlotSelectorModal; 