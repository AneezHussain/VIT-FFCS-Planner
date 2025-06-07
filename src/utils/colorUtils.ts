export const PALETTES = {
  default: {
    name: 'Default',
    colors: [
      'bg-red-100 text-red-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800', 'bg-orange-100 text-orange-800', 'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800', 'bg-lime-100 text-lime-800', 'bg-amber-100 text-amber-800'
    ],
    preview: ['#fecaca', '#dbeafe', '#dcfce7', '#fef9c3', '#e9d5ff', '#fce7f3']
  },
  vibrant: {
    name: 'Vibrant',
    colors: [
      'bg-rose-500 text-white', 'bg-cyan-500 text-white', 'bg-lime-500 text-white',
      'bg-fuchsia-500 text-white', 'bg-orange-500 text-white', 'bg-emerald-500 text-white',
      'bg-sky-500 text-white', 'bg-amber-500 text-white', 'bg-violet-500 text-white',
      'bg-teal-500 text-white', 'bg-pink-500 text-white', 'bg-indigo-500 text-white'
    ],
    preview: ['#f43f5e', '#06b6d4', '#84cc16', '#d946ef', '#f97316', '#10b981']
  },
  pastel: {
    name: 'Pastel',
    colors: [
      'bg-red-200 text-red-800', 'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800',
      'bg-yellow-200 text-yellow-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800',
      'bg-indigo-200 text-indigo-800', 'bg-orange-200 text-orange-800', 'bg-teal-200 text-teal-800',
      'bg-cyan-200 text-cyan-800', 'bg-lime-200 text-lime-800', 'bg-amber-200 text-amber-800'
    ],
    preview: ['#fecaca', '#bfdbfe', '#bbf7d0', '#fef08a', '#e9d5ff', '#fbcfe8']
  }
};

interface CourseForColor {
  colorIndex: number;
}

export const getNextColorIndex = (existingCourses: CourseForColor[]): number => {
  if (existingCourses.length === 0) {
    return 0;
  }

  const colorIndicesInUse = new Set(existingCourses.map(c => c.colorIndex));
  let nextIndex = 0;
  
  while (colorIndicesInUse.has(nextIndex)) {
    nextIndex++;
  }
  
  const paletteSize = PALETTES.default.colors.length;
  return nextIndex % paletteSize;
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