export interface JobAnalysis {
  keywords: string[];
  tone: string;
  mandatoryRequirements: string[];
  niceToHaveRequirements: string[];
  companyInsights: string;
}

export interface CVAudit {
  currentScore: number;
  criticalMissingKeywords: string[];
  formattingIssues: string[];
  improvements: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
}

export interface CoverLetterAudit {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  revisedVersion: string;
}

export interface ApplicationDocuments {
  coverLetter: string;
  email: string;
  interviewQuestions: string[];
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'auditing' | 'generating' | 'complete' | 'error';

export interface FileData {
  data: string;
  mimeType: string;
  name: string;
}

export interface UserInput {
  jobDescription: string;
  companyUrl: string;
  cvContent: string;
  cvFile: FileData | null;
  inputMethod: 'text' | 'file';
  coverLetterContent: string;
  coverLetterFile: FileData | null;
  coverLetterInputMethod: 'text' | 'file';
}