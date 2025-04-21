import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface SlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (slots: string[]) => void;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const regularSlots = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];
  const technicalSlots = ['TA1', 'TB1', 'TC1', 'TD1', 'TE1', 'TF1'];
  const advancedSlots = ['TAA1', 'TBB1', 'TCC1', 'TDD1'];

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[800px] max-w-[95%]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Select Theory Slots</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Regular Slots (A-G) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Regular Slots</h3>
          <div className="grid grid-cols-7 gap-3">
            {regularSlots.map(slot => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`
                  p-4 rounded-lg text-sm font-medium transition-all
                  ${selectedSlots.includes(slot)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Slots (TA-TF) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Technical Slots</h3>
          <div className="grid grid-cols-6 gap-3">
            {technicalSlots.map(slot => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`
                  p-4 rounded-lg text-sm font-medium transition-all
                  ${selectedSlots.includes(slot)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Technical Slots (TAA-TDD) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Technical Slots</h3>
          <div className="grid grid-cols-4 gap-3">
            {advancedSlots.map(slot => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`
                  p-4 rounded-lg text-sm font-medium transition-all
                  ${selectedSlots.includes(slot)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
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
              px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
              ${selectedSlots.length > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector; 