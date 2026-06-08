import AppDatePicker from '@/components/app-day-picker';
import AppInput from '@/components/app-input';
import AppSelect, { SelectOption } from '@/components/app-select';
import AppSelectSearch from '@/components/app-select-search';
import AppTextArea from '@/components/app-textare';
import { Button } from '@/components/ui/button';
import { useInertiaSearch } from '@/hooks/user-inertia-search';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { ProyekProps } from '@/types/project.type';
import { initialTransaksi, KategoriTransaksi, TransaksiItem, TransaksiProps } from '@/types/transaction.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ListAddItem from './assets/components/ListAddItem';
import { KATEGORI_DENGAN_ITEM } from './assets/transaksi-assets';

interface PageProps extends InertiaPageProps {
    transaksi?: TransaksiProps;
    proyek?: ProyekProps;
    usedKategory?: string[];
}

const TransactionCreateIndex = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { props } = usePage<PageProps>();
    const { transaksi: dataTransaksi, proyek: dataProyek, usedKategori: dataUsedKategori } = props;
    const transaksiId = dataTransaksi?.transaksi_id ?? null;
    const [mode, setMode] = useState<'persen' | 'jumlah'>('persen');
    // type SatuanOptionType = 'idr' | 'persen';
    // const [satuanOption, setSatuanOption] = useState<SatuanOptionType | null>(null);
    const [usedKategori, setUsedKategori] = useState<string[]>((dataUsedKategori as string[]) ?? []);
    const [namaProyekOptions, setNamaProyekOptions] = useState<SelectOption[]>(
        dataProyek ? [{ value: dataProyek.proyek_id, label: dataProyek.nama_proyek }] : [],
    );
    const [loadingKategori, setLoadingKategori] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: transaksiId !== null ? 'Ubah Transaksi' : 'Buat Transaksi Baru',
            href: transaksiId !== null ? `transaction/${transaksiId}/edit` : 'transaction/create',
        },
    ];

    const form = useForm<TransaksiProps>(initialTransaksi);
    const { data, setData, post, processing, errors, put } = form;
    const { loading: namaProyekLoading, search: searchNamaProyek } = useInertiaSearch({
        url: route('transaction.search-nama-proyek'),
        mapFn: (item) => ({ value: String(item.proyek_id), label: item.nama_proyek }),
        onResult: (results) => {
            setNamaProyekOptions(results);
        },
    });
    useEffect(() => {
        if (transaksiId && dataTransaksi) {
            setData({
                ...dataTransaksi,
                jumlah: parseFloat(String(dataTransaksi.jumlah)),
                persen: parseFloat(String(dataTransaksi.persen)),
                tanggal: dataTransaksi.tanggal ? new Date(dataTransaksi.tanggal).toISOString().split('T')[0] : '',
            });
        }
    }, [transaksiId]);
    useEffect(() => {
        if (transaksiId || dataTransaksi) {
            if (dataTransaksi?.jumlah !== 0) {
                setMode('jumlah');
            } else {
                setMode('persen');
            }
        }
    }, [transaksiId, dataTransaksi]);

    const handleProyekChange = async (proyekId: string) => {
        setData('proyek_id', proyekId);
        setData('kategori', '');

        if (!proyekId) {
            setUsedKategori([]);
            return;
        }

        setLoadingKategori(true);
        try {
            const res = await fetch(route('transaction.used-kategori', { proyek_id: proyekId }), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
            });
            const json = await res.json();
            setUsedKategori(json);
        } catch {
            setUsedKategori([]);
        } finally {
            setLoadingKategori(false);
        }
    };
    const kategoriOptions = [
        { value: 'material', label: 'Material' },
        { value: 'operasional', label: 'Operasional' },
        { value: 'jasa_tukang', label: 'Jasa Tukang' },
        { value: 'mandor', label: 'Mandor' },
        { value: 'staff_perpajakan', label: 'Staff Perpajakan' },
        { value: 'staff_entry_data', label: 'Staff Entry Data' },
        { value: 'biaya_tak_terduga', label: 'Biaya Tak Terduga' },
    ].map((opt) => ({
        ...opt,
        label: usedKategori.includes(opt.value) ? `${opt.label} ✓` : opt.label,
        disabled: usedKategori.includes(opt.value),
    }));

    const handleSubmitTransaksi = async (e: React.FormEvent) => {
        e.preventDefault();

        if (transaksiId !== null) {
            put(`/transaction/${transaksiId}`, {
                preserveState: false,
                onStart: () => setLoading(true),

                onSuccess: () => {
                    toast.success('Berhasil memperbarui transaksi.', { position: 'top-right' });
                    router.reload({ only: ['list_transaksi'] });
                },

                onError: (err) => {
                    toast.error('Gagal memperbarui transaksi.', { position: 'top-right' });
                    console.log('Error: ', err);
                },

                onFinish: () => setLoading(false),
            });
        } else {
            post('/transaction', {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil membuat transaksi baru.', { position: 'top-right' });
                    console.log('Success: ', success);
                },

                onError: (err: any) => {
                    toast.error('Gagal membuat transaksi baru.', {
                        position: 'top-right',
                        description: errors?.jumlah || errors?.kategori || errors?.tanggal || errors?.proyek_id || errors?.persen,
                    });
                    console.log('Error: ', err);
                },

                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Transaksi" />

            <div className="mt-2 flex w-full items-center justify-end gap-4 px-4">
                <Button
                    disabled={loading || processing}
                    onClick={() => router.visit('/transaction')}
                    className={`"transition-all relative" duration-150`}
                    variant={'secondary'}
                >
                    <span className={loading || processing ? 'invisible' : ''}>Kembali</span>

                    {loading || (processing && <Loader2 className="absolute inset-0 m-auto animate-spin" />)}
                </Button>
                <Button onClick={(e) => handleSubmitTransaksi(e)} disabled={loading || processing} className="relative transition-all duration-150">
                    <span className={loading || processing ? 'invisible' : ''}>Simpan</span>

                    {loading || (processing && <Loader2 className="absolute inset-0 m-auto animate-spin" />)}
                </Button>
            </div>
            <div className="grid grid-cols-1 items-center gap-4 px-4 py-2 sm:grid-cols-2">
                <AppSelectSearch
                    async
                    label="Proyek"
                    required
                    placeholder="Pilih Proyek..."
                    searchPlaceholder="Ketik nama proyek ..."
                    options={namaProyekOptions}
                    loading={namaProyekLoading || loadingKategori}
                    onSearch={searchNamaProyek}
                    value={data.proyek_id}
                    defaultValue={dataProyek?.proyek_id}
                    onValueChange={handleProyekChange}
                    error={errors.proyek_id}
                />

                <AppDatePicker
                    value={data.tanggal ? new Date(data.tanggal) : undefined}
                    required
                    label="Tanggal Rampung"
                    error={errors?.tanggal}
                    onChange={(e) => setData('tanggal', e ? formatDate(e, 'yyyy-MM-dd') : '')}
                />

                <AppSelect
                    defaultValue={dataTransaksi?.kategori || ''}
                    label="Kategori"
                    placeholder="Pilih opsi . . ."
                    disabled={!dataProyek?.proyek_id && !data?.proyek_id}
                    required={true}
                    value={data.kategori}
                    onValueChange={(val) => setData('kategori', val as KategoriTransaksi)}
                    options={kategoriOptions}
                    error={errors.kategori}
                    // hint={}
                    tooltip={transaksiId === null ? (!data.proyek_id ? 'Pilih proyek terlebih dahulu' : undefined) : undefined}
                />

                {!['material', 'operasional', 'biaya_tak_terduga'].includes(data?.kategori) && (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="ml-0.5 text-sm font-medium">Nominal</label>
                            <div className="bg-muted border-border flex h-7 w-fit gap-0.5 rounded-md border p-0.5">
                                <button
                                    type="button"
                                    disabled={!data?.kategori}
                                    onClick={() => {
                                        setMode('persen');
                                        setData('persen', 0);
                                    }}
                                    className={cn(
                                        'rounded px-2.5 text-xs font-semibold transition-all duration-150',
                                        mode === 'persen' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    %
                                </button>
                                <button
                                    type="button"
                                    disabled={!data?.kategori}
                                    onClick={() => {
                                        setMode('jumlah');
                                        setData('jumlah', 0);
                                    }}
                                    className={cn(
                                        'rounded px-2.5 text-xs font-semibold transition-all duration-150',
                                        mode === 'jumlah' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    IDR
                                </button>
                            </div>
                        </div>

                        <AppInput
                            type="number"
                            min={0}
                            disabled={!data?.kategori}
                            max={mode === 'persen' ? 100 : undefined}
                            required
                            placeholder={mode === 'persen' ? 'Masukkan persen . . .' : 'Masukkan jumlah . . .'}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (mode === 'persen') {
                                    setData('persen', val);
                                    setData('jumlah', 0);
                                } else {
                                    setData('jumlah', val);
                                    setData('persen', 0);
                                }
                            }}
                            value={mode === 'jumlah' ? data.jumlah || '' : data.persen || ''}
                            error={errors?.jumlah || errors?.persen}
                        />
                    </div>
                )}
            </div>
            {/* {!dataProyek?.proyek_id && !data?.proyek_id ? (
                <> </>
            ) : (
                <div
                    className={`max-w-[390px] transition-all duration-500 ease-in-out sm:max-w-[700px] lg:max-w-full ${
                        KATEGORI_DENGAN_ITEM.includes(data.kategori) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-4 pt-2">
                        <ItemTable
                            errors={errors as Record<string, string>}
                            items={data?.items as TransaksiItem[]}
                            onChange={(items) => setData('items', items as TransaksiItem[])}
                        />
                    </div>
                </div>
            )} */}

            {!dataProyek?.proyek_id && !data?.proyek_id ? (
                <> </>
            ) : (
                <div
                    className={`max-w-full transition-all duration-500 ease-in-out sm:max-w-[700px] lg:max-w-full ${
                        KATEGORI_DENGAN_ITEM.includes(data.kategori) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="my-4 w-full px-4">
                        <ListAddItem
                            errors={errors as Record<string, string>}
                            items={data?.items as TransaksiItem[]}
                            kategori={data?.kategori}
                            onChange={(items) => setData('items', items as TransaksiItem[])}
                        />
                    </div>
                </div>
            )}

            <div className="z-50 mt-4 px-4 pb-7">
                <AppTextArea
                    className="min-h-50 px-3 py-4"
                    value={data?.keterangan || ''}
                    onChange={(e) => setData('keterangan', e.target.value)}
                    placeholder="Masukkan keterangan transaksi . . ."
                    label="Keterangan Transaksi"
                    error={errors?.keterangan}
                />
            </div>
        </AppLayout>
    );
};

export default TransactionCreateIndex;
