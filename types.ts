export type Assignment = { id: string; name: string; dueDate: string };
export type Exam = { id: string; courseName: string; examDate: string };
export type Course = {
  id: string;
  title: string;
  topics: { id: number; title: string; done: boolean }[];
};
export type Topic = { id: number; title: string; done: boolean };