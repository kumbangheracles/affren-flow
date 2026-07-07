<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proyek extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'proyek';
    protected $primaryKey = 'proyek_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nama_proyek',
        'kategori_proyek_id',
        'jenis_proyek_id',
        'pagu_total',
        'tanggal_mulai',
        'tanggal_selesai',
        'pajak_persen',
        'proyek_images',
        // 'uang_bahan_persen',
        // 'jasa_tukang_persen',
        // 'biaya_staff_perpajakan',
        // 'biaya_staff_entry_data',
        // 'biaya_tak_terduga_persen',
        'nama_klien',
        'status',
        'created_by',
        'deskripsi_proyek',

    ];

    protected $casts = [
        'pagu_total' => 'decimal:2',
        'pajak_persen' => 'decimal:2',
        // 'uang_bahan_persen' => 'decimal:2',
        // 'jasa_tukang_persen' => 'decimal:2',
        // 'biaya_tak_terduga_persen' => 'decimal:2',
        // 'biaya_staff_perpajakan' => 'decimal:2',
        // 'biaya_staff_entry_data' => 'decimal:2',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'proyek_id', 'proyek_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriProyek::class, 'kategori_proyek_id', 'id');
    }

    public function jenis()
    {
        return $this->belongsTo(JenisProyek::class, 'jenis_proyek_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function proyek_images()
    {
        return $this->hasMany(
            ProyekImage::class,
            'proyek_id',
            'proyek_id'
        );
    }

    public function proyek_mandor()
    {
        return $this->belongsToMany(User::class, 'proyek_mandor', 'proyek_id', 'user_id')
            ->select('users.id', 'users.name', 'users.nama_lengkap', 'noHp')
            ->withTimestamps();
    }
}
