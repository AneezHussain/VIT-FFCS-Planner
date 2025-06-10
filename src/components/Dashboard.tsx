import React, { useState, useRef, useCallback, type DragEvent, useEffect } from 'react';
import { AiOutlineMenu, AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlinePlus, AiOutlineShareAlt, AiOutlineUpload, AiOutlineClose, AiOutlineFile, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlineCloud, AiOutlineCalendar, AiOutlineQuestionCircle, AiOutlineBgColors, AiOutlineDownload, AiOutlineInfoCircle, AiOutlineMail } from 'react-icons/ai';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { VscDebugRestart } from 'react-icons/vsc';
import html2canvas from 'html2canvas';
import TimeTable from './TimeTable';
import CourseSlotSelector from './CourseSlotSelector';
import TimeTableModal from './TimeTableModal';
import FacultyPreferenceModal from './FacultyPreferenceModal';
import ExportModal from './ExportModal';
import ImportPopover from './ImportPopover';
import CourseCards from './CourseCards';
import TimeTableSlotSelector from './TimeTableSlotSelector';
import { PALETTES, getNextColorIndex } from '../utils/colorUtils';

// Define slot conflicts centrally here or import from a shared utility
const slotConflictPairs = [
  // Monday conflicts
  ['A1', 'L1'], ['F1', 'L2'], ['D1', 'L3'], ['TB1', 'L4'], ['TG1', 'L5'],
  ['A2', 'L31'], ['F2', 'L32'], ['D2', 'L33'], ['TB2', 'L34'], ['TG2', 'L35'],

  // Tuesday conflicts
  ['B1', 'L7'], ['G1', 'L8'], ['E1', 'L9'], ['TC1', 'L10'], ['TAA1', 'L11'],
  ['B2', 'L37'], ['G2', 'L38'], ['E2', 'L39'], ['TC2', 'L40'], ['TAA2', 'L41'],

  // Wednesday conflicts
  ['C1', 'L13'], ['A1', 'L14'], ['F1', 'L15'], ['D1', 'L16'], ['TB1', 'L17'],
  ['C2', 'L43'], ['A2', 'L44'], ['F2', 'L45'], ['TD2', 'L46'], ['TBB2', 'L47'],

  // Thursday conflicts
  ['D1', 'L19'], ['B1', 'L20'], ['G1', 'L21'], ['E1', 'L22'], ['TCC1', 'L23'],
  ['D2', 'L49'], ['B2', 'L50'], ['G2', 'L51'], ['E2', 'L52'], ['TCC2', 'L53'],

  // Friday conflicts
  ['E1', 'L25'], ['C1', 'L26'], ['TA1', 'L27'], ['TF1', 'L28'], ['TD1', 'L29'],
  ['E2', 'L55'], ['C2', 'L56'], ['TA2', 'L57'], ['TF2', 'L58'], ['TDD2', 'L59']
];

interface Course {
  name: string;
  slots: string[];
  credits: number;
  colorIndex: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
  creationMode?: 'standard' | 'custom';
}

interface DashboardProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isExportModalOpen: boolean;
  setIsExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  importButtonRef: React.RefObject<HTMLButtonElement>;
  exportButtonRef: React.RefObject<HTMLButtonElement>;
}

// Define a type for the stored data
interface StoredData {
  courses: Course[];
  preferredSlot: 'standard' | 'custom';
  selectedPalette: keyof typeof PALETTES;
}

const STORAGE_KEY = 'ffcs_planner_data';

const Dashboard: React.FC<DashboardProps> = ({
  currentPage,
  setCurrentPage,
  isImportModalOpen,
  setIsImportModalOpen,
  isExportModalOpen,
  setIsExportModalOpen,
  importButtonRef,
  exportButtonRef
}) => {
  // Load initial state from localStorage
  const loadInitialState = (): StoredData => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      courses: [],
      preferredSlot: 'standard',
      selectedPalette: 'default'
    };
  };

  const initialState = loadInitialState();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialState.courses);
  const [isTimeTableModalOpen, setTimeTableModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempCourseData, setTempCourseData] = useState<{ courseName: string; selectedSlots: string[]; credits: number; facultyPreferences?: string[]; includeLabCourse?: boolean; facultyLabAssignments?: Map<string, string[]> } | null>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [isTimeTableSlotModalOpen, setIsTimeTableSlotModalOpen] = useState(false);
  const prevScrollPos = useRef(0);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<'standard' | 'custom'>(initialState.preferredSlot);
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof PALETTES>(initialState.selectedPalette);
  const [tempColorIndex, setTempColorIndex] = useState<number>(0);
  const [isPaletteDropdownOpen, setIsPaletteDropdownOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  // Add click outside handler for help menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
    };

    if (isHelpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHelpMenuOpen]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToSave: StoredData = {
        courses,
        preferredSlot,
        selectedPalette
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [courses, preferredSlot, selectedPalette]);

  // Add a function to clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCourses([]);
      setPreferredSlot('standard');
      setSelectedPalette('default');
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  };

  // Modify handleResetTable to also clear localStorage
  const handleResetTable = () => {
    if (courses.length > 0) {
      if (window.confirm('Are you sure you want to reset all courses? This action cannot be undone.')) {
        clearSavedData();
      }
    }
  };

  // Refs for the palette dropdown
  const paletteDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteDropdownRef.current && !paletteDropdownRef.current.contains(event.target as Node)) {
        setIsPaletteDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [paletteDropdownRef]);

  const getBaseCourseName = (name: string) => name.replace(/ (Lab|Edit Lab|Edit Faculty|Add Lab)$/, '').trim();

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
      const csvHeaders = lines[0].split(',');
      
      // Check if the CSV has the expected format
      const expectedHeaders = ['courseName', 'slots', 'credits', 'colorIndex', 'facultyPreferences', 'preferredSlot', 'creationMode', 'facultyLabAssignments'];
      const isValidFormat = expectedHeaders.every(header => csvHeaders.includes(header));
      
      if (!isValidFormat) {
        alert('Invalid CSV format. Please use the exported CSV format.');
        return;
      }
      
      // Extract data from the CSV
      const data: {
        courses: Course[];
        preferredSlot: 'standard' | 'custom';
      } = {
        courses: [],
        preferredSlot: 'standard'
      };
      
      // Process each row
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',');
        const rowData: { [key: string]: any } = {};
        
        csvHeaders.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        const courseCreationMode = rowData['creationMode'] === 'custom' ? 'custom' : 'standard';

        // Add course to data
        data.courses.push({
          name: rowData['courseName'],
          slots: rowData['slots'] ? rowData['slots'].split('|') : [],
          credits: parseInt(rowData['credits']),
          colorIndex: parseInt(rowData['colorIndex']) || 0,
          facultyPreferences: rowData['facultyPreferences'] ? rowData['facultyPreferences'].split('|').filter(Boolean) : [],
          facultyLabAssignments: rowData['facultyLabAssignments'] 
            ? rowData['facultyLabAssignments'].split(';').filter(Boolean).map((assignment: string) => {
                const [facultyName, slotsString] = assignment.split(':');
                return {
                  facultyName,
                  slots: slotsString ? slotsString.split('-') : []
                };
              })
            : undefined,
          creationMode: courseCreationMode
        });
        
        if (i === 1) {
          data.preferredSlot = courseCreationMode;
        }
      }
      
      // Update the state with the imported data
      setCourses(data.courses);
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

  const handleAddFaculty = (data: { courseName: string; selectedSlots: string[]; credits: number; colorIndex: number; }) => {
    setTempCourseData(data);
    setTempColorIndex(data.colorIndex);
    setIsCourseModalOpen(false); // Close course modal
    setIsFacultyModalOpen(true); // Open faculty modal
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
      const editingCourse = updatedCourses[editingCourseIndex];
      const oldCourseName = editingCourse.name;
      const isEditingTheory = !oldCourseName.endsWith(' Lab');
      
      // Update the current course being edited
      updatedCourses[editingCourseIndex] = { 
        ...editingCourse,
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits, 
        colorIndex: editingCourse.colorIndex,
        facultyPreferences: theoryFacultyPrefs,
        facultyLabAssignments: facultyLabAssignmentsArray || editingCourse.facultyLabAssignments
      };
      
      // If editing a theory course, update its lab course if it exists
      if (isEditingTheory) {
        const oldLabName = `${oldCourseName} Lab`;
        const newLabName = `${data.courseName} Lab`;
        const labIndex = updatedCourses.findIndex(c => c.name === oldLabName);
        
        if (labIndex !== -1) {
          updatedCourses[labIndex] = {
            ...updatedCourses[labIndex],
            name: newLabName,
            colorIndex: editingCourse.colorIndex
          };
        }
      }
      
      setEditingCourseIndex(null);
    } else {
      const newColorIndex = getNextColorIndex(courses);
      const newTheoryCourse: Course = {
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        colorIndex: newColorIndex,
        facultyPreferences: theoryFacultyPrefs,
        creationMode: 'standard'
      };
      updatedCourses.push(newTheoryCourse);

      if (data.includeLabCourse) {
        const newLabCourse: Course = {
          name: `${data.courseName} Lab`,
          slots: data.selectedSlots,
          credits: 1,
          colorIndex: newColorIndex,
          facultyPreferences: theoryFacultyPrefs,
          facultyLabAssignments: facultyLabAssignmentsArray,
          creationMode: 'standard'
        };
        updatedCourses.push(newLabCourse);
      }
    }
    setCourses(updatedCourses);
  };

  const handleFacultyPreferenceSubmit = (
    facultyPreferences: string[], 
    includeLabCourse?: boolean, 
    facultyLabAssignmentsMap?: Map<string, string[]>
  ) => {
    const facultyLabAssignmentsArray = facultyLabAssignmentsMap
      ? Array.from(facultyLabAssignmentsMap.entries()).map(([facultyName, slots]) => ({ facultyName, slots }))
      : undefined;

    if (tempCourseData && tempCourseData.courseName.includes('Add Lab')) {
      const baseCourseName = getBaseCourseName(tempCourseData.courseName);
      const theoryCourseIndex = courses.findIndex(c => c.name === baseCourseName);

      if (theoryCourseIndex !== -1) {
        const theoryCourse = courses[theoryCourseIndex];
        const labCourse: Course = {
          name: `${baseCourseName} Lab`,
          slots: theoryCourse.slots, // Initially same as theory
          credits: 1, // Labs are typically 1 credit
          colorIndex: theoryCourse.colorIndex,
          facultyPreferences: facultyPreferences,
          facultyLabAssignments: facultyLabAssignmentsArray,
          creationMode: theoryCourse.creationMode,
        };
        
        // Add theory faculty preferences as well
        const updatedTheoryCourse = {
            ...theoryCourse,
            facultyPreferences: facultyPreferences,
            facultyLabAssignments: facultyLabAssignmentsArray,
        };

        setCourses(prevCourses => {
            const newCourses = [...prevCourses];
            newCourses[theoryCourseIndex] = updatedTheoryCourse;
            
            // Check if lab already exists to avoid duplicates
            const existingLabIndex = newCourses.findIndex(c => c.name === labCourse.name);
            if(existingLabIndex === -1) {
                newCourses.push(labCourse);
            }
            return newCourses;
        });
      }
      setIsFacultyModalOpen(false);
      setTempCourseData(null);
      setEditingCourseIndex(null);
      return; // Exit after handling
    }

    if (editingCourseIndex !== null) {
      // We are editing an existing course's faculty
      const originalCourse = courses[editingCourseIndex];
      const baseCourseName = getBaseCourseName(originalCourse.name);

      setCourses(prevCourses => {
        let updatedCourses = [...prevCourses];
        
        // Update the theory course
        updatedCourses[editingCourseIndex] = {
          ...originalCourse,
          facultyPreferences: facultyPreferences,
          facultyLabAssignments: facultyLabAssignmentsArray || originalCourse.facultyLabAssignments
        };

        // If a lab course needs to be added or updated
        if (includeLabCourse) {
          const labCourseName = `${baseCourseName} Lab`;
          const existingLabIndex = updatedCourses.findIndex(c => getBaseCourseName(c.name) === baseCourseName && c.name.endsWith(' Lab'));

          const labCourseData: Course = {
            name: labCourseName,
            slots: originalCourse.slots, // Labs share theory slots
            credits: 1,
            colorIndex: originalCourse.colorIndex,
            facultyPreferences: facultyPreferences,
            facultyLabAssignments: facultyLabAssignmentsArray,
            creationMode: originalCourse.creationMode
          };

          if (existingLabIndex !== -1) {
            // Update existing lab course
            updatedCourses[existingLabIndex] = labCourseData;
          } else {
            // Add new lab course
            updatedCourses.push(labCourseData);
          }
        }
        
        return updatedCourses;
      });

      setEditingCourseIndex(null);
      setTempCourseData(null);
      setIsFacultyModalOpen(false);

    } else if (tempCourseData) {
      // We are adding a new course (or at least, that's what this branch should handle)
      // This case might not be strictly needed if faculty are only added via editing a course that already exists.
      // For safety, let's assume it could be for adding a new course with faculty info right away.
      const baseCourseName = getBaseCourseName(tempCourseData.courseName);

      const newCourse: Course = {
        name: baseCourseName,
        slots: tempCourseData.selectedSlots,
        credits: tempCourseData.credits,
        colorIndex: tempColorIndex,
        facultyPreferences: facultyPreferences,
        facultyLabAssignments: facultyLabAssignmentsArray,
        creationMode: 'standard'
      };
      
      let updatedCourses = [...courses, newCourse];

      if (includeLabCourse) {
        const labCourse: Course = {
          name: `${baseCourseName} Lab`,
          slots: tempCourseData.selectedSlots,
          credits: 1,
          colorIndex: tempColorIndex,
          facultyPreferences: facultyPreferences,
          facultyLabAssignments: facultyLabAssignmentsArray,
          creationMode: 'standard'
        };
        updatedCourses.push(labCourse);
      }
      
      setCourses(updatedCourses);
      setTempCourseData(null);
      setIsFacultyModalOpen(false);
    }
  };

  const handleDeleteCourse = (indexToDelete: number) => {
    const courseToDelete = courses[indexToDelete];
    if (!courseToDelete) return;

    const isTheoryCourse = !courseToDelete.name.endsWith(' Lab');

    if (isTheoryCourse) {
      // Deleting a theory course, so also delete its corresponding lab.
      const baseCourseName = getBaseCourseName(courseToDelete.name);
      const labCourseNameToDelete = `${baseCourseName} Lab`;
      setCourses(prevCourses => 
        prevCourses.filter(c => getBaseCourseName(c.name) !== baseCourseName)
      );
    } else {
      // Deleting a lab course.
      const labCourseName = courseToDelete.name;
      const theoryCourseName = getBaseCourseName(labCourseName);

      setCourses(prevCourses => {
        // First, update the parent theory course to remove lab assignments
        const updatedCourses = prevCourses.map(course => {
          if (course.name === theoryCourseName) {
            const { facultyLabAssignments, ...rest } = course;
            return rest;
          }
          return course;
        });

        // Then, filter out the lab course itself
        return updatedCourses.filter(course => course.name !== labCourseName);
      });
    }
  };

  const handleTimeTableSubmit = (data: { semester: string; timing: 'morning' | 'evening' }) => {
    // Handle the submission of the time table data
    setTimeTableModalOpen(false);
  };

  // Handle TimeTableSlot submission
  const handleTimeTableSlotSubmit = (data: { 
    courseName: string; 
    selectedSlots: string[]; 
    credits: number;
  }) => {
    let updatedCourses = [...courses];

    if (editingCourseIndex !== null) {
      updatedCourses[editingCourseIndex] = { 
        ...updatedCourses[editingCourseIndex],
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
      };
      setEditingCourseIndex(null);
    } else {
      const newTheoryCourse: Course = {
        name: data.courseName, 
        slots: data.selectedSlots, 
        credits: data.credits,
        colorIndex: tempColorIndex,
        creationMode: 'custom',
      };
      updatedCourses.push(newTheoryCourse);
    }
    
    setCourses(updatedCourses);
  };

  // Add getAllSelectedSlots function
  const getAllSelectedSlots = (excludeIndex: number | null = null): string[] => {
    let baseNameToExclude: string | null = null;
    if (excludeIndex !== null && courses[excludeIndex]) {
      baseNameToExclude = getBaseCourseName(courses[excludeIndex].name);
    }

    return courses.reduce((accSlots: string[], course) => {
      if (baseNameToExclude && getBaseCourseName(course.name) === baseNameToExclude) {
        return accSlots;
      }
    
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
    const courseToEdit = courses[index];
    // Open the appropriate modal based on the course's creationMode
    if (courseToEdit.creationMode === 'custom') {
      setIsTimeTableSlotModalOpen(true);
    } else { // 'standard' or undefined (for old data)
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
    setTempColorIndex(course.colorIndex);

    // If it's a lab course, open the lab slot modal directly
    if (course.name.endsWith(' Lab')) {
      // Find the theory course to get its slots
      const theoryCourse = courses.find(c => c.name === course.name.replace(' Lab', ''));
      if (theoryCourse) {
        setTempCourseData({
          ...tempData,
          courseName: `${theoryCourse.name} Edit Lab`,  // Add action identifier
          selectedSlots: theoryCourse.slots,
          credits: theoryCourse.credits,
        });
      }
      setIsFacultyModalOpen(true);
    } else {
      // For theory courses, indicate we're editing faculty
      setTempCourseData({
        ...tempData,
        courseName: `${course.name} Edit Faculty`  // Add action identifier
      });
      setIsFacultyModalOpen(true);
    }
  };

  // Handle Add Course
  const handleAddCourse = () => {
    setEditingCourseIndex(null);
    setTempColorIndex(getNextColorIndex(courses));
    // Open the appropriate modal based on selected preference
    if (preferredSlot === 'custom') {
      setIsTimeTableSlotModalOpen(true);
    } else {
      setIsCourseModalOpen(true);
    }
  };

  // Handle Add Lab
  const handleAddLab = (index: number) => {
    const theoryCourse = courses[index];
    setEditingCourseIndex(index);
    
    // If no faculty preferences exist, go to faculty preference modal first
    if (!theoryCourse.facultyPreferences || theoryCourse.facultyPreferences.length === 0) {
      const tempData = {
        courseName: `${theoryCourse.name} Add Lab`,  // Add action identifier
        selectedSlots: theoryCourse.slots,
        credits: theoryCourse.credits,
      };
      setTempCourseData(tempData);
      setTempColorIndex(theoryCourse.colorIndex);
      setIsFacultyModalOpen(true);
    } else {
      // Faculty preferences exist, check if lab course exists
      const labCourseName = `${theoryCourse.name} Lab`;
      const existingLabCourse = courses.find(c => c.name === labCourseName);
      
      if (existingLabCourse) {
        // Lab course exists, go directly to lab slot modal through faculty modal
        const tempData = {
          courseName: `${theoryCourse.name} Add Lab`,  // Add action identifier
          selectedSlots: theoryCourse.slots,
          credits: theoryCourse.credits,
        };
        setTempCourseData(tempData);
        setTempColorIndex(theoryCourse.colorIndex);
        setIsFacultyModalOpen(true);
      } else {
        // No lab course exists yet, go to faculty modal first
        const tempData = {
          courseName: `${theoryCourse.name} Add Lab`,  // Add action identifier
          selectedSlots: theoryCourse.slots,
          credits: theoryCourse.credits,
        };
        setTempCourseData(tempData);
        setTempColorIndex(theoryCourse.colorIndex);
        setIsFacultyModalOpen(true);
      }
    }
  };

  // Add exportDataToCSV function
  const exportDataToCSV = (userName?: string, message?: string): void => {
    const exportCsvHeaders = ['courseName', 'slots', 'credits', 'colorIndex', 'facultyPreferences', 'preferredSlot', 'creationMode', 'facultyLabAssignments'];
    const csvData = courses.map(course => ({
      courseName: course.name,
      slots: course.slots.join('|'),
      credits: course.credits,
      colorIndex: course.colorIndex,
      facultyPreferences: course.facultyPreferences?.join('|') || '',
      preferredSlot: preferredSlot,
      creationMode: course.creationMode || 'standard',
      facultyLabAssignments: course.facultyLabAssignments
        ?.map(assignment => `${assignment.facultyName}:${assignment.slots.join('-')}`)
        .join(';') || ''
    }));

    const csvContent = [
      exportCsvHeaders.join(','),
      ...csvData.map(row => 
        exportCsvHeaders.map(header => row[header as keyof typeof row]).join(',')
      )
    ].join('\n');

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ffcs-timetable${message ? '-' + message : ''}.csv`);
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add the downloadTimeTable function after the exportDataToCSV function
  const downloadTimeTable = () => {
    const timeTableElement = document.querySelector('.timetable-container') as HTMLDivElement;
    if (!timeTableElement) return;

    // Create a clean copy of the timetable for export
    const exportElement = timeTableElement.cloneNode(true) as HTMLDivElement;
    document.body.appendChild(exportElement);
    exportElement.style.position = 'absolute';
    exportElement.style.left = '-9999px';
    exportElement.style.top = '-9999px';

    html2canvas(exportElement, {
      scale: 2, // Increase quality
      backgroundColor: '#ffffff',
      removeContainer: true,
      logging: false,
      onclone: (doc) => {
        // Additional cleanup for the cloned element
        const lunchCell = doc.querySelector('td[rowspan="7"]');
        if (lunchCell) {
          (lunchCell as HTMLElement).style.borderTop = 'none';
          (lunchCell as HTMLElement).style.borderBottom = 'none';
        }
      }
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'timetable.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Cleanup
      document.body.removeChild(exportElement);
    });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        const courseBeingEdited = editingCourseIndex !== null ? courses[editingCourseIndex] : null;
        let isLabPresent = false;
        if (courseBeingEdited && !courseBeingEdited.name.endsWith(' Lab')) {
            const labCourseName = `${getBaseCourseName(courseBeingEdited.name)} Lab`;
            isLabPresent = courses.some(c => c.name === labCourseName);
        }

        const getSortableSlotKey = (slot: string | undefined): string => {
          if (!slot) return '4_'; // Should be last
        
          // Theory slots (e.g., A1, B2, TAA1)
          const theoryMatch = slot.match(/^([A-Z]+)([12])$/);
          if (theoryMatch) {
            const prefix = theoryMatch[1];
            const session = theoryMatch[2]; // '1' or '2'
            return `${session}_${prefix}`;
          }
        
          // Lab slots (e.g., L1, L31)
          const labMatch = slot.match(/^L(\d+)$/);
          if (labMatch) {
            const num = parseInt(labMatch[1]);
            return `3_${num.toString().padStart(3, '0')}`; // Pad to handle L1 vs L10
          }
        
          // Fallback for any other slot format (like custom slots)
          return `4_${slot}`;
        };

        const coursesWithOriginalIndex = courses.map((course, index) => ({
          ...course,
          originalIndex: index,
          baseName: getBaseCourseName(course.name),
          isLab: course.name.endsWith(' Lab'),
        }));
        
        coursesWithOriginalIndex.sort((a, b) => {
          const aSortSlot = getSortableSlotKey(a.isLab ? courses.find(c => c.name === a.baseName)?.slots[0] : a.slots[0]);
          const bSortSlot = getSortableSlotKey(b.isLab ? courses.find(c => c.name === b.baseName)?.slots[0] : b.slots[0]);

          if (a.baseName === b.baseName) {
            return a.isLab ? 1 : -1;
          }

          if (aSortSlot < bSortSlot) return -1;
          if (aSortSlot > bSortSlot) return 1;

          return a.baseName.localeCompare(b.baseName);
        });

        const sortedCourses = coursesWithOriginalIndex.map(({ originalIndex, baseName, isLab, ...course }) => course);

        return (
          <div className="space-y-8">
            {/* Semester Info and Course Cards */}
            <div>
              <div className="space-y-6">
                {/* Semester Input and Theory Preference in same row */}
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mt-8">
                  {/* Theory Slot Preference */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Slot Selection Mode
                    </label>
                    <div className="bg-gray-100 rounded-lg p-1 inline-flex items-center h-12">
                      <button
                        onClick={() => {
                          setPreferredSlot('standard');
                          setIsTimeTableSlotModalOpen(false);
                          setIsCourseModalOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all h-full ${ 
                          preferredSlot === 'standard'
                            ? 'bg-white shadow-sm text-black' 
                            : 'text-black' 
                        }`}
                      >
                        <AiOutlineMenu className="text-black" />
                        <span className="text-black">Standard</span>
                      </button>
                      <div className="w-px h-5 bg-gray-300"></div>
                      <button
                        onClick={() => {
                          setPreferredSlot('custom');
                          setIsCourseModalOpen(false);
                          setIsTimeTableSlotModalOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all h-full ${ 
                          preferredSlot === 'custom'
                            ? 'bg-white shadow-sm text-black' 
                            : 'text-black'  
                        }`}
                      >
                        <AiOutlineSetting className="mr-1 text-black" size={16} />
                        <span className="text-black">Custom</span>
                      </button>
                    </div>
                  </div>
                   
                  {/* Total Credits Counter */}
                  <div className="w-full sm:w-auto mt-2 sm:mt-8">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
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

                      {/* Color Palette Selector */}
                      <div className="relative" ref={paletteDropdownRef}>
                        <button
                          onClick={() => setIsPaletteDropdownOpen(!isPaletteDropdownOpen)}
                          className="flex items-center space-x-2 h-12 text-black hover:text-gray-600 transition-colors"
                          title="Change color palette"
                        >
                          <AiOutlineBgColors size={20} />
                          <span className="font-medium">
                            Theme: {PALETTES[selectedPalette].name}
                          </span>
                        </button>
                        {isPaletteDropdownOpen && (
                          <div
                            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                          >
                            <div className="absolute -top-1 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-gray-800 mb-3">Color Palette</h3>
                              <div className="space-y-3">
                                {Object.entries(PALETTES).map(([key, palette]) => (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      setSelectedPalette(key as keyof typeof PALETTES);
                                      setIsPaletteDropdownOpen(false);
                                    }}
                                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                                      selectedPalette === key 
                                        ? 'border-2 border-black text-black' 
                                        : 'hover:bg-gray-100 border border-transparent'
                                    }`}
                                  >
                                    <span className={`font-medium text-sm ${selectedPalette === key ? 'text-black' : 'text-gray-700'}`}>
                                      {palette.name}
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                      {palette.preview.map((color, i) => (
                                        <div
                                          key={i}
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Cards */}
                <CourseCards 
                  courses={sortedCourses}
                  onEditCourse={(index) => handleEditCourse(coursesWithOriginalIndex[index].originalIndex)}
                  onEditFaculty={(index) => handleEditFaculty(coursesWithOriginalIndex[index].originalIndex)}
                  onDeleteCourse={(index) => handleDeleteCourse(coursesWithOriginalIndex[index].originalIndex)}
                  onAddCourse={handleAddCourse}
                  onAddLab={(index) => handleAddLab(coursesWithOriginalIndex[index].originalIndex)}
                  blockedSlots={getAllSelectedSlots()}
                  palette={selectedPalette}
                />
              </div>
            </div>

            {/* Timetable Display Area */}
            <div className="flex items-center mb-4 mt-8">
              <AiOutlineCalendar size={20} className="text-black mr-2" />
              <h2 className="text-xl font-semibold text-black">Time Table</h2>
            </div>
            <div className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl overflow-hidden">
              <TimeTable courses={courses} palette={selectedPalette} />
            </div>

            {/* Course Selector Modal */}
            <CourseSlotSelector
              isOpen={isCourseModalOpen}
              onClose={() => {
                setIsCourseModalOpen(false);
                setEditingCourseIndex(null);
              }}
              onSubmit={handleCourseSubmit}
              onAddFaculty={handleAddFaculty}
              existingSlots={getAllSelectedSlots().filter((slot: string) => 
                editingCourseIndex === null || !courses[editingCourseIndex].slots.includes(slot)
              )}
              editingCourse={editingCourseIndex !== null ? courses[editingCourseIndex] : undefined}
              palette={selectedPalette}
              colorIndex={editingCourseIndex !== null ? courses[editingCourseIndex].colorIndex : tempColorIndex}
            />

            <TimeTableModal
              isOpen={isTimeTableModalOpen}
              onClose={() => setTimeTableModalOpen(false)}
              onSubmit={handleTimeTableSubmit}
              existingSlots={getAllSelectedSlots()}
              palette={selectedPalette}
              courses={courses}
            />

            {/* TimeTableSlot Modal */}
            <TimeTableSlotSelector
              isOpen={isTimeTableSlotModalOpen}
              onClose={() => {
                setIsTimeTableSlotModalOpen(false);
                setEditingCourseIndex(null);
              }}
              onSubmit={handleTimeTableSlotSubmit}
              editingCourse={editingCourseIndex !== null ? courses[editingCourseIndex] : undefined}
              otherCoursesData={courses.filter((course, index) => 
                editingCourseIndex === null || index !== editingCourseIndex
              )}
              slotConflictPairs={slotConflictPairs}
              palette={selectedPalette}
              colorIndex={editingCourseIndex !== null ? courses[editingCourseIndex].colorIndex : tempColorIndex}
            />

            {/* Faculty Preference Modal */}
            {isFacultyModalOpen && tempCourseData && (
              <FacultyPreferenceModal
                isOpen={isFacultyModalOpen}
                onClose={(currentFacultyPreferences, currentLabAssignments) => {
                  // If coming from back button (no preferences passed), reopen course modal
                  if (!currentFacultyPreferences) {
                    setIsFacultyModalOpen(false);
                    setIsCourseModalOpen(true);
                  } else {
                    // Normal close (confirm or force close)
                    setIsFacultyModalOpen(false);
                    setTempCourseData(null);
                    setEditingCourseIndex(null);
                  }
                }}
                onForceClose={() => {
                  setIsFacultyModalOpen(false);
                  setTempCourseData(null);
                  setEditingCourseIndex(null);
                }}
                onSubmit={handleFacultyPreferenceSubmit}
                courseName={`${tempCourseData.courseName} ${tempCourseData.selectedSlots.join('+')}`}
                courseCredits={tempCourseData.credits}
                initialFacultyPreferences={editingCourseIndex !== null && courses[editingCourseIndex] ? courses[editingCourseIndex].facultyPreferences : []}
                initialFacultyLabAssignments={editingCourseIndex !== null && courses[editingCourseIndex] && courses[editingCourseIndex].facultyLabAssignments 
                  ? new Map(courses[editingCourseIndex].facultyLabAssignments!.map(a => [a.facultyName, a.slots])) 
                  : undefined}
                allCurrentlyUsedSlots={getAllSelectedSlots(editingCourseIndex)}
                slotConflictPairs={slotConflictPairs}
                isLabCourseAssociated={isLabPresent}
                palette={selectedPalette}
                colorIndex={tempColorIndex}
              />
            )}
          </div>
        );
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
      
      {/* Main Content - Fixed width and centered */}
      <div className={`flex-grow pt-24 mx-auto w-full max-w-screen-2xl transition-all duration-300 ease-in-out px-4 sm:px-6 md:px-8 lg:px-20`}>
        <div className="w-full mx-auto py-4">
          {renderContent()}
        </div>
      </div>

      {/* Floating Help Button with Arc Menu */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-[5rem] z-50">
        <div className="relative" ref={helpMenuRef}>
          {/* Arc Menu Items */}
          {isHelpMenuOpen && (
            <>
              {/* How to Use Button - 0 degrees */}
              <a
                href="https://aneezhussain.com/how-to-use-f2cs-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute arc-menu-item position-1 group"
              >
                <div className="bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-700 hover:bg-gray-50 transition-all">
                  <AiOutlineInfoCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-gray-900" />
                </div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full ml-[-12px] bg-black text-white px-3 py-2 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  how to use
                </div>
              </a>

              {/* Feedback Button - 45 degrees */}
      <button
                onClick={() => window.location.href = 'mailto:aneezhussain.protomail.com'}
                className="absolute arc-menu-item position-2 group"
              >
                <div className="bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-700 hover:bg-gray-50 transition-all">
                  <AiOutlineMail className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-gray-900" />
                </div>
                <div className="absolute left-0 top-0 transform -translate-x-full -translate-y-1/4 ml-[-12px] bg-black text-white px-3 py-2 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  mail
                </div>
              </button>

              {/* About Creator Button - 90 degrees */}
              <a
                href="https://aneezhussain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute arc-menu-item position-3 group"
              >
                <div className="bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-700 hover:bg-gray-50 transition-all">
                  <AiOutlineUser className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-gray-900" />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 bg-black text-white px-3 py-2 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  creator
                </div>
              </a>
            </>
          )}

          {/* Main Help Button */}
          <button
            onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
            className="bg-black hover:bg-gray-900 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-colors"
      >
        <AiOutlineQuestionCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
        </div>
      </div>

      <style>
        {`
          .arc-menu-item {
            opacity: 0;
            transform: translate(0, 0);
            transition: all 0.3s ease-out;
          }

          .position-1 {
            /* 0 degrees - pure horizontal */
            transform: translate(-4.5rem, 0);
            opacity: 1;
            transition-delay: 0s;
          }

          .position-2 {
            /* 45 degrees - equal x and y */
            transform: translate(-3.2rem, -3.2rem);
            opacity: 1;
            transition-delay: 0.1s;
          }

          .position-3 {
            /* 90 degrees - pure vertical */
            transform: translate(0, -4.5rem);
            opacity: 1;
            transition-delay: 0.2s;
          }
        `}
      </style>

      {/* Footer */}
      <footer className="bg-white py-3 sm:py-4 mt-auto pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <p className="text-sm sm:text-base text-black">Made with ❤️ for Vitians</p>
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
          downloadTimeTable={downloadTimeTable}
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

export default Dashboard; 
