<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use App\Models\ItemTransaksi;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Transaksi extends Model
{
    use HasUlids;
    protected $table = 'transaksi';
    protected $primaryKey = 'transaksi_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'proyek_id',
        // 'tipe',
        'kategori',
        'jumlah',
        'tanggal',
        'persen',
        'keterangan',
        'status',
        'created_by',
        'approved_by'
    ];

    protected $casts = [
        'persen'  => 'decimal:2',
        'jumlah'   => 'decimal:2',
        'tanggal'  => 'date',

    ];

    const TIPE_PEMASUKAN   = 'pemasukan';
    const TIPE_PENGELUARAN = 'pengeluaran';
    const KATEGORI_DENGAN_ITEM = [
        'material',
        'operasional',
        'biaya_tak_terduga',
    ];

    const KATEGORI_LANGSUNG = [
        'jasa_tukang',
        'mandor',
        'staff_perpajakan',
        'staff_entry_data',
    ];
    const KATEGORI = [
        'material',
        'operasional',
        'jasa_tukang',
        'mandor',

        'staff_perpajakan',
        'staff_entry_data',
        'biaya_tak_terduga',
    ];
    const STATUS = [
        'disetujui',
        'belum_disetujui',
        'ditolak',
        'lunas'

    ];

    // Relasi ke proyek
    public function proyek(): BelongsTo
    {
        return $this->belongsTo(Proyek::class, 'proyek_id', 'proyek_id');
    }

    public function getRouteKeyName(): string
    {
        return 'transaksi_id';
    }

    // Scope filter per proyek
    // public function scopeForProyek($query, string $proyekId)
    // {
    //     return $query->where('proyek_id', $proyekId);
    // }

    // Scope filter per tipe
    public function scopePemasukan($query)
    {
        return $query->where('tipe', self::TIPE_PEMASUKAN);
    }

    // public function scopePengeluaran($query)
    // {
    //     return $query->where('tipe', self::TIPE_PENGELUARAN);
    // }

    // Scope filter per bulan — dipakai nanti untuk agregasi Prophet
    public function scopePerBulan($query, int $year, int $month)
    {
        return $query->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemTransaksi::class, 'transaksi_id', 'transaksi_id');
    }

    public function creatorTransaksi()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approverTransaksi()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
