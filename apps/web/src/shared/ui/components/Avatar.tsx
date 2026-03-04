import { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback: string;
}

function Avatar({ src, fallback, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100",
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm uppercase">
          {fallback.substring(0, 2)}
        </div>
      )}
    </div>
  );
}

export { Avatar };
