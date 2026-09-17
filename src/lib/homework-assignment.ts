import type { Assignment, Homework } from '../services/homework';
export function resolveAssignment(homework: Pick<Homework, 'assignments' | 'assignmentsByStudent'>, studentId: string, groupId?: string): Assignment | undefined {
 const group = groupId ? homework.assignments?.[groupId] : undefined;
 const individual = homework.assignmentsByStudent?.[studentId];
 return group || individual ? {...group, ...individual} as Assignment : undefined;
}
