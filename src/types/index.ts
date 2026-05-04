export type UserRole = "student" | "instructor";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  badges: string[];
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QuestionType = "mcq" | "true_false";

export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?: string;
  text: string;
  type: QuestionType;
  options: IOption[];
  explanation?: string;
  points: number;
}

export interface IAssessment {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  questions: IQuestion[];
  timeLimit: number;
  passingScore: number;
  tags: string[];
  createdBy: IUser | string;
  isPublished: boolean;
  totalPoints: number;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmission {
  _id: string;
  userId: IUser | string;
  assessmentId: IAssessment | string;
  answers: { questionIndex: number; selectedOption: number }[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  email: string;
  points: number;
  badges: string[];
  submissionCount: number;
  rank: number;
}

export interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalPoints: number;
  rank: number;
  recentSubmissions: ISubmission[];
}
