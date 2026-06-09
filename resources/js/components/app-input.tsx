import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

interface AppInputProps extends React.ComponentProps<typeof Input> {
    label?: string;
    hint?: string;
    error?: string;
    isType?: React.HTMLInputTypeAttribute;
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(({ label, isType, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <Label htmlFor={inputId} className={cn('ml-0.5 text-[12px] font-medium sm:text-sm', error && 'text-destructive')}>
                    {label}
                    {props.required && <span className="text-destructive ml-1 text-[8px] sm:text-[12px]">*</span>}
                </Label>
            )}

            {isType !== 'password' && (
                <Input
                    ref={ref}
                    id={inputId}
                    className={`${cn(
                        error &&
                            'border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_20%,transparent)]',
                        className,
                    )} text-[10px] sm:text-sm ${isType === 'date' && ''}`}
                    {...props}
                />
            )}

            {isType === 'password' && (
                <div className="relative w-full">
                    <Input
                        ref={ref}
                        id={inputId}
                        type={isOpen ? 'text' : 'password'} // ← toggle type
                        className={cn(
                            'pr-9', // ← beri ruang untuk icon
                            error &&
                                'border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_20%,transparent)]',
                            className,
                            'text-[10px] sm:text-sm',
                        )}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-2.5"
                        tabIndex={-1}
                        aria-label={isOpen ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                        {isOpen ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
            )}

            {(hint || error) && <p className={cn('ml-0.5 text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>{error ?? hint}</p>}
        </div>
    );
});

AppInput.displayName = 'AppInput';

export default AppInput;
