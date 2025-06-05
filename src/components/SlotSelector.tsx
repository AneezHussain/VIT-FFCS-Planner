import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { usePopper } from 'react-popper';

interface SlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedSlots: string[]) => void;
  referenceElement: HTMLElement | null;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
  isMorningTheory?: boolean;
  isFirstFaculty?: boolean;
  blockedSlots?: string[];
  slotConflictPairs?: string[][];
  preSelectedSlots?: string[];
}

const SlotSelector: React.FC<SlotSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  referenceElement,
  placement = 'bottom',
  isMorningTheory = false,
  isFirstFaculty = false,
  blockedSlots = [],
  slotConflictPairs = [],
  preSelectedSlots = []
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'preventOverflow', options: { padding: 8 } },
      { name: 'flip', options: { padding: 8 } }
    ],
  });

  // Initialize with preSelectedSlots when the component opens
  useEffect(() => {
    if (isOpen && preSelectedSlots.length > 0) {
      setSelectedSlots(preSelectedSlots);
    } else if (!isOpen) {
      setSelectedSlots([]); // Reset when closing
    }
  }, [isOpen, preSelectedSlots]);

  // Generate lab slots based on theory slot type
  const labSlots = isMorningTheory 
    ? Array.from({ length: 30 }, (_, i) => `L${i + 31}`) // L31-L60 for morning theory
    : Array.from({ length: 30 }, (_, i) => `L${i + 1}`);  // L1-L30 for evening theory

  const isSlotBlocked = (slot: string) => {
    if (!isFirstFaculty) return false;
    
    // Check if slot is directly blocked
    if (blockedSlots.includes(slot)) return true;

    // Check for conflicts with blocked slots
    for (const blockedSlot of blockedSlots) {
      const conflictPair = slotConflictPairs.find(pair => 
        (pair[0] === slot && pair[1] === blockedSlot) ||
        (pair[1] === slot && pair[0] === blockedSlot)
      );
      if (conflictPair) return true;
    }

    return false;
  };

  const toggleSlot = (slot: string) => {
    if (isSlotBlocked(slot)) return;

    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] z-[70]"
      >
        <div ref={setArrowElement} style={styles.arrow} className="popper-arrow" />
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Lab Slots</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Lab Slots Grid */}
          <div className="grid grid-cols-6 gap-2">
            {labSlots.map(slot => {
              const isCurrentlyBlocked = isSlotBlocked(slot);
              let buttonClasses = 'py-2 px-3 rounded-lg text-sm font-medium transition-all';
              let title = '';

              if (selectedSlots.includes(slot)) {
                buttonClasses += ' bg-black text-white';
              } else if (isCurrentlyBlocked) { // This implies isFirstFaculty
                buttonClasses += ' bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'; // Neutral disabled
                title = 'This slot is not available';
              } else {
                buttonClasses += ' bg-gray-100 text-gray-700 hover:bg-gray-200'; // Default available
              }

              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  disabled={isCurrentlyBlocked} // Disable if blocked (only happens for first faculty due to isSlotBlocked logic)
                  className={buttonClasses}
                  title={title}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelect(selectedSlots);
                onClose();
              }}
              disabled={selectedSlots.length === 0}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors
                ${selectedSlots.length > 0
                  ? 'bg-black' // Enabled: black background, no hover
                  : 'bg-gray-300 cursor-not-allowed' // Disabled: gray background
                }
              `}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlotSelector; 