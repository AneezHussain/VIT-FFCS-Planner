import React from 'react';

// Define Course interface directly within the component
interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  code?: string;
  faculty?: string;
  venue?: string;
}

interface SlotObject {
  colspan: number;
  content: string;
}

type Slot = string | SlotObject;

interface DayRow {
  day: string;
  slots: Slot[];
}

interface TimeTableProps {
  courses?: Course[];
  darkMode?: boolean;
}

const TimeTable: React.FC<TimeTableProps> = ({ courses = [], darkMode = false }) => {
  const dayRows: DayRow[] = [
    {
      day: 'MON',
      slots: ['A1/L1', 'F1/L2', 'D1/L3', 'TB1/L4', 'TG1/L5', 'L6', 'A2/L31', 'F2/L32', 'D2/L33', 'TB2/L34', 'TG2/L35', 'L36']
    },
    {
      day: 'TUE',
      slots: ['B1/L7', 'G1/L8', 'E1/L9', 'TC1/L10', 'TAA1/L11', 'L12', 'B2/L37', 'G2/L38', 'E2/L39', 'TC2/L40', 'TAA2/L41', 'L42']
    },
    {
      day: 'WED',
      slots: ['C1/L13', 'A1/L14', 'F1/L15', { colspan: 3, content: 'Extramural Hour' }, 'C2/L43', 'A2/L44', 'F2/L45', 'TD2/L46', 'TBB2/L47', 'L48']
    },
    {
      day: 'THU',
      slots: ['D1/L19', 'B1/L20', 'G1/L21', 'TE1/L22', 'TCC1/L23', 'L24', 'D2/L49', 'B2/L50', 'G2/L51', 'TE2/L52', 'TCC2/L53', 'L54']
    },
    {
      day: 'FRI',
      slots: ['E1/L25', 'C1/L26', 'TA1/L27', 'TF1/L28', 'TD1/L29', 'L30', 'E2/L55', 'C2/L56', 'TA2/L57', 'TF2/L58', 'TDD2/L59', 'L60']
    }
  ];

  // Get course initials (first letter of each word)
  const getCourseInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Find course that includes a specific slot
  const findCourseForSlot = (slotText: string): { course: Course; index: number } | null => {
    // Extract the slot code before the slash if there is one
    const slotCode = slotText.split('/')[0];
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      if (course.slots.includes(slotCode)) {
        return { course, index: i };
      }
    }
    return null;
  };

  // Get color class based on course index using the custom CSS classes
  const getColorClass = (index: number): string => {
    const colorClasses = [
      'table-cell-course-red',
      'table-cell-course-blue',
      'table-cell-course-green',
      'table-cell-course-orange',
      'table-cell-course-purple',
      'table-cell-course-teal',
      'table-cell-course-yellow',
      'table-cell-course-primary'
    ];
    
    return colorClasses[index % 8];
  };

  // Create theory and lab time arrays without lunch row
  const theoryTimes = [
    "08:00AM\nto\n08:50AM",
    "09:00AM\nto\n09:50AM",
    "10:00AM\nto\n10:50AM",
    "11:00AM\nto\n11:50AM",
    "12:00AM\nto\n12:50PM",
    "",
    "02:00PM\nto\n02:50PM",
    "03:00PM\nto\n03:50PM",
    "04:00PM\nto\n04:50PM",
    "05:00PM\nto\n05:50PM",
    "06:00PM\nto\n06:50PM",
    ""
  ];

  const labTimes = [
    "08:00AM\nto\n08:50AM",
    "09:00AM\nto\n09:50AM",
    "10:00AM\nto\n10:50AM",
    "11:00AM\nto\n11:50AM",
    "12:00AM\nto\n12:50PM",
    "12:50PM\nto\n01:30PM",
    "02:00PM\nto\n02:50PM",
    "03:00PM\nto\n03:50PM",
    "04:00PM\nto\n04:50PM",
    "05:00PM\nto\n05:50PM",
    "06:00PM\nto\n06:50PM",
    "06:50PM\nto\n07:30PM"
  ];

  const cellStyle = {
    width: '80px',
    height: '80px',
    minWidth: '80px',
    minHeight: '80px'
  };

  return (
    <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <table className={`min-w-full table-fixed ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {/* Theory Hours Row */}
          <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}>
            <td className={`px-4 py-3 text-sm font-medium border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={{ width: '80px' }}>
              THEORY<br />HOURS
            </td>
            {theoryTimes.slice(0, 6).map((time, index) => (
              <td key={index} className={`px-4 py-3 text-xs font-semibold text-center border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={cellStyle}>
                {time.split("\n").map((t, i) => (
                  <React.Fragment key={i}>
                    {t}
                    {i !== 2 && time !== "" && <br />}
                  </React.Fragment>
                ))}
              </td>
            ))}
            
            {/* Lunch column - appears only once */}
            <td 
              rowSpan={7} 
              className={`font-semibold text-center align-middle border-r ${darkMode ? 'bg-gray-700/80 text-gray-300 border-gray-700' : 'bg-gray-100/80 text-gray-900 border-gray-200'}`}
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                width: '40px',
                minWidth: '40px'
              }}
            >
              LUNCH
            </td>

            {theoryTimes.slice(6).map((time, index) => (
              <td key={index + 6} className={`px-4 py-3 text-xs font-semibold text-center border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={cellStyle}>
                {time.split("\n").map((t, i) => (
                  <React.Fragment key={i}>
                    {t}
                    {i !== 2 && time !== "" && <br />}
                  </React.Fragment>
                ))}
              </td>
            ))}
          </tr>

          {/* Lab Hours Row */}
          <tr className={darkMode ? 'bg-gray-800' : 'bg-white'}>
            <td className={`px-4 py-3 text-sm font-medium border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={{ width: '80px' }}>
              LAB<br />HOURS
            </td>
            {labTimes.slice(0, 6).map((time, index) => (
              <td key={index} className={`px-4 py-3 text-xs font-semibold text-center border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={cellStyle}>
                {time.split("\n").map((t, i) => (
                  <React.Fragment key={i}>
                    {t}
                    {i !== 2 && <br />}
                  </React.Fragment>
                ))}
              </td>
            ))}
            
            {/* Lunch column is handled by rowSpan from Theory row */}

            {labTimes.slice(6).map((time, index) => (
              <td key={index + 6} className={`px-4 py-3 text-xs font-semibold text-center border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={cellStyle}>
                {time.split("\n").map((t, i) => (
                  <React.Fragment key={i}>
                    {t}
                    {i !== 2 && <br />}
                  </React.Fragment>
                ))}
              </td>
            ))}
          </tr>

          {/* Days and Periods */}
          {dayRows.map(({ day, slots }) => (
            <tr key={day} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'}`}>
              <td className={`px-4 py-3 text-sm font-medium border-r ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'}`} style={{ width: '80px' }}>
                {day}
              </td>
              
              {/* First half of slots (before lunch) */}
              {slots.slice(0, 6).map((slot, index) => {
                if (typeof slot === 'object' && 'colspan' in slot) {
                  return (
                    <td 
                      key={index} 
                      colSpan={slot.colspan}
                      className={`px-4 py-3 text-xs text-center border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      style={{ height: '80px' }}
                    >
                      <div className={darkMode ? 'text-red-400 font-medium' : 'text-system-red font-medium'}>
                        {slot.content}
                      </div>
                    </td>
                  );
                }
                
                // Find course for this slot if any
                const courseInfo = slot ? findCourseForSlot(slot) : null;
                
                return (
                  <td 
                    key={index} 
                    className={`px-4 py-3 text-xs text-center border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${courseInfo ? getColorClass(courseInfo.index) : ''}`}
                    style={cellStyle}
                  >
                    {courseInfo ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <div className="font-bold">{getCourseInitials(courseInfo.course.name)}</div>
                        <div className="text-xs mt-1">{slot}</div>
                      </div>
                    ) : (
                      <div className={darkMode ? 'text-gray-500' : 'text-gray-600'}>{slot}</div>
                    )}
                  </td>
                );
              })}
              
              {/* No lunch cell here - it's handled by the rowSpan in the header */}
              
              {/* Second half of slots (after lunch) */}
              {slots.slice(6).map((slot, index) => {
                if (typeof slot === 'object' && 'colspan' in slot) {
                  return (
                    <td 
                      key={index + 6} 
                      colSpan={slot.colspan}
                      className={`px-4 py-3 text-xs text-center border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      style={{ height: '80px' }}
                    >
                      <div className={darkMode ? 'text-red-400 font-medium' : 'text-system-red font-medium'}>
                        {slot.content}
                      </div>
                    </td>
                  );
                }
                
                // Find course for this slot if any
                const courseInfo = slot ? findCourseForSlot(slot) : null;
                
                return (
                  <td 
                    key={index + 6} 
                    className={`px-4 py-3 text-xs text-center border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${courseInfo ? getColorClass(courseInfo.index) : ''}`}
                    style={cellStyle}
                  >
                    {courseInfo ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <div className="font-bold">{getCourseInitials(courseInfo.course.name)}</div>
                        <div className="text-xs mt-1">{slot}</div>
                      </div>
                    ) : (
                      <div className={darkMode ? 'text-gray-500' : 'text-gray-600'}>{slot}</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTable; 
