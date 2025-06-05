import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import CourseSlotSelector from './CourseSlotSelector';

interface TimeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { semester: string; timing: 'morning' | 'evening' }) => void;
  existingSlots?: string[];
}

const TimeTableModal: React.FC<TimeTableModalProps> = ({ isOpen, onClose, onSubmit, existingSlots = [] }) => {
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [isMorningSlot, setIsMorningSlot] = useState(true);

  const handleSlotSubmit = (data: { courseName: string; selectedSlots: string[]; credits: number }) => {
    console.log('Selected course and slots:', data);
    setShowSlotSelector(false);
    // Handle the course and slot selection here
  };

  if (!isOpen) return null;

  if (showSlotSelector) {
    return (
      <CourseSlotSelector
        isOpen={true}
        onClose={() => setShowSlotSelector(false)}
        onSubmit={handleSlotSubmit}
        existingSlots={existingSlots}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Choose Your Preferences</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Semester Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter semester name"
          />
        </div>

        {/* Theory Slot Selection */}
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Choose Your Preferred Theory Slot Timings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Morning Theory */}
            <button
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              onClick={() => {
                setIsMorningSlot(true);
                setShowSlotSelector(true);
              }}
            >
              <BsSun className="text-4xl text-yellow-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900">Morning Theory</h4>
              <p className="text-sm text-gray-600 mt-2 text-center">
                A1, B1, C1... (8 AM - 12:50 PM)
              </p>
            </button>

            {/* Evening Theory */}
            <button
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              onClick={() => {
                setIsMorningSlot(false);
                setShowSlotSelector(true);
              }}
            >
              <BsMoonStars className="text-4xl text-blue-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900">Evening Theory</h4>
              <p className="text-sm text-gray-600 mt-2 text-center">
                A2, B2, C2... (2 PM - 6:50 PM)
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableModal; 