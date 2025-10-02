

'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { Student } from '@/services/students';
import { getStudentById } from '@/services/students';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { setupPresenceHeartbeat } from '@/services/student-presence';


interface UserContextType {
  student: Student | null;
  setStudent: (student: Student | null) => void;
  isLoading: boolean;
  refreshStudent: () => void;
}

export const UserContext = createContext<UserContextType>({
  student: null,
  setStudent: () => {},
  isLoading: true,
  refreshStudent: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudentState] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = typeof window !== 'undefined' ? sessionStorage.getItem('classemagique_student_id') : null;
    if (!storedId) {
        setIsLoading(false);
        return;
    }

    const unsub = onSnapshot(doc(db, "students", storedId), (doc) => {
        if (doc.exists()) {
             const data = doc.data();
             const newStudent = {
                id: doc.id,
                name: data.name,
                code: data.code,
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
                accordProgressionIndex: data.accordProgressionIndex || 0,
            };

             // Only update state if important fields have changed (ignore isOnline/lastSeenAt)
             setStudentState(prev => {
                if (!prev) return newStudent;

                // Compare important fields only
                const hasChanged =
                    prev.name !== newStudent.name ||
                    prev.photoURL !== newStudent.photoURL ||
                    prev.showPhoto !== newStudent.showPhoto ||
                    prev.nuggets !== newStudent.nuggets ||
                    prev.accordProgressionIndex !== newStudent.accordProgressionIndex ||
                    JSON.stringify(prev.levels) !== JSON.stringify(newStudent.levels) ||
                    JSON.stringify(prev.enabledSkills) !== JSON.stringify(newStudent.enabledSkills) ||
                    JSON.stringify(prev.themeColors) !== JSON.stringify(newStudent.themeColors);

                return hasChanged ? newStudent : prev;
             });
        } else {
            // Handle case where student is deleted from another client
            setStudentState(null);
             if (typeof window !== 'undefined') {
                sessionStorage.removeItem('classemagique_student_id');
             }
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error with real-time student listener:", error);
        setIsLoading(false);
    });

    return () => unsub(); // Cleanup listener on unmount

  }, []);

  // Gérer la présence en ligne/hors ligne
  useEffect(() => {
    if (!student?.id) return;

    const cleanupPresence = setupPresenceHeartbeat(student.id);

    return () => {
      cleanupPresence();
    };
  }, [student?.id]);

  const setStudent = (studentData: Student | null) => {
    try {
      if (studentData) {
        sessionStorage.setItem('classemagique_student_id', studentData.id);
        document.cookie = `classemagique_student_id=${studentData.id}; path=/; max-age=86400; SameSite=Strict`;
      } else {
        sessionStorage.removeItem('classemagique_student_id');
        document.cookie = 'classemagique_student_id=; path=/; max-age=-1; SameSite=Strict';
      }
    } catch (error) {
        console.error("Could not access sessionStorage", error);
    }
    setStudentState(studentData);
  };
  
  const refreshStudent = useCallback(async () => {
      if(student?.id) {
        setIsLoading(true);
        const freshStudent = await getStudentById(student.id);
        setStudentState(freshStudent);
        setIsLoading(false);
      }
  }, [student?.id]);

  const contextValue = useMemo(() => ({
    student,
    setStudent,
    isLoading,
    refreshStudent,
  }), [student, isLoading, refreshStudent]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
