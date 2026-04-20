import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30',
        destructive:
          'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/25',
        outline:
          'border border-slate-200/90 bg-white/90 text-slate-800 shadow-sm hover:border-slate-300 hover:bg-white hover:shadow-md hover:shadow-slate-900/5',
        secondary:
          'bg-zinc-100/90 text-zinc-900 hover:bg-zinc-200/90 hover:shadow-sm',
        ghost: 'text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900',
        link: 'text-indigo-600 underline-offset-4 hover:text-indigo-500 hover:underline active:scale-100',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
