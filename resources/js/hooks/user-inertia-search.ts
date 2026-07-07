// hooks/use-inertia-search.ts
import { SelectOption } from '@/components/app-select';
import * as React from 'react';

interface UseInertiaSearchProps {
    url: string;
    mapFn: (item: any) => SelectOption;
    debounce?: number;
    onResult?: (results: SelectOption[]) => void;
}

export function useInertiaSearch({ url, mapFn, debounce: debounceMs = 400, onResult }: UseInertiaSearchProps) {
    const [options, setOptions] = React.useState<SelectOption[]>([]);
    const [loading, setLoading] = React.useState(false);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = React.useRef<AbortController | null>(null);

    const search = React.useCallback(
        (query: string) => {
            if (!query) {
                setOptions([]);
                return;
            }

            // batalkan request sebelumnya
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();

            debounceRef.current = setTimeout(async () => {
                setLoading(true);

                const controller = new AbortController();
                abortRef.current = controller;

                try {
                    const params = new URLSearchParams({ search: query });
                    const res = await fetch(`${url}?${params}`, {
                        signal: controller.signal,
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                        },
                    });

                    if (!res.ok) throw new Error('Request failed');
                    const data = await res.json();
                    setOptions(data.map(mapFn));
                    const mapped = data.map(mapFn);
                    onResult?.(mapped);
                } catch (err: any) {
                    if (err.name !== 'AbortError') setOptions([]);
                } finally {
                    setLoading(false);
                }
            }, debounceMs);
            // console.log('Options: ', options);
        },

        [url, mapFn, debounceMs],
    );

    React.useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return { options, loading, search };
}
