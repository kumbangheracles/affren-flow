<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriProyek extends Model
{
    use HasFactory;

    protected $table = 'kategori_proyek';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['nama', 'created_by'];

    public function jenisProyek(): HasMany
    {
        return $this->hasMany(JenisProyek::class, 'kategori_proyek_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
