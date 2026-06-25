import DetailItem from '@/components/app-detail-item';
import CashFlowCard from '@/components/cashflow-card';
import FadeUpWrapper from '@/components/fade-up-wrapper';
import LabaRugiCard from '@/components/laba-rugi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, formatPercent } from '@/helpers/format';
import { useCountUp } from '@/hooks/use-count';
import { useMounted } from '@/hooks/use-mounted';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { AnggaranProps } from '@/types/anggaran.type';
import { LabaRugiProps } from '@/types/laba_rugi.type';
import { ProyekProps } from '@/types/project.type';
import { RealisasiProps } from '@/types/realisasi.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { saveAs } from 'file-saver';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PageProps extends InertiaPageProps {
    proyek?: ProyekProps;
    anggaran?: AnggaranProps;
    realisasi?: RealisasiProps;
    laba_rugi?: LabaRugiProps;
    cashflow?: {
        pemasukan?: number;
        total_pengeluaran?: number;
        cashflow?: number;
        breakdown?: Record<string, number>;
    };
}

const ProjectDetailIndex = () => {
    const { props } = usePage<PageProps>();
    const proyek = props?.proyek;
    const anggaran = props?.anggaran;
    const realisasi = props?.realisasi;
    const laba_rugi = props?.laba_rugi;
    const cashflow = props?.cashflow;
    const projectId = props?.proyek_id ?? null;
    console.log('Props: ', props);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Detail Proyek',
            href: `/project/${projectId}/detail`,
        },
    ];

    const exportToExcel = () => {
        const wsData = [
            ['Field', 'Value'],
            ['Nama Proyek', proyek?.nama_proyek],
            ['Tipe Proyek', proyek?.tipe_proyek],
            ['Pagu Total', formatCurrency(proyek?.pagu_total)],
            ['Tanggal Mulai', formatDate(proyek?.tanggal_mulai)],
            ['Tanggal Selesai', formatDate(proyek?.tanggal_selesai as string)],
            ['Pajak (%)', formatPercent(proyek?.pajak_persen)],
            ['Uang Bahan (%)', formatPercent(proyek?.uang_bahan_persen)],
            ['Jasa Tukang (%)', formatPercent(proyek?.jasa_tukang_persen)],
            ['Biaya Tak Terduga (%)', formatPercent(proyek?.biaya_tak_terduga_persen)],
            ['Biaya Staff Perpajakan', formatCurrency(proyek?.biaya_staff_perpajakan)],
            ['Biaya Staff Entry Data', formatCurrency(proyek?.biaya_staff_entry_data)],
            ['Nama Klien', proyek?.nama_klien],
            ['Status', proyek?.status],
            ['Deskripsi Proyek', proyek?.deskripsi_proyek ?? '-'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 25 }, { wch: 40 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Proyek');

        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buf], { type: 'application/octet-stream' });
        saveAs(blob, `${proyek?.nama_proyek || 'proyek'}.xlsx`);
    };

    const getStatusTone = (status?: string) => {
        if (status === 'selesai') return 'success';
        if (status === 'dibatalkan') return 'error';
        if (status === 'sedang_berjalan') return 'info';
        return 'default';
    };

    const getStatusLabel = (status?: string) => {
        if (status === 'sedang_berjalan') return 'Sedang Berjalan';
        if (status === 'dibatalkan') return 'Dibatalkan';
        if (status === 'selesai') return 'Selesai';
        return '-';
    };
    const isMounted = useMounted();

    const animatedValueNetto = useCountUp(anggaran?.netto as number, 1600, isMounted);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Proyek" />

            {/* Action Bar */}
            <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 px-4 sm:flex-row">
                <div className="flex items-center gap-2">
                    <div className="bg-primary hidden h-1 w-6 rounded-full sm:block" />
                    <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase opacity-60">Ringkasan Proyek</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.visit('/project')}
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:text-foreground gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                    <Button onClick={exportToExcel} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Download Excel
                        <Download className="h-3.5 w-3.5 opacity-70" />
                    </Button>
                </div>
            </div>
            <FadeUpWrapper delay={200}>
                <Card className="border-border bg-card m-4">
                    <CardHeader className="border-border border-b pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                                <div className="bg-primary h-3 w-3 rounded-sm" />
                            </div>
                            <CardTitle className="text-card-foreground text-sm font-bold sm:text-base">Detail Proyek</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Nama Proyek"
                            value={proyek?.nama_proyek}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Kategori"
                            value={proyek?.kategori?.nama?.toLocaleUpperCase()}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Jenis"
                            value={proyek?.jenis?.nama}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            isStatus
                            toneStatus={getStatusTone(proyek?.status)}
                            label="Status"
                            value={getStatusLabel(proyek?.status)}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName="text-[10px] sm:text-sm rounded-xl! px-2 bg-foreground text-background font-semibold!"
                            label="Dibuat oleh"
                            value={proyek?.creator?.name || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Pagu Total"
                            value={formatCurrency(proyek?.pagu_total)}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Tanggal Mulai"
                            value={formatDate(proyek?.tanggal_mulai)}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Tanggal Selesai"
                            value={formatDate(proyek?.tanggal_selesai as string)}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Pajak (%)"
                            value={formatPercent(proyek?.pajak_persen)}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Total Dana Setelah Pajak"
                            value={formatCurrency(anggaran?.dana_setelah_pajak || '-')}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Nama Klien"
                            value={proyek?.nama_klien}
                        />
                        <div className="border-border flex flex-col gap-1 border-b py-3 last:border-b-0">
                            <span className="text-foreground text-[10px] font-semibold sm:text-sm">Deskripsi Proyek</span>
                            <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-[10px] font-normal sm:text-sm">
                                {proyek?.deskripsi_proyek || '-'}
                            </p>
                        </div>
                        <div className="mt-2">
                            <Label className="text-[12px] font-semibold sm:text-sm">Foto Proyek</Label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {proyek?.proyek_images?.map((file, index) => (
                                    <div key={`new-${index}`} className="group relative aspect-square">
                                        <img src={file?.image_url} alt={file?.id} className="h-full w-full rounded-lg object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FadeUpWrapper>
            <FadeUpWrapper delay={200}>
                <Card className="border-border bg-card mx-4 mt-0 mb-2">
                    <CardHeader className="border-border border-b pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-chart-2/10 flex h-8 w-8 items-center justify-center rounded-md">
                                <div className="bg-chart-2 h-3 w-3 rounded-sm" />
                            </div>
                            <CardTitle className="text-card-foreground text-sm font-bold sm:text-base">Transaksi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Jasa Tukang"
                            value={formatPercent(realisasi?.jasa_tukang?.items?.persen) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Biaya Mandor"
                            value={formatPercent(realisasi?.mandor?.items?.persen) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Material"
                            value={formatCurrency(realisasi?.material?.items?.jumlah) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Staff Entry Data"
                            value={formatCurrency(realisasi?.staff_entry_data?.aktual) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Staff Perpajakan"
                            value={formatCurrency(realisasi?.staff_perpajakan?.aktual) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Biaya Tak Terduga"
                            value={formatCurrency(realisasi?.biaya_tak_terduga?.aktual) || '-'}
                        />
                        <DetailItem
                            labelClassName=" text-[10px] sm:text-sm"
                            valueClassName=" text-[10px] sm:text-sm"
                            label="Biaya Operasional"
                            value={formatCurrency(realisasi?.operasional?.aktual) || '-'}
                        />
                    </CardContent>
                </Card>
            </FadeUpWrapper>
            <FadeUpWrapper delay={200}>
                <LabaRugiCard
                    pemasukan={laba_rugi?.pemasukan}
                    pengeluaran={laba_rugi?.pengeluaran}
                    selisih={laba_rugi?.selisih}
                    status={laba_rugi?.status}
                />
            </FadeUpWrapper>
            <FadeUpWrapper delay={200}>
                <CashFlowCard
                    breakdown={cashflow?.breakdown}
                    kasKeluar={cashflow?.total_pengeluaran}
                    kasMasuk={cashflow?.pemasukan}
                    netCash={cashflow?.cashflow}
                />
            </FadeUpWrapper>
            <FadeUpWrapper delay={200}>
                <Card className="border-primary/20 bg-card mx-4 mt-2 mb-4">
                    <CardHeader className="border-border border-b pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                                <div className="bg-primary h-3 w-3 rounded-full" />
                            </div>
                            <CardTitle className="text-card-foreground text-sm font-bold sm:text-base">Total Netto</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-1 py-3 sm:py-6">
                        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">Nilai Bersih Proyek</p>
                        <h4 className="text-primary text-3xl font-bold tracking-tight">{formatCurrency(animatedValueNetto || '')}</h4>
                    </CardContent>
                </Card>
            </FadeUpWrapper>
        </AppLayout>
    );
};

export default ProjectDetailIndex;
