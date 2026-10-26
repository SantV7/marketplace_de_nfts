import type { ComponentProps } from 'react';
import { Dialog as Primitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-50 bg-black/80" /><Primitive.Content data-slot="dialog-content" className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90svh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#3D2C24] bg-[#231712] p-6 text-[#F5F1EB]', className)} {...props}>
    {children}
    <Primitive.Close aria-label="Fechar diálogo" className="absolute right-3 top-3 rounded-lg bg-[#140D0A] p-2 text-[#CFB28C]"><X className="h-5 w-5" /></Primitive.Close>
  </Primitive.Content></Primitive.Portal>;
}
