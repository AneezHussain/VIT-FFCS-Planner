import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { PALETTES } from '../utils/colorUtils';

// Define slot conflicts here or import from a shared utility
const slotConflictPairs = [
  // Monday conflicts
  ['A1', 'L1'], ['F1', 'L2'], ['D1', 'L3'], ['TB1', 'L4'], ['TG1', 'L5'],
  ['A2', 'L31'], ['F2', 'L32'], ['D2', 'L33'], ['TB2', 'L34'], ['TG2', 'L35'],

  // Tuesday conflicts
  ['B1', 'L7'], ['G1', 'L8'], ['E1', 'L9'], ['TC1', 'L10'], ['TAA1', 'L11'],
  ['B2', 'L37'], ['G2', 'L38'], ['E2', 'L39'], ['TC2', 'L40'], ['TAA2', 'L41'],

  // Wednesday conflicts
  ['C1', 'L13'], ['A1', 'L14'], ['F1', 'L15'], ['D1', 'L16'], ['TB1', 'L17'],
  ['C2', 'L43'], ['A2', 'L44'], ['F2', 'L45'], ['D2', 'L46'], ['TB2', 'L47'],

  // Thursday conflicts
  ['D1', 'L19'], ['B1', 'L20'], ['G1', 'L21'], ['E1', 'L22'], ['TC1', 'L23'],
  ['D2', 'L49'], ['B2', 'L50'], ['G2', 'L51'], ['E2', 'L52'], ['TC2', 'L53'],

  // Friday conflicts
  ['E1', 'L25'], ['C1', 'L26'], ['TA1', 'L27'], ['TF1', 'L28'], ['TD1', 'L29'],
  ['E2', 'L55'], ['C2', 'L56'], ['TA2', 'L57'], ['TF2', 'L58'], ['TDD2', 'L59']
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
  onAddFaculty: (data: {
    courseName: string;
    selectedSlots: string[];
    credits: number;
    colorIndex: number;
  }) => void;
  existingSlots?: string[]; // Add this prop to track already selected slots
  editingCourse?: { name: string; slots: string[]; credits: number; facultyPreferences?: string[]; facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>; colorIndex: number }; // Add prop for editing
  referenceElement?: HTMLElement;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  isMorningTheory?: boolean;
  isFirstFaculty?: boolean;
  blockedSlots?: string[];
  slotConflictPairs?: string[][];
  preSelectedSlots?: string[];
  palette: keyof typeof PALETTES;
  colorIndex: number;
}

const CourseSlotSelector: React.FC<CourseSlotSelectorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddFaculty,
  existingSlots = [], // Default to empty array if not provided
  editingCourse = undefined, // Default to undefined if not provided
  referenceElement,
  placement = 'bottom',
  isMorningTheory = false,
  isFirstFaculty = false,
  blockedSlots = [],
  slotConflictPairs = [],
  preSelectedSlots = [],
  palette,
  colorIndex
}) => {
  const [courseName, setCourseName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [credits, setCredits] = useState(0); // Default to 0 credits
  const [activeTimingTab, setActiveTimingTab] = useState<'morning' | 'evening'>('morning'); // New state for tabs
  const [creditInputString, setCreditInputString] = useState('0'); // New state for credit input text
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  // Use the constants for slot patterns
  const morningTheorySlots = morningTheorySlotsConst;
  const eveningTheorySlots = eveningTheorySlotsConst;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // When this modal is open, ensure the main dashboard doesn't scroll.
    }
    // Cleanup function to restore scroll when the modal is closed/unmounted
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        setCourseName(editingCourse.name);
        setSelectedSlots(editingCourse.slots);
        setCredits(editingCourse.credits);
        setCreditInputString(editingCourse.credits.toString());
      } else {
        // Reset form for new course
        resetForm();
      }
    }
  }, [isOpen, editingCourse]);

  useEffect(() => {
    if (activeTimingTab === 'morning') {
      setSelectedSlots(prevSlots => prevSlots.filter(slot => morningTheorySlots.includes(slot)));
    } else {
      setSelectedSlots(prevSlots => prevSlots.filter(slot => eveningTheorySlots.includes(slot)));
    }
  }, [activeTimingTab, morningTheorySlots, eveningTheorySlots]);

  const handleCloseModal = () => {
    // Just close without saving any changes
    resetForm();
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
      onAddFaculty({
        courseName,
        selectedSlots,
        credits,
        colorIndex: colorIndex,
      });
    }
  };

  const handleSkipFaculty = () => {
    if (courseName && selectedSlots.length > 0) {
      onSubmit({
        courseName,
        selectedSlots,
        credits,
        facultyPreferences: [], // No faculty preferences
      });
      onClose(); // This is crucial to close the modal
    }
  };

  const handleConfirmEdit = () => {
    if (courseName && selectedSlots.length > 0) {
      onSubmit({
        courseName,
        selectedSlots,
        credits,
        // When just confirming an edit from this modal, we assume no faculty change.
        // Faculty changes are handled through the "Edit Faculty" button on the card.
        facultyPreferences: editingCourse?.facultyPreferences || [],
        includeLabCourse: !!editingCourse?.facultyLabAssignments, 
        facultyLabAssignments: editingCourse?.facultyLabAssignments 
          ? new Map(editingCourse.facultyLabAssignments.map(a => [a.facultyName, a.slots]))
          : undefined,
      });
      onClose();
    }
  };

  const resetForm = () => {
    setCourseName('');
    setSelectedSlots([]);
    setCredits(0); // Reset credits to 0
    setCreditInputString('0'); // Reset creditInputString
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

  const isLabAssociated = () => {
    // Implement the logic to determine if a lab course is associated
    return false; // Placeholder return, actual implementation needed
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center z-50`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"></div>
        <div className="bg-white rounded-2xl p-6 w-[700px] max-h-[90vh] overflow-y-auto z-10 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 break-words max-w-[80%]">{editingCourse ? 'Edit Course Details' : 'Enter Course Details'}</h2>
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
                maxLength={34}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-base break-words"
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
                  className="w-full text-center border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10 text-base"
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
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
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
                <button
                  onClick={handleConfirmEdit}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'bg-black hover:bg-gray-900'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                    }
                  `}
                >
                  Confirm Changes
                </button>
              </>
            ) : (
              // Show regular options for new course creation
              <>
                <button
                  onClick={handleSkipFaculty}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors
                    ${!courseName || selectedSlots.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  Skip & Add Course
                </button>
                <button
                  onClick={handleCourseDetailSubmit}
                  disabled={!courseName || selectedSlots.length === 0}
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors
                    ${courseName && selectedSlots.length > 0
                      ? 'bg-black hover:bg-gray-900'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                    }
                  `}
                >
                  Next: Add Faculty
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSlotSelector; 