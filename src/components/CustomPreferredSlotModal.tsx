import React, { useState, useEffect } from 'react';
import { IoClose, IoArrowBack } from 'react-icons/io5';
import FacultyPreferenceModal from './FacultyPreferenceModal';

interface CustomPreferredSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseName: string; selectedSlots: string[]; credits: number; facultyPreferences?: string[] }) => void;
  existingSlots?: string[];
  editingCourse?: { name: string; slots: string[]; credits: number; facultyPreferences?: string[] };
  onTabChange?: (tab: 'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening') => void;
  activeTab?: 'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening';
}

const CustomPreferredSlotModal: React.FC<CustomPreferredSlotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingSlots = [],
  editingCourse = undefined,
  onTabChange,
  activeTab: externalActiveTab
}) => {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(3);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [slotText, setSlotText] = useState('');
  const [localActiveTab, setLocalActiveTab] = useState<'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening'>('theory-morning');
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [tempCourseData, setTempCourseData] = useState<{ courseName: string; selectedSlots: string[]; credits: number } | null>(null);

  // Use either external or local active tab
  const activeTab = externalActiveTab || localActiveTab;

  // Handle tab change, updating both local state and parent component if callback provided
  const handleTabChange = (tab: 'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening') => {
    setLocalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  // Slot patterns
  const morningTheorySlots = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'TA1', 'TB1', 'TC1', 'TD1', 'TE1', 'TF1', 'TG1', 'TAA1', 'TCC1'];
  const eveningTheorySlots = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'TA2', 'TB2', 'TC2', 'TD2', 'TE2', 'TF2', 'TAA2', 'TBB2', 'TCC2', 'TDD2'];
  const morningLabSlots = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30'];
  const eveningLabSlots = ['L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37', 'L38', 'L39', 'L40', 'L41', 'L42', 'L43', 'L44', 'L45', 'L46', 'L47', 'L48', 'L49', 'L50', 'L51', 'L52', 'L53', 'L54', 'L55', 'L56', 'L57', 'L58', 'L59', 'L60'];

  // Define slot conflicts as pairs of conflicting slots
  const slotConflictPairs = [
    // Monday conflicts
    ['A1', 'L1'], ['F1', 'L2'], ['D1', 'L3'], ['TB1', 'L4'], ['TG1', 'L5'],
    ['A2', 'L31'], ['F2', 'L32'], ['D2', 'L33'], ['TB2', 'L34'], ['TG2', 'L35'],
    
    // Tuesday conflicts
    ['B1', 'L7'], ['G1', 'L8'], ['E1', 'L9'], ['TC1', 'L10'], ['TAA1', 'L11'],
    ['B2', 'L37'], ['G2', 'L38'], ['E2', 'L39'], ['TC2', 'L40'], ['TAA2', 'L41'],
    
    // Wednesday conflicts
    ['C1', 'L13'], ['A1', 'L14'], ['F1', 'L15'],
    ['C2', 'L43'], ['A2', 'L44'], ['F2', 'L45'], ['TD2', 'L46'], ['TBB2', 'L47'],
    
    // Thursday conflicts
    ['D1', 'L19'], ['B1', 'L20'], ['G1', 'L21'], ['TE1', 'L22'], ['TCC1', 'L23'],
    ['D2', 'L49'], ['B2', 'L50'], ['G2', 'L51'], ['TE2', 'L52'], ['TCC2', 'L53'],
    
    // Friday conflicts
    ['E1', 'L25'], ['C1', 'L26'], ['TA1', 'L27'], ['TF1', 'L28'], ['TD1', 'L29'],
    ['E2', 'L55'], ['C2', 'L56'], ['TA2', 'L57'], ['TF2', 'L58'], ['TDD2', 'L59']
  ];

  // Create a map for quick lookup of conflicting slots
  const slotConflictsMap = new Map<string, string[]>();
  
  // Populate the map with conflicting slots (bidirectional)
  slotConflictPairs.forEach(([slot1, slot2]) => {
    // For slot1, add slot2 as a conflicting slot
    const slot1Conflicts = slotConflictsMap.get(slot1) || [];
    slotConflictsMap.set(slot1, [...slot1Conflicts, slot2]);
    
    // For slot2, add slot1 as a conflicting slot
    const slot2Conflicts = slotConflictsMap.get(slot2) || [];
    slotConflictsMap.set(slot2, [...slot2Conflicts, slot1]);
  });

  // Reset form or populate with editing data when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        // Populate form with editing data
        setCourseName(editingCourse.name);
        setSelectedSlots(editingCourse.slots);
        setCredits(editingCourse.credits);
        setSlotText(editingCourse.slots.join('+'));
      } else {
        // Reset form for new entry
        setCourseName('');
        setSelectedSlots([]);
        setCredits(3);
        setSlotText('');
      }
      setTempCourseData(null);
      
      // Don't override the active tab if it's controlled externally
      if (!externalActiveTab) {
        setLocalActiveTab('theory-morning');
      }
    }
  }, [isOpen, editingCourse, externalActiveTab]);

  // Function to parse slot text and identify valid slots
  const parseSlotText = (text: string) => {
    // Split the input by + or space or comma
    const inputSlots = text.split(/[+\s,]+/).filter(Boolean);
    const allValidSlots = [...morningTheorySlots, ...eveningTheorySlots, ...morningLabSlots, ...eveningLabSlots];
    
    // Filter to get only valid slots
    const validSlots = inputSlots.filter(slot => allValidSlots.includes(slot));
    
    // Update the selected slots
    setSelectedSlots(validSlots);
  };

  // Toggle slot selection
  const toggleSlot = (slot: string) => {
    // Don't allow selecting already taken slots, unless it's part of the course being edited
    if (isSlotTaken(slot) && !(editingCourse && editingCourse.slots.includes(slot))) return;
    
    const newSelectedSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter(s => s !== slot)
      : [...selectedSlots, slot];
    
    setSelectedSlots(newSelectedSlots);
    setSlotText(newSelectedSlots.join('+'));
  };

  // Check if a slot is already taken or has a theory-lab conflict
  const isSlotTaken = (slot: string) => {
    // If we're editing a course, don't consider its own slots as taken
    if (editingCourse && editingCourse.slots.includes(slot)) {
      return false;
    }

    // Check if the slot is already taken by another course
    if (existingSlots.includes(slot)) {
      return true;
    }

    // Check if any conflicting slot is already taken or selected
    const conflictingSlots = slotConflictsMap.get(slot) || [];
    for (const conflictSlot of conflictingSlots) {
      // Check if a conflicting slot is already selected in this course
      if (selectedSlots.includes(conflictSlot) && !(editingCourse && editingCourse.slots.includes(conflictSlot))) {
        return true;
      }

      // Check if a conflicting slot is already taken in other courses
      if (existingSlots.includes(conflictSlot)) {
        return true;
      }
    }
    
    return false;
  };

  // Handle course details submission
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

  // Handle faculty preference submission
  const handleFacultyPreferenceSubmit = (facultyPreferences: string[]) => {
    if (tempCourseData) {
      // Submit with faculty preferences
      onSubmit({
        ...tempCourseData,
        facultyPreferences
      });
      
      // Reset states and close modals
      setTempCourseData(null);
      setIsFacultyModalOpen(false);
      onClose();
    }
  };

  // Handle skip faculty
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
      
      // Close modal
      onClose();
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    onClose();
  };

  // Handle faculty modal close
  const handleFacultyModalClose = () => {
    setIsFacultyModalOpen(false);
    setTempCourseData(null);
  };

  if (!isOpen) return null;

  // Get slot rows based on the active tab
  const getSlotRows = () => {
    let slots = [];
    switch (activeTab) {
      case 'theory-morning':
        slots = morningTheorySlots;
        break;
      case 'theory-evening':
        slots = eveningTheorySlots;
        break;
      case 'lab-morning':
        slots = morningLabSlots;
        break;
      case 'lab-evening':
        slots = eveningLabSlots;
        break;
    }
    
    // Create rows of 5 slots each for consistent layout
    const rows = [];
    for (let i = 0; i < slots.length; i += 5) {
      rows.push(slots.slice(i, i + 5));
    }
    return rows;
  };

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isFacultyModalOpen ? 'hidden' : ''}`}>
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

          {/* Slot Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Pattern (e.g., A1+TG1)
            </label>
            <input
              type="text"
              value={slotText}
              onChange={(e) => {
                setSlotText(e.target.value);
                parseSlotText(e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter slot pattern (e.g., A1+TG1)"
            />
          </div>

          {/* Slot Category Tabs */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => handleTabChange('theory-morning')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'theory-morning'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Theory Morning
                </button>
                <button
                  onClick={() => handleTabChange('theory-evening')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'theory-evening'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Theory Evening
                </button>
                <button
                  onClick={() => handleTabChange('lab-morning')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'lab-morning'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lab Morning
                </button>
                <button
                  onClick={() => handleTabChange('lab-evening')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                    activeTab === 'lab-evening'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lab Evening
                </button>
              </nav>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="mb-6">
            {getSlotRows().map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 mb-2">
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

export default CustomPreferredSlotModal; 