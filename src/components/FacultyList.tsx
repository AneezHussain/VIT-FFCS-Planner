import React, { useState, useMemo } from 'react';
import { AiOutlineUser, AiOutlineSearch } from 'react-icons/ai';

interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  facultyLabAssignments?: Array<{ facultyName: string; slots: string[] }>;
}

interface FacultyListProps {
  courses: Course[];
  semesterName: string;
}

const FacultyList: React.FC<FacultyListProps> = ({ courses, semesterName }) => {
  const [facultySearchQuery, setFacultySearchQuery] = useState('');

  const allFaculty = useMemo(() => {
    return courses.reduce((acc, course) => {
      if (course.facultyPreferences && course.facultyPreferences.length > 0) {
        course.facultyPreferences.forEach(faculty => {
          acc.push({
            facultyName: faculty,
            courseName: course.name,
            slots: course.slots,
          });
        });
      }
      return acc;
    }, [] as Array<{ facultyName: string; courseName: string; slots: string[] }>);
  }, [courses]);

  const filteredFaculty = useMemo(() => {
    return allFaculty
      .filter(item =>
        facultySearchQuery === '' ||
        item.facultyName.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
        item.courseName.toLowerCase().includes(facultySearchQuery.toLowerCase())
      )
      .sort((a, b) => a.facultyName.localeCompare(b.facultyName));
  }, [allFaculty, facultySearchQuery]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
          Faculty List
        </h1>
        <p className="mt-3 text-xl text-gray-600">
          View all faculty preferences and their assigned courses.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by faculty name or course..."
          value={facultySearchQuery}
          onChange={(e) => setFacultySearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      
      {semesterName && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Semester: <span className="font-normal">{semesterName}</span>
          </h2>
        </div>
      )}
      
      {filteredFaculty.length > 0 ? (
        <div className="space-y-3">
          {filteredFaculty.map((item, index) => (
            <div 
              key={`${item.facultyName}-${item.courseName}-${index}`}
              className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-4 shrink-0">
                {index + 1}
              </div>
              <div className="font-semibold text-gray-800 truncate flex-1 min-w-0 mr-4">
                {item.facultyName}
              </div>
              <div className="text-sm text-gray-600 truncate flex-1 min-w-0 mr-4">
                {item.courseName}
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                {item.slots.join(' + ')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-400 mb-3">
            <AiOutlineUser size={48} className="mx-auto" />
          </div>
          {facultySearchQuery ? (
            <p className="text-lg text-gray-700">No faculties found matching "{facultySearchQuery}".</p>
          ) : (
            <p className="text-lg text-gray-700">No faculty preferences have been added yet.</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Add courses and assign faculty preferences on the dashboard page.
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyList; 