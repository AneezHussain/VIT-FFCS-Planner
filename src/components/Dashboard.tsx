import React, { useState, useRef, useCallback, type DragEvent, useEffect } from 'react';
import { AiOutlineMenu, AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineTeam, AiOutlinePlus, AiOutlineShareAlt, AiOutlineUpload, AiOutlineClose, AiOutlineFile, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlineCloud, AiOutlineCalendar, AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import { BiConversation } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import { VscDebugRestart } from 'react-icons/vsc';
import TimeTable from './TimeTable';
import CourseSlotSelector from './CourseSlotSelector';
import Communities from './Communities';
import TimeTableModal from './TimeTableModal';
import FacultyPreferenceModal from './FacultyPreferenceModal';
import ExportModal from './ExportModal';
import CustomPreferredSlotModal from './CustomPreferredSlotModal';
import FacultyList from './FacultyList';
import Navbar from './navbar';
import Sidebar from './Sidebar';
import CourseCards from './CourseCards';

// Define slot conflicts centrally here or import from a shared utility
const slotConflictPairs = [
  // Monday conflicts
  ['A1', 'L1'], ['F1', 'L2'], ['D1', 'L3'], ['TB1', 'L4'], ['TG1', 'L5'], ['L6', 'B1'],
  ['A2', 'L31'], ['F2', 'L32'], ['D2', 'L33'], ['TB2', 'L34'], ['TG2', 'L35'], ['L36', 'B2'],
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
];

interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
}

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const [isCustomSlotModalOpen, setIsCustomSlotModalOpen] = useState(false);
  const [customActiveTab, setCustomActiveTab] = useState<'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening'>('theory-morning');
  const [hideNavbar, setHideNavbar] = useState(false);
  const prevScrollPos = useRef(0);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');

  // Refs for the import, export, and Google Drive buttons
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);

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

  const getBaseCourseName = (name: string) => name.replace(/ Lab$/, '');

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
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        // Add course to data
        data.courses.push({
          name: rowData['courseName'],
          slots: rowData['slots'] ? rowData['slots'].split('|') : [],
          credits: parseInt(rowData['credits']),
          facultyPreferences: rowData['facultyPreferences'] ? rowData['facultyPreferences'].split('|').filter(Boolean) : [],
          facultyLabAssignments: rowData['facultyLabAssignments'] 
            ? rowData['facultyLabAssignments'].split(';').filter(Boolean).map((assignment: string) => {
                const [facultyName, slotsString] = assignment.split(':');
                return {
                  facultyName,
                  slots: slotsString ? slotsString.split('-') : [] // Assuming slots are 'L1-L2' in CSV
                };
              })
            : undefined
        });
        
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
    includeLabCourse?: boolean;
    facultyLabAssignments?: Map<string, string[]>
  }) => {
    let updatedCourses = [...courses];
    const theoryFacultyPrefs = data.facultyPreferences || [];
    const facultyLabAssignmentsArray = data.facultyLabAssignments 
      ? Array.from(data.facultyLabAssignments.entries()).map(([facultyName, slots]) => ({ facultyName, slots }))
      : undefined;

    if (editingCourseIndex !== null) {
      updatedCourses[editingCourseIndex] = { 
        ...updatedCourses[editingCourseIndex],
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits, 
        facultyPreferences: theoryFacultyPrefs,
        facultyLabAssignments: facultyLabAssignmentsArray || updatedCourses[editingCourseIndex].facultyLabAssignments
      };
      
      if (data.includeLabCourse) {
        const labCourse: Course = {
          name: `${data.courseName} Lab`,
          slots: data.selectedSlots, 
          credits: 1, 
          facultyPreferences: theoryFacultyPrefs, 
          facultyLabAssignments: facultyLabAssignmentsArray 
        };
        const existingLabIndex = updatedCourses.findIndex(c => c.name === labCourse.name);
        if (existingLabIndex !== -1) {
          updatedCourses[existingLabIndex] = { ...updatedCourses[existingLabIndex], ...labCourse };
        } else {
          updatedCourses.push(labCourse);
        }
      }
      setEditingCourseIndex(null);
    } else {
      const newTheoryCourse: Course = {
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits, 
        facultyPreferences: theoryFacultyPrefs,
      };
      updatedCourses.push(newTheoryCourse);

      if (data.includeLabCourse) {
        const newLabCourse: Course = {
          name: `${data.courseName} Lab`,
          slots: data.selectedSlots,
          credits: 1,
          facultyPreferences: theoryFacultyPrefs,
          facultyLabAssignments: facultyLabAssignmentsArray
        };
        updatedCourses.push(newLabCourse);
      }
    }
    setCourses(updatedCourses);
    setIsCourseModalOpen(false);
  };

  const handleFacultyPreferenceSubmit = (
    facultyPreferences: string[], 
    includeLabCourse?: boolean, 
    facultyLabAssignmentsMap?: Map<string, string[]>
  ) => {
    if (tempCourseData) {
      let updatedCourses = [...courses];
      let theoryCourseName = tempCourseData.courseName;
      let theorySlots = tempCourseData.selectedSlots;
      const facultyLabAssignmentsArray = facultyLabAssignmentsMap 
        ? Array.from(facultyLabAssignmentsMap.entries()).map(([facultyName, slots]) => ({ facultyName, slots })) 
        : undefined;

      if (editingCourseIndex !== null) {
        updatedCourses[editingCourseIndex] = {
          ...updatedCourses[editingCourseIndex],
          facultyPreferences,
        };
        theoryCourseName = updatedCourses[editingCourseIndex].name;
        theorySlots = updatedCourses[editingCourseIndex].slots;
      } else {
        const newCourse: Course = {
          name: tempCourseData.courseName,
          slots: tempCourseData.selectedSlots,
          credits: tempCourseData.credits,
          facultyPreferences,
        };
        updatedCourses.push(newCourse);
      }
      
      if (includeLabCourse) {
        const labCourseData: Course = {
          name: `${theoryCourseName} Lab`,
          slots: theorySlots, 
          credits: 1, 
          facultyPreferences: facultyPreferences,
          facultyLabAssignments: facultyLabAssignmentsArray 
        };
        const existingLabIndex = updatedCourses.findIndex(c => c.name === labCourseData.name);
        if (existingLabIndex !== -1) {
          updatedCourses[existingLabIndex] = { ...updatedCourses[existingLabIndex], ...labCourseData };
        } else {
          updatedCourses.push(labCourseData);
        }
      }
      
      setCourses(updatedCourses);
      if (editingCourseIndex !== null) {
        setEditingCourseIndex(null);
      }
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
    includeLabCourse?: boolean;
    facultyLabAssignments?: Map<string, string[]>
  }) => {
    let updatedCourses = [...courses];
    const theoryFacultyPrefs = data.facultyPreferences || [];
    const facultyLabAssignmentsArray = data.facultyLabAssignments
      ? Array.from(data.facultyLabAssignments.entries()).map(([facultyName, slots]) => ({ facultyName, slots }))
      : undefined;

    if (editingCourseIndex !== null) {
      updatedCourses[editingCourseIndex] = { 
        ...updatedCourses[editingCourseIndex],
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits, 
        facultyPreferences: theoryFacultyPrefs,
        facultyLabAssignments: facultyLabAssignmentsArray || updatedCourses[editingCourseIndex].facultyLabAssignments
      };
      
      if (data.includeLabCourse) {
        const labCourse: Course = {
          name: `${data.courseName} Lab`,
          slots: data.selectedSlots, 
          credits: 1, 
          facultyPreferences: theoryFacultyPrefs, 
          facultyLabAssignments: facultyLabAssignmentsArray 
        };
        const existingLabIndex = updatedCourses.findIndex(c => c.name === labCourse.name);
        if (existingLabIndex !== -1) {
          updatedCourses[existingLabIndex] = { ...updatedCourses[existingLabIndex], ...labCourse };
        } else {
          updatedCourses.push(labCourse);
        }
      }
      setEditingCourseIndex(null);
    } else {
      const newTheoryCourse: Course = {
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits, 
        facultyPreferences: theoryFacultyPrefs,
      };
      updatedCourses.push(newTheoryCourse);

      if (data.includeLabCourse) {
        const newLabCourse: Course = {
          name: `${data.courseName} Lab`,
          slots: data.selectedSlots, 
          credits: 1, 
          facultyPreferences: theoryFacultyPrefs, 
          facultyLabAssignments: facultyLabAssignmentsArray 
        };
        updatedCourses.push(newLabCourse);
      }
    }
    setCourses(updatedCourses);
    setIsCustomSlotModalOpen(false);
  };

  // Handle custom slot modal tab change
  const handleCustomTabChange = (tab: 'theory-morning' | 'theory-evening' | 'lab-morning' | 'lab-evening') => {
    setCustomActiveTab(tab);
    // Keep 'custom' selected in the preferredSlot while updating the custom tab
  };

  // Add getAllSelectedSlots function
  const getAllSelectedSlots = (): string[] => {
    return courses.reduce((accSlots: string[], course) => {
      let slotsForThisCourse: string[] = [...course.slots]; // Default to general course slots

      if (course.name.endsWith(' Lab') &&
          course.facultyPreferences && course.facultyPreferences.length > 0 &&
          course.facultyLabAssignments) {
        const firstFacultyName = course.facultyPreferences[0];
        const firstFacultyLabAssignment = course.facultyLabAssignments.find(a => a.facultyName === firstFacultyName);
        
        if (firstFacultyLabAssignment && firstFacultyLabAssignment.slots.length > 0) {
          slotsForThisCourse = firstFacultyLabAssignment.slots; // Use specific slots
        }
        // If no specific assignment for the first faculty, it implicitly uses course.slots (from initialization)
      }
      return [...accSlots, ...slotsForThisCourse];
    }, []);
  };

  // Handle Edit Course
  const handleEditCourse = (index: number) => {
    setEditingCourseIndex(index);
    // Open the appropriate modal based on selected preference
    if (preferredSlot === 'custom') {
      setIsCustomSlotModalOpen(true);
    } else {
      setIsCourseModalOpen(true);
    }
  };

  // Handle Edit Faculty
  const handleEditFaculty = (index: number) => {
    setEditingCourseIndex(index);
    const course = courses[index];
    const tempData = {
      courseName: course.name,
      selectedSlots: course.slots,
      credits: course.credits,
    };
    setTempCourseData(tempData);
    setIsFacultyModalOpen(true);
  };

  // Handle Add Course
  const handleAddCourse = () => {
    setEditingCourseIndex(null);
    // Open the appropriate modal based on selected preference
    if (preferredSlot === 'custom') {
      setIsCustomSlotModalOpen(true);
    } else {
      setIsCourseModalOpen(true);
    }
  };

  // Add exportDataToCSV function
  const exportDataToCSV = (userName?: string, message?: string): string => {
    const headers = ['courseName', 'slots', 'credits', 'facultyPreferences', 'semesterName', 'preferredSlot', 'facultyLabAssignments'];
    const csvData = courses.map(course => ({
      courseName: course.name,
      slots: course.slots.join('|'),
      credits: course.credits,
      facultyPreferences: course.facultyPreferences?.join('|') || '',
      semesterName: semesterName,
      preferredSlot: preferredSlot,
      facultyLabAssignments: course.facultyLabAssignments
        ?.map(assignment => `${assignment.facultyName}:${assignment.slots.join('-')}`)
        .join(';') || ''
    }));

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => row[header as keyof typeof row]).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'communities':
        return <Communities />;
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Semester Info and Course Cards */}
            <div>
              <div className="space-y-6">
                {/* Semester Input and Theory Preference in same row */}
                <div className="flex items-start gap-6">
                  {/* Semester Input - 60% width */}
                  <div className="w-48">
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-12"
                      placeholder="Enter semester name"
                    />
                  </div>

                  {/* Theory Slot Preference */}
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Theory Slot Preference
                    </label>
                    <div className="bg-gray-100 rounded-lg p-1 inline-flex items-center h-12">
                      <button
                        onClick={() => {
                          setPreferredSlot('morning');
                          setIsCustomSlotModalOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all h-full ${
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
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all h-full ${
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
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all h-full ${
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
                  <div className="mt-8">
                    <div className="flex items-center gap-6">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center h-12">
                        <span className="text-2xl font-bold text-gray-800">
                          {courses.reduce((total, course) => total + course.credits, 0)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">credits</span>
                      </div>
                      
                      {/* Reset Button */}
                      <button
                        onClick={handleResetTable}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 h-12 ${
                          courses.length > 0 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        } transition-colors`}
                        disabled={courses.length === 0}
                        title="Reset all courses"
                      >
                        <VscDebugRestart size={20} />
                        <span className="font-medium">Reset</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course Cards Component */}
                <CourseCards 
                  courses={courses}
                  onEditCourse={handleEditCourse}
                  onEditFaculty={handleEditFaculty}
                  onDeleteCourse={handleDeleteCourse}
                  onAddCourse={handleAddCourse}
                />
              </div>
            </div>

            {/* Timetable Display Area */}
            <div className="flex items-center mb-4 mt-8">
              <AiOutlineCalendar size={20} className="text-gray-700 mr-2" />
              <h2 className="text-xl font-semibold text-gray-700">Time Table</h2>
            </div>
            <div className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl overflow-hidden">
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
              existingSlots={getAllSelectedSlots().filter((slot: string) => 
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
              existingSlots={getAllSelectedSlots().filter((slot: string) => 
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
                allCurrentlyUsedSlots={getAllSelectedSlots()}
                slotConflictPairs={slotConflictPairs}
              />
            )}
          </div>
        );
      case 'faculty-list':
        return <FacultyList courses={courses} semesterName={semesterName} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-auto flex flex-col">
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
      <Navbar 
        hideNavbar={hideNavbar}
        currentPage={currentPage}
        importButtonRef={importButtonRef}
        setIsImportModalOpen={setIsImportModalOpen}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content - Fixed width and centered */}
      <div className={`flex-grow pt-24 mx-auto max-w-screen-2xl transition-all duration-300 ease-in-out pl-8`}>
        <div className="w-full mx-auto py-4">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <p className="text-gray-600">Made with ❤️ for Vitians</p>
          </div>
        </div>
      </footer>

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

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
        // onClose(); // Removed to prevent closing on outside click
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

export default Dashboard; 