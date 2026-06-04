<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JenisProyek extends Model
{
    use HasFactory;

    protected $table = 'jenis_proyek';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['kategori_proyek_id', 'nama', 'created_by'];

    public function kategoriProyek(): BelongsTo
    {
        return $this->belongsTo(KategoriProyek::class, 'kategori_proyek_id');
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
