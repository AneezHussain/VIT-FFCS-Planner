export const SLOT_COLORS = [
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
] as const;

export const getSlotColor = (courseName: string): string => {
  const colorIndex = Math.abs(courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % SLOT_COLORS.length;
  return SLOT_COLORS[colorIndex];
};

interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
  code?: string;
  faculty?: string;
  venue?: string;
}

// Helper function to get base course name (e.g., "Course A" from "Course A Lab")
const getBaseCourseName = (name: string) => name.replace(/ Lab$/, '');

// Get color class based on course's base name for consistent coloring
export const getColorClass = (course: Course, originalIndex: number, allCourses: Course[]): string => {
  const baseName = getBaseCourseName(course.name);
  const firstMatchingCourseIndex = allCourses.findIndex(c => getBaseCourseName(c.name) === baseName);
  const colorLookupIndex = firstMatchingCourseIndex === -1 ? originalIndex : firstMatchingCourseIndex;

  const colorClasses = [
    'table-cell-course-red',
    'table-cell-course-blue',
    'table-cell-course-green',
    'table-cell-course-orange',
    'table-cell-course-purple',
    'table-cell-course-teal',
    'table-cell-course-yellow',
    'table-cell-course-primary',
    'table-cell-course-indigo',
    'table-cell-course-pink',
    'table-cell-course-lime',
    'table-cell-course-amber'
  ];
  
  return colorClasses[colorLookupIndex % 12];
}; 