'use client';

import { useContext } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Home, ListChecks, Sparkles } from 'lucide-react';
import { UserContext } from '@/context/user-context';
import { StudentSchedule } from '@/components/student-schedule';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillLink, PillSlot } from '@/components/layout/page-banner';
import { PageShell } from '@/components/layout/section';
import { NotConnected, PageLoading } from '@/components/layout/states';

export default function PlanningPage() {
    const { student, isLoading } = useContext(UserContext);

    if (isLoading) {
        return <PageLoading>J&apos;ouvre ton planning…</PageLoading>;
    }

    if (!student) {
        return <NotConnected>Connecte-toi pour voir le programme de ta journée.</NotConnected>;
    }

    return (
        <PageShell>
            <PageBanner
                icon={<ListChecks />}
                title="Mon planning"
                subtitle={`Le programme de ${format(new Date(), 'EEEE d MMMM', { locale: fr })}, ${student.name}.`}
                actions={
                    <>
                        <PillLink href="/en-classe" icon={Sparkles}>En classe</PillLink>
                        <PillLink href="/" icon={Home}>Accueil</PillLink>
                        <PillSlot>
                            <FullscreenToggle />
                        </PillSlot>
                    </>
                }
            />

            <StudentSchedule />
        </PageShell>
    );
}
