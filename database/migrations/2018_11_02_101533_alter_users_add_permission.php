<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterUsersAddPermission extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            //3 – 超级管理员，具备所有权限
            // 2 – 管理员，具备后台管理权限和咖啡店增删改权限
            // 1 – 商家，具备对自有咖啡店和对应公司的更新权限
            // 0 – 普通用户，具备更新个人信息、喜欢及咖啡店浏览权限
            $table->tinyInteger('permission')->after('id')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('permission');
        });
    }
}
