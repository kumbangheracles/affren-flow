<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Role;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'roles'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    public function role()
    {
        return $this->belongsTo(Role::class, 'id', 'id');
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
    public function creatorItemTransaksi()
    {
        return $this->hasMany(ItemTransaksi::class, 'created_by');
    }
    public function approverItemTransaksi()
    {
        return $this->hasMany(ItemTransaksi::class, 'approved_by');
    }
}
