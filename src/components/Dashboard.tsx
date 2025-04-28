import React, { useState, useRef, useCallback, DragEvent, useEffect } from 'react';
import { AiOutlineMenu, AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineTeam, AiOutlinePlus, AiOutlineShareAlt, AiOutlineUpload, AiOutlineClose, AiOutlineFile, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlineCloud } from 'react-icons/ai';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { VscDebugRestart } from 'react-icons/vsc';
import TimeTable from './TimeTable';
import CourseSlotSelector from './CourseSlotSelector';
import Communities from './Communities';
import TimeTableModal from './TimeTableModal';
import FacultyPreferenceModal from './FacultyPreferenceModal';
import ExportModal from './ExportModal';
import CustomPreferredSlotModal from './CustomPreferredSlotModal';

interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
}

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [semesterName, setSemesterName] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [preferredSlot, setPreferredSlot] = useState<'morning' | 'evening' | 'custom'>('morning');
  const [isTimeTableModalOpen, setTimeTableModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempCourseData, setTempCourseData] = useState<{ courseName: string; selectedSlots: string[]; credits: number } | null>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isCustomSlotModalOpen, setIsCustomSlotModalOpen] = useState(false);
  const [customActiveTab, setCustomActiveTab] = useState<'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening'>('theory-morning');
  const [hideNavbar, setHideNavbar] = useState(false);
  const prevScrollPos = useRef(0);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');

  // Refs for the import, export, and Google Drive buttons
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  
  // Ref for expanded card to check for clicks outside
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setHideNavbar(prevScrollPos.current < currentScrollPos && currentScrollPos > 50);
      prevScrollPos.current = currentScrollPos;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileImport(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  }, []);

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      
      // Parse CSV content
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      
      // Check if the CSV has the expected format
      const expectedHeaders = ['courseName', 'slots', 'credits', 'facultyPreferences', 'semesterName', 'preferredSlot'];
      const isValidFormat = expectedHeaders.every(header => headers.includes(header));
      
      if (!isValidFormat) {
        alert('Invalid CSV format. Please use the exported CSV format.');
        return;
      }
      
      // Extract data from the CSV
      const data: {
        courses: Course[];
        semesterName: string;
        preferredSlot: 'morning' | 'evening' | 'custom';
      } = {
        courses: [],
        semesterName: '',
        preferredSlot: 'morning'
      };
      
      // Process each row
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',');
        const rowData: { [key: string]: any } = {};
        
        // Map values to headers
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        // Add course to data
        data.courses.push({
          name: rowData['courseName'],
          slots: rowData['slots'] ? rowData['slots'].split('|') : [],
          credits: parseInt(rowData['credits']),
          facultyPreferences: rowData['facultyPreferences'] ? rowData['facultyPreferences'].split('|').filter(Boolean) : []
        });
        
        // Set semester name and preferred slot from the first row
        if (i === 1) {
          data.semesterName = rowData['semesterName'] || '';
          data.preferredSlot = (rowData['preferredSlot'] === 'evening' ? 'evening' : rowData['preferredSlot'] === 'custom' ? 'custom' : 'morning');
        }
      }
      
      // Update the state with the imported data
      setCourses(data.courses);
      setSemesterName(data.semesterName);
      setPreferredSlot(data.preferredSlot);
      
      // Close the import modal
      setIsImportModalOpen(false);
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const importDataFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    handleFileImport(file);
  };

  const handleCourseSubmit = (data: { 
    courseName: string; 
    selectedSlots: string[]; 
    credits: number;
    facultyPreferences?: string[];
  }) => {
    if (editingCourseIndex !== null) {
      // Update existing course
      const updatedCourses = [...courses];
      updatedCourses[editingCourseIndex] = { 
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        facultyPreferences: data.facultyPreferences || []
      };
      setCourses(updatedCourses);
      setEditingCourseIndex(null);
    } else {
      // Add new course
      setCourses([...courses, { 
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        facultyPreferences: data.facultyPreferences || []
      }]);
    }
    setIsCourseModalOpen(false);
  };

  const handleFacultyPreferenceSubmit = (facultyPreferences: string[]) => {
    if (tempCourseData && editingCourseIndex !== null) {
      // Update faculty for existing course
      const updatedCourses = [...courses];
      updatedCourses[editingCourseIndex] = {
        ...updatedCourses[editingCourseIndex],
        facultyPreferences
      };
      setCourses(updatedCourses);
      setEditingCourseIndex(null);
    }
    setTempCourseData(null);
    setIsFacultyModalOpen(false);
  };

  const handleDeleteCourse = (indexToDelete: number) => {
    setCourses(courses.filter((_, index) => index !== indexToDelete));
  };

  const handleTimeTableSubmit = (data: { semester: string; timing: 'morning' | 'evening' }) => {
    // Handle the submission of the time table data
    setTimeTableModalOpen(false);
  };

  // Handle reset table function
  const handleResetTable = () => {
    if (courses.length > 0) {
      if (window.confirm('Are you sure you want to reset all courses? This action cannot be undone.')) {
        setCourses([]);
      }
    }
  };

  // Handle custom slot modal submission
  const handleCustomSlotSubmit = (data: { 
    courseName: string; 
    selectedSlots: string[]; 
    credits: number;
    facultyPreferences?: string[];
  }) => {
    if (editingCourseIndex !== null) {
      // Update existing course
      const updatedCourses = [...courses];
      updatedCourses[editingCourseIndex] = { 
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        facultyPreferences: data.facultyPreferences || []
      };
      setCourses(updatedCourses);
      setEditingCourseIndex(null);
    } else {
      // Add new course
      setCourses([...courses, { 
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        facultyPreferences: data.facultyPreferences || []
      }]);
    }
    setIsCustomSlotModalOpen(false);
  };

  // Handle custom slot modal tab change
  const handleCustomTabChange = (tab: 'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening') => {
    setCustomActiveTab(tab);
    // Keep 'custom' selected in the preferredSlot while updating the custom tab
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'communities':
        return <Communities />;
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                Hello, Mohammed Aneez
              </h1>
              <p className="mt-3 text-xl text-gray-600">
                Welcome to your FFCS dashboard!
              </p>
            </div>
            
            {/* Semester Info and Course Cards */}
            <div>
              <div className="space-y-6">
                {/* Semester Input and Theory Preference in same row */}
                <div className="flex items-start gap-6">
                  {/* Semester Input - 60% width */}
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester Name
                    </label>
                    <input
                      type="text"
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter semester name"
                    />
                  </div>

                  {/* Theory Slot Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theory Slot Preference
                    </label>
                    <div className="bg-gray-100 rounded-lg p-1 inline-flex items-center">
                      <button
                        onClick={() => {
                          setPreferredSlot('morning');
                          setIsCustomSlotModalOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          preferredSlot === 'morning'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        <BsSun className={`${preferredSlot === 'morning' ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>Morning</span>
                      </button>
                      <div className="w-px h-5 bg-gray-300"></div>
                      <button
                        onClick={() => {
                          setPreferredSlot('evening');
                          setIsCustomSlotModalOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          preferredSlot === 'evening'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        <BsMoonStars className={`${preferredSlot === 'evening' ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>Evening</span>
                      </button>
                      <div className="w-px h-5 bg-gray-300"></div>
                      <button
                        onClick={() => {
                          setPreferredSlot('custom');
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          preferredSlot === 'custom'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        <AiOutlineSetting className="mr-1" size={16} />
                        <span>Custom</span>
                      </button>
                    </div>
                  </div>
                   
                  {/* Total Credits Counter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Credits
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center">
                        <span className="text-2xl font-bold text-gray-800">
                          {courses.reduce((total, course) => total + course.credits, 0)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">credits</span>
                      </div>
                      
                      {/* Reset Button */}
                      <button
                        onClick={handleResetTable}
                        className={`p-2 rounded-lg flex items-center ${
                          courses.length > 0 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        } transition-colors`}
                        disabled={courses.length === 0}
                        title="Reset all courses"
                      >
                        <VscDebugRestart size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course Cards Section */}
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Course Cards */}
                  {courses.map((course, index) => (
                    <div 
                      key={index}
                      className={`
                        bg-white border border-gray-200 rounded-lg p-4 pb-6 hover:shadow-md transition-all relative group flex flex-col
                        ${expandedCard === index ? 'w-96 min-h-[260px] shadow-lg' : 'w-72 h-[210px]'}
                      `}
                      style={{
                        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out, min-height 0.3s ease-in-out, transform 0.3s ease-in-out',
                        zIndex: expandedCard === index ? 10 : 1,
                        transform: expandedCard === index ? 'scale(1.02)' : 'scale(1)'
                      }}
                      ref={(el) => (cardRefs.current[index] = el)}
                    >
                      {/* Settings Button */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="relative">
                          <button 
                            className="p-1 rounded-full bg-white text-gray-400 hover:text-blue-500 shadow-sm hover:shadow-md transition-all"
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
                            <button 
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                // Open course selector modal with existing data
                                setEditingCourseIndex(index);
                                // Open the appropriate modal based on selected preference
                                if (preferredSlot === 'custom') {
                                  setIsCustomSlotModalOpen(true);
                                } else {
                                  setIsCourseModalOpen(true);
                                }
                              }}
                            >
                              <AiOutlineEdit className="mr-2 text-gray-500" size={18} />
                              <span>Edit Course</span>
                            </button>
                            <button 
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                // Open faculty preference modal directly
                                setEditingCourseIndex(index);
                                const tempData = {
                                  courseName: course.name,
                                  selectedSlots: course.slots,
                                  credits: course.credits
                                };
                                setTempCourseData(tempData);
                                setIsFacultyModalOpen(true);
                              }}
                            >
                              <AiOutlineUser className="mr-2 text-gray-500" size={18} />
                              <span>Edit Faculty</span>
                            </button>
                            <div className="w-full h-px bg-gray-200 my-1"></div>
                            <button 
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteCourse(index)}
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
                      
                      {/* Faculty Preferences (if any) */}
                      {course.facultyPreferences && course.facultyPreferences.length > 0 && expandedCard !== index && (
                        <div className="mt-2 mb-2 pb-10">
                          <div className="flex items-center flex-wrap gap-2">
                            {course.facultyPreferences.slice(0, 3).map((faculty, facultyIndex) => (
                              <div key={facultyIndex} className="flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs font-medium">
                                {faculty}
                              </div>
                            ))}
                            {course.facultyPreferences.length > 3 && (
                              <button 
                                className="ml-2 text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center"
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
                        </div>
                      )}

                      {/* Show "No faculties added" message when no faculty preferences exist */}
                      {(!course.facultyPreferences || course.facultyPreferences.length === 0) && expandedCard !== index && (
                        <div className="mt-2 mb-2 pb-10">
                          <span className="text-xs text-gray-500">Preferred Faculty:</span>
                          <div className="text-sm text-gray-500 italic mt-1">
                            No faculties have been added
                          </div>
                        </div>
                      )}
                      
                      {/* Slot at the bottom for collapsed view - always fixed at bottom */}
                      {expandedCard !== index && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className={`
                            px-3 py-2 text-xs font-medium rounded-md inline-block w-full text-center
                            ${
                              [
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
                              ][index % 12]
                            }
                          `}>
                            {course.slots.join('+')}
                          </span>
                        </div>
                      )}
                      
                      {/* Expanded Faculty List */}
                      {expandedCard === index && course.facultyPreferences && course.facultyPreferences.length > 0 && (
                        <div className="animate-expandDown overflow-hidden pb-14">
                          <div className="mt-2 py-2 px-3 bg-gray-50 rounded-md">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">All Preferred Faculty:</h4>
                            {course.facultyPreferences.map((faculty, facultyIndex) => (
                              <div key={facultyIndex} className="flex items-center mb-2 last:mb-1">
                                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs mr-2">
                                  {facultyIndex + 1}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{faculty}</div>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-center">
                              <button 
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center"
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
                      
                      {/* Expanded view showing "No faculties added" message */}
                      {expandedCard === index && (!course.facultyPreferences || course.facultyPreferences.length === 0) && (
                        <div className="animate-expandDown overflow-hidden pb-14">
                          <div className="mt-2 py-2 px-3 bg-gray-50 rounded-md">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">All Preferred Faculty:</h4>
                            <div className="text-sm text-gray-500 italic mb-3">
                              No faculties have been added
                            </div>
                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-center">
                              <button 
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center"
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
                            ${
                              [
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
                              ][index % 12]
                            }
                          `}>
                            {course.slots.join('+')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Course Button */}
                  <button
                    onClick={() => {
                      setEditingCourseIndex(null);
                      // Open the appropriate modal based on selected preference
                      if (preferredSlot === 'custom') {
                        setIsCustomSlotModalOpen(true);
                      } else {
                        setIsCourseModalOpen(true);
                      }
                    }}
                    className="w-72 h-[210px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-all group"
                  >
                    <AiOutlinePlus className="text-2xl text-gray-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">
                      Add Course
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <TimeTable courses={courses} />
            </div>

            {/* Course Selector Modal */}
            <CourseSlotSelector
              isOpen={isCourseModalOpen}
              onClose={() => {
                setIsCourseModalOpen(false);
                setEditingCourseIndex(null);
              }}
              onSubmit={handleCourseSubmit}
              preferredSlot={preferredSlot}
              existingSlots={getAllSelectedSlots().filter(slot => 
                editingCourseIndex === null || !courses[editingCourseIndex].slots.includes(slot)
              )}
              editingCourse={editingCourseIndex !== null ? courses[editingCourseIndex] : undefined}
            />

            <TimeTableModal
              isOpen={isTimeTableModalOpen}
              onClose={() => setTimeTableModalOpen(false)}
              onSubmit={handleTimeTableSubmit}
              existingSlots={getAllSelectedSlots()}
            />

            {/* Custom Slot Modal */}
            <CustomPreferredSlotModal
              isOpen={isCustomSlotModalOpen}
              onClose={() => {
                setIsCustomSlotModalOpen(false);
                setEditingCourseIndex(null);
              }}
              onSubmit={handleCustomSlotSubmit}
              onTabChange={handleCustomTabChange}
              activeTab={customActiveTab}
              existingSlots={getAllSelectedSlots().filter(slot => 
                editingCourseIndex === null || !courses[editingCourseIndex].slots.includes(slot)
              )}
              editingCourse={editingCourseIndex !== null ? courses[editingCourseIndex] : undefined}
            />

            {/* Faculty Preference Modal */}
            {tempCourseData && (
              <FacultyPreferenceModal
                isOpen={isFacultyModalOpen}
                onClose={() => {
                  setIsFacultyModalOpen(false);
                  setTempCourseData(null);
                  setEditingCourseIndex(null);
                }}
                onSubmit={handleFacultyPreferenceSubmit}
                courseName={`${tempCourseData.courseName} ${tempCourseData.selectedSlots.join('+')}`}
                initialFacultyPreferences={editingCourseIndex !== null ? courses[editingCourseIndex].facultyPreferences : []}
              />
            )}
          </div>
        );
      case 'faculty-list':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                Faculty List
              </h1>
              <p className="mt-3 text-xl text-gray-600">
                View all faculty preferences
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={facultySearchQuery}
                    onChange={(e) => setFacultySearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {semesterName && (
                <div className="font-medium text-lg text-gray-900 mb-4">
                  Semester: {semesterName}
                </div>
              )}
              
              {/* Create a flattened, alphabetically sorted list of all faculty */}
              {(() => {
                // Extract all faculty with their course and slot info
                const allFaculty: Array<{
                  facultyName: string;
                  courseName: string;
                  slots: string[];
                }> = [];
                
                courses.forEach(course => {
                  if (course.facultyPreferences && course.facultyPreferences.length > 0) {
                    course.facultyPreferences.forEach(faculty => {
                      allFaculty.push({
                        facultyName: faculty,
                        courseName: course.name,
                        slots: course.slots,
                      });
                    });
                  }
                });
                
                // Filter by search query
                const filteredFaculty = allFaculty.filter(item => 
                  facultySearchQuery === '' || 
                  item.facultyName.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                  item.courseName.toLowerCase().includes(facultySearchQuery.toLowerCase())
                );
                
                // Sort alphabetically by faculty name
                filteredFaculty.sort((a, b) => a.facultyName.localeCompare(b.facultyName));
                
                if (filteredFaculty.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <div className="text-gray-400 mb-3">
                        <AiOutlineUser size={40} className="mx-auto" />
                      </div>
                      {facultySearchQuery ? (
                        <p className="text-gray-600">No faculties found matching "{facultySearchQuery}"</p>
                      ) : (
                        <p className="text-gray-600">No faculty preferences have been added yet</p>
                      )}
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {filteredFaculty.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                        <div className="flex items-start">
                          <div className="font-bold text-gray-900">{item.facultyName}</div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {item.courseName} • {item.slots.join('+')}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-auto">
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importDataFromCSV}
        accept=".csv"
        className="hidden"
        id="csv-file-input"
      />
      
      {/* Top Navigation Bar */}
      <nav className={`bg-white shadow-sm fixed w-full z-10 ${hideNavbar ? 'hidden' : ''}`}>
        <div className="h-16 w-full px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <AiOutlineMenu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          
          {/* Profile Section with Import/Export/Google Drive Buttons */}
          <div className="flex items-center space-x-3">
            {/* Import Button */}
            <button
              ref={importButtonRef}
              onClick={() => setIsImportModalOpen(true)}
              className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              title="Import data from CSV"
            >
              <AiOutlineUpload className="h-5 w-5" />
            </button>
            
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Mohammed Aneez</div>
              <div className="text-xs text-gray-500">20BCE1430</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              MA
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full bg-white shadow-md transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 z-20`}
      >
        <div className="p-4">
          <div className="space-y-4">
            <SidebarItem 
              icon={<AiOutlineHome />} 
              text="Dashboard" 
              onClick={() => setCurrentPage('dashboard')}
              active={currentPage === 'dashboard'}
            />
            <SidebarItem 
              icon={<AiOutlineUser />} 
              text="Faculty List" 
              onClick={() => setCurrentPage('faculty-list')}
              active={currentPage === 'faculty-list'}
            />
            <SidebarItem 
              icon={<AiOutlineTeam />} 
              text="Communities" 
              onClick={() => setCurrentPage('communities')}
              active={currentPage === 'communities'}
            />
            <SidebarItem icon={<AiOutlineSetting />} text="Settings" onClick={() => setCurrentPage('settings')} />
          </div>
        </div>
      </div>

      {/* Main Content - Fixed width and centered */}
      <div className="pt-16 mx-auto max-w-7xl">
        <div className="w-full mx-auto p-8">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <p className="text-gray-600">Made with ❤️ for Vitians</p>
          </div>
        </div>
      </footer>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal 
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          exportDataToCSV={exportDataToCSV}
          defaultUserName="Mohammed Aneez"
          triggerRef={exportButtonRef}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportPopover
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          triggerRef={importButtonRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDragging={isDragging}
        />
      )}
    </div>
  );
};

// Import Popover Component
interface ImportPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

const ImportPopover: React.FC<ImportPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position based on trigger button location
  useEffect(() => {
    if (isOpen && triggerRef?.current && modalRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      // Position below and to the right of the trigger button
      setPosition({
        top: triggerRect.bottom + window.scrollY + 10, // 10px gap
        right: window.innerWidth - triggerRect.right - window.scrollX
      });
    }
  }, [isOpen, triggerRef]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) && 
        triggerRef?.current !== event.target && 
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed z-50 shadow-xl rounded-xl"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="bg-white rounded-xl w-80 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">
            Import FFCS Data
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all mb-3
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
              }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center">
              <AiOutlineFile className={`text-3xl mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop your CSV file here
              </p>
              <p className="text-xs text-gray-500 mb-3">
                or
              </p>
              <label 
                htmlFor="csv-file-input"
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Only CSV files that were previously exported from this application are supported.
          </p>
        </div>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  text: string; 
  onClick?: () => void;
  active?: boolean;
}> = ({ icon, text, onClick, active }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700 ${
        active ? 'bg-gray-100' : ''
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default Dashboard; 