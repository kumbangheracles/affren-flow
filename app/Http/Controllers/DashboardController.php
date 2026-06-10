<?php

namespace App\Http\Controllers;

use App\Models\Proyek;
use App\Models\Transaksi;
use App\Services\FinanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected FinanceService $financeService) {}

    public function index(Request $request)
    {
        Carbon::setLocale('id');
        $periode = $request->query('bulan', null);

        $defaultValue =
            Carbon::now()->subMonths(5)->format('Y-m')
            . ':' .
            Carbon::now()->format('Y-m');


        if (!$periode || !str_contains($periode, ':')) {
            $periode = $defaultValue;
        }

        [$startStr, $endStr] = explode(':', $periode, 2);

        try {
            $start = Carbon::parse($startStr)->startOfMonth();
            $end   = Carbon::parse($endStr)->endOfMonth();
        } catch (\Exception $e) {
            $periode = $defaultValue;
            [$startStr, $endStr] = explode(':', $periode, 2);
            $start = Carbon::parse($startStr)->startOfMonth();
            $end   = Carbon::parse($endStr)->endOfMonth();
        }

        return Inertia::render('dashboard', [
            'summary'               => $this->financeService->summaryPerusahaan($start, $end),
            'chartPemasukanBulanan' => $this->chartPemasukanPengeluaranBulanan($start, $end),
            'chartCashflowBulanan'  => $this->chartCashflowBulanan($start, $end),
            'chartStatusProyek'     => $this->chartStatusProyek(),
            'chartTopProyek'        => $this->chartTopProyek(),
            'periodeOptions'        => $this->generatePeriodeOptions(),
            'selectedPeriode'       => $periode,
        ]);
    }

    private function generatePeriodeOptions(int $perPeriode = 3, int $maxOpsi = 5): array
    {
        $bulanTertua = Transaksi::query()
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m-01') as bulan")
            ->orderBy('tanggal')
            ->value('bulan');

        if (!$bulanTertua) return [];

        $dataStart = Carbon::parse($bulanTertua)->startOfMonth();
        $end       = Carbon::now()->startOfMonth();
        $options   = [];
        $cursor    = $end->copy();

        while ($cursor->gte($dataStart) && count($options) < $maxOpsi) {
            $periodeStart = $cursor->copy()->subMonths($perPeriode - 1)->startOfMonth();

            if ($periodeStart->lt($dataStart)) {
                $periodeStart = $dataStart->copy();
            }

            $options[] = [
                'value' => $periodeStart->format('Y-m') . ':' . $cursor->format('Y-m'),
                'label' => $periodeStart->translatedFormat('M Y') . ' – ' . $cursor->translatedFormat('M Y'),
            ];

            $cursor->subMonths($perPeriode);
        }

        return $options;
    }

    private function chartPemasukanPengeluaranBulanan(Carbon $start, Carbon $end): array
    {
        $pengeluaran = Transaksi::query()
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m-01') as bulan, SUM(jumlah) as total")
            ->whereBetween('tanggal', [$start, $end])
            ->groupByRaw("DATE_FORMAT(tanggal, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        $pemasukan = Proyek::query()
            ->selectRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01') as bulan, SUM(pagu_total) as total")
            ->whereBetween('tanggal_mulai', [$start, $end])
            ->groupByRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        $labels = $dataPemasukan = $dataPengeluaran = [];
        $cursor = $start->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $bulan             = $cursor->format('Y-m-01');
            $labels[]          = $cursor->translatedFormat('M Y');
            $dataPemasukan[]   = (float) ($pemasukan[$bulan] ?? 0);
            $dataPengeluaran[] = (float) ($pengeluaran[$bulan] ?? 0);
            $cursor->addMonth();
        }

        return [
            'labels'      => $labels,
            'pemasukan'   => $dataPemasukan,
            'pengeluaran' => $dataPengeluaran,
        ];
    }

    private function chartCashflowBulanan(Carbon $start, Carbon $end): array
    {
        $bulanan = $this->financeService->aggregateCashflowBulanan($start, $end);

        $filtered = $bulanan->filter(function ($item) use ($start, $end) {
            $bulan = Carbon::parse($item['ds']);
            return $bulan->gte($start) && $bulan->lte($end);
        })->values();

        return [
            'labels'   => $filtered->map(
                fn($b) => Carbon::parse($b['ds'])->translatedFormat('M Y')
            )->values()->toArray(),
            'cashflow' => $filtered->pluck('y')->values()->toArray(),
        ];
    }

    private function chartStatusProyek(): array
    {
        $counts = Proyek::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statusMap = [
            'sedang_berjalan' => 'Berjalan',
            'selesai'         => 'Selesai',
            'dibatalkan'      => 'Dibatalkan',
        ];

        $labels = [];
        $data   = [];

        foreach ($statusMap as $key => $label) {
            $labels[] = $label;
            $data[]   = (int) ($counts[$key] ?? 0);
        }

        return compact('labels', 'data');
    }

    private function chartTopProyek(int $limit = 5): array
    {
        $proyeks = Proyek::query()
            ->select('nama_proyek', 'pagu_total', 'status')
            ->orderByDesc('pagu_total')
            ->limit($limit)
            ->get();

        return [
            'labels' => $proyeks->pluck('nama_proyek')->toArray(),
            'pagu'   => $proyeks->pluck('pagu_total')->map(fn($v) => (float) $v)->toArray(),
            'status' => $proyeks->pluck('status')->toArray(),
        ];
    }
}
