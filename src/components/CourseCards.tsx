import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFile, AiOutlineEdit, AiOutlineDelete, AiOutlineUser, AiOutlineSetting, AiOutlinePlus } from 'react-icons/ai';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { PALETTES } from '../utils/colorUtils';

interface Course {
  name: string;
  slots: string[];
  credits: number;
  colorIndex: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
  creationMode?: 'standard' | 'custom';
}

interface CourseCardsProps {
  courses: Course[];
  onEditCourse: (index: number) => void;
  onEditFaculty: (index: number) => void;
  onDeleteCourse: (index: number) => void;
  onAddCourse: () => void;
  onAddLab: (index: number) => void;
  blockedSlots: string[];
  palette: keyof typeof PALETTES;
}

const CourseCards: React.FC<CourseCardsProps> = ({
  courses,
  onEditCourse,
  onEditFaculty,
  onDeleteCourse,
  onAddCourse,
  onAddLab,
  blockedSlots,
  palette
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [openSettings, setOpenSettings] = useState<number | null>(null);
  // Ref for expanded card to check for clicks outside
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const creditBoxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [creditWidths, setCreditWidths] = useState<number[]>([]);

  // Helper function to capitalize course name
  const capitalizeCourseName = (name: string) => {
    const exceptions = ['and', 'of'];
    return name.split(' ').map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (exceptions.includes(lowerWord)) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  };

  useEffect(() => {
    const newWidths = courses.map((_, index) => creditBoxRefs.current[index]?.offsetWidth ?? 0);
    // Only update if any width is different to avoid re-render loops
    if (newWidths.some((w, i) => w !== creditWidths[i])) {
      setCreditWidths(newWidths);
    }
  }, [courses, expandedCard, creditWidths]);

  const getBaseCourseName = (name: string) => name.replace(/ Lab$/, '');

  // Helper function to check if slots are blocked
  const checkSlotsBlocked = (slots: string | null, blockedSlotsList: string[]): boolean => {
    if (!slots) return false;
    const individualSlots = slots.split('+');
    return individualSlots.some(slot => blockedSlotsList.includes(slot));
  };

  return (
    <div>
      {/* Course Cards Title */}
      <div className="flex items-center mb-4 mt-8">
        <AiOutlineFile size={20} className="text-black mr-2" />
        <h2 className="text-xl font-semibold text-black">Course Cards</h2>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full lg:w-[calc(4*20rem+3*1rem)] justify-center">
        {/* Course Cards */}
        {courses.map((course, index) => {
          const baseName = getBaseCourseName(course.name);
          const firstMatchingCourseIndex = courses.findIndex(c => getBaseCourseName(c.name) === baseName);
          const colorLookupIndex = firstMatchingCourseIndex === -1 ? index : firstMatchingCourseIndex;

          const isLabCourse = course.name.endsWith(' Lab');
          const hasFacultyPreferences = course.facultyPreferences && course.facultyPreferences.length > 0;
          const isSkippedFacultyCourse = !isLabCourse && !hasFacultyPreferences && course.creationMode !== 'custom';
          const isCustomSlotCourse = course.creationMode === 'custom';
          const capitalizedCourseName = capitalizeCourseName(course.name);
          const isLongCourseName = capitalizedCourseName.length > 17;
          
          return (
            <div 
              key={index}
              className={`
                bg-white border-[1.5px] border-gray-300 rounded-lg p-4 hover:shadow-md transition-all relative group flex flex-col
                w-full lg:w-80 ${expandedCard === index ? 'min-h-[280px] shadow-lg' : 'h-[230px]'}
                before:content-[''] before:absolute before:-top-[6px] before:-right-[6px] before:w-[28px] before:h-[28px] before:bg-white before:rounded-full before:z-[5]
              `}
              style={{
                transition: 'height 0.3s ease-in-out, min-height 0.3s ease-in-out',
                zIndex: expandedCard === index ? 10 : 1,
                transform: expandedCard === index ? 'scale(1.02)' : 'scale(1)'
              }}
              ref={(el) => { cardRefs.current[index] = el; }}
            >
              {/* Settings Button */}
              <div className="absolute -top-2 -right-2 z-10">
                <div 
                  className="relative"
                  onMouseLeave={() => setOpenSettings(null)}
                >
                  <button 
                    className={`p-1 transition-all ${openSettings === index ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                    onMouseEnter={() => setOpenSettings(index)}
                  >
                    <AiOutlineSetting size={20} />
                  </button>
                  <div 
                    id={`settings-dropdown-${index}`} 
                    className={`absolute right-0 mt-1 bg-white shadow-lg rounded-md py-2 z-20 w-48 border border-gray-300 ${openSettings === index ? '' : 'hidden'}`}
                    style={{ minWidth: '180px' }}
                  >
                    <div className="absolute -top-1 right-2 w-4 h-4 bg-white border-l border-t border-gray-300 transform rotate-45 z-[-1]"></div>
                    {isCustomSlotCourse ? (
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => onEditCourse(index)}
                      >
                        <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                        <span>Edit Course</span>
                      </button>
                    ) : isSkippedFacultyCourse ? (
                      <>
                        <button 
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditCourse(index)}
                        >
                          <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                          <span>Edit Course</span>
                        </button>
                        <button 
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditFaculty(index)}
                        >
                          <AiOutlineUser className="mr-2 text-gray-500" size={18} />
                          <span>Add Faculty</span>
                        </button>
                        <button 
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onAddLab(index)}
                        >
                          <AiOutlinePlus className="mr-2 text-gray-500" size={18} />
                          <span>Add Lab</span>
                        </button>
                      </>
                    ) : isLabCourse ? (
                      <button 
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => onEditFaculty(index)}
                      >
                        <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                        <span>Edit Lab Slots</span>
                      </button>
                    ) : (
                      <>
                        <button 
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditCourse(index)}
                        >
                          <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                          <span>Edit Course</span>
                        </button>
                        <button 
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onEditFaculty(index)}
                        >
                          <AiOutlineUser className="mr-2 text-gray-500" size={18} />
                          <span>Edit Faculty</span>
                        </button>
                        {!courses.some(c => c.name === `${course.name} Lab`) && (
                          <button 
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => onAddLab(index)}
                          >
                            <AiOutlinePlus className="mr-2 text-gray-500" size={18} />
                            <span>Add Lab</span>
                          </button>
                        )}
                      </>
                    )}
                    {/* Delete is always available */}
                    {(isSkippedFacultyCourse || isLabCourse || hasFacultyPreferences || isCustomSlotCourse) && <div className="w-full h-px bg-gray-200 my-1"></div>}
                    <button 
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteCourse(index)}
                    >
                      <AiOutlineDelete className="mr-2" size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start mt-2">
                <h3 className={`font-medium text-base text-gray-900 break-words max-w-[70%] overflow-hidden text-ellipsis ${isLongCourseName ? '-mt-2' : ''}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{capitalizedCourseName}</h3>
                <div className="relative flex flex-col items-end">
                  <div ref={(el) => (creditBoxRefs.current[index] = el)} className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-500">Credits:</span>
                    <span className="text-sm font-medium text-gray-900">{course.credits}</span>
                  </div>
                  {expandedCard === index && !isLabCourse && (
                    <div className="absolute top-full right-0 mt-2" style={{ width: creditWidths[index] ? `${creditWidths[index]}px` : 'auto' }}>
                      <span className={`
                        block w-full text-center px-2 py-1 text-sm font-semibold rounded-lg
                        ${PALETTES[palette].colors[course.colorIndex]}
                      `}>
                        {course.slots.join('+')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Faculty Preferences Display or Custom Message */}
              {expandedCard !== index && (
                <div className="mt-3 mb-2 pb-10">
                  {isCustomSlotCourse ? (
                    <div className="text-sm text-gray-500 italic">
                      Custom slots don't have faculty preference.
                    </div>
                  ) : isSkippedFacultyCourse ? (
                    <div className="text-sm text-gray-500 italic">
                      Faculty preference not added.
                    </div>
                  ) : hasFacultyPreferences ? (
                    <div className="grid grid-cols-[1fr_max-content] gap-x-2 gap-y-3 items-start">
                      {course.facultyPreferences!.slice(0, 3).map((faculty, facultyIndex) => {
                        let labSlotsForFaculty: string | null = null;
                        if (isLabCourse && course.facultyLabAssignments) {
                          const assignment = course.facultyLabAssignments.find(a => a.facultyName === faculty);
                          if (assignment && assignment.slots.length > 0) {
                            labSlotsForFaculty = assignment.slots.join('+');
                          }
                        }
                        
                        let slotColorClass = '';
                        if (facultyIndex > 0 && labSlotsForFaculty) {
                          slotColorClass = checkSlotsBlocked(labSlotsForFaculty, blockedSlots) ? 'text-red-600' : 'text-green-600';
                        }

                        return (
                          <React.Fragment key={facultyIndex}>
                            <div className="flex items-center">
                              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs mr-2 flex-shrink-0">
                                {facultyIndex + 1}
                              </div>
                              <span className="text-base text-gray-700 truncate">{faculty}</span>
                              {facultyIndex === 2 && course.facultyPreferences!.length > 3 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedCard(index);
                                  }}
                                  className="ml-2 flex-shrink-0"
                                >
                                  <IoChevronDown size={20} className="text-black transition-colors" />
                                </button>
                              )}
                            </div>
                            <div className={`text-sm ${slotColorClass} truncate`}>
                              {labSlotsForFaculty}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No faculties have been added.
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Card Content */}
              {expandedCard === index && hasFacultyPreferences && (
                <div className="mt-3 flex-grow flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-[1fr_max-content] gap-x-2 gap-y-3 items-start">
                      {course.facultyPreferences?.map((faculty, facultyIndex) => {
                        let labSlotsForFaculty: string | null = null;
                        if (isLabCourse && course.facultyLabAssignments) {
                          const assignment = course.facultyLabAssignments.find(a => a.facultyName === faculty);
                          if (assignment && assignment.slots.length > 0) {
                            labSlotsForFaculty = assignment.slots.join('+');
                          }
                        }
                        
                        let slotColorClass = '';
                        if (facultyIndex > 0 && labSlotsForFaculty) {
                          slotColorClass = checkSlotsBlocked(labSlotsForFaculty, blockedSlots) ? 'text-red-600' : 'text-green-600';
                        }

                        return (
                          <React.Fragment key={facultyIndex}>
                            <div className="flex items-center">
                              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs mr-2">
                                {facultyIndex + 1}
                              </div>
                              <span className="text-base text-gray-700 break-all">{faculty}</span>
                            </div>
                            <div className={`text-sm ${slotColorClass}`}>
                              {labSlotsForFaculty}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                    >
                      <IoChevronUp size={24} className="text-black transition-colors" />
                    </button>
                  </div>
                </div>
              )}

              {/* Slot at the bottom for collapsed view - always fixed at bottom */}
              {expandedCard !== index && (
                <div className="absolute bottom-3 left-4 right-4">
                  <span className={`
                    px-3 py-2 text-[13px] font-semibold rounded-md inline-block w-full text-center
                    ${PALETTES[palette].colors[course.colorIndex]}
                  `}>
                    {(() => {
                      let displaySlots = course.slots.join('+');
                      if (course.name.endsWith(' Lab') && course.facultyPreferences && course.facultyPreferences.length > 0 && course.facultyLabAssignments) {
                        const firstFacultyName = course.facultyPreferences[0];
                        const firstFacultyLabAssignment = course.facultyLabAssignments.find(a => a.facultyName === firstFacultyName);
                        if (firstFacultyLabAssignment && firstFacultyLabAssignment.slots.length > 0) {
                          displaySlots = firstFacultyLabAssignment.slots.join('+');
                        }
                      }
                      return displaySlots;
                    })()}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Course Card */}
        <button 
          className="w-full lg:w-80 h-[230px] border-[3px] border-dashed border-gray-300 [border-style:dashed] [border-dash:16px] rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all"
          onClick={onAddCourse}
        >
          <AiOutlinePlus size={32} />
          <span className="mt-2 font-medium">Add New Course</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCards; 
