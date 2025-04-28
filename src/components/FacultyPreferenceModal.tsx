import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoArrowBack } from 'react-icons/io5';
import { BiSolidUpvote, BiSolidDownvote } from 'react-icons/bi';

interface FacultyPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facultyPreferences: string[]) => void;
  courseName: string;
  initialFacultyPreferences?: string[];
}

const FacultyPreferenceModal: React.FC<FacultyPreferenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  initialFacultyPreferences = []
}) => {
  const [facultyName, setFacultyName] = useState('');
  const [facultyPreferences, setFacultyPreferences] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset or initialize form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFacultyName('');
      // Use initialFacultyPreferences if provided
      setFacultyPreferences(initialFacultyPreferences);
      setShowInput(true);
      setShowPreview(false);
    }
  }, [isOpen, initialFacultyPreferences]);

  // Show preview of next input when typing
  useEffect(() => {
    if (facultyName.trim().length > 0 && !showPreview) {
      setShowPreview(true);
    } else if (facultyName.trim().length === 0 && showPreview) {
      setShowPreview(false);
    }
  }, [facultyName]);

  // Focus input when showInput changes
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  // Debug log for initial faculty preferences
  useEffect(() => {
    if (isOpen) {
      console.log("Initial faculty preferences:", initialFacultyPreferences);
    }
  }, [isOpen, initialFacultyPreferences]);

  // Debug state changes
  useEffect(() => {
    console.log("Current facultyPreferences:", facultyPreferences);
    console.log("Current facultyName:", facultyName);
  }, [facultyPreferences, facultyName]);

  const handleAddFaculty = () => {
    if (facultyName.trim()) {
      console.log("Adding faculty:", facultyName.trim());
      setFacultyPreferences([...facultyPreferences, facultyName.trim()]);
      setFacultyName('');
      setShowInput(true);
      setShowPreview(false);
      // Focus on input after adding
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleRemoveFaculty = (index: number) => {
    setFacultyPreferences(facultyPreferences.filter((_, i) => i !== index));
  };

  const handleMoveFacultyUp = (index: number) => {
    if (index > 0) {
      const newPreferences = [...facultyPreferences];
      [newPreferences[index - 1], newPreferences[index]] = [newPreferences[index], newPreferences[index - 1]];
      setFacultyPreferences(newPreferences);
    }
  };

  const handleMoveFacultyDown = (index: number) => {
    if (index < facultyPreferences.length - 1) {
      const newPreferences = [...facultyPreferences];
      [newPreferences[index], newPreferences[index + 1]] = [newPreferences[index + 1], newPreferences[index]];
      setFacultyPreferences(newPreferences);
    }
  };

  const handleSubmit = () => {
    // First, check if there's a faculty name being typed
    if (facultyName.trim()) {
      // Add the current faculty name to the list
      const updatedPreferences = [...facultyPreferences, facultyName.trim()];
      console.log("Submitting with typed faculty added:", updatedPreferences);
      // Submit with the updated list that includes the currently typed faculty
      onSubmit(updatedPreferences);
    } else if (facultyPreferences.length > 0) {
      // Submit with existing faculty preferences
      console.log("Submitting existing faculty:", facultyPreferences);
      onSubmit(facultyPreferences);
    } else {
      // No faculty preferences
      console.log("Submitting with no faculty");
      onSubmit([]);
    }
  };

  const handleSkip = () => {
    onSubmit([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFaculty();
    }
  };

  // Extract slot name from courseName for display
  const slotDisplay = courseName.includes(' ') ? courseName.split(' ').pop() : '';
  const courseNameDisplay = courseName.includes(' ') ? courseName.split(' ').slice(0, -1).join(' ') : courseName;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-8 w-[550px] max-h-[90vh] overflow-y-auto z-10 relative shadow-xl">
        <div className="flex items-center mb-6">
          {/* Back button */}
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <IoArrowBack size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Faculty Details for "{courseNameDisplay}"</h2>
        
        <p className="text-center mb-8 text-gray-600">Selected slot: {slotDisplay}</p>

        {/* Faculty List */}
        <div className="mb-8 px-2">
          {facultyPreferences.map((faculty, index) => (
            <div key={index} className="flex items-center mb-5 relative">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                {index + 1}
              </div>
              <div className="flex-1 py-3 px-4 border border-gray-300 rounded-lg">
                {faculty}
              </div>
              <div className="ml-3 flex flex-col">
                <button
                  onClick={() => handleMoveFacultyUp(index)}
                  disabled={index === 0}
                  className={`p-1.5 transition-colors hover:bg-gray-100 rounded-sm ${
                    index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <BiSolidUpvote size={20} className="transition-transform hover:scale-110" />
                </button>
                <button
                  onClick={() => handleMoveFacultyDown(index)}
                  disabled={index === facultyPreferences.length - 1}
                  className={`p-1.5 transition-colors hover:bg-gray-100 rounded-sm ${
                    index === facultyPreferences.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <BiSolidDownvote size={20} className="transition-transform hover:scale-110" />
                </button>
              </div>
              <button
                onClick={() => handleRemoveFaculty(index)}
                className="ml-3 text-red-500 hover:text-red-700 transition-transform hover:scale-110"
              >
                <IoClose size={24} />
              </button>
            </div>
          ))}

          {/* Current Faculty Input - Always shown initially */}
          {showInput && (
            <div className="flex items-center mb-3 relative">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                {facultyPreferences.length + 1}
              </div>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => {
                    // Only add faculty if the blur isn't caused by clicking the confirm button
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (facultyName.trim() && (!relatedTarget || !relatedTarget.classList.contains('confirm-btn'))) {
                      handleAddFaculty();
                    }
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter faculty name"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {/* Preview of Next Faculty Input */}
          <div 
            className={`flex items-center mb-5 relative transition-all duration-300 ease-in-out ${
              showPreview ? 'opacity-100 max-h-20 translate-y-0' : 'opacity-0 max-h-0 -translate-y-4 overflow-hidden'
            }`}
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-400 font-medium mr-3">
              {facultyPreferences.length + 2}
            </div>
            <div className="flex-1 py-3 px-4 border border-dashed border-gray-200 rounded-lg text-gray-400">
              Next faculty...
            </div>
          </div>

          {/* Add Faculty Button - Only shown when input is hidden */}
          {!showInput && (
            <div 
              onClick={() => setShowInput(true)}
              className="w-full flex items-center justify-center py-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="text-gray-500">+ Add Another Faculty</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6 text-left text-sm px-2">
          Priority will be considered based on the order (1 being highest priority)
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          {initialFacultyPreferences && initialFacultyPreferences.length > 0 ? (
            // When editing (has initial preferences), show only Cancel/Confirm
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="confirm-btn px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                Confirm
              </button>
            </>
          ) : (
            // Normal flow for adding new faculty preferences
            <>
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className="confirm-btn px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyPreferenceModal; 