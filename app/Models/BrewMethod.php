<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\BrewMethod
 *
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Cafe[] $cafes
 * @mixin \Eloquent
 * @property int $id
 * @property string $method
 * @property string $icon
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BrewMethod whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BrewMethod whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BrewMethod whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BrewMethod whereMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BrewMethod whereUpdatedAt($value)
 */
class BrewMethod extends Model
{
    // 定义与 Cafe 模型间的多对多关联
    public function cafes()
    {
        return $this->belongsToMany(Cafe::class, 'cafes_brew_methods', 'brew_method_id', 'cafe_id');
    }
}
