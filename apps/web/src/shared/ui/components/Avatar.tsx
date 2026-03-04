import { HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200',
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} className="aspect-square h-full w-full object-cover" alt={fallback} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm uppercase">
          {fallback.substring(0, 2)}
        </div>
      )}
    </div>
  )
);
Avatar.displayName = 'Avatar';

export { Avatar };
