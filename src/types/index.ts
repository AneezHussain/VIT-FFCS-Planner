export interface Course {
  name: string;
  slots: string[];
  credits: number;
  facultyPreferences?: string[];
  code?: string;
  faculty?: string;
  venue?: string;
} 