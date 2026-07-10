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

    // Bobot musiman per bulan — Q1 & Q3 tinggi, Q2 & Q4 rendah
    private const BOBOT_MUSIMAN = [
        1  => 1.40,
        2  => 1.10,
        3  => 1.50,
        4  => 0.75,
        5  => 0.65,
        6  => 0.90,
        7  => 1.30,
        8  => 1.45,
        9  => 1.10,
        10 => 0.70,
        11 => 0.60,
        12 => 0.85,
    ];

    // Pagu base per proyek — realistis untuk CV kecil
    private const BASE_PAGU_UTAMA  = 200_000_000; // proyek utama per bulan
    private const BASE_PAGU_TAMBAHAN = 130_000_000; // proyek tambahan

    public function run(): void
    {
        $kategoriIds = \App\Models\KategoriProyek::pluck('id')->toArray();
        $jenisIds    = \App\Models\JenisProyek::pluck('id')->toArray();

        if (empty($kategoriIds) || empty($jenisIds)) {
            $this->command->error('Kategori atau Jenis proyek belum ada.');
            return;
        }

        // Truncate tabel (bukan delete()) supaya aman dari SoftDeletes —
        // ->delete() pada model dengan SoftDeletes hanya mengisi deleted_at,
        // baris lama tetap ada di tabel dan bikin data/laporan jadi dobel.
        \DB::statement('SET FOREIGN_KEY_CHECKS=0');
        \DB::table('item_transaksi')->truncate();
        \DB::table('transaksi')->truncate();
        \DB::table('proyek')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $jadwal = $this->generateJadwal();
        $total  = count($jadwal);

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
                'created_by'         => 1,
            ]);

            $this->buatTransaksiPengeluaran($proyek, (float) $pagu, $mulai);
        }

        $this->command->info("✓ Seeder selesai: {$total} proyek, 24 bulan, variasi musiman.");
    }

    private function generateJadwal(): array
    {
        $now = Carbon::now()->startOfDay();

        // Tepat 24 bulan ke belakang — tidak lebih, tidak kurang
        $windowStart = $now->copy()->subMonths(23)->startOfMonth();

        $defs   = [];
        $cursor = $windowStart->copy();

        while ($cursor->lte($now)) {
            $bulan = (int) $cursor->format('n');
            $bobot = self::BOBOT_MUSIMAN[$bulan];

            // Jumlah proyek per bulan: 1-2 saja
            // Q1/Q3 (bobot >= 1.2): kemungkinan 2 proyek lebih besar
            // Q2/Q4 (bobot < 1.2): hampir selalu 1 proyek
            if ($bobot >= 1.2) {
                $jumlahProyek = mt_rand(0, 100) < 70 ? 2 : 1; // 70% dapat 2, 30% dapat 1
            } else {
                $jumlahProyek = mt_rand(0, 100) < 25 ? 2 : 1; // 25% dapat 2, 75% dapat 1
            }

            for ($p = 0; $p < $jumlahProyek; $p++) {
                // Untuk bulan berjalan (belum selesai), batasi rentang addDays
                // supaya tanggal_mulai tidak jatuh setelah hari ini —
                // kalau tidak, proyek "sedang_berjalan" tapi belum punya transaksi sama sekali.
                $akhirBulanIni = $cursor->copy()->endOfMonth();
                if ($akhirBulanIni->gt($now)) {
                    $maxHari = max(1, $now->diffInDays($cursor));
                    $maxHari = min(25, $maxHari);
                } else {
                    $maxHari = 25;
                }

                $mulai   = $cursor->copy()->addDays(rand(1, $maxHari));
                $selesai = $mulai->copy()->endOfMonth();

                // Pagu mengikuti bobot musiman + variasi ±25%
                $basePagu    = $p === 0 ? self::BASE_PAGU_UTAMA : self::BASE_PAGU_TAMBAHAN;
                $noiseFactor = 0.75 + (mt_rand(0, 50) / 100); // 0.75 - 1.25
                $pagu        = (int) round($basePagu * $bobot * $noiseFactor / 5_000_000) * 5_000_000;
                $pagu        = max(50_000_000, min(500_000_000, $pagu));

                $pajak = fake()->randomElement([10, 10, 11, 11, 12]);

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
        $now        = Carbon::now()->startOfDay();
        $batasBulan = $mulai->copy()->endOfMonth();

        if ($batasBulan->gt($now)) {
            $batasBulan = $now->copy();
        }

        if ($mulai->gt($now)) return;

        // Rasio pengeluaran: 60%-70% dari pagu — cashflow selalu positif 30-40%
        // Variasi kecil supaya tidak terlalu random
        $rasioMaks = 0.60 + (mt_rand(0, 10) / 100); // 0.60 - 0.70
        $batasMaks = (int) ($pagu * $rasioMaks);

        $alokasi = [];
        foreach (self::PROPORSI_PERSEN as $kat => $pct) {
            $noisePct      = 0.92 + (mt_rand(0, 16) / 100); // 0.92 - 1.08
            $alokasi[$kat] = (int) round($pagu * $pct * $noisePct);
        }
        foreach (self::PROPORSI_FIXED as $kat => $nominal) {
            $alokasi[$kat] = (int) $nominal;
        }

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
                    'created_by' => 1,
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
                    'created_by' => 1,
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
                    'created_by' => 1,
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
                $porsi     = (int) ($porsiBase * (0.80 + lcg_value() * 0.40));
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
                'created_by'   => 1,
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
