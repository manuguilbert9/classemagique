

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Home, LogOut, GraduationCap } from 'lucide-react';
import { Logo } from '@/components/logo';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentManager } from '@/components/teacher/student-manager';
import { ResultsManager } from '@/components/teacher/results-manager';
import { DatabaseManager } from '@/components/teacher/database-manager';
import { GroupManager } from '@/components/teacher/group-manager';
import { HomeworkManager } from '@/components/teacher/homework-manager';
import { GrilleDeClasse } from '@/components/teacher/grille-de-classe';
import { getStudents, Student } from '@/services/students';
import { getGroups, type Group } from '@/services/groups';
import { getAllScores, Score } from '@/services/scores';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillButton, PillLink, PillSlot } from '@/components/layout/page-banner';
import { BuildInfo } from '@/components/teacher/build-info';
import { getAllWritingEntries, WritingEntry } from '@/services/writing';
import type { FsNode } from '@/services/writing-fs';
import { getAllHomework, type Homework, getHomeworkResultsForUser, HomeworkResult } from '@/services/homework';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { ThemeSettings } from '@/components/teacher/theme-settings';


export default function TeacherDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [allWritingEntries, setAllWritingEntries] = useState<WritingEntry[]>([]);
  const [allWritingFsNodes, setAllWritingFsNodes] = useState<FsNode[]>([]);
  const [allHomework, setAllHomework] = useState<Homework[]>([]);
  const [allHomeworkResults, setAllHomeworkResults] = useState<HomeworkResult[]>([]);
  const [archivedSkills, setArchivedSkills] = useState<Record<string, boolean>>({});

  const refreshAllData = useCallback(async () => {
    // This function can be used for a hard refresh if needed, but onSnapshot handles real-time updates.
    // For simplicity, we can leave this logic within useEffect.
  }, []);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('teacher_authenticated') === 'true';
    if (!isAuth) {
      router.replace('/teacher/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(true);

    const unsubscribers = [
      onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), snapshot => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
        setIsLoading(false);
      }),
      onSnapshot(query(collection(db, 'groups'), orderBy('createdAt', 'asc')), snapshot => {
        setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
      }),
      onSnapshot(query(collection(db, 'scores'), orderBy('createdAt', 'desc')), snapshot => {
        setAllScores(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as any).toDate().toISOString()
        } as Score)));
      }),
      onSnapshot(query(collection(db, 'writingEntries'), orderBy('createdAt', 'desc')), snapshot => {
        setAllWritingEntries(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as any).toDate().toISOString()
        } as WritingEntry)));
      }),
      onSnapshot(query(collection(db, 'writingFsNodes'), orderBy('updatedAt', 'desc')), snapshot => {
        setAllWritingFsNodes(snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as any)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as any)?.toDate().toISOString(),
          } as FsNode;
        }));
      }),
      onSnapshot(query(collection(db, 'homework')), snapshot => {
        setAllHomework(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework)));
      }),
      onSnapshot(query(collection(db, 'homeworkResults')), snapshot => {
        setAllHomeworkResults(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as any)?.toDate().toISOString()
        } as HomeworkResult)));
      }),
      onSnapshot(doc(db, 'teacher', 'settings'), snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setArchivedSkills(data.archivedSkills || {});
        }
      }),
    ];

    return () => unsubscribers.forEach(unsub => unsub());

  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('teacher_authenticated');
    router.push('/');
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <main className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <PageBanner
            icon={<GraduationCap />}
            title="Tableau de bord"
            subtitle="La classe, les devoirs et les résultats."
            actions={
              <>
                <PillLink href="/" icon={Home}>Accueil</PillLink>
                <PillButton icon={LogOut} onClick={handleLogout} className="border-white/40 bg-white/25">
                  Déconnexion
                </PillButton>
                <PillSlot>
                  <FullscreenToggle />
                </PillSlot>
              </>
            }
          />
        </div>

        <div className="mx-auto mt-8 w-full max-w-7xl flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="grille" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-[20px] p-1.5 sm:grid-cols-6 [&>button]:rounded-[14px] [&>button]:py-2">
                <TabsTrigger value="grille">Grille de classe</TabsTrigger>
                <TabsTrigger value="students">Élèves</TabsTrigger>
                <TabsTrigger value="groups">Groupes</TabsTrigger>
                <TabsTrigger value="homework">Devoirs</TabsTrigger>
                <TabsTrigger value="results">Résultats</TabsTrigger>
                <TabsTrigger value="database">Réglages</TabsTrigger>
              </TabsList>
              <TabsContent value="grille" className="mt-6">
                <GrilleDeClasse
                  students={students}
                  groups={groups}
                  allHomework={allHomework}
                  allHomeworkResults={allHomeworkResults}
                  onDataRefresh={refreshAllData}
                />
              </TabsContent>
              <TabsContent value="students" className="mt-6">
                <StudentManager students={students} archivedSkills={archivedSkills} />
              </TabsContent>
              <TabsContent value="groups" className="mt-6">
                <GroupManager initialStudents={students} initialGroups={groups} />
              </TabsContent>
              <TabsContent value="homework" className="mt-6">
                <HomeworkManager
                  students={students}
                  groups={groups}
                  allHomework={allHomework}
                  allHomeworkResults={allHomeworkResults}
                />
              </TabsContent>
              <TabsContent value="results" className="mt-6">
                <ResultsManager
                  students={students}
                  allScores={allScores}
                  allWritingEntries={allWritingEntries}
                  allWritingFsNodes={allWritingFsNodes}
                />
              </TabsContent>
              <TabsContent value="database" className="mt-6 space-y-6">
                <ThemeSettings />
                <DatabaseManager onDataRefresh={refreshAllData} archivedSkills={archivedSkills} />
              </TabsContent>
            </Tabs>
          )}
        </div>
        <footer className="max-w-7xl mx-auto w-full pt-8 mt-auto flex justify-end">
          <BuildInfo />
        </footer>
      </main>
    </TooltipProvider>
  );
}
