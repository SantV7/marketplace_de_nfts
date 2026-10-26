import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export const AuthDialog = ({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) => (
  <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent aria-describedby={undefined} className="flex min-h-150 max-w-125 flex-col rounded-none border-x-0 border-t-0 border-b-[10px] border-[#D28A4C] bg-[#241612] px-8 pb-12 pt-10 font-mono sm:px-12">
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {children}
    </DialogContent>
  </Dialog>
);
