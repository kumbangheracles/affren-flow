import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CircleAlert, Info } from 'lucide-react';
import * as React from 'react';
import { EmptyContent } from './ui-shadcn/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui-shadcn/tooltip';

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface SelectOptionGroup {
    group: string;
    options: SelectOption[];
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

export type SelectTone = 'default' | 'error' | 'warning' | 'success' | 'info';

export type SelectSize = 'sm' | 'md' | 'lg' | 'responsive';

function isGrouped(options: SelectOptions): options is SelectOptionGroup[] {
    return options.length > 0 && 'group' in options[0];
}

const toneStyles: Record<SelectTone, React.CSSProperties> = {
    default: {
        '--tone-bg': 'var(--muted)',
        '--tone-border': 'var(--input)',
        '--tone-focus-border': 'var(--primary)',
        '--tone-ring': 'var(--primary)',
        '--tone-text': 'var(--foreground)',
        '--tone-placeholder': 'var(--muted-foreground)',
        '--tone-label': 'inherit',
        '--tone-hint': 'var(--muted-foreground)',
    } as React.CSSProperties,

    error: {
        '--tone-bg': 'color-mix(in srgb, var(--color-error) 12%, var(--background))',
        '--tone-border': 'var(--color-error)',
        '--tone-focus-border': 'var(--color-error)',
        '--tone-ring': 'var(--color-error)',
        '--tone-text': 'color-mix(in srgb, var(--color-error) 80%, var(--foreground))',
        '--tone-placeholder': 'color-mix(in srgb, var(--color-error) 55%, var(--foreground))',
        '--tone-label': 'color-mix(in srgb, var(--color-error) 70%, var(--foreground))',
        '--tone-hint': 'color-mix(in srgb, var(--color-error) 65%, var(--foreground))',
    } as React.CSSProperties,

    warning: {
        '--tone-bg': 'color-mix(in srgb, var(--color-warning) 12%, var(--background))',
        '--tone-border': 'var(--color-warning)',
        '--tone-focus-border': 'var(--color-warning)',
        '--tone-ring': 'var(--color-warning)',
        '--tone-text': 'color-mix(in srgb, var(--color-warning) 80%, var(--foreground))',
        '--tone-placeholder': 'color-mix(in srgb, var(--color-warning) 55%, var(--foreground))',
        '--tone-label': 'color-mix(in srgb, var(--color-warning) 70%, var(--foreground))',
        '--tone-hint': 'color-mix(in srgb, var(--color-warning) 65%, var(--foreground))',
    } as React.CSSProperties,

    success: {
        '--tone-bg': 'color-mix(in srgb, var(--color-success) 15%, var(--background))',
        '--tone-border': 'var(--color-success)',
        '--tone-focus-border': 'var(--color-success)',
        '--tone-ring': 'var(--color-success)',
        '--tone-text': 'color-mix(in srgb, var(--color-success) 80%, var(--foreground))',
        '--tone-placeholder': 'color-mix(in srgb, var(--color-success) 55%, var(--foreground))',
        '--tone-label': 'color-mix(in srgb, var(--color-success) 70%, var(--foreground))',
        '--tone-hint': 'color-mix(in srgb, var(--color-success) 65%, var(--foreground))',
    } as React.CSSProperties,

    info: {
        '--tone-bg': 'color-mix(in srgb, var(--color-info) 12%, var(--background))',
        '--tone-border': 'var(--color-info)',
        '--tone-focus-border': 'var(--color-info)',
        '--tone-ring': 'var(--color-info)',
        '--tone-text': 'color-mix(in srgb, var(--color-info) 80%, var(--foreground))',
        '--tone-placeholder': 'color-mix(in srgb, var(--color-info) 55%, var(--foreground))',
        '--tone-label': 'color-mix(in srgb, var(--color-info) 70%, var(--foreground))',
        '--tone-hint': 'color-mix(in srgb, var(--color-info) 65%, var(--foreground))',
    } as React.CSSProperties,
};

/**
 * Trigger height + font-size per size variant.
 * `responsive` is the default: sm on mobile, md on sm breakpoint and above.
 */
const sizeStyles: Record<SelectSize, string> = {
    sm: 'h-8 text-[10px]',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
    responsive: 'h-8 text-[10px] sm:h-10 sm:text-sm',
};

/**
 * SelectItem font-size per size variant (mirrors trigger).
 */
const itemSizeStyles: Record<SelectSize, string> = {
    sm: 'text-[10px]',
    md: 'text-sm',
    lg: 'text-base',
    responsive: 'text-[10px] sm:text-sm',
};

/**
 * SelectLabel font-size per size variant.
 */
const labelSizeStyles: Record<SelectSize, string> = {
    sm: 'text-[10px]',
    md: 'text-sm',
    lg: 'text-base',
    responsive: 'text-[10px] sm:text-sm',
};

const ToneIcon: React.FC<{ tone: SelectTone }> = ({ tone }) => {
    if (tone === 'default') return null;

    const iconMap: Record<Exclude<SelectTone, 'default'>, React.ReactNode> = {
        error: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
            </svg>
        ),
        warning: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1.5L11 10.5H1L6 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                <path d="M6 5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="9" r="0.6" fill="currentColor" />
            </svg>
        ),
        success: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        info: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="3.5" r="0.6" fill="currentColor" />
            </svg>
        ),
    };

    return <span className="inline-flex items-center">{iconMap[tone]}</span>;
};

interface AppSelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
    options: SelectOptions;
    label?: string;
    hint?: string;
    tooltip?: string;
    emptyMsg?: string;
    /**
     * @deprecated Use `tone="error"` + `hint` instead.
     * Still supported for backward compatibility — when provided it forces tone="error".
     */
    error?: string;
    placeholder?: string;
    triggerClassName?: string;
    /** Visual tone of the select field. Defaults to "default". */
    tone?: SelectTone;
    /**
     * Controls trigger height and font-size.
     * Defaults to "responsive" (h-8/text-[10px] on mobile → h-10/text-sm on sm+).
     */
    size?: SelectSize;
}

const AppSelect = ({
    options,
    label,
    tooltip,
    hint,
    error,
    placeholder = 'Pilih opsi...',
    triggerClassName,
    required,
    disabled,
    emptyMsg = 'Tidak ada opsi saat ini',
    tone: toneProp = 'default',
    size = 'responsive',
    ...props
}: AppSelectProps) => {
    // Legacy `error` prop overrides tone
    const tone: SelectTone = error ? 'error' : toneProp;
    const message = error ?? hint;

    const id = label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1 sm:gap-1.5" style={toneStyles[tone]}>
            {/* ── Label row ── */}
            <div className="flex items-center gap-2">
                {label && (
                    <Label
                        htmlFor={id}
                        className={cn(
                            'ml-0.5 font-medium transition-colors',
                            'text-xs sm:text-sm', // responsive label size
                            disabled && 'opacity-50',
                        )}
                        style={{ color: 'var(--tone-label)' }}
                    >
                        {label}
                        {required && (
                            <span className="ml-1" style={{ color: 'var(--destructive)' }}>
                                *
                            </span>
                        )}
                    </Label>
                )}
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="animate-bounce cursor-pointer rounded-full">
                                <Info size={15} className="sm:size-[17px]" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* ── Trigger ── */}
            <Select disabled={disabled} required={required} {...props}>
                <SelectTrigger
                    id={id}
                    className={cn(
                        'border font-semibold transition-all duration-200',
                        'focus:ring-0 focus:outline-none',
                        'cursor-pointer',
                        sizeStyles[size], // ← centralised size
                        triggerClassName,
                    )}
                    style={
                        {
                            backgroundColor: 'var(--tone-bg)',
                            borderColor: 'var(--tone-border)',
                            color: 'var(--tone-text)',
                            '--tw-ring-color': 'var(--tone-ring)',
                        } as React.CSSProperties
                    }
                    data-tone={tone}
                >
                    <SelectValue
                        className={cn(
                            'font-semibold [&>span]:text-[color:var(--tone-placeholder)]',
                            itemSizeStyles[size], // ← placeholder text size matches trigger
                        )}
                        placeholder={placeholder}
                    />
                </SelectTrigger>

                {/* ── Options ── */}
                {options.length > 0 && (
                    <SelectContent className="max-h-[300px]">
                        {isGrouped(options)
                            ? options?.map((group) => (
                                  <SelectGroup key={group.group}>
                                      <SelectLabel className={cn(labelSizeStyles[size])}>{group.group}</SelectLabel>
                                      {group.options?.map((opt) => (
                                          <SelectItem
                                              style={toneStyles[tone]}
                                              className={cn('cursor-pointer font-semibold', itemSizeStyles[size])}
                                              key={opt.value}
                                              value={opt.value}
                                              disabled={opt.disabled}
                                          >
                                              {opt.label}
                                          </SelectItem>
                                      ))}
                                  </SelectGroup>
                              ))
                            : (options as SelectOption[])?.map((opt) => (
                                  <SelectItem
                                      style={toneStyles[tone]}
                                      className={cn('cursor-pointer font-semibold', itemSizeStyles[size])}
                                      key={opt.value}
                                      value={opt.value}
                                      disabled={opt.disabled}
                                  >
                                      {opt.label}
                                  </SelectItem>
                              ))}
                    </SelectContent>
                )}

                {/* ── Empty state ── */}
                {options.length === 0 && (
                    <SelectContent>
                        <div className="flex flex-col items-center justify-center gap-3 p-4 text-[10px]">
                            <CircleAlert />
                            <EmptyContent>{emptyMsg}</EmptyContent>
                        </div>
                    </SelectContent>
                )}
            </Select>

            {/* ── Hint / error message ── */}
            {message && (
                <p className="ml-0.5 flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: 'var(--tone-hint)' }}>
                    <ToneIcon tone={tone} />
                    {message}
                </p>
            )}
        </div>
    );
};

AppSelect.displayName = 'AppSelect';

export default AppSelect;
