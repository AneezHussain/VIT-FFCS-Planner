import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  link: string;
  members: number;
}

const communityGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'FFCS Help',
    description: 'Get help with course registration and timetable planning',
    link: 'https://chat.whatsapp.com/your-link-1',
    members: 256
  },
  {
    id: '2',
    name: 'Course Discussion',
    description: 'Discuss courses, share resources and study materials',
    link: 'https://chat.whatsapp.com/your-link-2',
    members: 189
  },
  {
    id: '3',
    name: 'Technical Clubs',
    description: 'Join technical clubs and participate in projects',
    link: 'https://chat.whatsapp.com/your-link-3',
    members: 342
  }
];

const Communities: React.FC = () => {
  const handleJoinGroup = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
          Communities
        </h1>
        <p className="mt-3 text-xl text-gray-600">
          Connect with your peers and join study groups
        </p>
      </div>

      {/* Communities Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityGroups.map((group) => (
          <div 
            key={group.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {group.description}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{group.members} members</span>
                </div>
              </div>
              <button
                onClick={() => handleJoinGroup(group.link)}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp className="text-xl" />
                <span>Join</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Communities; 