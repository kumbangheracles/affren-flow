import AppSelect, { SelectOptions } from '@/components/app-select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Banknote, HardHat, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

type ChartBase = {
    labels: string[];
    [key: string]: unknown;
};
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

interface ChartPemasukanBulanan extends ChartBase {
    labels: string[];
    pemasukan: number[];
    pengeluaran: number[];
}

interface ChartCashflowBulanan extends ChartBase {
    labels: string[];
    cashflow: number[];
}

interface ChartStatusProyek {
    labels: string[];
    data: number[];
}

interface ChartTopProyek {
    labels: string[];
    pagu: number[];
    status: string[];
}

interface PeriodeOption {
    value: string;
    label: string;
}

interface PageProps extends InertiaPageProps {
    summary: Summary;
    chartPemasukanBulanan: ChartPemasukanBulanan;
    chartCashflowBulanan: ChartCashflowBulanan;
    chartStatusProyek: ChartStatusProyek;
    chartTopProyek: ChartTopProyek;
    periodeOptions: PeriodeOption[];
    selectedBulan: number;
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

const MONTH_ID: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mei: 4,
    jun: 5,
    jul: 6,
    agt: 7,
    sep: 8,
    okt: 9,
    nov: 10,
    des: 11,
    may: 4,
    aug: 7,
    oct: 9,
    dec: 11,
};

function parseLabelBulan(label: string): { year: number; month: number } | null {
    const parts = label.trim().split(/\s+/);
    if (parts.length !== 2) return null;
    const month = MONTH_ID[parts[0].toLowerCase()];
    const year = parseInt(parts[1], 10);
    if (month === undefined || isNaN(year)) return null;
    return { year, month };
}

function generateSemesterOptions(labels: string[]): { value: string; label: string }[] {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];

    for (const label of labels) {
        const parsed = parseLabelBulan(label);
        if (!parsed) continue;

        const { year, month } = parsed;
        const sem = month < 6 ? 1 : 2;
        const key = `${year}-${sem}`;

        if (!seen.has(key)) {
            seen.add(key);
            const startMonth = sem === 1 ? 'Jan' : 'Jul';
            const endMonth = sem === 1 ? 'Jun' : 'Des';
            options.push({ value: key, label: `${startMonth}–${endMonth} ${year}` });
        }
    }

    return options;
}

/**
 * filter semua array dalam objek data brdasarkan semester terpilih.
 * Key "labels" dipakai buat acuan index; semua key lain yg berupa array
 * ikut difilter dgn index yg sama.
 *
 * semKey format: "2025-1" (semester 1 tahun 2025) atau "2025-2"
 */
function filterBySemester<T extends { labels: string[] } & { [K: string]: unknown }>(data: T, semKey: string): T {
    const [yearStr, semStr] = semKey.split('-');
    const year = parseInt(yearStr, 10);
    const sem = parseInt(semStr, 10);

    const indices = data.labels.reduce<number[]>((acc, label, i) => {
        const parsed = parseLabelBulan(label);
        if (!parsed) return acc;
        const inSem = sem === 1 ? parsed.year === year && parsed.month < 6 : parsed.year === year && parsed.month >= 6;
        if (inSem) acc.push(i);
        return acc;
    }, []);

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
        const val = data[key];
        result[key] = Array.isArray(val) ? indices.map((i) => (val as unknown[])[i]) : val;
    }
    return result as T;
}

const baseTooltip = {
    backgroundColor: '#0f172a',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    titleColor: '#94a3b8',
    bodyColor: '#f1f5f9',
    titleFont: { family: 'poppins', size: 11 } as const,
    bodyFont: { family: 'poppins', size: 11 } as const,
    padding: 12,
    cornerRadius: 10,
};

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    valueClass,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    valueClass?: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-start gap-4 px-5 pt-5 pb-4">
                <div className="bg-muted mt-0.5 rounded-lg p-2.5">
                    <Icon className="text-muted-foreground h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground mb-1 text-[11px] tracking-widest uppercase">{label}</p>
                    <p className={`truncate text-2xl font-bold tracking-wide ${valueClass ?? 'text-foreground'}`}>{value}</p>
                    {sub && <p className="text-muted-foreground mt-1 text-[11px]">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { summary, chartPemasukanBulanan, periodeOptions, chartCashflowBulanan, chartStatusProyek, chartTopProyek, selectedPeriode } = props;
    const [periode, setPeriode] = useState(String(selectedPeriode));
    // console.log('Props dashboard: ', props);

    const slicedPemasukan = chartPemasukanBulanan;

    const slicedCashflow = chartCashflowBulanan;

    const handlePeriodeChange = (val: string) => {
        setPeriode(val);
        router.get(
            route('dashboard.index'),
            { bulan: val },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const textColor = getComputedStyle(document.body).getPropertyValue('--muted-foreground').trim();
    const periodeLabel = periodeOptions.find((o) => o.value === periode)?.label ?? '';
    const baseScales = {
        x: {
            grid: { color: 'rgba(148,163,184,0.07)' },
            ticks: {
                color: textColor,
                font: { family: 'poppins', size: 12 } as const,
            },
            border: { display: false },
        },
        y: {
            grid: { color: 'rgba(148,163,184,0.07)' },
            ticks: {
                color: textColor,
                font: { family: 'poppins', size: 12 } as const,
                callback: (v: string | number) => fmt(v as number),
            },
            border: { display: false },
        },
    };
    const pemasukanData = {
        labels: slicedPemasukan.labels,

        datasets: [
            {
                label: 'Pemasukan',
                data: slicedPemasukan.pemasukan,
                backgroundColor: 'rgba(59,130,246,0.75)',
                borderRadius: 5,
                borderSkipped: false,
            },

            {
                label: 'Pengeluaran',
                data: slicedPemasukan.pengeluaran,
                backgroundColor: 'rgba(251,113,133,0.75)',
                borderRadius: 5,
                borderSkipped: false,
            },
        ],
    };

    const pemasukanOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...baseTooltip,
                callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${fmtFull(ctx.parsed.y)}` },
            },
        },
        scales: baseScales,
    };

    const cashflowData = {
        labels: slicedCashflow.labels,
        datasets: [
            {
                label: 'Cashflow',
                data: slicedCashflow.cashflow,
                borderColor: '#34d399',
                backgroundColor: 'rgba(52,211,153,0.08)',
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#34d399',
                tension: 0.4,
            },
        ],
    };

    const cashflowOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...baseTooltip,
                callbacks: { label: (ctx: any) => `Cashflow: ${fmtFull(ctx.parsed.y)}` },
            },
        },
        scales: baseScales,
    };

    const statusData = {
        labels: chartStatusProyek.labels,
        datasets: [
            {
                data: chartStatusProyek.data,
                backgroundColor: ['#3b82f6', '#34d399', '#f87171'],
                borderColor: 'transparent',
                hoverOffset: 6,
            },
        ],
    };

    const statusOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: textColor,
                    font: { family: 'poppins', size: 11 },
                    padding: 16,
                    boxWidth: 12,
                },
            },
            tooltip: {
                ...baseTooltip,
                callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} proyek` },
            },
        },
    };

    const topProyekData = {
        labels: chartTopProyek.labels,
        datasets: [
            {
                label: 'Pagu',
                data: chartTopProyek.pagu,
                backgroundColor: chartTopProyek.status.map((s) =>
                    s === 'sedang_berjalan' ? 'rgba(59,130,246,0.75)' : s === 'selesai' ? 'rgba(52,211,153,0.75)' : 'rgba(251,113,133,0.75)',
                ),
                borderRadius: 5,
                borderSkipped: false,
            },
        ],
    };

    const topProyekOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...baseTooltip,
                callbacks: { label: (ctx: any) => `Pagu: ${fmtFull(ctx.parsed.x)}` },
            },
        },
        scales: {
            x: baseScales.x,
            y: {
                grid: { display: false },
                ticks: {
                    color: textColor,
                    font: { family: 'poppins', size: 12 } as const,
                },
                border: { display: false },
            },
        },
    };

    const dumbPeriodeOption = [{}];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard <span className="text-primary">Keuangan</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs tracking-wide">Ringkasan seluruh proyek & arus kas perusahaan</p>
                    </div>

                    <div className="w-52">
                        <AppSelect
                            options={periodeOptions as SelectOptions}
                            value={periode ?? [{}]}
                            emptyMsg="Belum ada periode saat ini"
                            onValueChange={handlePeriodeChange}
                            label="Pilih periode"
                            placeholder="Pilih . . ."
                            tooltip="Mempengaruhi chart pemasukan, pengeluaran, dan cashflow bulanan"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Pagu" value={fmt(summary.total_pagu)} sub={`${summary.total_proyek} proyek`} icon={Banknote} />
                    <StatCard
                        label="Total Pengeluaran"
                        value={fmt(summary.total_pengeluaran)}
                        sub="seluruh transaksi"
                        icon={TrendingDown}
                        valueClass="text-rose-500"
                    />
                    <StatCard
                        label="Total Cashflow"
                        value={fmt(summary.total_cashflow)}
                        sub="pagu − pengeluaran"
                        icon={TrendingUp}
                        valueClass={summary.total_cashflow >= 0 ? 'text-emerald-500' : 'text-destructive'}
                    />
                    <StatCard
                        label="Proyek Berjalan"
                        value={String(summary.proyek_berjalan)}
                        sub={`selesai: ${summary.proyek_selesai} · batal: ${summary.proyek_dibatalkan}`}
                        icon={HardHat}
                        valueClass="text-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="mx-auto flex flex-col items-start justify-center gap-2 sm:mx-0 sm:flex-row sm:justify-between">
                                <div>
                                    <CardTitle className="text-sm font-semibold">Pemasukan & Pengeluaran</CardTitle>
                                    <CardDescription className="mt-0.5 text-[11px]">{periodeLabel} · seluruh proyek</CardDescription>
                                </div>
                                <div className="flex gap-3">
                                    {[
                                        { color: 'bg-blue-500', label: 'Pemasukan' },
                                        { color: 'bg-rose-400', label: 'Pengeluaran' },
                                    ].map((l) => (
                                        <span key={l.label} className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                                            <span className={`h-2 w-2 rounded-sm ${l.color}`} />
                                            {l.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="h-[240px]">
                                <Bar data={pemasukanData} options={pemasukanOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Cashflow Bulanan</CardTitle>
                            <CardDescription className="mt-0.5 text-[11px]">Netto (pagu − pengeluaran) · {periodeLabel}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="h-[240px]">
                                <Line data={cashflowData} options={cashflowOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Status Proyek</CardTitle>
                            <CardDescription className="mt-0.5 text-[11px]">Distribusi status seluruh proyek</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="h-[240px]">
                                <Doughnut data={statusData} options={statusOptions} />
                            </div>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {[
                                    {
                                        label: 'Berjalan',
                                        count: summary.proyek_berjalan,
                                        cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
                                    },
                                    {
                                        label: 'Selesai',
                                        count: summary.proyek_selesai,
                                        cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
                                    },
                                    {
                                        label: 'Batal',
                                        count: summary.proyek_dibatalkan,
                                        cls: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
                                    },
                                ].map((b) => (
                                    <Badge key={b.label} variant="secondary" className={`border-0 text-[11px] ${b.cls}`}>
                                        {b.label}: {b.count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Top 5 Proyek dengan pagu tertinggi</CardTitle>
                            <CardDescription className="mt-0.5 text-[11px]">
                                Warna: <span className="text-blue-400">berjalan</span> · <span className="text-emerald-400">selesai</span> ·{' '}
                                <span className="text-rose-400">dibatalkan</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="h-[260px]">
                                <Bar data={topProyekData} options={topProyekOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
