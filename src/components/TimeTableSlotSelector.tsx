import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import TimeTable from './TimeTable';
import { getColorClass, PALETTES } from '../utils/colorUtils';

// Define the Course interface/type
interface Course {
  name: string;
  slots: string[];
  credits: number;
  colorIndex: number;
  facultyPreferences?: string[]; // Added
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>; // Added
  // Add other properties like color if your TimeTable/getColorClass expects them directly on the course object
  // For now, assuming name, slots, credits are primary for identification and TimeTable handles color assignment
}

interface TimeTableSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    courseName: string; 
    selectedSlots: string[]; 
    credits: number;
  }) => void;
  otherCoursesData?: Course[];
  editingCourse?: Course;
  slotConflictPairs: string[][]; // Added prop
  palette: keyof typeof PALETTES;
  colorIndex: number;
}

const TimeTableSlotSelector: React.FC<TimeTableSlotSelectorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  otherCoursesData = [],
  editingCourse,
  slotConflictPairs, // Added prop
  palette,
  colorIndex
}) => {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(0);
  const [creditInputString, setCreditInputString] = useState('0');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showSlotPopup, setShowSlotPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [availableSlotsForCell, setAvailableSlotsForCell] = useState<string[]>([]);
  const [isPopupHovered, setIsPopupHovered] = useState(false);
  const [slotInputString, setSlotInputString] = useState('');

  // Derive all existing slot strings from otherCoursesData
  const allExistingSlots = useMemo(() => {
    return otherCoursesData.reduce((accSlots: string[], course) => {
      let slotsForThisCourse: string[] = course.slots; // Default to general course slots

      if (course.name.endsWith(' Lab') &&
          course.facultyPreferences && course.facultyPreferences.length > 0 &&
          course.facultyLabAssignments) {
        const firstFacultyName = course.facultyPreferences[0];
        const firstFacultyLabAssignment = course.facultyLabAssignments.find(a => a.facultyName === firstFacultyName);
        
        if (firstFacultyLabAssignment && firstFacultyLabAssignment.slots.length > 0) {
          slotsForThisCourse = firstFacultyLabAssignment.slots; // Use specific lab slots
        }
      }
      return [...accSlots, ...slotsForThisCourse];
    }, []);
  }, [otherCoursesData]);

  // Helper function to find a conflicting partner
  const getConflictingPartner = useCallback((slot: string): string | undefined => {
    for (const pair of slotConflictPairs) {
      if (pair[0] === slot.toUpperCase()) return pair[1]; // Ensure uppercase comparison
      if (pair[1] === slot.toUpperCase()) return pair[0]; // Ensure uppercase comparison
    }
    return undefined;
  }, [slotConflictPairs]);

  // Helper function to check if a slot is effectively blocked for new selection
  const isSlotEffectivelyBlocked = useCallback((
    slot: string, 
    currentAllExisting: string[], // Slots from other courses
    currentSelectedBySelf: string[] // Slots selected for the current course
  ): boolean => {
    if (currentAllExisting.includes(slot)) return true;
    const partner = getConflictingPartner(slot);
    if (partner) {
      if (currentAllExisting.includes(partner)) return true;
      // If the slot is not yet selected by self, but its partner is, then it's blocked.
      if (!currentSelectedBySelf.includes(slot) && currentSelectedBySelf.includes(partner)) return true;
    }
    return false;
  }, [getConflictingPartner]);

  const coursesToDisplayInTimeTable = useMemo(() => {
    const currentSelectingCourse: Course = {
      name: courseName || 'Selecting...',
      slots: selectedSlots,
      credits: credits,
      colorIndex: colorIndex
    };
    return [...(otherCoursesData || []), currentSelectingCourse];
  }, [otherCoursesData, courseName, selectedSlots, credits, colorIndex]);
  
  const selectingCourseColorClass = useMemo(() => PALETTES[palette].colors[colorIndex], [palette, colorIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (editingCourse) {
        // If editing, populate the form
        setCourseName(editingCourse.name);
        setCredits(editingCourse.credits);
        setCreditInputString(editingCourse.credits.toString());
        setSelectedSlots(editingCourse.slots);
        setSlotInputString(editingCourse.slots.join('+'));
      } else {
        // Otherwise, reset for a new course
        setCourseName('');
        setCredits(0);
        setCreditInputString('0');
        setSelectedSlots([]);
        setSlotInputString('');
      }

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.timetable-container') && !target.closest('.slot-popup')) {
          setShowSlotPopup(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      // Reset state when the modal closes
      setCourseName('');
      setCredits(0);
      setCreditInputString('0');
      setSelectedSlots([]);
      setShowSlotPopup(false);
      setSlotInputString('');
    }
  }, [isOpen, editingCourse]);

  const handleCellClick = (event: React.MouseEvent<HTMLButtonElement>, cellSlots: string) => {
    const rawSlotsInCell = cellSlots.split('/');
    
    const interactableSlotsInCell = rawSlotsInCell.filter(slot => {
      if (selectedSlots.includes(slot)) return true; 
      return !isSlotEffectivelyBlocked(slot, allExistingSlots, selectedSlots);
    });

    if (interactableSlotsInCell.length === 0) {
      return; 
    }

    const alreadySelectedSlotInCell = interactableSlotsInCell.find(slot => selectedSlots.includes(slot));

    if (alreadySelectedSlotInCell) {
      const newSelectedSlots = selectedSlots.filter(s => s !== alreadySelectedSlotInCell);
      setSelectedSlots(newSelectedSlots);
      setSlotInputString(newSelectedSlots.join('+'));
      setShowSlotPopup(false);
      return;
    }
    
    const slotsAvailableForNewSelection = interactableSlotsInCell.filter(slot => {
        const partner = getConflictingPartner(slot);
        if (partner && selectedSlots.includes(partner)) return false; 
        return true;
    });

    if (slotsAvailableForNewSelection.length === 0) {
      setShowSlotPopup(false); 
      return;
    }
    
    setShowSlotPopup(false); 
    
    if (slotsAvailableForNewSelection.length === 1) {
      const slotToSelect = slotsAvailableForNewSelection[0];
      if (!selectedSlots.includes(slotToSelect)) {
        const newSelectedSlots = [...selectedSlots, slotToSelect];
        setSelectedSlots(newSelectedSlots);
        setSlotInputString(newSelectedSlots.join('+'));
      }
    } else { 
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setAvailableSlotsForCell(slotsAvailableForNewSelection);
      setSelectedCell(cellSlots);
      setShowSlotPopup(true);
    }
  };

  const handleSlotSelectFromPopup = (slot: string) => {
    let newSelectedSlots;
    if (selectedSlots.includes(slot)) {
      newSelectedSlots = selectedSlots.filter(s => s !== slot);
    } else {
      const partner = getConflictingPartner(slot);
      if (partner && selectedSlots.includes(partner)) {
        console.warn(`Attempted to select slot ${slot} from popup, but its partner ${partner} is already selected.`);
        setShowSlotPopup(false);
        return;
      }
      newSelectedSlots = [...selectedSlots, slot];
    }
    setSelectedSlots(newSelectedSlots);
    setSlotInputString(newSelectedSlots.join('+'));
    setShowSlotPopup(false);
  };

  const handleSlotInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentInput = event.target.value;

    const potentialSlotsRaw = currentInput.toUpperCase().split('+');
    const potentialSlots = potentialSlotsRaw.map(s => s.trim()).filter(s => s !== '');
    
    const newValidSelectedSlots: string[] = [];

    for (const slotToAdd of potentialSlots) {
        if (newValidSelectedSlots.includes(slotToAdd)) { 
            continue;
        }
        if (allExistingSlots.includes(slotToAdd)) { 
            continue;
        }
        const partner = getConflictingPartner(slotToAdd);
        if (partner && allExistingSlots.includes(partner)) { 
            continue;
        }
        if (partner && newValidSelectedSlots.includes(partner)) { 
            continue;
        }
        // TODO: Consider adding validation here to ensure slotToAdd is a known slot from dayRows, not just non-conflicting.
        newValidSelectedSlots.push(slotToAdd);
    }
    
    setSelectedSlots(newValidSelectedSlots);

    const baseValidatedString = newValidSelectedSlots.join('+');
    let finalDisplayStringToShow = baseValidatedString;

    if (currentInput.endsWith('+')) {
        if (newValidSelectedSlots.length > 0) {
            finalDisplayStringToShow = baseValidatedString + '+';
        } else {
            if (currentInput.split('').every(char => char === '+')) {
                finalDisplayStringToShow = currentInput;
            }
            // If currentInput was e.g. "X+" and X is invalid,
            // baseValidatedString is "", so finalDisplayStringToShow remains "".
        }
    }
    // If currentInput does not end with '+', finalDisplayStringToShow is already baseValidatedString.
    
    setSlotInputString(finalDisplayStringToShow);
  };

  const handleSubmit = () => {
    if (courseName && selectedSlots.length > 0) {
      onSubmit({
        courseName,
        selectedSlots,
        credits
      });
    }
    onClose();
  };

  const getCellClickableClass = (
    cellSlotString: string,
    currentSelectedSlots: string[],
    currentExistingSlots: string[],
    isCellWithPopupOpen: boolean
  ): string => {
    const cellSlotParts = cellSlotString.split('/');
    
    // A cell is considered "interactive" if at least one of its slot parts can be interacted with.
    // A slot part can be interacted with if:
    // 1. It's already selected by the current user (allows for deselection).
    // 2. It's not blocked by other courses AND selecting it wouldn't conflict with current user's other selections.
    const isAnySlotPartInteractable = cellSlotParts.some(part => {
      if (currentSelectedSlots.includes(part)) return true; // Already selected by user, so it's interactable
      
      // Check if blocked by other courses or would conflict with current user's selections
      return !isSlotEffectivelyBlocked(part, currentExistingSlots, currentSelectedSlots);
    });

    let classes = 'transition-colors border border-transparent';

    if (!isAnySlotPartInteractable) {
      classes += ' opacity-50 cursor-not-allowed';
    } else if (!isCellWithPopupOpen) {
      classes += ' hover:border-black';
    }

    return classes;
  };

  const dayRows = [
    {
      day: 'MON',
      slots: ['A1/L1', 'F1/L2', 'D1/L3', 'TB1/L4', 'TG1/L5', 'L6', 'A2/L31', 'F2/L32', 'D2/L33', 'TB2/L34', 'TG2/L35', 'L36']
    },
    {
      day: 'TUE',
      slots: ['B1/L7', 'G1/L8', 'E1/L9', 'TC1/L10', 'TAA1/L11', 'L12', 'B2/L37', 'G2/L38', 'E2/L39', 'TC2/L40', 'TAA2/L41', 'L42']
    },
    {
      day: 'WED',
      slots: ['C1/L13', 'A1/L14', 'F1/L15', 'D1/L16', 'TB1/L17', 'L18', 'C2/L43', 'A2/L44', 'F2/L45', 'TD2/L46', 'TBB2/L47', 'L48']
    },
    {
      day: 'THU',
      slots: ['D1/L19', 'B1/L20', 'G1/L21', 'TE1/L22', 'TCC1/L23', 'L24', 'D2/L49', 'B2/L50', 'G2/L51', 'TE2/L52', 'TCC2/L53', 'L54']
    },
    {
      day: 'FRI',
      slots: ['E1/L25', 'C1/L26', 'TA1/L27', 'TF1/L28', 'TD1/L29', 'L30', 'E2/L55', 'C2/L56', 'TA2/L57', 'TF2/L58', 'TDD2/L59', 'L60']
    }
  ];

  const cellStyle = {
    width: '80px',
    height: '80px',
    minWidth: '80px',
    minHeight: '80px'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-[1600px] z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{editingCourse ? 'Edit Course Slots' : 'Select Course Slots'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-[4fr,1fr] gap-6">
          {/* Left side - Interactive TimeTable */}
          <div className="border rounded-xl timetable-container overflow-x-auto">
            <div className="min-w-[1000px]"> {/* Increased minimum width */}
              <TimeTable 
                courses={coursesToDisplayInTimeTable}
                isSelectMode={true}
                onCellClick={handleCellClick}
                selectedSlots={selectedSlots}
                existingSlots={allExistingSlots}
                getCellInteractionClass={(cellSlots: string) => getCellClickableClass(cellSlots, selectedSlots, allExistingSlots, showSlotPopup && selectedCell === cellSlots)}
                hideContentForCell={showSlotPopup && selectedCell ? selectedCell : undefined}
                palette={palette}
              />
            </div>
          </div>

          {/* Right side - Course Details */}
          <div className="border rounded-xl p-4">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label htmlFor="slot-input-tts" className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Slots (e.g., A1+F1+TC1)
                </label>
                <input
                  id="slot-input-tts"
                  type="text"
                  value={slotInputString}
                  onChange={handleSlotInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-0 transition-all"
                  placeholder="Type slots like A1+F1 or click timetable"
                />
              </div>

              <div>
                <label htmlFor="credits-input-tts" className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <div className="relative flex items-center">
                  <input
                    id="credits-input-tts"
                    type="text"
                    value={creditInputString}
                    maxLength={1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreditInputString(val); 

                      if (val === '') {
                        setCredits(0);
                      } else {
                        const num = parseInt(val);
                        if (!isNaN(num) && num >= 0 && num <= 5) {
                          setCredits(num);
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

              <button
                onClick={handleSubmit}
                disabled={!courseName || selectedSlots.length === 0}
                className={`
                  w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
                  ${courseName && selectedSlots.length > 0
                    ? 'bg-black hover:bg-gray-900'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>

        {/* Slot Selection Popup */}
        {showSlotPopup && selectedCell && availableSlotsForCell.length > 1 && (
          <div
            className="fixed z-20 slot-popup"
            style={{
              left: `${popupPosition.x + 40}px`, 
              top: `${popupPosition.y - 30}px`,  
              transform: 'translateX(-50%)'      
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div 
              className="relative bg-white rounded-lg shadow-xl border border-gray-300 p-2 hover:border-black transition-colors"
              onMouseEnter={() => setIsPopupHovered(true)}
              onMouseLeave={() => setIsPopupHovered(false)}
            >
              <div className="flex flex-row items-center gap-1">
                {availableSlotsForCell.map((slot, index) => (
                  <React.Fragment key={slot}>
                    <button
                      onClick={() => handleSlotSelectFromPopup(slot)}
                      className={`
                        px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-left whitespace-nowrap
                        ${selectedSlots.includes(slot)
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                        }
                      `}
                    >
                      {slot}
                    </button>
                    {index < availableSlotsForCell.length - 1 && (
                      <span className="text-gray-400">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Speech bubble tail */}
              <div
                className="absolute w-0 h-0"
                style={{
                  bottom: '-15px', 
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderLeft: '10px solid transparent', 
                  borderRight: '10px solid transparent',
                  borderTop: `15px solid ${isPopupHovered ? 'black' : '#D1D5DB'}`,
                  transition: 'border-top-color 0.15s ease-in-out'
                }}
              />
              <div
                className="absolute w-0 h-0"
                style={{
                  bottom: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderLeft: '9px solid transparent',
                  borderRight: '9px solid transparent',
                  borderTop: '14px solid white',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTableSlotSelector; 