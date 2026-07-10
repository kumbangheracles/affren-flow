import AppLayout from '@/layouts/app-layout';
import { BaseResponse, BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    type ChartData,
    type ChartOptions,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

import AppDatePicker from '@/components/app-day-picker';
import AppSelect from '@/components/app-select';
import { Column, DataTable } from '@/components/app-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui-shadcn/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { formatDate } from 'date-fns';
import { ChartNoAxesCombined, Loader2, TrendingUp, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ForecastPoint {
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

interface Summary {
    total_pagu: number;
    total_pengeluaran: number;
    total_cashflow: number;
    total_netto: number;
    total_proyek: number;
    proyek_berjalan: number;
    proyek_selesai: number;
    proyek_dibatalkan: number;
}

interface ForecastingResult {
    actual: ForecastPoint[];
    forecast: ForecastPoint[];
    periods: number;
    trained_on: number;
    summary: Summary | null;
    mae: number;
    rmse: number;
    smape: number;
    mape: number | null;
    accuracy_label?: string;
}

interface CashflowProps {
    date: Date;
    total_pemasukan: number;
    total_pengeluaran: number;
    cashflow: number;
}

interface PageProps extends InertiaPageProps {
    forecasting: ForecastingResult | null;
    errors: { data?: string; forecast?: string };
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(n);

const fmtFull = (n: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n);

const fmtMonth = (ds: string) => new Date(ds).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });

const PERIOD_OPTIONS = [6, 9, 12, 15, 18, 21, 24].map((n) => ({
    value: String(n),
    label: `${n} bulan`,
}));

const TRAINING_OPTIONS = [6, 9, 12, 15, 18, 21, 24].map((n) => ({
    value: String(n),
    label: `${n} bulan`,
}));

function buildChartConfig(forecasting: ForecastingResult): ChartData<'line'> {
    const actualLabels = forecasting?.actual.map((r) => fmtMonth(r.ds));
    const forecastLabels = forecasting?.forecast.map((r) => fmtMonth(r.ds));
    const labels = [...actualLabels, ...forecastLabels];

    const actualLen = actualLabels.length;
    const totalLen = labels.length;
    const lastActual = forecasting?.actual[forecasting?.actual.length - 1]?.yhat ?? null;

    const aktualData: (number | null)[] = [...forecasting?.actual.map((r) => r.yhat), ...Array(totalLen - actualLen).fill(null)];
    const proyeksiData: (number | null)[] = [...Array(actualLen - 1).fill(null), lastActual, ...forecasting?.forecast.map((r) => r.yhat)];
    const upperData: (number | null)[] = [...Array(actualLen - 1).fill(null), lastActual, ...forecasting?.forecast.map((r) => r.yhat_upper)];
    const lowerData: (number | null)[] = [...Array(actualLen - 1).fill(null), lastActual, ...forecasting?.forecast.map((r) => r.yhat_lower)];

    return {
        labels,
        datasets: [
            {
                label: 'CI Upper',
                data: upperData,
                borderColor: 'transparent',
                backgroundColor: 'rgba(52,211,153,0.13)',
                fill: { target: '+1', above: 'rgba(52,211,153,0.13)' },
                pointRadius: 0,
                tension: 0.4,
                spanGaps: true,
            },
            {
                label: 'CI Lower',
                data: lowerData,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                fill: false,
                pointRadius: 0,
                tension: 0.4,
                spanGaps: true,
            },
            {
                label: 'Proyeksi',
                data: proyeksiData,
                borderColor: '#34d399',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [6, 4],
                pointRadius: 3,
                pointBackgroundColor: '#34d399',
                pointBorderWidth: 0,
                tension: 0.4,
                spanGaps: false,
            },
            {
                label: 'Aktual',
                data: aktualData,
                borderColor: '#3b82f6',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: '#3b82f6',
                pointBorderWidth: 0,
                tension: 0.4,
                spanGaps: false,
            },
        ],
    };
}

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#0f172a',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            titleFont: { family: 'monospace', size: 11 },
            bodyFont: { family: 'monospace', size: 11 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
                label(ctx) {
                    if (['CI Upper', 'CI Lower'].includes(ctx.dataset.label ?? '')) return undefined;
                    if (ctx.parsed.y === null) return undefined;
                    return `${ctx.dataset.label}: ${fmtFull(ctx.parsed.y)}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: { color: 'rgba(148,163,184,0.08)' },
            ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
            border: { display: false },
        },
        y: {
            grid: { color: 'rgba(148,163,184,0.08)' },
            ticks: { color: '#64748b', font: { family: 'monospace', size: 11 }, callback: (v) => fmt(v as number) },
            border: { display: false },
        },
    },
};

function MetricCard({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) {
    return (
        <Card>
            <CardContent className="px-5 pt-5 pb-4">
                <p className="text-muted-foreground mb-2 text-[11px] tracking-widest uppercase">{label}</p>
                <p className={`text-2xl leading-tight font-bold tracking-tight ${valueClass ?? 'text-foreground'}`}>{value}</p>
                {sub && <p className="text-muted-foreground mt-1.5 text-[11px]">{sub}</p>}
            </CardContent>
        </Card>
    );
}

function StatRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground text-[12px]">{label}</span>
            <span className={`text-[13px] font-semibold ${valueClass ?? 'text-foreground'}`}>{value}</span>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Forecasting', href: '/forecasting' }];

const COLUMN_CASHFLOW: Column<CashflowProps>[] = [
    {
        key: 'no',
        label: 'No',
        className: 'px-5 py-2',
        render: (_: any, __: any, index: number) => <span className="text-muted-foreground text-sm">{index + 1}</span>,
    },
    {
        key: 'total_pemasukan',
        label: 'Total pemasukan',
        sortable: true,
        render: (value) => {
            return (
                <span className={cn('font-semibold tracking-wide', 'text-blue-500')}>
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    }).format(Number(value))}
                </span>
            );
        },
    },
    {
        key: 'total_pengeluaran',
        label: 'Total pengeluaran',
        sortable: true,
        render: (value) => {
            return (
                <span className={cn('font-semibold tracking-wide', 'text-card-foreground')}>
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    }).format(Number(value))}
                </span>
            );
        },
    },
    {
        key: 'cashflow',
        label: 'Cashflow',
        sortable: true,
        render: (value) => {
            return (
                <span className={cn('font-semibold tracking-wide', 'text-emerald-500')}>
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    }).format(Number(value))}
                </span>
            );
        },
    },
    {
        key: 'date',
        label: 'Tanggal',
        sortable: true,
        render: (value) =>
            new Date(value as string).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
    },
];

const ForecastingIndex = () => {
    const { props } = usePage<PageProps>();
    const { errors, forecasting } = props;
    const [listCashflow, setListCashflow] = useState<BaseResponse<CashflowProps> | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPerPage, setCurrentPerPage] = useState(20);
    const endError = startDate && endDate && endDate < startDate ? 'Tanggal akhir tidak boleh sebelum tanggal mulai' : null;
    const { data, setData, post, processing } = useForm({
        periods: 6,
        training_months: 6,
    });

    const chartData = useMemo(() => (forecasting ? buildChartConfig(forecasting) : null), [forecasting]);

    const chartKey = useMemo(() => {
        if (!forecasting) return 'empty';
        return `${forecasting?.periods}-${forecasting?.trained_on}-${forecasting?.actual.length}-${forecasting?.forecast[0]?.yhat ?? 0}`;
    }, [forecasting]);

    const forecastList = forecasting?.forecast ?? [];
    const avgForecast = forecastList.length > 0 ? forecastList.reduce((s, r) => s + r.yhat, 0) / forecastList.length : 0;
    const maxForecast = forecastList.length > 0 ? Math.max(...forecastList.map((r) => r.yhat_upper)) : 0;
    const minForecast = forecastList.length > 0 ? Math.min(...forecastList.map((r) => r.yhat_lower)) : 0;
    const summary = forecasting?.summary ?? null;

    // useEffect(() => {
    //     console.log('Hasil forecast: ', forecasting);
    // }, [forecasting]);
    const fetchCashflow = async (page = currentPage, perPage = currentPerPage) => {
        try {
            const res = await axios.get('/cashflow', {
                params: {
                    page,
                    per_page: perPage,

                    start_date: startDate ? formatDate(startDate, 'yyyy-MM-dd') : undefined,

                    end_date: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
                },
            });

            setListCashflow(res.data.list_cashflow);
        } catch (error) {
            toast.error('Gagal mengambil data cashflow');
        }
    };
    const handlePageChange = async (page: number) => {
        setCurrentPage(page);

        await fetchCashflow(page, currentPerPage);
    };
    const handlePageSizeChange = async (perPage: number) => {
        setCurrentPerPage(perPage);
        setCurrentPage(1);

        await fetchCashflow(1, perPage);
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCashflow(1, currentPerPage);
        }, 500);

        return () => clearTimeout(timer);
    }, [startDate, endDate]);
    console.log(forecasting?.mape);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forecasting" />
            <div className="p-4">
                {/* ── Header ── */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Cashflow <span className="text-primary">Forecasting</span>
                        </h1>
                        <p className="text-muted-foreground mt-1.5 text-xs tracking-wide">
                            Prophet · 95% confidence interval · data transaksi aktual
                        </p>
                    </div>

                    {/* ── Controls ── */}
                    <div className="flex flex-wrap items-end gap-3">
                        <AppSelect
                            options={PERIOD_OPTIONS}
                            value={String(data.periods)}
                            onValueChange={(v) => setData('periods', Number(v))}
                            label="Proyeksi ke depan"
                            tooltip="Jumlah bulan yang akan diprediksi Prophet"
                        />
                        <AppSelect
                            options={TRAINING_OPTIONS}
                            value={String(data.training_months)}
                            onValueChange={(v) => setData('training_months', Number(v))}
                            label="Data training"
                            tooltip="Jumlah bulan historis yang dipakai melatih model"
                        />
                        <Button
                            onClick={() => post(route('forecasting.generate'))}
                            disabled={processing}
                            size="sm"
                            className="gap-2 px-5 font-semibold"
                        >
                            {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
                            {processing ? 'Memproses...' : 'Generate'}
                        </Button>
                    </div>
                </div>

                {/* ── Errors ── */}
                {(errors.data || errors.forecast) && (
                    <Alert variant="destructive" className="mb-6">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertDescription className="text-xs">{errors.data ?? errors.forecast}</AlertDescription>
                    </Alert>
                )}

                {/* ── Empty state ── */}
                {!forecasting && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-20">
                            <ChartNoAxesCombined className="text-muted-foreground/40 h-10 w-10" />
                            <p className="text-base font-semibold">Belum ada forecast</p>
                            <p className="text-muted-foreground text-center text-xs leading-relaxed">
                                Pilih Data training dan proyeksinya lalu klik generate
                                <br />
                                untuk memulai prediksi cashflow.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Hasil forecast ── */}
                {forecasting && chartData && (
                    <div className="space-y-5">
                        {/* Metric cards */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            <MetricCard
                                label="Rata-rata proyeksi"
                                value={fmt(avgForecast)}
                                sub={`${forecasting?.periods} bulan ke depan`}
                                valueClass="text-primary"
                            />
                            <MetricCard label="Proyeksi tertinggi" value={fmt(maxForecast)} sub="batas atas 95% CI" valueClass="text-emerald-500" />
                            <MetricCard label="Proyeksi terendah" value={fmt(minForecast)} sub="batas bawah 95% CI" valueClass="text-amber-500" />
                            <MetricCard label="Dilatih dari" value={`${forecasting?.trained_on} bulan`} sub="data historis transaksi" />
                            <Card>
                                <CardContent className="pt-4">
                                    <p className="text-muted-foreground text-xs tracking-widest uppercase">MAE</p>
                                    <p className="text-2xl font-bold">{fmtFull(forecasting?.mae)}</p>
                                    <p className="text-muted-foreground mt-1 text-xs">Rata-rata selisih prediksi vs aktual</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <p className="text-muted-foreground text-xs tracking-widest uppercase">MAPE</p>
                                    <p
                                        className={`text-2xl font-bold ${
                                            forecasting?.mape == null
                                                ? ''
                                                : forecasting.mape < 10
                                                  ? 'text-emerald-500'
                                                  : forecasting.mape < 50
                                                    ? 'text-yellow-500'
                                                    : 'text-rose-500'
                                        }`}
                                    >
                                        {(forecasting?.mape as number).toFixed(2)}%
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {(forecasting?.mape as number) < 10
                                            ? 'Sangat akurat'
                                            : (forecasting?.mape as number) < 20
                                              ? 'Akurat'
                                              : (forecasting?.mape as number) < 50
                                                ? 'Cukup akurat'
                                                : 'Tidak akurat'}
                                    </p>
                                </CardContent>
                            </Card>
                            {summary && (
                                <>
                                    <MetricCard
                                        label="Proyek aktif"
                                        value={String(summary.proyek_berjalan)}
                                        sub={`dari ${summary.total_proyek} proyek`}
                                    />
                                    <MetricCard
                                        label="Total cashflow"
                                        value={fmt(summary.total_cashflow)}
                                        sub="seluruh proyek"
                                        valueClass={summary.total_cashflow >= 0 ? 'text-emerald-500' : 'text-destructive'}
                                    />
                                </>
                            )}
                        </div>

                        {/* Main chart — key prop memaksa Chart.js re-mount saat data berubah */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base font-semibold">Tren &amp; Proyeksi Cashflow</CardTitle>
                                        <CardDescription className="mt-1 text-[11px]">
                                            Aktual dari DB · Proyeksi Prophet · Confidence band 95%
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { color: 'bg-blue-500', label: 'Aktual' },
                                            { color: 'bg-emerald-400', label: 'Proyeksi' },
                                            { color: 'bg-emerald-400/20 border border-dashed border-emerald-400/40', label: 'CI 95%' },
                                        ].map((l) => (
                                            <span key={l.label} className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                                                <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
                                                {l.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="relative h-[300px] max-w-100 overflow-x-scroll sm:max-w-170 lg:max-w-full lg:overflow-x-hidden">
                                    <Line key={chartKey} data={chartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bottom grid */}
                        <div className="flex max-w-full flex-col gap-5 overflow-x-scroll sm:max-w-170 sm:overflow-x-hidden lg:max-w-full">
                            {/* Tabel proyeksi */}
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Detail Proyeksi</CardTitle>
                                    <CardDescription className="text-[11px]">{forecasting?.periods} bulan · confidence 95%</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-[11px] tracking-wide">Bulan</TableHead>
                                                <TableHead className="text-[11px] tracking-wide">Proyeksi</TableHead>
                                                <TableHead className="text-right text-[11px] tracking-wide">Bawah</TableHead>
                                                <TableHead className="text-right text-[11px] tracking-wide">Atas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {forecastList.map((r, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-2.5 text-xs">{fmtMonth(r.ds)}</TableCell>
                                                    <TableCell className="py-2.5 text-xs">
                                                        <Badge
                                                            variant="secondary"
                                                            className="border-0 bg-emerald-50 text-[11px] text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                        >
                                                            {fmt(r.yhat)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground py-2.5 text-right text-[11px]">
                                                        {fmt(r.yhat_lower)}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground py-2.5 text-right text-[11px]">
                                                        {fmt(r.yhat_upper)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Ringkasan keuangan */}
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Ringkasan Keuangan</CardTitle>
                                    <CardDescription className="text-[11px]">Semua proyek aktif</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {summary ? (
                                        <div className="divide-border divide-y">
                                            <StatRow label="Total pagu" value={fmt(summary.total_pagu)} />
                                            <StatRow label="Total pengeluaran" value={fmt(summary.total_pengeluaran)} valueClass="text-amber-500" />
                                            <StatRow
                                                label="Total cashflow"
                                                value={fmt(summary.total_cashflow)}
                                                valueClass={summary.total_cashflow >= 0 ? 'text-emerald-500' : 'text-destructive'}
                                            />
                                            <StatRow
                                                label="Netto perusahaan"
                                                value={fmt(summary.total_netto)}
                                                valueClass={summary.total_netto >= 0 ? 'text-emerald-500' : 'text-destructive'}
                                            />
                                            <StatRow label="Proyek berjalan" value={String(summary.proyek_berjalan)} />
                                            <StatRow label="Proyek selesai" value={String(summary.proyek_selesai)} valueClass="text-emerald-500" />
                                            <StatRow
                                                label="Proyek dibatalkan"
                                                value={String(summary.proyek_dibatalkan)}
                                                valueClass={summary.proyek_dibatalkan > 0 ? 'text-destructive' : 'text-foreground'}
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-xs">Data summary tidak tersedia.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Cashflow <span className="text-primary">Hasil Agregasi</span>
                        </h1>
                        <p className="text-muted-foreground mt-1.5 text-xs tracking-wide">List detail cashflow hasil agregasi bulanan</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <AppDatePicker
                            // granularity="month"
                            label="Tanggal Mulai"
                            value={startDate ?? undefined}
                            onChange={(val) => setStartDate(val ?? null)}
                        />
                        <AppDatePicker
                            // granularity="month"
                            label="Tanggal Akhir"
                            value={endDate ?? undefined}
                            onChange={(val) => setEndDate(val ?? null)}
                            error={endError as string}
                        />
                    </div>
                </div>
                <div className="max-w-full sm:max-w-170 lg:max-w-full">
                    <DataTable
                        className="mt-3"
                        emptyMessage="Tidak ada cashflow saat ini"
                        data={listCashflow?.data as CashflowProps[]}
                        mobileColumns={['no', 'total_pemasukan', 'total_pengeluaran', 'cashflow', 'date']}
                        columns={COLUMN_CASHFLOW}
                        key={listCashflow?.data?.length as number}
                        pagination={{
                            current_page: listCashflow?.current_page as number,
                            last_page: listCashflow?.last_page as number,
                            per_page: listCashflow?.per_page as number,
                            total: listCashflow?.total as number,
                            from: listCashflow?.from as number,
                            to: listCashflow?.to as number,
                        }}
                        isDisplayPageChange={false}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default ForecastingIndex;
