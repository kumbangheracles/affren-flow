<?php

namespace Database\Seeders;

use App\Models\Proyek;
use App\Models\Transaksi;
use App\Models\ItemTransaksi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProyekTransaksiSeeder extends Seeder
{
    private const PROPORSI_PERSEN = [
        'material'          => 0.35,
        'operasional'       => 0.05,
        'jasa_tukang'       => 0.11,
        'mandor'            => 0.015,
        'biaya_tak_terduga' => 0.04,
    ];

    private const PROPORSI_FIXED = [
        'staff_perpajakan' => 300_000,
        'staff_entry_data' => 1_600_000,
    ];

    private const KATEGORI_DENGAN_ITEM = ['material', 'operasional', 'biaya_tak_terduga'];

    // Bobot musiman per bulan (1=Jan ... 12=Des)
    // Q1 & Q3 tinggi, Q2 & Q4 rendah — mencerminkan siklus konstruksi
    private const BOBOT_MUSIMAN = [
        1  => 1.3,  // Jan — awal tahun, banyak kontrak baru
        2  => 1.1,  // Feb
        3  => 1.4,  // Mar — akhir Q1, puncak
        4  => 0.8,  // Apr — awal Q2, lebih sepi
        5  => 0.7,  // Mei
        6  => 0.9,  // Jun
        7  => 1.2,  // Jul — awal Q3
        8  => 1.4,  // Agt — puncak Q3
        9  => 1.1,  // Sep
        10 => 0.8,  // Okt — awal Q4, mulai sepi
        11 => 0.7,  // Nov
        12 => 0.9,  // Des — akhir tahun
    ];

    // Base pagu per bulan — akan dikalikan bobot musiman
    private const BASE_PAGU = 250_000_000;

    public function run(): void
    {
        $kategoriIds = \App\Models\KategoriProyek::pluck('id')->toArray();
        $jenisIds    = \App\Models\JenisProyek::pluck('id')->toArray();

        if (empty($kategoriIds) || empty($jenisIds)) {
            $this->command->error('Kategori atau Jenis proyek belum ada.');
            return;
        }

        $jadwal = $this->generateJadwal();

        foreach ($jadwal as $def) {
            $mulai   = $def['mulai'];
            $selesai = $def['selesai'];
            $pagu    = $def['pagu'];
            $pajak   = $def['pajak'];
            $status  = $selesai->isPast() ? 'selesai' : 'sedang_berjalan';

            $proyek = Proyek::create([
                'nama_proyek'        => 'Proyek ' . fake()->words(3, true),
                'kategori_proyek_id' => $kategoriIds[array_rand($kategoriIds)],
                'jenis_proyek_id'    => $jenisIds[array_rand($jenisIds)],
                'pagu_total'         => $pagu,
                'tanggal_mulai'      => $mulai,
                'tanggal_selesai'    => $selesai,
                'pajak_persen'       => $pajak,
                'nama_klien'         => fake()->company(),
                'status'             => $status,
                'deskripsi_proyek'   => fake()->sentence(10),
                'created_by' => 1
            ]);

            $this->buatTransaksiPengeluaran($proyek, (float) $pagu, $mulai);
        }

        $this->command->info('✓ Seeder selesai: cashflow 24 bulan dengan pola musiman.');
    }

    private function generateJadwal(): array
    {
        $now         = Carbon::now()->startOfDay();
        $windowStart = $now->copy()->subMonths(24)->startOfMonth();
        $defs        = [];

        $cursor = $windowStart->copy();

        while ($cursor->lte($now)) {
            $bulan  = (int) $cursor->format('n'); // 1-12
            $bobot  = self::BOBOT_MUSIMAN[$bulan];

            // Jumlah proyek per bulan mengikuti bobot musiman
            // Bobot tinggi = lebih banyak proyek
            $jumlahProyek = (int) round($bobot * 1.5); // 1-3 proyek per bulan
            $jumlahProyek = max(1, $jumlahProyek);

            for ($p = 0; $p < $jumlahProyek; $p++) {
                $mulai = $cursor->copy()->addDays(rand(0, 20));

                // Durasi proyek: 1 bulan saja — pengeluaran di bulan yang sama
                $selesai = $mulai->copy()->endOfMonth();

                // Pagu mengikuti bobot musiman + variasi kecil ±15%
                $variasi = 0.85 + (mt_rand(0, 30) / 100); // 0.85 - 1.15
                $pagu    = (int) round(self::BASE_PAGU * $bobot * $variasi / 5_000_000) * 5_000_000;
                $pagu    = max(50_000_000, $pagu); // minimal 50jt

                $pajak = fake()->randomElement([10, 11, 12]);

                $defs[] = compact('mulai', 'selesai', 'pagu', 'pajak');
            }

            $cursor->addMonth();
        }

        return $defs;
    }

    private function buatTransaksiPengeluaran(
        Proyek $proyek,
        float  $pagu,
        Carbon $mulai
    ): void {
        // Semua transaksi dalam bulan yang sama dengan tanggal_mulai
        $batasBulan = $mulai->copy()->endOfMonth();
        $now        = Carbon::now()->startOfDay();

        // Kalau bulan ini belum selesai, batasi sampai hari ini
        if ($batasBulan->gt($now)) {
            $batasBulan = $now->copy();
        }

        // Kalau mulai > now (edge case), skip
        if ($mulai->gt($now)) return;

        $alokasi = [];
        foreach (self::PROPORSI_PERSEN as $kat => $pct) {
            $alokasi[$kat] = (int) round($pagu * $pct);
        }
        foreach (self::PROPORSI_FIXED as $kat => $nominal) {
            $alokasi[$kat] = (int) $nominal;
        }

        // Total maksimal 70% dari pagu — cashflow selalu positif 30%
        $batasMaks    = (int) ($pagu * 0.70);
        $totalAlokasi = array_sum($alokasi);

        if ($totalAlokasi > $batasMaks) {
            $faktor = $batasMaks / $totalAlokasi;
            foreach ($alokasi as $kat => &$val) {
                $val = (int) floor($val * $faktor);
            }
            unset($val);
        }

        foreach ($alokasi as $kategori => $budget) {
            if ($budget <= 0) continue;

            // Tanggal transaksi dalam bulan mulai
            $tanggal = Carbon::createFromTimestamp(
                rand($mulai->timestamp, $batasBulan->timestamp)
            );

            if (isset(self::PROPORSI_FIXED[$kategori])) {
                Transaksi::create([
                    'proyek_id'  => $proyek->proyek_id,
                    'kategori'   => $kategori,
                    'jumlah'     => $budget,
                    'persen'     => $this->hitungPersen($budget, $pagu),
                    'tanggal'    => $tanggal,
                    'keterangan' => "Biaya tetap {$kategori}",
                ]);
                continue;
            }

            if (in_array($kategori, self::KATEGORI_DENGAN_ITEM, true)) {
                $transaksi = Transaksi::create([
                    'proyek_id'  => $proyek->proyek_id,
                    'kategori'   => $kategori,
                    'jumlah'     => 0,
                    'persen'     => null,
                    'tanggal'    => $tanggal,
                    'keterangan' => "Transaksi {$kategori}",
                ]);

                $totalItem = $this->buatItemTransaksi(
                    $transaksi,
                    $budget,
                    $kategori,
                    $mulai,
                    $batasBulan
                );

                $transaksi->update([
                    'jumlah' => $totalItem,
                    'persen' => $this->hitungPersen($totalItem, $pagu),
                ]);
            } else {
                Transaksi::create([
                    'proyek_id'  => $proyek->proyek_id,
                    'kategori'   => $kategori,
                    'jumlah'     => $budget,
                    'persen'     => $this->hitungPersen($budget, $pagu),
                    'tanggal'    => $tanggal,
                    'keterangan' => "Transaksi {$kategori}",
                ]);
            }
        }
    }

    private function buatItemTransaksi(
        Transaksi $transaksi,
        int       $targetTotal,
        string    $kategori,
        Carbon    $tanggalAwal,
        Carbon    $maxTanggal
    ): int {
        $jumlahItem   = rand(2, 4);
        $sisaAnggaran = $targetTotal;
        $totalAktual  = 0;

        for ($j = 1; $j <= $jumlahItem; $j++) {
            $isItemAkhir = ($j === $jumlahItem);

            $tFrom = $tanggalAwal->copy();
            $tTo   = $maxTanggal->copy();
            if ($tFrom->gt($tTo)) $tFrom = $tTo->copy();

            $tanggalItem = Carbon::createFromTimestamp(
                rand($tFrom->timestamp, $tTo->timestamp)
            );

            [$namaItem, $satuan] = $this->generateItem($kategori, $j);

            if ($isItemAkhir) {
                $subtotal = max(1, $sisaAnggaran);
                $harga    = rand(10_000, 300_000);
                $qty      = max(1, (int) round($subtotal / $harga));
                $harga    = (int) round($subtotal / $qty);
                $subtotal = $qty * $harga;
            } else {
                $porsiBase = (int) round($sisaAnggaran / ($jumlahItem - $j + 1));
                $porsi     = (int) ($porsiBase * (0.85 + lcg_value() * 0.30));
                $porsi     = max(1_000, min($porsi, $sisaAnggaran - ($jumlahItem - $j) * 1_000));

                $harga    = rand(10_000, 300_000);
                $qty      = max(1, (int) round($porsi / $harga));
                $harga    = (int) round($porsi / $qty);
                $subtotal = $qty * $harga;
            }

            $sisaAnggaran -= $subtotal;
            $totalAktual  += $subtotal;

            ItemTransaksi::create([
                'transaksi_id' => $transaksi->transaksi_id,
                'tanggal'      => $tanggalItem,
                'nama_item'    => $namaItem,
                'satuan'       => $satuan,
                'qty'          => $qty,
                'harga_satuan' => $harga,
                'subtotal'     => $subtotal,
                'keterangan'   => "Item ke-{$j}",
            ]);
        }

        return $totalAktual;
    }

    private function hitungPersen(float $jumlah, float $pagu): float
    {
        return $pagu > 0 ? round(($jumlah / $pagu) * 100, 2) : 0.0;
    }

    private function generateItem(string $kategori, int $index): array
    {
        static $katalog = [
            'material' => [
                ['Semen Tiga Roda 50kg',   'sak'],
                ['Besi Beton 10mm',         'batang'],
                ['Pasir Beton',             'm³'],
                ['Batu Split 2/3',          'm³'],
                ['Kayu Bekisting 4/6',      'lembar'],
                ['Cat Tembok Interior',     'kaleng'],
                ['Keramik 60×60 Polished',  'dus'],
                ['Pipa PVC AW 4 inch',      'batang'],
                ['Triplek 12mm',            'lembar'],
                ['Kawat Bindrat',           'kg'],
            ],
            'operasional' => [
                ['Sewa Excavator',         'hari'],
                ['Sewa Molen Beton',       'hari'],
                ['Transportasi Material',  'trip'],
                ['Bahan Bakar Genset',     'liter'],
                ['Sewa Scaffolding',       'set'],
                ['Konsumsi Pekerja',       'hari'],
                ['Sewa Stamper Kuda',      'hari'],
                ['Biaya Pengujian Beton',  'kali'],
            ],
            'biaya_tak_terduga' => [
                ['Perbaikan Pipa Bocor',           'kali'],
                ['Penggantian Material Rusak',     'unit'],
                ['Biaya Lembur Darurat',           'hari'],
                ['Perbaikan Alat Berat Rusak',     'kali'],
                ['Bahan Tambahan Tidak Terencana', 'unit'],
            ],
        ];

        $list = $katalog[$kategori] ?? [["Item {$index}", 'unit']];
        return $list[($index - 1) % count($list)];
    }
}
