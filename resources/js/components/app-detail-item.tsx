import { cn } from '@/lib/utils';
import { SelectTone } from './app-select';
import { Badge } from './ui-shadcn/badge';

type DetailItemProps = {
    label: string;
    value?: string | number | undefined | null;
    /** Kalau diisi, tiap item dirender sebagai badge terpisah (mis. daftar mandor). Prioritas di atas `value`. */
    values?: (string | number)[];
    isStatus?: boolean;
    toneStatus?: SelectTone;
    isBordered?: boolean;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
    /** Teks fallback kalau `values` kosong/undefined. Default '-'. */
    emptyText?: string;
};

const toneStyles: Record<SelectTone, React.CSSProperties> = {
    default: {
        '--tone-bg': 'var(--muted)',
        '--tone-border': 'var(--border)',
        '--tone-text': 'var(--muted-foreground)',
    } as React.CSSProperties,

    error: {
        '--tone-bg': 'var(--color-error-bg)',
        '--tone-border': 'color-mix(in srgb, var(--color-error) 35%, transparent)',
        '--tone-text': 'var(--color-error)',
    } as React.CSSProperties,

    warning: {
        '--tone-bg': 'var(--color-warning-bg)',
        '--tone-border': 'color-mix(in srgb, var(--color-warning) 35%, transparent)',
        '--tone-text': 'var(--color-warning)',
    } as React.CSSProperties,

    success: {
        '--tone-bg': 'var(--color-success-bg)',
        '--tone-border': 'color-mix(in srgb, var(--color-success) 35%, transparent)',
        '--tone-text': 'var(--color-success)',
    } as React.CSSProperties,

    info: {
        '--tone-bg': 'var(--color-info-bg)',
        '--tone-border': 'color-mix(in srgb, var(--color-info) 35%, transparent)',
        '--tone-text': 'var(--color-info)',
    } as React.CSSProperties,
};

const DetailItem: React.FC<DetailItemProps> = ({
    label,
    value,
    values,
    isStatus = false,
    toneStatus = 'default',
    isBordered = true,
    className,
    labelClassName,
    valueClassName,
    emptyText = '-',
}) => {
    const tone: SelectTone = toneStatus;

    const renderValue = () => {
        if (isStatus) {
            return (
                <Badge
                    style={{
                        ...toneStyles[tone],
                        backgroundColor: 'var(--tone-bg)',
                        borderColor: 'var(--tone-border)',
                        color: 'var(--tone-text)',
                    }}
                    data-tone={tone}
                    className="border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide sm:text-xs"
                >
                    {value}
                </Badge>
            );
        }

        // Mode array: tiap item jadi badge terpisah (border membungkus masing-masing)
        if (values) {
            if (values.length === 0) {
                return <span className={cn('text-foreground/80 text-sm', valueClassName)}>{emptyText}</span>;
            }

            return (
                <div className="flex flex-wrap justify-end gap-1.5">
                    {values.map((item, idx) => (
                        <span
                            key={`${item}-${idx}`}
                            className={cn(
                                'bg-foreground text-background rounded-xl px-2 py-0.5 text-[10px] font-semibold sm:text-sm',
                                valueClassName,
                            )}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            );
        }

        // Mode default: single value
        return <span className={cn('text-foreground/80 text-sm', valueClassName)}>{value ?? emptyText}</span>;
    };

    return (
        <div className={cn(isBordered && 'border-border border-b last:border-b-0', 'flex items-center justify-between py-2.5', className)}>
            <span className={cn(`text-foreground text-sm font-semibold`, labelClassName)}>{label}</span>
            {renderValue()}
        </div>
    );
};

export default DetailItem;
