import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import TimeTable from './TimeTable';
import { getColorClass } from '../utils/colorUtils';

// Define the Course interface/type
interface Course {
  name: string;
  slots: string[];
  credits: number;
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
  slotConflictPairs: string[][]; // Added prop
}

const TimeTableSlotSelector: React.FC<TimeTableSlotSelectorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  otherCoursesData = [],
  slotConflictPairs // Added prop
}) => {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(3);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showSlotPopup, setShowSlotPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [availableSlotsForCell, setAvailableSlotsForCell] = useState<string[]>([]);

  // Derive all existing slot strings from otherCoursesData
  const allExistingSlots = useMemo(() => {
    return otherCoursesData.flatMap(course => course.slots);
  }, [otherCoursesData]);

  // Helper function to find a conflicting partner
  const getConflictingPartner = useCallback((slot: string): string | undefined => {
    for (const pair of slotConflictPairs) {
      if (pair[0] === slot) return pair[1];
      if (pair[1] === slot) return pair[0];
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
      credits: credits
    };
    return [...(otherCoursesData || []), currentSelectingCourse];
  }, [otherCoursesData, courseName, selectedSlots, credits]);
  
  const selectingCourseColorClass = useMemo(() => getColorClass(
    { name: courseName || 'Selecting...', slots: selectedSlots, credits }, 
    coursesToDisplayInTimeTable.length -1, 
    coursesToDisplayInTimeTable
  ), [courseName, selectedSlots, credits, coursesToDisplayInTimeTable]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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
      setCourseName('');
      setCredits(3);
      setSelectedSlots([]);
      setShowSlotPopup(false);
    }
  }, [isOpen]);

  const handleCellClick = (event: React.MouseEvent<HTMLButtonElement>, cellSlots: string) => {
    const rawSlotsInCell = cellSlots.split('/');
    
    // Determine which slots in the cell are genuinely available for interaction (selection/deselection)
    // A slot is interactable if it's not blocked by existing courses or by its own selected conflicts.
    // If a slot IS already selected, it remains "interactable" for deselection.
    const interactableSlotsInCell = rawSlotsInCell.filter(slot => {
      if (selectedSlots.includes(slot)) return true; // Already selected? It's interactable for deselection.
      return !isSlotEffectivelyBlocked(slot, allExistingSlots, selectedSlots);
    });

    if (interactableSlotsInCell.length === 0) {
      return; // No slots in this cell can be interacted with
    }

    // Check if any of the interactable slots in this cell are already selected by the current course
    const alreadySelectedSlotInCell = interactableSlotsInCell.find(slot => selectedSlots.includes(slot));

    if (alreadySelectedSlotInCell) {
      // If an interactable (and already selected) slot in this cell is clicked, unselect it
      setSelectedSlots(selectedSlots.filter(s => s !== alreadySelectedSlotInCell));
      setShowSlotPopup(false);
      return;
    }
    
    // If we are here, we are trying to select a new slot.
    // Filter out slots that cannot be newly selected due to conflicts with *currently selected* slots.
    const slotsAvailableForNewSelection = interactableSlotsInCell.filter(slot => {
        const partner = getConflictingPartner(slot);
        if (partner && selectedSlots.includes(partner)) return false; // Cannot select if partner is already selected
        return true;
    });


    if (slotsAvailableForNewSelection.length === 0) {
      // This can happen if, e.g., cell is A1/L1, L1 is taken by another course (so A1 is not in interactableSlotsInCell initially if L1 was only conflict)
      // OR, cell is A1/L1, nothing taken by other courses. User selects A1. Then L1 is no longer available for new selection.
      // If user clicks L1 now, slotsAvailableForNewSelection would be empty.
      setShowSlotPopup(false); // Ensure popup is closed
      return;
    }
    
    setShowSlotPopup(false); // Close any existing popup
    
    if (slotsAvailableForNewSelection.length === 1) {
      const slotToSelect = slotsAvailableForNewSelection[0];
      // This condition selectedSlots.includes(slotToSelect) should ideally be false here
      // because `alreadySelectedSlotInCell` case handles unselection.
      if (!selectedSlots.includes(slotToSelect)) {
        setSelectedSlots([...selectedSlots, slotToSelect]);
      }
    } else { // Multiple slots are available for new selection in this cell
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setAvailableSlotsForCell(slotsAvailableForNewSelection); // Populate popup with these
      setSelectedCell(cellSlots); // Keep track of the cell that was clicked
      setShowSlotPopup(true);
    }
  };

  const handleSlotSelectFromPopup = (slot: string) => {
    // Conflict check for popup selection:
    // A slot from popup should not be selected if its partner is already selected.
    // This should be guaranteed by `slotsAvailableForNewSelection` feeding `setAvailableSlotsForCell`.
    // However, double-checking or relying on the previous filter is fine.
    // If the slot is already selected (e.g. a bug allowed it), unselect it.
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      // Before adding, ensure its conflict partner isn't already selected
      const partner = getConflictingPartner(slot);
      if (partner && selectedSlots.includes(partner)) {
        // This case should ideally not be reached if availableSlotsForCell is correctly filtered
        console.warn(`Attempted to select slot ${slot} from popup, but its partner ${partner} is already selected.`);
        setShowSlotPopup(false);
        return;
      }
      setSelectedSlots([...selectedSlots, slot]);
    }
    setShowSlotPopup(false);
  };

  const handleSubmit = () => {
    if (courseName && selectedSlots.length > 0) {
      onSubmit({
        courseName,
        selectedSlots,
        credits
      });
      onClose();
    }
  };

  const getCellClickableClass = (cellSlotString: string, currentSelectedSlots: string[], currentExistingSlots: string[]): string => {
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
    } else {
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
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-h-[90vh] overflow-y-auto z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Select Course Slots</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-[3fr,1fr] gap-6">
          {/* Left side - Interactive TimeTable */}
          <div className="border rounded-xl p-4 timetable-container">
            <TimeTable 
              courses={coursesToDisplayInTimeTable} // Pass all courses to TimeTable
              isSelectMode={true}
              onCellClick={handleCellClick}
              selectedSlots={selectedSlots} // selectedSlots for the current course being edited/added
              existingSlots={allExistingSlots} // All slots from other courses
              getCellInteractionClass={getCellClickableClass}
              hideContentForCell={showSlotPopup && selectedCell ? selectedCell : undefined}
            />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <select
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {[1, 2, 3, 4, 5].map((credit) => (
                    <option key={credit} value={credit}>
                      {credit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Slots
                </label>
                <div className="min-h-[40px] flex justify-center items-center">
                  {selectedSlots.length > 0 ? (
                    <div className={`inline-flex items-center gap-2 p-2 rounded-md ${selectingCourseColorClass}`}> {/* Use updated color class */}
                      {selectedSlots.map((slot, index) => (
                        <React.Fragment key={slot}>
                          {/* Removed course name/initials display here */}
                          <div className="flex flex-col items-center">
                            <div className={'text-xs'}> {/* Removed conditional mt-1 */}
                              {slot.includes('/') ? (
                                slot.split('/').map((part, i, arr) => (
                                  <React.Fragment key={i}>
                                    {/* Ensure 'part' refers to the specific sub-slot for styling if needed */}
                                    {/* For now, just display part */}
                                    <span className={'text-base font-semibold'}> {/* Simplified class */}
                                      {part}
                                    </span>
                                    {i < arr.length - 1 && '/'}
                                  </React.Fragment>
                                ))
                              ) : (
                                <span className="text-base font-semibold">{slot}</span>
                              )}
                            </div>
                          </div>
                          {index < selectedSlots.length - 1 && (
                            <span className="font-bold text-lg">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      Click on the timetable cells to select slots
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!courseName || selectedSlots.length === 0}
                className={`
                  w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
                  ${courseName && selectedSlots.length > 0
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

        {/* Slot Selection Popup - Only shown for cells with multiple available slots */}
        {showSlotPopup && selectedCell && availableSlotsForCell.length > 1 && (
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-300 p-2 z-20 slot-popup"
            style={{
              left: `${popupPosition.x + 40}px`,
              top: `${popupPosition.y - 30}px`,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-row items-center gap-1">
              {availableSlotsForCell.map((slot, index) => (
                <React.Fragment key={slot}>
                  <button
                    onClick={() => handleSlotSelectFromPopup(slot)}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-left
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTableSlotSelector; 