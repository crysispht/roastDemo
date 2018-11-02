<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Cafe
 *
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\BrewMethod[] $brewMethods
 * @property-read \App\Models\Company $company
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $likes
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\CafePhoto[] $photos
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Tag[] $tags
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $userLike
 * @mixin \Eloquent
 * @property int $id
 * @property string $location_name
 * @property int|null $city_id
 * @property string $address
 * @property string $city
 * @property string $state
 * @property string $zip
 * @property float|null $latitude
 * @property float|null $longitude
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $company_id
 * @property string|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereCityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereLocationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Cafe whereZip($value)
 */
class Cafe extends Model
{

    use SoftDeletes;

    //定义咖啡店与冲泡方法间的关联关系
    public function brewMethods()
    {
        return $this->belongsToMany(BrewMethod::class, 'cafes_brew_methods', 'cafe_id', 'brew_method_id');
    }

    // 与 User 间的多对对关联
    public function likes()
    {
        return $this->belongsToMany(User::class, 'users_cafes_likes', 'cafe_id', 'user_id');
    }

    //标识登录用户是否已经喜欢/取消喜欢指定咖啡店
    public function userLike()
    {
        return $this->belongsToMany(User::class, 'users_cafes_likes', 'cafe_id', 'user_id')->where('user_id', auth()->id());
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'cafes_users_tags', 'cafe_id', 'tag_id');
    }

    // 咖啡店图片
    public function photos()
    {
        return $this->hasMany(CafePhoto::class, 'id', 'cafe_id');
    }

    // 归属公司
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }
}
