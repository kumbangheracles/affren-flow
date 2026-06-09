<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Role;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nama_lengkap',
        'email',
        'password',
        'role_id',
        'isActive',
        'noHp'
        // 'created_by'
        // 'photo_url', // nanti untuk cloudinary
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    public function kategoriProyek()
    {
        return $this->hasMany(KategoriProyek::class, 'created_by');
    }

    public function jenisProyek()
    {
        return $this->hasMany(JenisProyek::class, 'created_by');
    }

    public function proyek()
    {
        return $this->hasMany(Proyek::class, 'created_by');
    }

    public function creatorTransaksi()
    {
        return $this->hasMany(Transaksi::class, 'created_by');
    }

    public function approverTransaksi()
    {
        return $this->hasMany(Transaksi::class, 'approved_by');
    }
}
