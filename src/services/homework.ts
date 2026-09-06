

'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query, addDoc, Timestamp, where } from 'firebase/firestore';

export interface Assignment {
  francais: string | null;
  maths: string | null;
  orthographe?: string | null;
  notes?: string | null; // Consignes libres (ex: "Prévoir une tenue de sport", "Faire signer le cahier")
}

export interface Homework {
  id: string; // The ID will be the ISO date of the assignment, e.g., "2024-09-16"
  assignments: Record<string, Assignment>; // Key is groupId
  /**
   * Devoirs propres à un élève, prioritaires sur ceux de son groupe.
   * Clé : identifiant de l'élève. C'est ce que produit la programmation
   * automatique, qui adapte le travail au niveau de chacun.
   */
  assignmentsByStudent?: Record<string, Assignment>;
}

export interface HomeworkResult {
    id?: string;
    userId: string;
    date: string; // Date of the homework assignment (e.g., "2024-09-16")
    skillSlug: string;
    score: number;
    createdAt?: string | Timestamp; // When the user completed it
}


/**
 * Saves a completed homework exercise result.
 */
export async function saveHomeworkResult(resultData: Omit<HomeworkResult, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
   if (!resultData.userId) {
        return { success: false, error: 'User ID is required.' };
    }
    if (!resultData.date) {
        return { success: false, error: 'Homework date is required.' };
    }
    try {
        await addDoc(collection(db, 'homeworkResults'), {
            ...resultData,
            createdAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving homework result to Firestore:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
}

/**
 * Gets all homework results for a specific user.
 * @param userId The ID of the student.
 * @returns A promise that resolves to an array of homework results.
 */
export async function getHomeworkResultsForUser(userId: string): Promise<HomeworkResult[]> {
    if (!userId) return [];
    try {
        const q = query(collection(db, "homeworkResults"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const results: HomeworkResult[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            results.push({
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            } as HomeworkResult);
        });
        return results;
    } catch (error) {
        console.error("Error loading homework results from Firestore:", error);
        return [];
    }
}


/**
 * Saves or updates homework for a specific date.
 * @param dateId The ISO date string (YYYY-MM-DD) for that day's homework.
 * @param assignments A record of assignments, keyed by groupId.
 * @returns An object indicating success or failure.
 */
export async function saveHomework(dateId: string, assignments: Record<string, Assignment>): Promise<{ success: boolean; error?: string }> {
  if (!dateId) {
    return { success: false, error: 'Date ID is required.' };
  }
  try {
    const homeworkDocRef = doc(db, 'homework', dateId);
    await setDoc(homeworkDocRef, { assignments });
    return { success: true };
  } catch (error) {
    console.error("Error saving homework to Firestore:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}

/**
 * Retrieves all homework assignments from the database.
 * @returns A promise that resolves to an array of Homework objects.
 */
export async function getAllHomework(): Promise<Homework[]> {
  try {
    const q = query(collection(db, "homework"));
    const querySnapshot = await getDocs(q);
    const homeworks: Homework[] = [];
    querySnapshot.forEach((doc) => {
        homeworks.push({
            id: doc.id,
            assignments: doc.data().assignments || {},
            assignmentsByStudent: doc.data().assignmentsByStudent || {},
        });
    });
    return homeworks.sort((a, b) => b.id.localeCompare(a.id));
  } catch (error) {
    console.error("Error loading homework from Firestore:", error);
    return [];
  }
}


/**
 * Retrieves all relevant assignments for a specific group.
 * @param groupId The ID of the student's group.
 * @returns A promise that resolves to an array of assignments with their dates.
 */
export async function getHomeworkForGroup(groupId: string): Promise<{ date: string; assignment: Assignment }[]> {
    if (!groupId) return [];

    try {
        const homeworkCollectionRef = collection(db, "homework");
        const querySnapshot = await getDocs(homeworkCollectionRef);
        
        const groupAssignments: { date: string; assignment: Assignment }[] = [];

        querySnapshot.forEach((doc) => {
            const homeworkData = doc.data();
            if (homeworkData.assignments && homeworkData.assignments[groupId]) {
                groupAssignments.push({
                    date: doc.id,
                    assignment: homeworkData.assignments[groupId],
                });
            }
        });
        
        return groupAssignments;
    } catch (error) {
        console.error("Error loading homework for group from Firestore:", error);
        return [];
    }
}

/**
 * Enregistre les devoirs propres à des élèves pour une date, sans toucher à ceux
 * des groupes déjà présents sur cette date.
 */
export async function saveHomeworkForStudents(
  dateId: string,
  assignmentsByStudent: Record<string, Assignment>
): Promise<{ success: boolean; error?: string }> {
  if (!dateId) {
    return { success: false, error: 'Date ID is required.' };
  }
  try {
    const homeworkDocRef = doc(db, 'homework', dateId);
    await setDoc(homeworkDocRef, { assignmentsByStudent }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving per-student homework to Firestore:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}

/**
 * Les devoirs d'un élève : ceux de son groupe, complétés et surchargés par ceux
 * qui lui sont propres. Un devoir individuel l'emporte toujours sur celui du groupe.
 */
export async function getHomeworkForStudent(
  studentId: string,
  groupId: string | undefined
): Promise<{ date: string; assignment: Assignment }[]> {
  if (!studentId) return [];

  try {
    const querySnapshot = await getDocs(collection(db, 'homework'));
    const resultat: { date: string; assignment: Assignment }[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const duGroupe = groupId ? data.assignments?.[groupId] : undefined;
      const propre = data.assignmentsByStudent?.[studentId];
      if (!duGroupe && !propre) return;
      resultat.push({ date: docSnap.id, assignment: { ...(duGroupe || {}), ...(propre || {}) } });
    });

    return resultat;
  } catch (error) {
    console.error('Error loading homework for student from Firestore:', error);
    return [];
  }
}
