import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';
import FacultyPreferenceModal from './FacultyPreferenceModal';

interface CourseSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseName: string; selectedSlots: string[]; credits: number; facultyPreferences?: string[] }) => void;
  preferredSlot: 'morning' | 'evening';
  existingSlots?: string[]; // Add this prop to track already selected slots
  editingCourse?: { name: string; slots: string[]; credits: number; facultyPreferences?: string[] }; // Add prop for editing
}

const CourseSlotSelector: React.FC<CourseSlotSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  preferredSlot,
  existingSlots = [], // Default to empty array if not provided
  editingCourse = undefined // Default to undefined if not provided
}) => {
  const [courseName, setCourseName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [credits, setCredits] = useState(3); // Default to 3 credits
  const [isLabSlotsOpen, setIsLabSlotsOpen] = useState(false);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [tempCourseData, setTempCourseData] = useState<{courseName: string; selectedSlots: string[]; credits: number} | null>(null);

  // Reset form or populate with editing data when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        // Populate form with editing data
        setCourseName(editingCourse.name);
        setSelectedSlots(editingCourse.slots);
        setCredits(editingCourse.credits);
      } else {
        // Reset form for new entry
        setCourseName('');
        setSelectedSlots([]);
        setCredits(3);
      }
      setTempCourseData(null);
    }
  }, [isOpen, editingCourse]);

  const morningTheorySlotRows = [
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'],
    ['TA1', 'TB1', 'TC1', 'TD1', 'TE1', 'TF1', 'TG1'],
    ['TAA1', 'TCC1']
  ];

  const eveningTheorySlotRows = [
    ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'],
    ['TA2', 'TB2', 'TC2', 'TD2', 'TE2', 'TF2'],
    ['TAA2', 'TBB2', 'TCC2', 'TDD2']
  ];

  const firstHalfLabSlots = [
    ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'],
    ['L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14'],
    ['L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21'],
    ['L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30']
  ];

  const secondHalfLabSlots = [
    ['L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37'],
    ['L38', 'L39', 'L40', 'L41', 'L42', 'L43', 'L44'],
    ['L45', 'L46', 'L47', 'L48', 'L49', 'L50', 'L51'],
    ['L52', 'L53', 'L54', 'L55', 'L56', 'L57', 'L58', 'L59', 'L60']
  ];

  const theorySlotRows = preferredSlot === 'morning' ? morningTheorySlotRows : eveningTheorySlotRows;
  const labSlotRows = preferredSlot === 'morning' ? secondHalfLabSlots : firstHalfLabSlots;

  const toggleSlot = (slot: string) => {
    // Don't allow selecting already taken slots, unless it's part of the course being edited
    if (isSlotTaken(slot) && !(editingCourse && editingCourse.slots.includes(slot))) return;
    
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  // Function to check if a slot is already taken in other courses
  const isSlotTaken = (slot: string) => {
    // If we're editing a course, don't consider its own slots as taken
    if (editingCourse && editingCourse.slots.includes(slot)) {
      return false;
    }
    return existingSlots.includes(slot);
  };

  const handleCourseDetailSubmit = () => {
    if (courseName && selectedSlots.length > 0) {
      // Store course data and open faculty modal
      setTempCourseData({
        courseName,
        selectedSlots,
        credits
      });
      setIsFacultyModalOpen(true);
    }
  };

  const handleSkipFaculty = () => {
    if (courseName && selectedSlots.length > 0) {
      // Submit course without faculty preferences
      // For editing, preserve existing faculty preferences if available
      onSubmit({
        courseName,
        selectedSlots,
        credits,
        facultyPreferences: editingCourse?.facultyPreferences || []
      });
      
      // Reset states and close modal
      resetForm();
      onClose();
    }
  };

  const handleFacultyPreferenceSubmit = (facultyPreferences: string[]) => {
    if (tempCourseData) {
      // Submit the complete data including faculty preferences
      onSubmit({
        ...tempCourseData,
        facultyPreferences
      });
      
      // Reset states
      resetForm();
      setIsFacultyModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    // Just close without saving any changes
    resetForm();
    onClose();
  };

  const handleFacultyModalClose = () => {
    // Close faculty modal without saving changes
    setIsFacultyModalOpen(false);
    setTempCourseData(null);
  };

  const resetForm = () => {
    setCourseName('');
    setSelectedSlots([]);
    setCredits(3);
    setTempCourseData(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm" onClick={handleCloseModal}></div>
        <div className="bg-white rounded-2xl p-6 w-[800px] max-h-[90vh] overflow-y-auto z-10 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Enter Course Details</h2>
            <button 
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Course Name and Credits Input */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter course name"
              />
            </div>
            
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setCredits(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l-lg transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center border-x border-gray-300 py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max="5"
                />
                <button
                  onClick={() => setCredits(prev => Math.min(5, prev + 1))}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Theory Slots Grid */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theory Slots
            </label>
            <div className="space-y-2">
              {theorySlotRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  {row.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      disabled={isSlotTaken(slot)}
                      className={`
                        flex-1 p-3 rounded-lg text-sm font-medium transition-all
                        ${selectedSlots.includes(slot)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isSlotTaken(slot)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-70'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Lab Slots Section */}
          <div className="mb-6">
            <button
              onClick={() => setIsLabSlotsOpen(!isLabSlotsOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 hover:text-gray-900"
            >
              <span>Lab Slots</span>
              {isLabSlotsOpen ? (
                <IoChevronUpOutline className="h-5 w-5" />
              ) : (
                <IoChevronDownOutline className="h-5 w-5" />
              )}
            </button>
            
            {/* Lab Slots Grid - Collapsible */}
            <div className={`space-y-2 transition-all duration-300 ${isLabSlotsOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {labSlotRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  {row.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      disabled={isSlotTaken(slot)}
                      className={`
                        flex-1 p-3 rounded-lg text-sm font-medium transition-all
                        ${selectedSlots.includes(slot)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isSlotTaken(slot)
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-70'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {editingCourse ? (
              // Show only confirm/cancel when editing
              <>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSkipFaculty()}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Confirm
                </button>
              </>
            ) : (
              // Show regular options for new course creation
              <>
                <button
                  onClick={handleSkipFaculty}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-4 py-3 text-sm font-medium transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Skip Faculty
                </button>
                <button
                  onClick={handleCourseDetailSubmit}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Add Faculty
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Preference Modal */}
      {tempCourseData && (
        <FacultyPreferenceModal
          isOpen={isFacultyModalOpen}
          onClose={handleFacultyModalClose}
          onSubmit={handleFacultyPreferenceSubmit}
          courseName={`${tempCourseData.courseName} ${tempCourseData.selectedSlots.join('+')}`}
          initialFacultyPreferences={editingCourse?.facultyPreferences || []}
        />
      )}
    </>
  );
};

export default CourseSlotSelector; 