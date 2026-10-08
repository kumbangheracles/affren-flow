<?php

namespace App\Services;

use App\Models\Proyek;
use App\Models\Transaksi;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class FinanceService
{
    /**
     * Hitung semua komponen biaya dari pagu proyek.
     * Sumber: field persentase di tabel proyek.
     */
    public function hitungAnggaranProyek(Proyek $proyek): array
    {
        $pagu = (float) $proyek->pagu_total;

        $nilai_pajak        = $pagu * ($proyek->pajak_persen / 100);
        $dana_setelah_pajak = $pagu - $nilai_pajak;

        $kategoriTotals = Transaksi::where('proyek_id', $proyek->proyek_id)
            ->selectRaw("
            SUM(CASE WHEN kategori = 'material' THEN jumlah ELSE 0 END) as material,
            SUM(CASE WHEN kategori = 'jasa_tukang' THEN jumlah ELSE 0 END) as jasa_tukang,
            SUM(CASE WHEN kategori = 'biaya_tak_terduga' THEN jumlah ELSE 0 END) as biaya_tak_terduga,
            SUM(CASE WHEN kategori = 'mandor' THEN jumlah ELSE 0 END) as mandor,
            SUM(CASE WHEN kategori = 'staff_perpajakan' THEN jumlah ELSE 0 END) as staff_perpajakan,
            SUM(CASE WHEN kategori = 'staff_entry_data' THEN jumlah ELSE 0 END) as staff_entry_data
        ")
            ->first();

        $material        = (float) $kategoriTotals->material;
        $jasa_tukang       = (float) $kategoriTotals->jasa_tukang;
        $biaya_tak_terduga = (float) $kategoriTotals->biaya_tak_terduga;
        $mandor      = (float) $kategoriTotals->mandor;

        $biaya_staff =
            (float) $kategoriTotals->staff_perpajakan +
            (float) $kategoriTotals->staff_entry_data;

        $total_pengeluaran =
            $material +
            $jasa_tukang +
            $biaya_tak_terduga +
            $mandor +
            $biaya_staff;

        $netto = $dana_setelah_pajak - $total_pengeluaran;

        return [
            'pagu_total'         => $pagu,
            'nilai_pajak'        => $nilai_pajak,
            'dana_setelah_pajak' => $dana_setelah_pajak,
            'material'         => $material,
            'jasa_tukang'        => $jasa_tukang,
            'biaya_tak_terduga'  => $biaya_tak_terduga,
            'mandor'             => $mandor,
            'biaya_staff'        => $biaya_staff,
            'total_pengeluaran'  => $total_pengeluaran,
            'netto'              => $netto,
        ];
    }

    public function hitungLabaRugi(Proyek $proyek): array
    {
        $pemasukan = (float) $proyek->pagu_total;

        // Total transaksi pengeluaran
        $pengeluaranTransaksi = $proyek->transaksi->sum('jumlah');

        // Pajak proyek
        $nilaiPajak = $pemasukan * ((float) $proyek->pajak_persen / 100);

        // Total pengeluaran termasuk pajak
        $pengeluaran = $pengeluaranTransaksi + $nilaiPajak;

        $selisih = $pemasukan - $pengeluaran;

        return [
            'pemasukan'             => $pemasukan,
            'pengeluaran_transaksi' => $pengeluaranTransaksi,
            'pajak'                 => $nilaiPajak,
            'pengeluaran'           => $pengeluaran,
            'selisih'               => $selisih,
            'status'                => $selisih >= 0 ? 'laba' : 'rugi',
        ];
    }
    public function laporanKeuanganPerusahaan(): array
    {
        $proyeks = Proyek::with('transaksi')->get();

        $detail = $proyeks->map(function ($proyek) {
            $labaRugi = $this->hitungLabaRugi($proyek);
            return [
                'proyek_id'   => $proyek->proyek_id,
                'nama_proyek' => $proyek->nama_proyek,
                'tipe_proyek' => $proyek->tipe_proyek,
                'status'      => $proyek->status,
                'pemasukan'   => $labaRugi['pemasukan'],
                'pengeluaran' => $labaRugi['pengeluaran'],
                'selisih'     => $labaRugi['selisih'],
                'laba_rugi'   => $labaRugi['status'],
            ];
        });

        return [
            'total_pemasukan'   => $detail->sum('pemasukan'),
            'total_pengeluaran' => $detail->sum('pengeluaran'),
            'total_selisih'     => $detail->sum('selisih'),
            'status_perusahaan' => $detail->sum('selisih') >= 0 ? 'laba' : 'rugi',
            'detail_proyek'     => $detail,
        ];
    }

    /**
     * Hitung cashflow aktual proyek dari tabel transaksi.
     * Sumber: transaksi yang sudah diinput staff finance.
     */
    public function hitungCashflowAktual(Proyek $proyek): array
    {
        $transaksi = $proyek->transaksi;

        $total_pengeluaran = $transaksi->sum('jumlah');

        $cashflow = (float) $proyek->pagu_total - $total_pengeluaran;

        $breakdown = $transaksi
            ->groupBy('kategori')
            ->map(fn($group) => $group->sum('jumlah'));

        return [
            'pemasukan'         => (float) $proyek->pagu_total,
            'total_pengeluaran' => $total_pengeluaran,
            'cashflow'          => $cashflow,
            'breakdown'         => $breakdown,
        ];
    }


    public function hitungRealisasiPerKategori(Proyek $proyek): array
    {
        $rencana  = $this->hitungAnggaranProyek($proyek);
        $transaksi = $proyek->relationLoaded('transaksi')
            ? $proyek->transaksi
            : $proyek->transaksi()->get();


        $aktual = $transaksi->isNotEmpty()
            ? $transaksi->groupBy('kategori')->map(fn($group) => [
                'jumlah' => $group->sum('jumlah'),
                'items'  => $group->map(fn($t) => [
                    'transaksi_id' => $t->transaksi_id,
                    'persen'       => $t->persen,
                    'jumlah'       => $t->jumlah,
                    'tanggal'      => $t->tanggal,
                    'keterangan'   => $t->keterangan,
                ])
            ])
            : collect();

        return [
            'jasa_tukang' => [
                'rencana' => $rencana['jasa_tukang'],
                'aktual'  => $aktual['jasa_tukang']['jumlah'] ?? 0,
                'items' => $aktual['jasa_tukang']['items'][0] ?? null,
                'selisih' => $rencana['jasa_tukang'] - ($aktual['jasa_tukang']['jumlah'] ?? 0),
            ],
            'material' => [
                'rencana' => $rencana['material'],
                'aktual'  => $aktual['material']['jumlah'] ?? 0,
                'items' => $aktual['material']['items'][0] ?? null,
                'selisih' => $rencana['material'] - ($aktual['material']['jumlah'] ?? 0),
            ],
            'operasional' => [                                              // ← tambah ini
                'rencana' => null,                                         // tidak ada di anggaran
                'aktual'  => $aktual['operasional']['jumlah'] ?? 0,
                'items'   => $aktual['operasional']['items'][0] ?? null,
                'selisih' => null,
            ],
            'mandor' => [
                'rencana' => $rencana['mandor'],
                'aktual'  => $aktual['mandor']['jumlah'] ?? 0,
                'items' => $aktual['mandor']['items'][0] ?? null,
                'selisih' => $rencana['mandor'] - ($aktual['mandor']['jumlah'] ?? 0),
            ],
            'staff_perpajakan' => [
                'rencana' => (float) $proyek->biaya_staff_perpajakan,
                'aktual'  => $aktual['staff_perpajakan']['jumlah'] ?? 0,
                'items' => $aktual['staff_perpajakan']['items'][0] ?? null,
                'selisih' => (float) $proyek->biaya_staff_perpajakan - ($aktual['staff_perpajakan']['jumlah'] ?? 0),
            ],
            'staff_entry_data' => [
                'rencana' => (float) $proyek->biaya_staff_entry_data,
                'aktual'  => $aktual['staff_entry_data']['jumlah'] ?? 0,
                'items' => $aktual['staff_entry_data']['items'][0] ?? null,
                'selisih' => (float) $proyek->biaya_staff_entry_data - ($aktual['staff_entry_data']['jumlah'] ?? 0),
            ],
            'biaya_tak_terduga' => [
                'rencana' => $rencana['biaya_tak_terduga'],
                'aktual'  => $aktual['biaya_tak_terduga']['jumlah'] ?? 0,
                'items' => $aktual['biaya_tak_terduga']['items'][0] ?? null,
                'selisih' => $rencana['biaya_tak_terduga'] - ($aktual['biaya_tak_terduga']['jumlah'] ?? 0),
            ],
        ];
    }



    public function hitungRealisasi(Proyek $proyek): array
    {
        $anggaran = $this->hitungAnggaranProyek($proyek);
        $aktual   = $this->hitungCashflowAktual($proyek);

        $selisih  = $aktual['cashflow'] - $anggaran['netto'];
        $status   = match (true) {
            $selisih > 0  => 'surplus',
            $selisih < 0  => 'defisit',
            default       => 'impas',
        };

        return [
            'anggaran'  => $anggaran,
            'aktual'    => $aktual,
            'selisih'   => $selisih,
            'status'    => $status,
        ];
    }

    /**
     * Agregasi cashflow bulanan seluruh perusahaan.
     * Output ini yang jadi input Prophet nanti di Step 7.
     *
     * Format return:
     * [
     *   ['ds' => '2024-01-01', 'y' => 105000000],
     *   ['ds' => '2024-02-01', 'y' => 80000000],
     *   ...
     * ]
     */
    public function aggregateCashflowBulanan(Carbon $start = null, Carbon $end = null): Collection
    {
        $start = $start ?? Carbon::now()->subMonths(5)->startOfMonth();
        $end   = $end   ?? Carbon::now()->endOfMonth();

        $pengeluaran = Transaksi::query()
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m-01') as bulan, SUM(jumlah) as total")
            ->whereBetween('tanggal', [$start->copy()->startOfMonth(), $end->copy()->endOfMonth()])
            ->groupByRaw("DATE_FORMAT(tanggal, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        $pemasukan = Proyek::query()
            ->selectRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01') as bulan, SUM(pagu_total) as total")
            ->whereBetween('tanggal_mulai', [$start->copy()->startOfMonth(), $end->copy()->endOfMonth()])
            ->groupByRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        // Generate semua bulan dalam range — termasuk bulan tanpa data (nilai 0)
        $bulanRange = collect();
        $cursor     = $start->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $bulanRange->push($cursor->format('Y-m-01'));
            $cursor->addMonth();
        }

        return $bulanRange->map(fn($b) => [
            'ds' => $b,
            'y'  => (float)($pemasukan[$b] ?? 0) - (float)($pengeluaran[$b] ?? 0),
        ])->values();
    }

    public function aggregateCashflowDetail(Carbon $start = null, Carbon $end = null): Collection
    {
        $start = $start ?? Carbon::now()->subMonths(5)->startOfMonth();
        $end   = $end   ?? Carbon::now()->endOfMonth();

        // ── Pemasukan per bulan ──────────────────────────────────────────────────
        $pemasukanRaw = Proyek::query()
            ->selectRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01') as bulan, SUM(pagu_total) as total")
            ->whereBetween('tanggal_mulai', [$start, $end])
            ->groupByRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        // Detail proyek per bulan
        // Detail proyek per bulan
        $pemasukanDetail = Proyek::query()
            ->selectRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01') as bulan, proyek_id, nama_proyek, pagu_total")
            ->whereBetween('tanggal_mulai', [$start, $end])
            ->get()
            ->groupBy('bulan');

        // ── Pengeluaran per bulan ────────────────────────────────────────────────
        $pengeluaranRaw = Transaksi::query()
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m-01') as bulan, SUM(jumlah) as total")
            ->whereBetween('tanggal', [$start, $end])
            ->groupByRaw("DATE_FORMAT(tanggal, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        // Detail transaksi per bulan — join proyek supaya nama proyek ikut
        $pengeluaranDetail = Transaksi::query()
            ->selectRaw("DATE_FORMAT(transaksi.tanggal, '%Y-%m-01') as bulan, transaksi.transaksi_id, transaksi.jumlah, transaksi.keterangan, transaksi.proyek_id, proyek.nama_proyek")
            ->leftJoin('proyek', 'proyek.proyek_id', '=', 'transaksi.proyek_id') // ← fix di sini
            ->whereBetween('transaksi.tanggal', [$start, $end])
            ->get()
            ->groupBy('bulan');

        // ── Gabungkan ────────────────────────────────────────────────────────────
        $semuaBulan = collect(
            $pemasukanRaw->keys()->merge($pengeluaranRaw->keys())->unique()->sort()
        );

        return $semuaBulan->map(function ($bulan) use (
            $pemasukanRaw,
            $pemasukanDetail,
            $pengeluaranRaw,
            $pengeluaranDetail
        ) {
            $totalPemasukan   = (float) ($pemasukanRaw[$bulan]   ?? 0);
            $totalPengeluaran = (float) ($pengeluaranRaw[$bulan] ?? 0);

            return [
                'date'              => $bulan,
                'total_pemasukan'   => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'cashflow'          => $totalPemasukan - $totalPengeluaran,

                // ── Detail ──────────────────────────────────────────────────────
                'detail_pemasukan' => ($pemasukanDetail[$bulan] ?? collect())->map(fn($p) => [
                    'proyek_id'   => $p->proyek_id,
                    'nama_proyek' => $p->nama_proyek,
                    'pagu_total'  => (float) $p->pagu_total,
                ])->values(),

                'detail_pengeluaran' => ($pengeluaranDetail[$bulan] ?? collect())->map(fn($t) => [
                    'transaksi_id' => $t->id,
                    'proyek_id'    => $t->proyek_id,
                    'nama_proyek'  => $t->nama_proyek,
                    'jumlah'       => (float) $t->jumlah,
                    'keterangan'   => $t->keterangan,
                ])->values(),
            ];
        })->values();
    }


    public function summaryPerusahaan(Carbon $start = null, Carbon $end = null): array
    {
        // Kalau tidak ada parameter, pakai semua data
        $proyekQuery = Proyek::query();
        $transaksiQuery = Transaksi::query();

        if ($start && $end) {
            $proyekQuery    = $proyekQuery->whereBetween('tanggal_mulai', [$start, $end]);
            $transaksiQuery = $transaksiQuery->whereBetween('tanggal', [$start, $end]);
        }

        $proyeks           = $proyekQuery->get();
        $total_pagu        = $proyeks->sum('pagu_total');
        $total_pengeluaran = $transaksiQuery->sum('jumlah');
        $total_cashflow    = $total_pagu - $total_pengeluaran;
        $total_netto       = $proyeks->sum(fn($p) => $this->hitungAnggaranProyek($p)['netto']);

        return [
            'total_pagu'        => (float) $total_pagu,
            'total_pengeluaran' => (float) $total_pengeluaran,
            'total_cashflow'    => (float) $total_cashflow,
            'total_netto'       => (float) $total_netto,
            'total_proyek'      => $proyeks->count(),
            'proyek_berjalan'   => $proyeks->where('status', 'sedang_berjalan')->count(),
            'proyek_selesai'    => $proyeks->where('status', 'selesai')->count(),
            'proyek_dibatalkan' => $proyeks->where('status', 'dibatalkan')->count(),
        ];
    }


    public function aggregateCashflowBulanantAll(): Collection
    {
        $pengeluaran = Transaksi::query()
            ->selectRaw("DATE_FORMAT(tanggal, '%Y-%m-01') as bulan, SUM(jumlah) as total")
            ->groupByRaw("DATE_FORMAT(tanggal, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        $pemasukan = Proyek::query()
            ->selectRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01') as bulan, SUM(pagu_total) as total")
            ->groupByRaw("DATE_FORMAT(tanggal_mulai, '%Y-%m-01')")
            ->pluck('total', 'bulan');

        $allKeys     = $pemasukan->keys()->merge($pengeluaran->keys());
        $minBulan    = Carbon::parse($allKeys->min())->startOfMonth();
        $maxBulan    = Carbon::now()->startOfMonth();

        // Generate semua bulan — isi gap dengan 0
        $semuaBulan = collect();
        $cursor     = $minBulan->copy();
        while ($cursor->lte($maxBulan)) {
            $semuaBulan->push($cursor->format('Y-m-01'));
            $cursor->addMonth();
        }

        return $semuaBulan->map(fn($b) => [
            'ds' => $b,
            'y'  => (float)($pemasukan[$b] ?? 0) - (float)($pengeluaran[$b] ?? 0),
        ])->values();
    }
}
