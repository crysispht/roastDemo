<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Action
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $company_id
 * @property int|null $cafe_id
 * @property int $status
 * @property int|null $processed_by
 * @property string|null $processed_on
 * @property string $type
 * @property string $content
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $by
 * @property-read \App\Models\Cafe|null $cafe
 * @property-read \App\Models\User|null $processedBy
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereCafeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereProcessedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereProcessedOn($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Action whereUserId($value)
 * @mixin \Eloquent
 */
class Action extends Model
{
    const STATUS_PENDING = 0;   // 待审核
    const STATUS_APPROVED = 1;  // 已通过
    const STATUS_DENIED = 2;    // 已拒绝

    // 该更新动作所属咖啡店
    public function cafe()
    {
        return $this->belongsTo(Cafe::class, 'cafe_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    // 对应前台操作用户
    public function by()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // 对应后台处理管理员
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by', 'id');
    }
}
