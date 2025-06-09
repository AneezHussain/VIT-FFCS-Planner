import React, { useState, useRef, useEffect } from 'react';
import { IoArrowBack, IoClose } from 'react-icons/io5';
import { AiOutlinePlus, AiOutlineEdit } from 'react-icons/ai';
import FacultyLabSlotSelectorModal from './FacultyLabSlotSelectorModal';
import SlotSelector from './SlotSelector';

// Define available lab slots
const MORNING_LAB_SLOTS = Array.from({ length: 30 }, (_, i) => `L${i + 1}`); // L1-L30
const EVENING_LAB_SLOTS = Array.from({ length: 30 }, (_, i) => `L${i + 31}`); // L31-L60

interface LabSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceClose: () => void;
  onSubmit: (facultyLabAssignments: Map<string, string[]>) => void;
  courseName: string;
  theorySlot: string;
  theoryCourseActualSlots: string[];
  facultyPreferences: string[];
  allCurrentlyUsedSlots: string[];
  slotConflictPairs: string[][];
  slotColor: string;
  initialAssignments?: Map<string, string[]>;
}

const LabSlotModal: React.FC<LabSlotModalProps> = ({
  isOpen,
  onClose,
  onForceClose,
  onSubmit,
  courseName,
  theorySlot,
  theoryCourseActualSlots,
  facultyPreferences,
  allCurrentlyUsedSlots,
  slotConflictPairs,
  slotColor,
  initialAssignments
}) => {
  const labCourseName = `${courseName} Lab`;
  // State to hold faculty-specific lab slots. Key: facultyName, Value: string[] of lab slots
  const [facultySpecificLabSlots, setFacultySpecificLabSlots] = useState<Map<string, string[]>>(new Map());

  // State for the pop-up lab slot selector
  const [isFacultyLabSlotPopupOpen, setIsFacultyLabSlotPopupOpen] = useState(false);
  const [popupAnchorElement, setPopupAnchorElement] = useState<HTMLElement | null>(null);
  const [currentFacultyForPopup, setCurrentFacultyForPopup] = useState<string>('');
  const [slotsToOfferInPopup, setSlotsToOfferInPopup] = useState<string[]>([]);
  const [slotSelectorAnchorEl, setSlotSelectorAnchorEl] = useState<HTMLElement | null>(null);

  // Add state for pre-selected slots
  const [preSelectedSlots, setPreSelectedSlots] = useState<string[]>([]);

  const determineAvailableLabSlots = (): string[] => {
    // If any theory slot ends with '1' (morning theory), offer evening labs (L31-L60)
    // Otherwise (evening theory or no specific number), offer morning labs (L1-L30)
    const isMorningTheory = theoryCourseActualSlots.some(slot => slot.endsWith('1') && (slot.startsWith('T') || /^[A-Z]1$/.test(slot)));
    return isMorningTheory ? EVENING_LAB_SLOTS : MORNING_LAB_SLOTS;
  };

  const isMorningTheory = theoryCourseActualSlots.some(slot => slot.endsWith('1') && (slot.startsWith('T') || /^[A-Z]1$/.test(slot)));

  const handleAssignSlotsClick = (event: React.MouseEvent<HTMLButtonElement>, facultyName: string) => {
    setCurrentFacultyForPopup(facultyName);
    setSlotsToOfferInPopup(determineAvailableLabSlots());
    setSlotSelectorAnchorEl(event.currentTarget);
    
    // Pre-select previously chosen slots
    const previouslySelectedSlots = facultySpecificLabSlots.get(facultyName) || [];
    if (previouslySelectedSlots.length > 0) {
      // We'll pass these pre-selected slots to the SlotSelector component
      setPreSelectedSlots(previouslySelectedSlots);
    }
  };

  const handleSlotSelectorClose = () => {
    setSlotSelectorAnchorEl(null);
    setCurrentFacultyForPopup('');
    setPreSelectedSlots([]);
  };

  const handleFacultyLabSlotPopupSubmit = (selectedSlots: string[]) => {
    const updatedMap = new Map(facultySpecificLabSlots);
    if (selectedSlots.length > 0) {
      updatedMap.set(currentFacultyForPopup, selectedSlots);
    } else {
      updatedMap.delete(currentFacultyForPopup); // Remove entry if no slots selected
    }
    setFacultySpecificLabSlots(updatedMap);
    handleSlotSelectorClose();
  };
  
  const mainModalRef = useRef<HTMLDivElement>(null); // Ref for the main modal div

  useEffect(() => {
    if (isOpen) {
        setFacultySpecificLabSlots(initialAssignments ? new Map(initialAssignments) : new Map());
        const facultyPrefModal = document.querySelector('.faculty-preference-modal');
        if (facultyPrefModal) {
            facultyPrefModal.classList.add('lab-modal-open');
        }
    }
    // When LabModal closes (isOpen becomes false), do NOT set document.body.style.overflow = 'auto'.
    // The parent modal (FacultyPreferenceModal) will manage the overflow.
    return () => {
        const facultyPrefModal = document.querySelector('.faculty-preference-modal');
        if (facultyPrefModal) {
            facultyPrefModal.classList.remove('lab-modal-open');
        }
    };
  }, [isOpen, initialAssignments]);

  if (!isOpen) return null;

  const isConfirmLabDetailsDisabled = facultyPreferences.length > 0 &&
    !facultyPreferences.every(facultyName => {
        const assignedSlots = facultySpecificLabSlots.get(facultyName);
        return assignedSlots && assignedSlots.length > 0;
    });

  return (
    <div ref={mainModalRef} className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"></div>
      <div className={`bg-white rounded-2xl p-7 z-10 relative shadow-xl transition-all duration-300 translate-y-4 ${
        facultyPreferences.length > 5 
          ? 'w-[900px]' 
          : 'w-[550px]'
      }`}>
        {/* New header with Back button on left and X button on right */}
        <div className="flex justify-between items-center mb-3">
          {!initialAssignments && (
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-black transition-colors flex items-center"
              aria-label="Back to faculty preferences"
            >
              <IoArrowBack size={24} />
            </button>
          )}
          {!initialAssignments && <div className="flex-1" />} {/* Spacer when back button is shown */}
          <button 
            onClick={onForceClose}
            className="text-gray-500 hover:text-gray-700 transition-colors ml-auto"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center break-words">Lab Slots for "{labCourseName}"</h2>
        
        <p className="text-center mb-8 text-gray-600 flex items-center justify-center gap-3">
          Theory slot: <span className={`inline-block px-3 py-1 text-sm font-medium rounded-md ${slotColor}`}>
            {theorySlot}
          </span>
          <span className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-500">Credits:</span>
            <span className="text-sm font-medium text-gray-900">1</span>
          </span>
        </p>
        
        {facultyPreferences && facultyPreferences.length > 0 ? (
          <div className="flex mb-8 gap-x-6">
            {/* Left Column */}
            <div className="flex-1">
              <div className="px-2">
                {facultyPreferences.slice(0, 5).map((faculty, index) => {
                  const assignedSlotsArray = facultySpecificLabSlots.get(faculty);
                  const assignedSlotsString = assignedSlotsArray && assignedSlotsArray.length > 0 ? assignedSlotsArray.join('+') : null;
                  return (
                    <div key={index} className="flex items-center relative transition-all duration-200 mb-5">
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="relative py-3 px-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors group">
                          <div className="flex justify-between items-center">
                            <span className="break-words">{faculty}</span>
                            {assignedSlotsString && (
                              <div className={`text-xs px-2.5 py-1.5 ml-3 rounded-md font-medium break-words ${
                                index === 0 ? slotColor : 'bg-gray-50 text-gray-700'
                              }`}>
                                {assignedSlotsString}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleAssignSlotsClick(e, faculty)}
                        className="ml-3 text-gray-500 hover:text-black transition-transform hover:scale-110"
                      >
                        {assignedSlotsString ? <AiOutlineEdit size={24} /> : <AiOutlinePlus size={24} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Only show if there are more than 5 faculties */}
            {facultyPreferences.length > 5 && (
              <div className="flex-1">
                <div className="px-2">
                  {facultyPreferences.slice(5).map((faculty, index) => {
                    const assignedSlotsArray = facultySpecificLabSlots.get(faculty);
                    const assignedSlotsString = assignedSlotsArray && assignedSlotsArray.length > 0 ? assignedSlotsArray.join('+') : null;
                    return (
                      <div key={index} className="flex items-center relative transition-all duration-200 mb-5">
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                          {index + 6}
                        </div>
                        <div className="flex-1">
                          <div className="relative py-3 px-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors group">
                            <div className="flex justify-between items-center">
                              <span className="break-words">{faculty}</span>
                              {assignedSlotsString && (
                                <div className="text-xs bg-gray-50 text-gray-700 px-2.5 py-1.5 ml-3 rounded-md font-medium break-words">
                                  {assignedSlotsString}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleAssignSlotsClick(e, faculty)}
                          className="ml-3 text-gray-500 hover:text-black transition-transform hover:scale-110"
                        >
                          {assignedSlotsString ? <AiOutlineEdit size={24} /> : <AiOutlinePlus size={24} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
           <p className="text-gray-600 mb-6 text-center px-2 break-words">
             No faculty preferences were set for the theory course.
           </p>
        )}

        <p className="text-xs text-gray-500 mb-5 text-center px-2">
          Specific lab slots can be assigned per faculty.
        </p>

        <div className="flex justify-end space-x-3 mt-5 pb-2">
          <button
            onClick={() => onSubmit(facultySpecificLabSlots)}
            disabled={isConfirmLabDetailsDisabled}
            className={`confirm-btn px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors ${
              isConfirmLabDetailsDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black'
            }`}
          >
            Confirm Lab Details
          </button>
        </div>
      </div>
      
      {/* Faculty Lab Slot Selector Pop-up */}
      <SlotSelector
        isOpen={Boolean(slotSelectorAnchorEl)}
        onClose={handleSlotSelectorClose}
        onSelect={(selectedSlots) => {
          handleFacultyLabSlotPopupSubmit(selectedSlots);
          handleSlotSelectorClose();
        }}
        referenceElement={slotSelectorAnchorEl}
        placement="right-start"
        isMorningTheory={isMorningTheory}
        isFirstFaculty={facultyPreferences.length > 0 && currentFacultyForPopup === facultyPreferences[0]}
        blockedSlots={allCurrentlyUsedSlots}
        slotConflictPairs={slotConflictPairs}
        preSelectedSlots={preSelectedSlots}
      />
    </div>
  );
};

export default LabSlotModal; 