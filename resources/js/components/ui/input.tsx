import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            autoComplete="off"
            className={cn(
                'border-input bg-muted text-foreground ring-offset-background flex h-10 w-full rounded-md border px-2 py-2 text-base transition-all duration-200 sm:px-3 sm:py-2',
                'file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground',
                'focus-visible:border-primary focus-visible:bg-background focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_25%,transparent)] focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'md:text-sm',
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
