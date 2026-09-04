'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DicteeExercise } from '@/components/dictee-exercise';

export default function DicteePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
  const from = searchParams.get('from');

  const handleFinish = () => {
    router.push(from === 'devoirs' ? '/devoirs' : '/');
  };

  if (!sessionId) {
    return <div className="p-8 text-center">Identifiant de dictée invalide.</div>;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 sm:p-8 bg-background">
      <DicteeExercise sessionId={sessionId} onFinish={handleFinish} />
    </main>
  );
}
