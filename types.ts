
export type Persona = 'STUDENT' | 'TEACHER' | 'PROFESSIONAL' | 'INTERVIEW' | 'ASPIRANT' | 'BUSINESS';

export interface User {
  id: string;
  name: string;
  role: Persona;
  avatar?: string;
}

export interface Material {
  id: string;
  title: string;
  type: 'PDF' | 'IMAGE' | 'TEXT';
  content: string; // Base64 or text content
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  type: 'SUMMARY' | 'FLASHCARD' | 'QA' | 'MINDMAP' | 'CODE' | 'PAPER';
  title: string;
  content: any;
  createdAt: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'PENDING';
  score?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}
