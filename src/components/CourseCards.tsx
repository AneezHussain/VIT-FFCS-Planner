import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFile, AiOutlineEdit, AiOutlineDelete, AiOutlineUser, AiOutlineSetting, AiOutlinePlus } from 'react-icons/ai';
import { getSlotColor } from '../utils/colorUtils';

interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
}

interface CourseCardsProps {
  courses: Course[];
  onEditCourse: (index: number) => void;
  onEditFaculty: (index: number) => void;
  onDeleteCourse: (index: number) => void;
  onAddCourse: () => void;
  onAddLab: (index: number) => void;
}

const CourseCards: React.FC<CourseCardsProps> = ({
  courses,
  onEditCourse,
  onEditFaculty,
  onDeleteCourse,
  onAddCourse,
  onAddLab
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  // Ref for expanded card to check for clicks outside
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle clicks outside the expanded card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedCard !== null && cardRefs.current[expandedCard] && 
          !cardRefs.current[expandedCard]?.contains(event.target as Node)) {
        setExpandedCard(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedCard]);

  const getBaseCourseName = (name: string) => name.replace(/ Lab$/, '');

  return (
    <div>
      {/* Course Cards Title */}
      <div className="flex items-center mb-4 mt-8">
        <AiOutlineFile size={20} className="text-gray-700 mr-2" />
        <h2 className="text-xl font-semibold text-gray-700">Course Cards</h2>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-4 gap-4 items-start w-[calc(4*18rem+3*1rem)]">
        {/* Course Cards */}
        {courses.map((course, index) => {
          const baseName = getBaseCourseName(course.name);
          const firstMatchingCourseIndex = courses.findIndex(c => getBaseCourseName(c.name) === baseName);
          const colorLookupIndex = firstMatchingCourseIndex === -1 ? index : firstMatchingCourseIndex;

          const isLabCourse = course.name.endsWith(' Lab');
          const hasFacultyPreferences = course.facultyPreferences && course.facultyPreferences.length > 0;
          // A course is considered "custom slot selected" if it's not a lab and has no faculty preferences.
          const isCustomSlotCourse = !isLabCourse && !hasFacultyPreferences;
          
          return (
            <div 
              key={index}
              className={`
                bg-white border border-gray-200 rounded-lg p-4 pb-6 hover:shadow-md transition-all relative group flex flex-col
                ${expandedCard === index ? 'w-72 min-h-[260px] shadow-lg' : 'w-72 h-[210px]'}
                before:content-[''] before:absolute before:-top-[6px] before:-right-[6px] before:w-[28px] before:h-[28px] before:bg-white before:rounded-full before:z-[5]
              `}
              style={{
                transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out, min-height 0.3s ease-in-out',
                zIndex: expandedCard === index ? 10 : 1,
                transform: expandedCard === index ? 'scale(1.02)' : 'scale(1)'
              }}
              ref={(el) => { cardRefs.current[index] = el; }}
            >
              {/* Settings Button */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="relative">
                  <button 
                    className="p-1 text-gray-400 hover:text-blue-500 transition-all"
                    onMouseEnter={() => document.getElementById(`settings-dropdown-${index}`)?.classList.remove('hidden')}
                    onMouseLeave={() => setTimeout(() => {
                      if (!document.getElementById(`settings-dropdown-${index}`)?.matches(':hover')) {
                        document.getElementById(`settings-dropdown-${index}`)?.classList.add('hidden');
                      }
                    }, 100)}
                  >
                    <AiOutlineSetting size={20} />
                  </button>
                  <div 
                    id={`settings-dropdown-${index}`} 
                    className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-2 z-20 hidden w-48"
                    onMouseEnter={() => document.getElementById(`settings-dropdown-${index}`)?.classList.remove('hidden')}
                    onMouseLeave={() => document.getElementById(`settings-dropdown-${index}`)?.classList.add('hidden')}
                    style={{ minWidth: '180px' }}
                  >
                    {isCustomSlotCourse ? (
                      // Only Delete for custom slot courses
                      <>
                        {/* Placeholder for potential future Edit for custom, if needed, but currently just Delete */}
                      </>
                    ) : isLabCourse ? (
                      // Settings for Lab courses
                      <button 
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => onEditFaculty(index)} // onEditFaculty is used for lab slot editing
                      >
                        <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                        <span>Edit Lab Slots</span>
                      </button>
                    ) : (
                      // Settings for regular Theory courses (with faculty preferences)
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
                    {(isCustomSlotCourse || isLabCourse || hasFacultyPreferences) && <div className="w-full h-px bg-gray-200 my-1"></div>}
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

              <div className="flex justify-between items-start mt-3">
                <h3 className="font-medium text-gray-900">{course.name}</h3>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
                  <span className="text-xs text-gray-500">Credits:</span>
                  <span className="text-sm font-medium text-gray-900">{course.credits}</span>
                </div>
              </div>
              
              {/* Faculty Preferences Display or Custom Message */}
              {expandedCard !== index && (
                <div className="mt-2 mb-2 pb-10">
                  {isCustomSlotCourse ? (
                    <div className="text-sm text-gray-500 italic">
                      Custom slot courses do not have faculty preference functionality.
                    </div>
                  ) : hasFacultyPreferences ? (
                    <div className="flex flex-col space-y-2">
                      {course.facultyPreferences!.slice(0, 3).map((faculty, facultyIndex) => {
                        let labSlotsForFaculty: string | null = null;
                        if (isLabCourse && course.facultyLabAssignments) {
                          const assignment = course.facultyLabAssignments.find(a => a.facultyName === faculty);
                          if (assignment && assignment.slots.length > 0) {
                            labSlotsForFaculty = assignment.slots.join('+');
                          }
                        }
                        return (
                          <div key={facultyIndex} className="flex items-center">
                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs mr-2">
                              {facultyIndex + 1}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{faculty}</div>
                            {labSlotsForFaculty && (
                              <span className="ml-2 text-xs">
                                {labSlotsForFaculty}
                              </span>
                            )}
                            {facultyIndex === 2 && course.facultyPreferences && course.facultyPreferences.length > 3 && (
                              <button 
                                className="text-gray-500 hover:text-gray-700 text-xs font-medium ml-2 flex items-center whitespace-nowrap"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCard(expandedCard === index ? null : index);
                                }}
                              >
                                See more
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Not custom, but no faculty preferences (e.g. a Lab course that hasn't had faculty assigned specifically for it yet)
                    <div className="text-sm text-gray-500 italic">
                      No faculties have been added.
                    </div>
                  )}
                </div>
              )}
              
              {/* Slot at the bottom for collapsed view - always fixed at bottom */}
              {expandedCard !== index && (
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`
                    px-3 py-2 text-xs font-medium rounded-md inline-block w-full text-center
                    ${getSlotColor(getBaseCourseName(course.name))}
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
              
              {/* Expanded Faculty List or Custom Message */}
              {expandedCard === index && (
                <div className="animate-expandDown overflow-hidden pb-14">
                  <div className="mt-2 py-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">All Preferred Faculty:</h4>
                    {isCustomSlotCourse ? (
                      <div className="text-sm text-gray-500 italic mb-3">
                        Custom slot courses do not have faculty preference functionality.
                      </div>
                    ) : hasFacultyPreferences ? (
                      course.facultyPreferences!.map((faculty, facultyIndex) => {
                        let labSlotsForFaculty: string | null = null;
                        if (isLabCourse && course.facultyLabAssignments) {
                          const assignment = course.facultyLabAssignments.find(a => a.facultyName === faculty);
                          if (assignment && assignment.slots.length > 0) {
                            labSlotsForFaculty = assignment.slots.join('+');
                          }
                        }
                        return (
                          <div key={facultyIndex} className="flex items-center mb-2 last:mb-1">
                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs mr-2">
                              {facultyIndex + 1}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{faculty}</div>
                            {labSlotsForFaculty && (
                              <span className="ml-2 text-xs">
                                {labSlotsForFaculty}
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 italic mb-3">
                        No faculties have been added.
                      </div>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-center">
                      <button 
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(null);
                        }}
                      >
                        Collapse 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Slot for expanded view - also fixed at bottom */}
              {expandedCard === index && (
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`
                    px-3 py-2 text-xs font-medium rounded-md inline-block w-full text-center
                    ${getSlotColor(getBaseCourseName(course.name))}
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

        {/* Add Course Button */}
        <button
          onClick={onAddCourse}
          className="w-72 h-[210px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all group"
        >
          <AiOutlinePlus className="text-2xl text-gray-500 mb-1" />
          <span className="text-sm font-medium text-gray-600">
            Add Course
          </span>
        </button>
      </div>
    </div>
  );
};

export default CourseCards; 