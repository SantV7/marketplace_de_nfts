import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

export function PageSkeleton({ label, summary = false }: { label: string; summary?: boolean }) {
  return <main role="status" aria-label={label} className="mx-auto min-h-svh max-w-6xl bg-[#140D0A] px-6 py-12"><span className="sr-only">{label}</span><Skeleton className="mb-8 h-10 w-64" /><div className="grid gap-8 md:grid-cols-2"><Skeleton className={summary ? 'h-96' : 'aspect-square'} /><div className="space-y-6"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-24" /><Skeleton className="h-48" /></div></div></main>;
}

export function RequestError({ message, retry }: { message: string; retry: () => void }) {
  return <main className="min-h-[50vh] bg-[#140D0A] p-10 text-center text-[#F5F1EB]"><p role="alert" className="mb-6">{message}</p><Button onClick={retry}>Tentar novamente</Button></main>;
}
