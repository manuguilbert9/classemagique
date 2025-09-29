'use client';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, type Unsubscribe, Timestamp } from 'firebase/firestore';
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
