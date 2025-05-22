import React, { useState, useRef, useEffect } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { AiOutlinePlus, AiOutlineEdit } from 'react-icons/ai';
import FacultyLabSlotSelectorModal from './FacultyLabSlotSelectorModal';

// Define available lab slots
const MORNING_LAB_SLOTS = Array.from({ length: 30 }, (_, i) => `L${i + 1}`); // L1-L30
const EVENING_LAB_SLOTS = Array.from({ length: 30 }, (_, i) => `L${i + 31}`); // L31-L60

interface LabSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facultyLabAssignments: Map<string, string[]>) => void;
  courseName: string;
  theorySlot: string;
  theoryCourseActualSlots: string[];
  facultyPreferences: string[];
  allCurrentlyUsedSlots: string[];
  slotConflictPairs: string[][];
}

const LabSlotModal: React.FC<LabSlotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  theorySlot,
  theoryCourseActualSlots,
  facultyPreferences,
  allCurrentlyUsedSlots,
  slotConflictPairs
}) => {
  const labCourseName = `${courseName} Lab`;
  // State to hold faculty-specific lab slots. Key: facultyName, Value: string[] of lab slots
  const [facultySpecificLabSlots, setFacultySpecificLabSlots] = useState<Map<string, string[]>>(new Map());

  // State for the pop-up lab slot selector
  const [isFacultyLabSlotPopupOpen, setIsFacultyLabSlotPopupOpen] = useState(false);
  const [popupAnchorElement, setPopupAnchorElement] = useState<HTMLElement | null>(null);
  const [currentFacultyForPopup, setCurrentFacultyForPopup] = useState<string>('');
  const [slotsToOfferInPopup, setSlotsToOfferInPopup] = useState<string[]>([]);

  const determineAvailableLabSlots = (): string[] => {
    // If any theory slot ends with '1' (morning theory), offer evening labs (L31-L60)
    // Otherwise (evening theory or no specific number), offer morning labs (L1-L30)
    const isMorningTheory = theoryCourseActualSlots.some(slot => slot.endsWith('1') && (slot.startsWith('T') || /^[A-Z]1$/.test(slot)));
    return isMorningTheory ? EVENING_LAB_SLOTS : MORNING_LAB_SLOTS;
  };

  const handleAssignSlotsClick = (event: React.MouseEvent<HTMLButtonElement>, facultyName: string) => {
    setCurrentFacultyForPopup(facultyName);
    setSlotsToOfferInPopup(determineAvailableLabSlots());
    setPopupAnchorElement(event.currentTarget);
    setIsFacultyLabSlotPopupOpen(true);
  };

  const handleFacultyLabSlotPopupClose = () => {
    setIsFacultyLabSlotPopupOpen(false);
    setPopupAnchorElement(null);
    setCurrentFacultyForPopup('');
  };

  const handleFacultyLabSlotPopupSubmit = (selectedSlots: string[]) => {
    const updatedMap = new Map(facultySpecificLabSlots);
    if (selectedSlots.length > 0) {
      updatedMap.set(currentFacultyForPopup, selectedSlots);
    } else {
      updatedMap.delete(currentFacultyForPopup); // Remove entry if no slots selected
    }
    setFacultySpecificLabSlots(updatedMap);
    handleFacultyLabSlotPopupClose();
  };
  
  const mainModalRef = useRef<HTMLDivElement>(null); // Ref for the main modal div

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={mainModalRef} className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl p-8 w-[600px] max-h-[90vh] overflow-y-auto z-10 relative shadow-xl">
        <div className="flex items-center mb-6">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <IoArrowBack size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">{labCourseName} Details</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p>Associated Theory Slot(s): {theorySlot}</p>
            <p>Lab Credits: <strong>1</strong></p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">Assign Lab Slots per Faculty:</h3>
        {facultyPreferences && facultyPreferences.length > 0 ? (
          <div className="mb-6 px-2 space-y-3">
            {facultyPreferences.map((faculty, index) => {
              const assignedSlotsArray = facultySpecificLabSlots.get(faculty);
              const assignedSlotsString = assignedSlotsArray && assignedSlotsArray.length > 0 ? assignedSlotsArray.join('+') : null;
              return (
                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{faculty}</div>
                    {assignedSlotsString ? (
                      <div className="text-xs text-blue-600 font-medium mt-1">Lab Slots: {assignedSlotsString}</div>
                    ) : (
                      <div className="text-xs text-gray-500 italic mt-1">No lab slots assigned</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAssignSlotsClick(e, faculty)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors ml-3"
                    title={assignedSlotsString ? "Edit lab slots" : "Add lab slots"}
                  >
                    {assignedSlotsString ? <AiOutlineEdit size={20} /> : <AiOutlinePlus size={20} />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
           <p className="text-gray-600 mb-6 text-center px-2">
             No faculty preferences were set for the theory course.
           </p>
        )}

        <p className="text-xs text-gray-500 mb-6 text-center px-2">
          The lab course will be created with <strong>1 credit</strong>. Specific lab slots can be assigned per faculty.
        </p>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(facultySpecificLabSlots)}
            className="confirm-btn px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Confirm Lab Details
          </button>
        </div>
      </div>
      
      {/* Faculty Lab Slot Selector Pop-up */}
      <FacultyLabSlotSelectorModal
        isOpen={isFacultyLabSlotPopupOpen}
        onClose={handleFacultyLabSlotPopupClose}
        onSubmit={handleFacultyLabSlotPopupSubmit}
        anchorElement={popupAnchorElement}
        availableLabSlots={slotsToOfferInPopup}
        currentSelectedSlots={facultySpecificLabSlots.get(currentFacultyForPopup) || []}
        facultyName={currentFacultyForPopup}
        externallyBlockedSlots={allCurrentlyUsedSlots}
        isFirstFaculty={facultyPreferences.length > 0 && facultyPreferences[0] === currentFacultyForPopup}
        slotConflictPairs={slotConflictPairs}
      />
    </div>
  );
};

export default LabSlotModal; 