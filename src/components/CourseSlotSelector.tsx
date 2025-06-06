import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import FacultyPreferenceModal from './FacultyPreferenceModal';

// Define slot conflicts here or import from a shared utility
const slotConflictPairs = [
  // Monday conflicts
  ['A1', 'L1'], ['F1', 'L2'], ['D1', 'L3'], ['TB1', 'L4'], ['TG1', 'L5'], ['L6', 'B1'], // B1-L6 conflict added as an example if needed
  ['A2', 'L31'], ['F2', 'L32'], ['D2', 'L33'], ['TB2', 'L34'], ['TG2', 'L35'], ['L36', 'B2'], // B2-L36 conflict

  // Tuesday conflicts
  ['B1', 'L7'], ['G1', 'L8'], ['E1', 'L9'], ['TC1', 'L10'], ['TAA1', 'L11'], ['L12', 'C1'],
  ['B2', 'L37'], ['G2', 'L38'], ['E2', 'L39'], ['TC2', 'L40'], ['TAA2', 'L41'], ['L42', 'C2'],

  // Wednesday conflicts
  ['C1', 'L13'], ['A1', 'L14'], ['F1', 'L15'], ['D1', 'L16'], ['TB1', 'L17'], ['L18', 'G1'],
  ['C2', 'L43'], ['A2', 'L44'], ['F2', 'L45'], ['D2', 'L46'], ['TB2', 'L47'], ['L48', 'G2'],

  // Thursday conflicts
  ['D1', 'L19'], ['B1', 'L20'], ['G1', 'L21'], ['E1', 'L22'], ['TC1', 'L23'], ['L24', 'A1'],
  ['D2', 'L49'], ['B2', 'L50'], ['G2', 'L51'], ['E2', 'L52'], ['TC2', 'L53'], ['L54', 'A2'],

  // Friday conflicts
  ['E1', 'L25'], ['C1', 'L26'], ['TA1', 'L27'], ['TF1', 'L28'], ['TD1', 'L29'], ['L30', 'F1'],
  ['E2', 'L55'], ['C2', 'L56'], ['TA2', 'L57'], ['TF2', 'L58'], ['TDD2', 'L59'], ['L60', 'F2']
  // Ensure all theory slots that have labs are covered, and lab slots too if they can be primary.
];

const slotConflictsMap = new Map<string, string[]>();
slotConflictPairs.forEach(([slot1, slot2]) => {
  const slot1Conflicts = slotConflictsMap.get(slot1) || [];
  slotConflictsMap.set(slot1, [...slot1Conflicts, slot2]);
  const slot2Conflicts = slotConflictsMap.get(slot2) || [];
  slotConflictsMap.set(slot2, [...slot2Conflicts, slot1]);
});

// --- Slot Association Logic (Module Level) ---
const morningTheorySlotsConst = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'TA1', 'TB1', 'TC1', 'TD1', 'TE1', 'TF1', 'TG1', 'TAA1', 'TCC1'];
const eveningTheorySlotsConst = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'TA2', 'TB2', 'TC2', 'TD2', 'TE2', 'TF2', 'TAA2', 'TBB2', 'TCC2', 'TDD2'];

const getAssociatedSlots = (primarySlot: string, availableTheorySlots: string[]): string[] => {
  const associates: string[] = [];
  if (primarySlot.length < 2 || primarySlot.length > 3) return associates;

  const baseLetter = primarySlot[0];
  if (!/^[A-G]$/.test(baseLetter)) return associates;

  const firstAssociatePattern = `T${primarySlot}`;
  if (availableTheorySlots.includes(firstAssociatePattern)) {
    associates.push(firstAssociatePattern);
  }

  const secondAssociatePattern = `T${baseLetter}${primarySlot}`;
  if (availableTheorySlots.includes(secondAssociatePattern)) {
    if (!associates.includes(secondAssociatePattern)) {
      associates.push(secondAssociatePattern);
    }
  }
  return associates;
};

const primaryMorningSlotsList = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];
const morningSlotAssociations = new Map<string, string[]>();
primaryMorningSlotsList.forEach(ps => {
  morningSlotAssociations.set(ps, getAssociatedSlots(ps, morningTheorySlotsConst));
});

const primaryEveningSlotsList = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'];
const eveningSlotAssociations = new Map<string, string[]>();
primaryEveningSlotsList.forEach(ps => {
  eveningSlotAssociations.set(ps, getAssociatedSlots(ps, eveningTheorySlotsConst));
});
// --- End Slot Association Logic ---

interface CourseSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    courseName: string;
    selectedSlots: string[];
    credits: number;
    facultyPreferences?: string[];
    includeLabCourse?: boolean;
    facultyLabAssignments?: Map<string, string[]>;
  }) => void;
  existingSlots?: string[]; // Add this prop to track already selected slots
  editingCourse?: { name: string; slots: string[]; credits: number; facultyPreferences?: string[]; facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }> }; // Add prop for editing
  referenceElement?: HTMLElement;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  isMorningTheory?: boolean;
  isFirstFaculty?: boolean;
  blockedSlots?: string[];
  slotConflictPairs?: string[][];
  preSelectedSlots?: string[];
}

const CourseSlotSelector: React.FC<CourseSlotSelectorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingSlots = [], // Default to empty array if not provided
  editingCourse = undefined, // Default to undefined if not provided
  referenceElement,
  placement = 'bottom',
  isMorningTheory = false,
  isFirstFaculty = false,
  blockedSlots = [],
  slotConflictPairs = [],
  preSelectedSlots = []
}) => {
  const [courseName, setCourseName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [credits, setCredits] = useState(0); // Default to 0 credits
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [tempCourseData, setTempCourseData] = useState<{courseName: string; selectedSlots: string[]; credits: number} | null>(null);
  const [transientFacultyPreferences, setTransientFacultyPreferences] = useState<string[] | undefined>(undefined);
  const [transientLabAssignments, setTransientLabAssignments] = useState<Map<string, string[]> | undefined>(undefined);
  const [activeTimingTab, setActiveTimingTab] = useState<'morning' | 'evening'>('morning'); // New state for tabs
  const [creditInputString, setCreditInputString] = useState('0'); // New state for credit input text
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  // Use the constants for slot patterns
  const morningTheorySlots = morningTheorySlotsConst;
  const eveningTheorySlots = eveningTheorySlotsConst;

  useEffect(() => {
    if (isOpen && !isFacultyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, isFacultyModalOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        setCourseName(editingCourse.name);
        setSelectedSlots(editingCourse.slots);
        setCredits(editingCourse.credits);
        setCreditInputString(editingCourse.credits.toString());
        setTransientFacultyPreferences(editingCourse.facultyPreferences || []);
        if (editingCourse.facultyLabAssignments) {
          const labAssignmentsMap = new Map<string, string[]>();
          editingCourse.facultyLabAssignments.forEach(assignment => {
            labAssignmentsMap.set(assignment.facultyName, assignment.slots);
          });
          setTransientLabAssignments(labAssignmentsMap);
        } else {
          setTransientLabAssignments(undefined);
        }
      } else {
        setCourseName('');
        setSelectedSlots([]);
        setCredits(0);
        setCreditInputString('0');
        setTransientFacultyPreferences(undefined);
        setTransientLabAssignments(undefined);
      }
      setTempCourseData(null);
    }
  }, [isOpen, editingCourse]);

  useEffect(() => {
    if (activeTimingTab === 'morning') {
      setSelectedSlots(prevSlots => prevSlots.filter(slot => morningTheorySlots.includes(slot)));
    } else {
      setSelectedSlots(prevSlots => prevSlots.filter(slot => eveningTheorySlots.includes(slot)));
    }
  }, [activeTimingTab, morningTheorySlots, eveningTheorySlots]);

  const handleForceClose = () => {
    setIsFacultyModalOpen(false);
    onClose();
  };

  const handleCloseModal = () => {
    // Just close without saving any changes
    resetForm(); // This will also clear transients
    onClose();
  };

  const toggleSlot = (slot: string) => {
    if (isSlotTaken(slot) && !(editingCourse && editingCourse.slots.includes(slot))) return;
    
    let slotsToUpdate = new Set<string>();
    
    // If removing a slot
    if (selectedSlots.includes(slot)) {
      // Remove the slot and its associated slot (if any)
      const newSelectedSlots = selectedSlots.filter(s => {
        // Keep slots that are not the one being removed and not its associated slot
        if (s === slot) return false;
        if (s === `T${slot}`) return false; // Remove associated slot (e.g., TA1 when removing A1)
        return true;
      });
      setSelectedSlots(newSelectedSlots);
    } else {
      // Adding a slot
      slotsToUpdate.add(slot);
      
      // If it's a primary slot (like A1, B1, etc.), automatically add its associated slot
      if (/^[A-G][12]$/.test(slot)) {
        const associatedSlot = `T${slot}`;
        // Only add the associated slot if it exists in available slots and isn't blocked
        if (
          (activeTimingTab === 'morning' ? morningTheorySlots : eveningTheorySlots).includes(associatedSlot) &&
          !isSlotTaken(associatedSlot)
        ) {
          slotsToUpdate.add(associatedSlot);
        }
      }
      
      setSelectedSlots([...selectedSlots, ...Array.from(slotsToUpdate)]);
    }
  };

  const isSlotTaken = (slot: string): boolean => {
    if (editingCourse && editingCourse.slots.includes(slot)) {
      return false;
    }
    if (existingSlots.includes(slot)) {
      return true;
    }
    const conflictingSlots = slotConflictsMap.get(slot) || [];
    for (const conflict of conflictingSlots) {
      if (existingSlots.includes(conflict)) {
        if (editingCourse && editingCourse.slots.includes(conflict)) {
          // Conflict is part of the course being edited, not an external block.
        } else {
          return true; 
        }
      }
    }
    for (const conflict of conflictingSlots) {
      if (selectedSlots.includes(conflict)) {
        if (editingCourse && editingCourse.slots.includes(slot) && editingCourse.slots.includes(conflict)) {
          // This specific conflict was part of the original course.
        } else {
          return true;
        }
      }
    }
    return false;
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
      // If transientFacultyPreferences exist, they represent the latest state from Faculty Modal (even if just closed via back/cancel)
      // If editing and no transientFacultyPreferences, use editingCourse.facultyPreferences
      const facultyToSubmit = transientFacultyPreferences !== undefined ? transientFacultyPreferences : (editingCourse?.facultyPreferences || []);
      const labsToSubmit = transientLabAssignments !== undefined ? transientLabAssignments : 
        (editingCourse?.facultyLabAssignments ? new Map(editingCourse.facultyLabAssignments.map(a => [a.facultyName, a.slots])) : undefined);
      
      onSubmit({
        courseName,
        selectedSlots,
        credits,
        facultyPreferences: facultyToSubmit,
        includeLabCourse: !!(labsToSubmit && labsToSubmit.size > 0 && facultyToSubmit.length > 0),
        facultyLabAssignments: labsToSubmit
      });
      
      // Reset states and close modal
      resetForm();
      onClose();
    }
  };

  const handleFacultyPreferenceSubmit = (
    facultyPreferencesFromModal: string[], 
    includeLabCourse?: boolean, 
    facultyLabAssignmentsFromModal?: Map<string, string[]>
  ) => {
    if (tempCourseData) {
      onSubmit({
        ...tempCourseData,
        facultyPreferences: facultyPreferencesFromModal,
        includeLabCourse: includeLabCourse,
        facultyLabAssignments: facultyLabAssignmentsFromModal,
      });
    }
    handleCloseModal(); // This will close both modals and reset state
  };

  const handleFacultyModalClose = (currentFacultyPreferences?: string[], currentLabAssignments?: Map<string, string[]>) => {
    setIsFacultyModalOpen(false);
    // Persist faculty preferences temporarily
    if (currentFacultyPreferences !== undefined) {
      setTransientFacultyPreferences(currentFacultyPreferences);
    }
    if (currentLabAssignments !== undefined) {
      setTransientLabAssignments(currentLabAssignments);
    }
  };

  const resetForm = () => {
    setCourseName('');
    setSelectedSlots([]);
    setCredits(0); // Reset credits to 0
    setCreditInputString('0'); // Reset creditInputString
    setTempCourseData(null);
    setTransientFacultyPreferences(undefined); // Clear transients
    setTransientLabAssignments(undefined);
  };

  // Get slot rows based on the active timing tab
  const getSlotRows = () => {
    const slots = activeTimingTab === 'evening' ? eveningTheorySlots : morningTheorySlots;
    
    // Create rows of 4 slots each for consistent layout
    const rows = [];
    for (let i = 0; i < slots.length; i += 4) {
      rows.push(slots.slice(i, i + 4));
    }
    return rows;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isFacultyModalOpen ? 'hidden' : ''}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"></div>
        <div className="bg-white rounded-2xl p-6 w-[700px] max-h-[90vh] overflow-y-auto z-10 relative">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                placeholder="Enter course name"
              />
            </div>
            
            <div className="w-32">
              <label htmlFor="credits-input" className="block text-sm font-medium text-gray-700 mb-2">
                Credits
              </label>
              <div className="relative flex items-center">
                <input
                  id="credits-input"
                  type="text"
                  value={creditInputString}
                  maxLength={2}
                  onFocus={(e) => {
                    // Optional: select all text on focus for easy replacement
                    // e.target.select();
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCreditInputString(val); // Update string representation first

                    if (val === '') {
                      // If user clears the input, set credits to 0 (or handle as pending)
                      setCredits(0); 
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num) && num >= 0 && num <= 5) {
                        setCredits(num);
                      } else {
                        // If invalid number (e.g., "a", "10"), keep credits as is or clamp.
                        // For now, let input string be invalid temporarily, blur will fix.
                        // Or, immediately clamp credits if that's preferred:
                        // setCredits(prev => Math.max(0, Math.min(5, prev)));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCreditInputString('0');
                      setCredits(0);
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num) && num >= 0 && num <= 5) {
                        setCreditInputString(num.toString());
                        setCredits(num);
                      } else {
                        // If invalid on blur, revert to last valid credits
                        setCreditInputString(credits.toString());
                      }
                    }
                  }}
                  className="w-full text-center border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10"
                  aria-label="Credits value"
                />
                <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newCredits = Math.min(5, credits + 1);
                      setCredits(newCredits);
                      setCreditInputString(newCredits.toString());
                    }}
                    className="h-1/2 px-1 text-gray-500 hover:text-gray-700 flex items-center justify-center rounded-tr-md focus:outline-none"
                    aria-label="Increase credits"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newCredits = Math.max(0, credits - 1);
                      setCredits(newCredits);
                      setCreditInputString(newCredits.toString());
                    }}
                    className="h-1/2 px-1 text-gray-500 hover:text-gray-700 flex items-center justify-center rounded-br-md focus:outline-none"
                    aria-label="Decrease credits"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="mb-6">
            {/* Timing Tabs */}
            <div className="flex mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTimingTab('morning')}
                className={`px-4 py-2 text-sm font-medium transition-colors
                  ${activeTimingTab === 'morning'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Morning Slots
              </button>
              <button
                onClick={() => setActiveTimingTab('evening')}
                className={`px-4 py-2 text-sm font-medium transition-colors
                  ${activeTimingTab === 'evening'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Evening Slots
              </button>
            </div>

            {getSlotRows().map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 mb-2">
                {row.map(slot => (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    disabled={isSlotTaken(slot) && !selectedSlots.includes(slot)}
                    className={`
                      flex-1 p-3 rounded-lg text-sm font-medium transition-all
                      ${selectedSlots.includes(slot)
                        ? 'bg-black text-white border border-black'
                        : isSlotTaken(slot)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-70 border border-gray-400'
                          : 'bg-gray-200 text-gray-700 border border-gray-200'
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
                {/* Cancel button removed as X button in header serves this purpose */}
                <button
                  onClick={() => handleSkipFaculty()} // This is effectively the 'Confirm' for editing
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
                  onClick={handleCourseDetailSubmit}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'bg-black'
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
          onForceClose={handleForceClose}
          onSubmit={handleFacultyPreferenceSubmit}
          courseName={`${tempCourseData.courseName} ${tempCourseData.selectedSlots.join('+')}`}
          courseCredits={tempCourseData.credits}
          initialFacultyPreferences={transientFacultyPreferences !== undefined ? transientFacultyPreferences : (editingCourse ? editingCourse.facultyPreferences : [])}
          initialFacultyLabAssignments={transientLabAssignments !== undefined ? transientLabAssignments : 
            (editingCourse?.facultyLabAssignments ? new Map(editingCourse.facultyLabAssignments.map(a => [a.facultyName, a.slots])) : undefined)}
          allCurrentlyUsedSlots={blockedSlots}
          slotConflictPairs={slotConflictPairs}
          isLabCourseAssociated={false} // In add mode, no lab is associated yet
        />
      )}
    </>
  );
};

export default CourseSlotSelector; 