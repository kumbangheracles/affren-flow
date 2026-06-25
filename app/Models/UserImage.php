<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class UserImage extends Model
{
    protected $table = 'user_image';
    protected $fillable = [
        'user_id',
        'image_url',
        'public_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
