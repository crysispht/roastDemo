<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

/**
 * App\Models\User
 *
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\CafePhoto[] $cafePhotos
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Passport\Client[] $clients
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Company[] $companiesOwned
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Cafe[] $likes
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Passport\Token[] $tokens
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $email_verified_at
 * @property string $password
 * @property string $provider
 * @property string $provider_id
 * @property string $avatar
 * @property string $favorite_coffee 最喜欢的咖啡
 * @property string $flavor_notes 口味记录
 * @property int $profile_visibility 是否公开个人信息
 * @property string $city 所在城市
 * @property string $state 所在省份
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereFavoriteCoffee($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereFlavorNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereProfileVisibility($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereProviderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\User whereUpdatedAt($value)
 */
class User extends Authenticatable
{
    use Notifiable,HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    // 与 Cafe 间的多对多关联
    public function likes()
    {
        return $this->belongsToMany(Cafe::class, 'users_cafes_likes', 'user_id', 'cafe_id');
    }

    // 上传的咖啡店图片
    public function cafePhotos()
    {
        return $this->hasMany(CafePhoto::class, 'id', 'cafe_id');
    }

    // 归属此用户的公司
    public function companiesOwned()
    {
        return $this->belongsToMany(Company::class, 'company_owners', 'user_id', 'company_id');
    }
}
