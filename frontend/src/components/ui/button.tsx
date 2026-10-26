import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50', {
  variants: { variant: { default: 'bg-[#D28A4C] text-[#140D0A] hover:bg-[#E09A5C]', outline: 'border border-[#D28A4C] text-[#D28A4C]' } },
  defaultVariants: { variant: 'default' },
});

export function Button({ className, variant, asChild = false, ...props }: ComponentProps<'button'> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component data-slot="button" className={cn(variants({ variant }), className)} {...props} />;
}
