<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Proyek;

class ProyekImage extends Model
{
    protected $fillable = [
        'proyek_id',
        'image_url',
    ];

    public function proyek()
    {
        return $this->belongsTo(
            Proyek::class,
            'proyek_id',
            'proyek_id'
        );
    }
}
