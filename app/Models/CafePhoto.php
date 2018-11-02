<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\CafePhoto
 *
 * @property-read \App\Models\Cafe $cafe
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 * @property int $id
 * @property int $cafe_id
 * @property int $uploaded_by
 * @property string $file_url
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereCafeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\CafePhoto whereUploadedBy($value)
 */
class CafePhoto extends Model
{
    protected $table = 'cafes_photos';

    public function cafe()
    {
        return $this->belongsTo(Cafe::class, 'cafe_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'id');
    }
}
