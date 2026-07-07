import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, CircleAlert, Info, Search, X } from 'lucide-react';
import * as React from 'react';
import { EmptyContent } from './ui-shadcn/empty';
import { Popover, PopoverContent, PopoverTrigger } from './ui-shadcn/popover';
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
    return options?.length > 0 && 'group' in options[0];
}

function flattenOptions(options: SelectOptions): SelectOption[] {
    if (isGrouped(options)) {
        return options.flatMap((g) => g.options);
    }
    return options as SelectOption[];
}

/**
 * Filters grouped or flat options by label (case-insensitive, substring match).
 * Groups with zero matching options are dropped entirely.
 */
function filterOptions(options: SelectOptions, query: string): SelectOptions {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();

    if (isGrouped(options)) {
        return options
            .map((group) => ({
                group: group.group,
                options: group.options.filter((opt) => opt.label.toLowerCase().includes(q)),
            }))
            .filter((group) => group.options.length > 0);
    }

    return (options as SelectOption[]).filter((opt) => opt.label.toLowerCase().includes(q));
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

const sizeStyles: Record<SelectSize, string> = {
    sm: 'min-h-8 text-[10px]',
    md: 'min-h-10 text-sm',
    lg: 'min-h-12 text-base',
    responsive: 'min-h-8 text-[10px] sm:min-h-10 sm:text-sm',
};

const itemSizeStyles: Record<SelectSize, string> = {
    sm: 'text-[10px]',
    md: 'text-sm',
    lg: 'text-base',
    responsive: 'text-[10px] sm:text-sm',
};

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

export interface AppSelectMultipleProps {
    options: SelectOptions;
    value: string[];
    onValueChange: (value: string[]) => void;
    label?: string;
    hint?: string;
    tooltip?: string;
    emptyMsg?: string;
    error?: string;
    placeholder?: string;
    triggerClassName?: string;
    contentClassName?: string;
    tone?: SelectTone;
    size?: SelectSize;
    required?: boolean;
    disabled?: boolean;
    maxBadges?: number;
    clearable?: boolean;
    withSelectAll?: boolean;
    /** Show a search input inside the popover to filter options by label. Defaults to true. */
    searchable?: boolean;
    /** Placeholder text for the search input. */
    searchPlaceholder?: string;
    /** Message shown when the search query has no matching options. */
    searchEmptyMsg?: string;
    name?: string;
    id?: string;
}

const AppSelectMultiple = ({
    options,
    value,
    onValueChange,
    label,
    tooltip,
    hint,
    error,
    placeholder = 'Pilih opsi...',
    triggerClassName,
    contentClassName,
    required,
    disabled,
    emptyMsg = 'Tidak ada opsi saat ini',
    tone: toneProp = 'default',
    size = 'responsive',
    maxBadges = 3,
    clearable = true,
    withSelectAll = false,
    searchable = true,
    searchPlaceholder = 'Cari...',
    searchEmptyMsg = 'Tidak ditemukan',
    name,
    id: idProp,
}: AppSelectMultipleProps) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const tone: SelectTone = error ? 'error' : toneProp;
    const message = error ?? hint;

    const id = idProp ?? label?.toLowerCase().replace(/\s+/g, '-');

    const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
    const selectableOptions = React.useMemo(() => flatOptions.filter((o) => !o.disabled), [flatOptions]);

    const filteredOptions = React.useMemo(() => filterOptions(options, query), [options, query]);
    const filteredFlatOptions = React.useMemo(() => flattenOptions(filteredOptions), [filteredOptions]);
    const filteredSelectableOptions = React.useMemo(() => filteredFlatOptions.filter((o) => !o.disabled), [filteredFlatOptions]);

    const selectedOptions = React.useMemo(
        () => value?.map((v) => flatOptions.find((o) => o.value === v)).filter((o): o is SelectOption => Boolean(o)),
        [value, flatOptions],
    );

    // "Pilih semua" toggles only the currently *filtered* selectable options,
    // so it behaves intuitively while a search query is active.
    const allFilteredSelected = filteredSelectableOptions.length > 0 && filteredSelectableOptions.every((o) => value?.includes(o.value));

    const toggleValue = (optValue: string) => {
        if (value?.includes(optValue)) {
            onValueChange(value.filter((v) => v !== optValue));
        } else {
            onValueChange([...value, optValue]);
        }
    };

    const removeValue = (optValue: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        onValueChange(value.filter((v) => v !== optValue));
    };

    const clearAll = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onValueChange([]);
    };

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            onValueChange(value.filter((v) => !filteredSelectableOptions.some((o) => o.value === v)));
        } else {
            const newValues = new Set(value);
            filteredSelectableOptions.forEach((o) => newValues.add(o.value));
            onValueChange(Array.from(newValues));
        }
    };

    const visibleBadges = selectedOptions?.slice(0, maxBadges);
    const hiddenCount = selectedOptions?.length - visibleBadges?.length;

    // Reset search query each time the popover closes, and autofocus when it opens
    React.useEffect(() => {
        if (open) {
            const t = setTimeout(() => searchInputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
        setQuery('');
    }, [open]);

    return (
        <div className="flex flex-col gap-1 sm:gap-1.5" style={toneStyles[tone]}>
            {/* ── Label row ── */}
            <div className="flex items-center gap-2">
                {label && (
                    <Label
                        htmlFor={id}
                        className={cn('ml-0.5 font-medium transition-colors', 'text-xs sm:text-sm', disabled && 'opacity-50')}
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
            <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className={cn(
                            'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 font-semibold transition-all duration-200',
                            'focus:ring-0 focus:outline-none',
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                            sizeStyles[size],
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
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                            {selectedOptions?.length === 0 && (
                                <span className={cn('font-semibold', itemSizeStyles[size])} style={{ color: 'var(--tone-placeholder)' }}>
                                    {placeholder}
                                </span>
                            )}
                            {visibleBadges?.map((opt) => (
                                <Badge
                                    key={opt.value}
                                    variant="secondary"
                                    className={cn('flex items-center gap-1 rounded-sm px-1.5 py-0 font-medium', itemSizeStyles[size])}
                                >
                                    {opt.label}
                                    {!disabled && (
                                        <span
                                            role="button"
                                            tabIndex={-1}
                                            onClick={(e) => removeValue(opt.value, e)}
                                            className="rounded-full hover:opacity-70"
                                        >
                                            <X size={11} />
                                        </span>
                                    )}
                                </Badge>
                            ))}
                            {hiddenCount > 0 && (
                                <Badge variant="secondary" className={cn('rounded-sm px-1.5 py-0 font-medium', itemSizeStyles[size])}>
                                    +{hiddenCount} lainnya
                                </Badge>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            {clearable && !disabled && selectedOptions?.length > 0 && (
                                <span role="button" tabIndex={-1} onClick={clearAll} className="rounded-full p-0.5 hover:opacity-70">
                                    <X size={13} />
                                </span>
                            )}
                            <ChevronDown size={14} className="opacity-60 sm:size-4" />
                        </div>
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className={cn('w-[--radix-popover-trigger-width] overflow-hidden p-0', contentClassName)}
                    style={toneStyles[tone]}
                >
                    {/* ── Search input ── */}
                    {searchable && flatOptions.length > 0 && (
                        <div className="flex items-center gap-2 border-b px-2" style={{ borderColor: 'var(--tone-border)' }}>
                            <Search size={13} className="shrink-0 opacity-50" />
                            <Input
                                ref={searchInputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className={cn('h-8 border-none px-0 shadow-none focus-visible:ring-0', itemSizeStyles[size])}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                            {query && (
                                <span
                                    role="button"
                                    tabIndex={-1}
                                    onClick={() => setQuery('')}
                                    className="shrink-0 rounded-full p-0.5 hover:opacity-70"
                                >
                                    <X size={13} />
                                </span>
                            )}
                        </div>
                    )}

                    <div className="max-h-[260px] overflow-y-auto p-1">
                        {flatOptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-4 text-[10px]">
                                <CircleAlert />
                                <EmptyContent>{emptyMsg}</EmptyContent>
                            </div>
                        ) : filteredFlatOptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 p-4 text-[10px] opacity-70">
                                <Search size={16} />
                                <span>{searchEmptyMsg}</span>
                            </div>
                        ) : (
                            <>
                                {withSelectAll && (
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className={cn(
                                            'hover:bg-accent flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 font-semibold',
                                            itemSizeStyles[size],
                                        )}
                                    >
                                        <span>{allFilteredSelected ? 'Hapus semua' : 'Pilih semua'}</span>
                                        {allFilteredSelected && <Check size={14} />}
                                    </button>
                                )}

                                {isGrouped(filteredOptions)
                                    ? (filteredOptions as SelectOptionGroup[]).map((group) => (
                                          <div key={group.group} className="mb-1">
                                              <p className={cn('px-2 py-1 font-semibold opacity-60', labelSizeStyles[size])}>{group.group}</p>
                                              {group.options.map((opt) => {
                                                  const checked = value?.includes(opt.value);
                                                  return (
                                                      <button
                                                          key={opt.value}
                                                          type="button"
                                                          disabled={opt.disabled}
                                                          onClick={() => toggleValue(opt.value)}
                                                          className={cn(
                                                              'hover:bg-accent flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left font-semibold',
                                                              opt.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                                                              itemSizeStyles[size],
                                                          )}
                                                      >
                                                          <span className="truncate">{opt.label}</span>
                                                          {checked && <Check size={14} className="shrink-0" />}
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      ))
                                    : (filteredOptions as SelectOption[]).map((opt) => {
                                          const checked = value?.includes(opt.value);
                                          return (
                                              <button
                                                  key={opt.value}
                                                  type="button"
                                                  disabled={opt.disabled}
                                                  onClick={() => toggleValue(opt.value)}
                                                  className={cn(
                                                      'hover:bg-accent flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left font-semibold',
                                                      opt.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                                                      itemSizeStyles[size],
                                                  )}
                                              >
                                                  <span className="truncate">{opt.label}</span>
                                                  {checked && <Check size={14} className="shrink-0" />}
                                              </button>
                                          );
                                      })}
                            </>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* hidden inputs so it still participates in a plain <form> submit if needed */}
            {name && value?.map((v) => <input key={v} type="hidden" name={`${name}[]`} value={v} />)}

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

AppSelectMultiple.displayName = 'AppSelectMultiple';

export default AppSelectMultiple;
