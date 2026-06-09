import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import * as React from 'react';

interface AppSearchInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
    onClear?: () => void;
    clearable?: boolean;
}

const AppSearchInput = React.forwardRef<HTMLInputElement, AppSearchInputProps>(
    ({ className, value, clearable = false, onChange, onClear, ...props }, ref) => {
        const hasValue = value !== undefined ? String(value).length > 0 : false;

        const handleClear = () => {
            onClear?.();
        };

        return (
            <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                    <Search className="h-4 w-4" />
                </div>

                <input
                    ref={ref}
                    type="text"
                    autoComplete="off"
                    value={value}
                    onChange={onChange}
                    className={cn(
                        'border-input bg-muted text-foreground flex h-10 w-full rounded-md border pr-9 pl-9 text-sm',
                        'placeholder:text-muted-foreground transition-all duration-200',
                        'focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none',
                        'focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_25%,transparent)]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                    {...props}
                />

                {clearable && (
                    <>
                        {' '}
                        {hasValue && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={cn(
                                    'absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-0.5',
                                    'text-muted-foreground hover:text-foreground hover:bg-accent',
                                    'transition-all duration-150',
                                    'focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_25%,transparent)] focus:outline-none',
                                )}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    },
);

AppSearchInput.displayName = 'AppSearchInput';

export default AppSearchInput;
