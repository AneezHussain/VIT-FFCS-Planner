import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoArrowBack } from 'react-icons/io5';
import { MdDragIndicator } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LabSlotModal from './LabSlotModal';

interface FacultyPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facultyPreferences: string[], includeLabCourse?: boolean, facultyLabAssignments?: Map<string, string[]>) => void;
  courseName: string;
  initialFacultyPreferences?: string[];
  allCurrentlyUsedSlots: string[];
  slotConflictPairs: string[][];
}

// Define column IDs
const LEFT_COLUMN = 'left-column';
const RIGHT_COLUMN = 'right-column';

const FacultyPreferenceModal: React.FC<FacultyPreferenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  initialFacultyPreferences = [],
  allCurrentlyUsedSlots,
  slotConflictPairs
}) => {
  const [facultyName, setFacultyName] = useState('');
  // Split faculty preferences into left and right columns
  const [leftColumnFaculty, setLeftColumnFaculty] = useState<string[]>([]);
  const [rightColumnFaculty, setRightColumnFaculty] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Helper function to get all faculty preferences combined
  const getAllFacultyPreferences = (): string[] => {
    return [...leftColumnFaculty, ...rightColumnFaculty];
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Reset or initialize form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFacultyName('');
      
      // Split initial faculty preferences into left and right columns
      if (initialFacultyPreferences && initialFacultyPreferences.length > 0) {
        setLeftColumnFaculty(initialFacultyPreferences.slice(0, 5));
        setRightColumnFaculty(initialFacultyPreferences.slice(5));
      } else {
        setLeftColumnFaculty([]);
        setRightColumnFaculty([]);
      }
      
      setShowInput(true);
      setShowPreview(false);
    }
  }, [isOpen, initialFacultyPreferences]);

  // Update useEffect for preview
  useEffect(() => {
    const totalFaculty = leftColumnFaculty.length + rightColumnFaculty.length;
    if (facultyName.trim().length > 0 && !showPreview && totalFaculty < 9) {
      setShowPreview(true);
    } else if ((facultyName.trim().length === 0 || totalFaculty >= 9) && showPreview) {
      setShowPreview(false);
    }
  }, [facultyName, leftColumnFaculty.length, rightColumnFaculty.length]);

  // Update useEffect for input focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Add a small delay to ensure focus works after modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debug log for initial faculty preferences
  useEffect(() => {
    if (isOpen) {
      console.log("Initial faculty preferences:", initialFacultyPreferences);
    }
  }, [isOpen, initialFacultyPreferences]);

  // Debug state changes
  useEffect(() => {
    console.log("Current faculty preferences:", getAllFacultyPreferences());
    console.log("Current facultyName:", facultyName);
  }, [leftColumnFaculty, rightColumnFaculty, facultyName]);

  const handleAddFaculty = () => {
    if (facultyName.trim()) {
      const totalFaculty = leftColumnFaculty.length + rightColumnFaculty.length;
      
      if (totalFaculty < 10) {
        // Add to the appropriate column
        if (leftColumnFaculty.length < 5) {
          setLeftColumnFaculty([...leftColumnFaculty, facultyName.trim()]);
        } else {
          setRightColumnFaculty([...rightColumnFaculty, facultyName.trim()]);
        }
        
        setFacultyName('');
        setShowPreview(false);
        
        // Keep input visible and focused
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  const handleUpdateFaculty = (index: number, column: string) => {
    if (editingName.trim()) {
      if (column === LEFT_COLUMN) {
        const updatedPreferences = [...leftColumnFaculty];
        updatedPreferences[index] = editingName.trim();
        setLeftColumnFaculty(updatedPreferences);
      } else {
        const updatedPreferences = [...rightColumnFaculty];
        updatedPreferences[index] = editingName.trim();
        setRightColumnFaculty(updatedPreferences);
      }
    }
    setEditingIndex(null);
    setEditingColumn(null);
    setEditingName('');
    setIsEditing(false);
  };

  const handleRemoveFaculty = (index: number, column: string) => {
    if (column === LEFT_COLUMN) {
      setLeftColumnFaculty(leftColumnFaculty.filter((_, i) => i !== index));
      
      // If right column has items, move the first item to the left column
      if (rightColumnFaculty.length > 0) {
        const firstRightItem = rightColumnFaculty[0];
        const newRightItems = rightColumnFaculty.slice(1);
        
        setLeftColumnFaculty(prev => [...prev, firstRightItem]);
        setRightColumnFaculty(newRightItems);
      }
    } else {
      setRightColumnFaculty(rightColumnFaculty.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    // Get all faculty preferences
    let allPreferences = getAllFacultyPreferences();
    
    // First, check if there's a faculty name being typed
    if (facultyName.trim()) {
      // Add the current faculty name to the list
      allPreferences = [...allPreferences, facultyName.trim()];
      console.log("Submitting with typed faculty added:", allPreferences);
    }
    
    if (allPreferences.length > 0) {
      // Submit with existing faculty preferences
      console.log("Submitting faculty:", allPreferences);
      onSubmit(allPreferences);
    } else {
      // No faculty preferences
      console.log("Submitting with no faculty");
      onSubmit([]);
    }
  };

  const handleAddLabCourse = () => {
    if (facultyName.trim()) {
      // Add any faculty name currently in the input before opening lab modal
      const currentFaculty = facultyName.trim();
      const allPreferences = getAllFacultyPreferences();
      
      // Ensure not to add duplicates
      if (!allPreferences.includes(currentFaculty)) {
        if (leftColumnFaculty.length < 5) {
          setLeftColumnFaculty([...leftColumnFaculty, currentFaculty]);
        } else {
          setRightColumnFaculty([...rightColumnFaculty, currentFaculty]);
        }
      }
      setFacultyName(''); 
    }
    setIsLabModalOpen(true);
  };

  const handleLabModalClose = () => {
    setIsLabModalOpen(false);
  };

  const handleLabModalSubmit = (facultyLabAssignments: Map<string, string[]>) => {
    setIsLabModalOpen(false);
    // Submit with the combined faculty preferences
    onSubmit(getAllFacultyPreferences(), true, facultyLabAssignments);
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
  const theoryCourseSlots = slotDisplay ? slotDisplay.split('+').filter(Boolean) : [];

  const handleDragStart = () => {
    // Exit edit mode when dragging starts
    if (editingIndex !== null) {
      setEditingIndex(null);
      setEditingColumn(null);
      setEditingName('');
      setIsEditing(false);
    }
  };

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // If there's no destination or the item was dropped back in its original position
    if (!destination || 
        (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    // Handle reordering within the same column
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === LEFT_COLUMN) {
        const newItems = Array.from(leftColumnFaculty);
        const [movedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, movedItem);
        setLeftColumnFaculty(newItems);
      } else {
        const newItems = Array.from(rightColumnFaculty);
        const [movedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, movedItem);
        setRightColumnFaculty(newItems);
      }
    } 
    // Handle moving between columns
    else {
      if (source.droppableId === LEFT_COLUMN) {
        // Moving from left to right
        const leftItems = Array.from(leftColumnFaculty);
        const rightItems = Array.from(rightColumnFaculty);
        
        // Remove from left column
        const [movedItem] = leftItems.splice(source.index, 1);
        
        // Add to right column
        rightItems.splice(destination.index, 0, movedItem);
        
        // If left column now has less than 5 items and right has items, 
        // move the first item from right to left to maintain balance
        if (leftItems.length < 5 && rightItems.length > 0) {
          // Take the first item from right column (not the item we just moved)
          // Find the first item that isn't the one we just moved
          let itemIndexToMove = 0;
          while (itemIndexToMove < rightItems.length && 
                rightItems[itemIndexToMove] === movedItem && 
                destination.index === itemIndexToMove) {
            itemIndexToMove++;
          }
          
          // If we found a suitable item, move it
          if (itemIndexToMove < rightItems.length) {
            const firstRightItem = rightItems.splice(itemIndexToMove, 1)[0];
            leftItems.push(firstRightItem);
          }
        }
        
        setLeftColumnFaculty(leftItems);
        setRightColumnFaculty(rightItems);
      } else {
        // Moving from right to left
        const leftItems = Array.from(leftColumnFaculty);
        const rightItems = Array.from(rightColumnFaculty);
        
        // Remove from right column
        const [movedItem] = rightItems.splice(source.index, 1);
        
        // Add to left column
        leftItems.splice(destination.index, 0, movedItem);
        
        // If left column becomes too large, move the last item to right
        if (leftItems.length > 5) {
          const lastLeftItem = leftItems.pop()!;
          rightItems.unshift(lastLeftItem);
        }
        
        setLeftColumnFaculty(leftItems);
        setRightColumnFaculty(rightItems);
      }
    }

    // No need to reset editing state here as we do it in handleDragStart
  };

  const startEditing = (index: number, faculty: string, column: string) => {
    setEditingIndex(index);
    setEditingColumn(column);
    setEditingName(faculty);
    setIsEditing(true);
    // Focus the edit input after a short delay to ensure the input is rendered
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 50);
  };

  // Input box styles based on whether it has content
  const inputContainerClass = `flex items-center mb-3 relative transition-all duration-200 ${
    !facultyName.trim() && !isInputFocused ? 'opacity-95' : ''
  }`;
  
  const inputNumberClass = `flex items-center justify-center h-9 w-9 rounded-full mr-3 transition-all duration-200 ${
    facultyName.trim() 
      ? 'bg-blue-100 text-blue-700' // Has content - full blue
      : isInputFocused
        ? 'bg-blue-50 text-blue-600' // Active - lighter blue
        : 'bg-gray-300 text-gray-700' // Inactive - darker gray
  } font-medium`;

  const inputClass = `w-full py-3 px-4 border rounded-lg transition-all duration-200 ${
    facultyName.trim() 
      ? 'border-blue-500 ring-1 ring-blue-500' // Has content - full blue
      : isInputFocused
        ? 'border-blue-400 ring-1 ring-blue-400' // Active - lighter blue
        : 'border-gray-400 hover:border-gray-500' // Inactive - darker gray
  } outline-none`;

  const handleClearInput = () => {
    setFacultyName('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const shouldShowRightColumn = rightColumnFaculty.length > 0 || 
                               (leftColumnFaculty.length >= 4 && showPreview) || 
                               leftColumnFaculty.length >= 5;
  
  const totalFaculty = leftColumnFaculty.length + rightColumnFaculty.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"></div>
      <div className={`bg-white rounded-2xl overflow-y-auto z-10 relative shadow-xl transition-all duration-300 ${
        shouldShowRightColumn ? 'w-[900px] p-8 pb-4' : 'w-[550px] p-8'
      }`}>
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

        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Faculty Preference for "{courseNameDisplay}"</h2>
        
        <p className="text-center mb-8 text-gray-600 flex items-center justify-center gap-3">
          Selected slot: <span className={`
            inline-block px-3 py-1 text-sm font-medium rounded-md
            ${[
              'bg-red-50 text-red-700',
              'bg-blue-50 text-blue-700',
              'bg-green-50 text-green-700',
              'bg-yellow-50 text-yellow-700',
              'bg-purple-50 text-purple-700',
              'bg-pink-50 text-pink-700',
              'bg-indigo-50 text-indigo-700',
              'bg-orange-50 text-orange-700',
              'bg-teal-50 text-teal-700',
              'bg-cyan-50 text-cyan-700',
              'bg-lime-50 text-lime-700',
              'bg-amber-50 text-amber-700'
            ][Math.abs(courseNameDisplay.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 12]
          }`}
          >
            {slotDisplay}
          </span>
          <span className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-500">Credits:</span>
            <span className="text-sm font-medium text-gray-900">{courseName.endsWith(' Lab') ? '1' : '3'}</span>
          </span>
        </p>

        {/* Faculty List with Drag and Drop */}
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex mb-8 gap-x-6">
            {/* Left Column */}
            <div className="flex-1">
              <Droppable droppableId={LEFT_COLUMN} type="faculty">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="px-2"
                  >
                    {leftColumnFaculty.map((faculty, index) => (
                      <Draggable 
                        key={`left-${faculty}-${index}`} 
                        draggableId={`left-${faculty}-${index}`} 
                        index={index}
                        isDragDisabled={editingIndex !== null}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center mb-5 relative transition-all duration-200 ${
                              snapshot.isDragging ? 'z-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              {editingIndex === index && editingColumn === LEFT_COLUMN ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleUpdateFaculty(index, LEFT_COLUMN);
                                    } else if (e.key === 'Escape') {
                                      setEditingIndex(null);
                                      setEditingColumn(null);
                                      setEditingName('');
                                      setIsEditing(false);
                                    }
                                  }}
                                  onBlur={() => handleUpdateFaculty(index, LEFT_COLUMN)}
                                  className={`w-full py-3 px-4 border border-blue-500 ring-1 ring-blue-500 rounded-lg outline-none bg-white`}
                                  autoComplete="off"
                                />
                              ) : (
                                <div 
                                  className="relative py-3 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors group"
                                  onClick={() => startEditing(index, faculty, LEFT_COLUMN)}
                                >
                                  {faculty}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MdDragIndicator size={20} className="text-gray-400 hover:text-gray-600" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveFaculty(index, LEFT_COLUMN)}
                              className="ml-3 text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                            >
                              <IoClose size={24} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Input box in left column - outside the Droppable area */}
              {leftColumnFaculty.length < 5 && totalFaculty < 10 && (
                <div className={`px-2 ${inputContainerClass}`}>
                  <div className={inputNumberClass}>
                    {leftColumnFaculty.length + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFaculty();
                        }
                      }}
                      className={inputClass}
                      placeholder={totalFaculty === 9 ? "Enter last faculty name" : "Enter faculty name"}
                      autoComplete="off"
                    />
                    <div className="w-8 h-8 flex-shrink-0">
                      {facultyName.trim() && (
                        <button
                          onClick={handleClearInput}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                        >
                          <IoClose size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview in left column - outside the Droppable area */}
              {showPreview && leftColumnFaculty.length < 4 && (
                <div className="flex items-center mb-5 relative px-2">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-400 font-medium mr-3">
                    {leftColumnFaculty.length + 2}
                  </div>
                  <div className="flex-1 py-3 px-4 border border-dashed border-gray-200 rounded-lg text-gray-400">
                    Next Faculty (press Enter) ...
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            {shouldShowRightColumn && (
              <div className="flex-1">
                <Droppable droppableId={RIGHT_COLUMN} type="faculty">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="px-2"
                    >
                      {rightColumnFaculty.map((faculty, index) => (
                        <Draggable 
                          key={`right-${faculty}-${index}`} 
                          draggableId={`right-${faculty}-${index}`} 
                          index={index}
                          isDragDisabled={editingIndex !== null}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center mb-5 relative transition-all duration-200 ${
                                snapshot.isDragging ? 'z-50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-medium mr-3">
                                {leftColumnFaculty.length + index + 1}
                              </div>
                              <div className="flex-1">
                                {editingIndex === index && editingColumn === RIGHT_COLUMN ? (
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUpdateFaculty(index, RIGHT_COLUMN);
                                      } else if (e.key === 'Escape') {
                                        setEditingIndex(null);
                                        setEditingColumn(null);
                                        setEditingName('');
                                        setIsEditing(false);
                                      }
                                    }}
                                    onBlur={() => handleUpdateFaculty(index, RIGHT_COLUMN)}
                                    className={`w-full py-3 px-4 border border-blue-500 ring-1 ring-blue-500 rounded-lg outline-none bg-white`}
                                    autoComplete="off"
                                  />
                                ) : (
                                  <div 
                                    className="relative py-3 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors group"
                                    onClick={() => startEditing(index, faculty, RIGHT_COLUMN)}
                                  >
                                    {faculty}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MdDragIndicator size={20} className="text-gray-400 hover:text-gray-600" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveFaculty(index, RIGHT_COLUMN)}
                                className="ml-3 text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                              >
                                <IoClose size={24} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Input box in right column - outside the Droppable area */}
                {leftColumnFaculty.length >= 5 && rightColumnFaculty.length < 5 && totalFaculty < 10 && (
                  <div className={`px-2 ${inputContainerClass}`}>
                    <div className={inputNumberClass}>
                      {totalFaculty + 1}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFaculty();
                          }
                        }}
                        className={inputClass}
                        placeholder={totalFaculty === 9 ? "Enter last faculty name" : "Enter faculty name"}
                        autoComplete="off"
                      />
                      <div className="w-8 h-8 flex-shrink-0">
                        {facultyName.trim() && (
                          <button
                            onClick={handleClearInput}
                            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                          >
                            <IoClose size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview in right column - outside the Droppable area */}
                {showPreview && ((leftColumnFaculty.length === 4) || (leftColumnFaculty.length >= 5 && rightColumnFaculty.length < 4)) && (
                  <div className="flex items-center mb-5 relative px-2">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-400 font-medium mr-3">
                      {totalFaculty + 2}
                    </div>
                    <div className="flex-1 py-3 px-4 border border-dashed border-gray-200 rounded-lg text-gray-400">
                      Next Faculty (press Enter) ...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DragDropContext>

        <p className="text-gray-600 mb-5 text-sm px-2 text-center">
          Priority will be considered based on the order (1 being highest priority)
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-2">
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
                onClick={handleAddLabCourse}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                Add Lab Course
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
                onClick={handleAddLabCourse}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                Add Lab Course
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

      {/* Lab Course Modal */}
      {isLabModalOpen && (
        <LabSlotModal
          isOpen={isLabModalOpen}
          onClose={handleLabModalClose}
          onSubmit={handleLabModalSubmit}
          courseName={courseNameDisplay}
          theorySlot={slotDisplay || ''}
          theoryCourseActualSlots={theoryCourseSlots}
          facultyPreferences={getAllFacultyPreferences()}
          allCurrentlyUsedSlots={allCurrentlyUsedSlots}
          slotConflictPairs={slotConflictPairs}
        />
      )}
    </div>
  );
};

export default FacultyPreferenceModal; 