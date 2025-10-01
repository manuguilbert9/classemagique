
'use client';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, type Unsubscribe, Timestamp, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Student } from './students';

export type StudentPresenceState = {
    isOnline: boolean;
    lastSeenAt?: Date;
};

export function listenToStudentsPresence(callback: (students: Student[]) => void): Unsubscribe {
    const studentsRef = collection(db, 'students');

    return onSnapshot(studentsRef, (snapshot) => {
        const students: Student[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            const lastSeenAt = data.lastSeenAt instanceof Timestamp ? data.lastSeenAt.toDate() : undefined;

            return {
                id: doc.id,
                name: data.name,
                code: data.code,
                fcmToken: data.fcmToken,
                photoURL: data.photoURL,
                showPhoto: data.showPhoto,
                groupId: data.groupId,
                levels: data.levels || {},
                enabledSkills: data.enabledSkills,
                hasCustomSchedule: data.hasCustomSchedule || false,
                schedule: data.schedule || [],
                themeColors: data.themeColors,
                mentalMathPerformance: data.mentalMathPerformance || {},
                nuggets: data.nuggets || 0,
                isOnline: Boolean(data.isOnline),
                lastSeenAt,
            };
        });

        callback(students);
    });
}

export function createPresenceMap(students: Student[]): Record<string, StudentPresenceState> {
    return students.reduce<Record<string, StudentPresenceState>>((acc, student) => {
        acc[student.id] = {
            isOnline: Boolean(student.isOnline),
            lastSeenAt: student.lastSeenAt,
        };
        return acc;
    }, {});
}

/**
 * Met à jour le statut de présence d'un étudiant (en ligne/hors ligne)
 */
export async function updateStudentPresence(studentId: string, isOnline: boolean): Promise<void> {
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, {
            isOnline,
            lastSeenAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating student presence:', error);
    }
}

/**
 * Configure le système de heartbeat pour maintenir le statut en ligne
 * Retourne une fonction de nettoyage pour arrêter le heartbeat
 */
export function setupPresenceHeartbeat(studentId: string): () => void {
    // Marquer comme en ligne immédiatement
    updateStudentPresence(studentId, true);

    // Envoyer un heartbeat toutes les 30 secondes
    const heartbeatInterval = setInterval(() => {
        updateStudentPresence(studentId, true);
    }, 30000);

    // Marquer comme hors ligne quand la page se ferme
    const handleBeforeUnload = () => {
        // Utiliser sendBeacon pour envoyer la requête même si la page se ferme
        updateStudentPresence(studentId, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Fonction de nettoyage
    return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateStudentPresence(studentId, false);
    };
}
