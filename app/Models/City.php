<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\City
 *
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property string $state
 * @property string $country
 * @property string $slug
 * @property float|null $latitude
 * @property float|null $longitude
 * @property float|null $radius
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereRadius($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\City whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Cafe[] $cafes
 */
class City extends Model
{
    protected $table = 'cities';

    public function cafes()
    {
        return $this->hasMany(Cafe::class, 'city_id', 'id');
    }
}
