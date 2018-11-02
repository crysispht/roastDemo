<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Company
 *
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Cafe[] $cafes
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $ownedBy
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property int $roaster
 * @property int $subscription
 * @property string $website
 * @property string $logo
 * @property string $description
 * @property int|null $added_by
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereAddedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereRoaster($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereSubscription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Company whereWebsite($value)
 */
class Company extends Model
{
    // 所属用户
    public function ownedBy()
    {
        return $this->belongsToMany(User::class, 'company_owners', 'company_id', 'user_id');
    }

    // 所有关联咖啡店
    public function cafes()
    {
        return $this->hasMany(Cafe::class, 'company_id', 'id');
    }
}
