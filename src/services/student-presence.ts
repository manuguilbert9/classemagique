
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

    return onSnapshot(studentsRef, async (snapshot) => {
        // Récupérer les données de présence pour chaque étudiant
        const studentsPromises = snapshot.docs.map(async (studentDoc) => {
            const data = studentDoc.data();

            // Récupérer le statut de présence depuis la sous-collection
            let isOnline = false;
            let lastSeenAt: Date | undefined = undefined;

            try {
                const presenceDoc = await import('firebase/firestore').then(({ getDoc }) =>
                    getDoc(doc(db, 'students', studentDoc.id, 'presence', 'status'))
                );

                if (presenceDoc.exists()) {
                    const presenceData = presenceDoc.data();
                    isOnline = Boolean(presenceData.isOnline);
                    lastSeenAt = presenceData.lastSeenAt instanceof Timestamp
                        ? presenceData.lastSeenAt.toDate()
                        : undefined;
                }
            } catch (error) {
                console.error('Error fetching presence for student:', studentDoc.id, error);
            }

            return {
                id: studentDoc.id,
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
                isOnline,
                lastSeenAt,
            };
        });

        const students = await Promise.all(studentsPromises);
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
 * Utilise une sous-collection 'presence' pour éviter de déclencher le snapshot principal
 */
export async function updateStudentPresence(studentId: string, isOnline: boolean): Promise<void> {
    const presenceRef = doc(db, 'students', studentId, 'presence', 'status');

    try {
        await updateDoc(presenceRef, {
            isOnline,
            lastSeenAt: serverTimestamp(),
        });
    } catch (error) {
        // Si le document n'existe pas, le créer
        if ((error as any).code === 'not-found') {
            try {
                const { setDoc } = await import('firebase/firestore');
                await setDoc(presenceRef, {
                    isOnline,
                    lastSeenAt: serverTimestamp(),
                });
            } catch (setError) {
                console.error('Error creating student presence:', setError);
            }
        } else {
            console.error('Error updating student presence:', error);
        }
    }
}

/**
 * Configure le système de heartbeat pour maintenir le statut en ligne
 * Retourne une fonction de nettoyage pour arrêter le heartbeat
 */
export function setupPresenceHeartbeat(studentId: string): () => void {
    // Marquer comme en ligne immédiatement
    updateStudentPresence(studentId, true);

    // Envoyer un heartbeat toutes les 10 minutes
    const heartbeatInterval = setInterval(() => {
        updateStudentPresence(studentId, true);
    }, 600000);

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
