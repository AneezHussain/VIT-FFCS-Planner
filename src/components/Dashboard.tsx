import React, { useState, useRef, useCallback, DragEvent } from 'react';
import { AiOutlineMenu, AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineTeam, AiOutlinePlus, AiOutlineDownload, AiOutlineUpload, AiOutlineClose, AiOutlineFile, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import TimeTable from './TimeTable';
import CourseSlotSelector from './CourseSlotSelector';
import Communities from './Communities';
import TimeTableModal from './TimeTableModal';
import FacultyPreferenceModal from './FacultyPreferenceModal';

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
  const [preferredSlot, setPreferredSlot] = useState<'morning' | 'evening'>('morning');
  const [isTimeTableModalOpen, setTimeTableModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempCourseData, setTempCourseData] = useState<{ courseName: string; selectedSlots: string[]; credits: number } | null>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);

  // Get all selected slots from existing courses
  const getAllSelectedSlots = () => {
    return courses.reduce((acc, course) => [...acc, ...course.slots], [] as string[]);
  };

  const exportDataToCSV = () => {
    // Create CSV header
    const headers = ['courseName', 'slots', 'credits', 'facultyPreferences', 'semesterName', 'preferredSlot'];
    
    // Create rows for each course
    const rows = courses.map(course => [
      course.name,
      course.slots.join('|'),  // Use pipe as delimiter for slots
      course.credits,
      (course.facultyPreferences || []).join('|'), // Use pipe as delimiter for faculty preferences
      semesterName,
      preferredSlot
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element for downloading the CSV
    const link = document.createElement('a');
    link.href = url;
    link.download = `${semesterName || 'ffcs-data'}.csv`;
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        preferredSlot: 'morning' | 'evening';
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
          data.preferredSlot = (rowData['preferredSlot'] === 'evening' ? 'evening' : 'morning');
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
            
            {/* Semester Box with Course Cards */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Semester Input and Theory Preference in same row */}
                <div className="flex items-start gap-6">
                  {/* Semester Input */}
                  <div className="flex-1 max-w-sm">
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
                      Preferred Theory Slot
                    </label>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setPreferredSlot('morning')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          preferredSlot === 'morning'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <BsSun className={`${preferredSlot === 'morning' ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <span>Morning</span>
                      </button>
                      <div className="w-px h-5 bg-gray-300"></div>
                      <button
                        onClick={() => setPreferredSlot('evening')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          preferredSlot === 'evening'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <BsMoonStars className={`${preferredSlot === 'evening' ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>Evening</span>
                      </button>
                    </div>
                  </div>
                   
                  {/* Total Credits Counter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Credits
                    </label>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {courses.reduce((total, course) => total + course.credits, 0)}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">credits</span>
                    </div>
                  </div>

                  {/* CSV Export/Import */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Management
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={exportDataToCSV}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        disabled={courses.length === 0}
                        title="Export data to CSV"
                      >
                        <AiOutlineDownload />
                        <span>Export</span>
                      </button>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={importDataFromCSV}
                        accept=".csv"
                        className="hidden"
                        id="csv-file-input"
                      />
                      
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Import data from CSV"
                      >
                        <AiOutlineUpload />
                        <span>Import</span>
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
                      className="w-64 h-[160px] bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group flex flex-col"
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
                                setIsCourseModalOpen(true);
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

                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{course.name}</h3>
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-2 py-1">
                          <span className="text-xs text-gray-500">Credits:</span>
                          <span className="text-sm font-medium text-gray-900">{course.credits}</span>
                        </div>
                      </div>
                      
                      {/* Faculty Preferences (if any) */}
                      {course.facultyPreferences && course.facultyPreferences.length > 0 && (
                        <div className="mt-2 mb-1">
                          <span className="text-xs text-gray-500">Preferred Faculty:</span>
                          <div className="text-sm text-gray-900 truncate">
                            1. {course.facultyPreferences[0]}
                            {course.facultyPreferences.length > 1 && (
                              <button 
                                className="text-gray-500 ml-1 hover:underline text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const expandedElement = document.getElementById(`faculty-expanded-${index}`);
                                  if (expandedElement) {
                                    expandedElement.classList.toggle('hidden');
                                  }
                                }}
                              >
                                +{course.facultyPreferences.length - 1} more
                              </button>
                            )}
                          </div>
                          {/* Expandable faculty list */}
                          <div id={`faculty-expanded-${index}`} className="hidden mt-1 py-1 pl-2 text-sm max-h-[80px] overflow-y-auto bg-gray-50 rounded-md">
                            {course.facultyPreferences.slice(1).map((faculty, facultyIndex) => (
                              <div key={facultyIndex} className="text-gray-900">
                                {facultyIndex + 2}. {faculty}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Spacer */}
                      <div className="flex-grow"></div>
                      
                      {/* Combined slots at the bottom */}
                      <div>
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
                    </div>
                  ))}

                  {/* Add Course Button */}
                  <button
                    onClick={() => {
                      setEditingCourseIndex(null);
                      setIsCourseModalOpen(true);
                    }}
                    className="w-64 h-[160px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <AiOutlinePlus className="text-2xl text-gray-500 group-hover:text-blue-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
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

            {/* Import Modal */}
            {isImportModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div 
                  className="absolute inset-0 bg-black bg-opacity-20"
                  onClick={() => setIsImportModalOpen(false)}
                />
                <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 z-10 overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Import FFCS Data
                    </h3>
                    <button 
                      onClick={() => setIsImportModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <AiOutlineClose size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-4
                        ${isDragging 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center">
                        <AiOutlineFile className={`text-4xl mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag & drop your CSV file here
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
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
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <AiOutlineMenu className="h-6 w-6 text-gray-700" />
          </button>
          
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
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
              icon={<AiOutlineTeam />} 
              text="Communities" 
              onClick={() => setCurrentPage('communities')}
              active={currentPage === 'communities'}
            />
            <SidebarItem icon={<AiOutlineUser />} text="Profile" onClick={() => setCurrentPage('profile')} />
            <SidebarItem icon={<AiOutlineSetting />} text="Settings" onClick={() => setCurrentPage('settings')} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-16 ${isSidebarOpen ? 'ml-64' : ''} transition-margin duration-300 ease-in-out`}>
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
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