<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ItemTransaksi extends Model
{
    protected $table = 'item_transaksi';
    protected $primaryKey = 'item_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'transaksi_id',
        'tanggal',
        'nama_item',
        'satuan',
        'qty',
        'harga_satuan',
        'subtotal',
        'keterangan',
        'created_by',
        'approved_by',
        'status'
    ];

    const STATUS = [
        'disetujui',
        'belum_disetujui',
        'ditolak',
        'lunas'

    ];

    protected $casts = [
        'qty'          => 'decimal:2',
        'harga_satuan' => 'decimal:2',
        'subtotal'     => 'decimal:2',
        'tanggal'      => 'date',
    ];

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id', 'transaksi_id');
    }


    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->item_id)) {
                $model->item_id = (string) Str::ulid();
            }
        });
    }

    public function creatorItemTransaksi()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approverItemTransaksi()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
