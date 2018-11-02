<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */

// 公有路由，无需登录即可访问
Route::group(['prefix' => 'v1'], function(){
    /*
         |-------------------------------------------------------------------------------
         | Get All Cafes
         |-------------------------------------------------------------------------------
         | URL:            /api/v1/cafes
         | Controller:     API\CafesController@getCafes
         | Method:         GET
         | Description:    Gets all of the cafes in the application
        */
    Route::get('/cafes', 'API\CafesController@getCafes');

    /*
    |-------------------------------------------------------------------------------
    | Adds a New Cafe
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cafes
    | Controller:     API\CafesController@postNewCafe
    | Method:         POST
    | Description:    Adds a new cafe to the application
   */
    Route::get('/cafes/{id}', 'API\CafesController@getCafe');

    /*
     |-------------------------------------------------------------------------------
     | 获取所有冲泡方法
     |-------------------------------------------------------------------------------
     | 请求URL: /api/v1/brew-methods
     | 控制器:  API\BrewMethodsController@getBrewMethods
     | 请求方法: GET
     | API描述: 获取应用中的所有冲泡方法
    */
    Route::get('/brew-methods', 'API\BrewMethodsController@getBrewMethods');

    /*
    |-------------------------------------------------------------------------------
    | 搜索标签（自动提示/补全）
    |-------------------------------------------------------------------------------
    | 请求URL:            /api/v1/tags
    | 控制器:     API\TagsController@getTags
    | 请求方式:         GET
    | 功能描述:   根据输入词提供标签补全功能
    */
    Route::get('/tags', 'API\TagsController@getTags');

    Route::get('/user', 'API\UsersController@getUser');

    /*
    |-------------------------------------------------------------------------------
    | 获取所有城市
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cities
    | Controller:     API\CitiesController@getCities
    | Method:         GET
    | Description:    Get all cities
    */
    Route::get('/cities', 'API\CitiesController@getCities');

    /*
    |-------------------------------------------------------------------------------
    | 获取指定城市
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cities/{slug}
    | Controller:     API\CitiesController@getCity
    | Method:         GET
    | Description:    Gets an individual city
    */
    Route::get('/cities/{slug}', 'API\CitiesController@getCity');

    /*
    |-------------------------------------------------------------------------------
    | Handles a Company Search
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/companies/search
    | Controller:     API\CompaniesController@getCompanySearch
    | Method:         GET
    | Description:    Handles a search for a company.
    */
    Route::get('/companies/search', 'API\CompaniesController@getCompanySearch');
});

// 私有路由，需要登录才能访问
Route::group(['prefix' => 'v1', 'middleware' => 'auth:api'], function () {
    /*
     |-------------------------------------------------------------------------------
     | Get An Individual Cafe
     |-------------------------------------------------------------------------------
     | URL:            /api/v1/cafes/{id}
     | Controller:     API\CafesController@getCafe
     | Method:         GET
     | Description:    Gets an individual cafe
    */
    Route::post('/cafes', 'API\CafesController@postNewCafe');

    // 喜欢咖啡店
    Route::post('/cafes/{id}/like', 'API\CafesController@postLikeCafe');
    // 取消喜欢咖啡店
    Route::delete('/cafes/{id}/like', 'API\CafesController@deleteLikeCafe');

    /*
    |-------------------------------------------------------------------------------
    | 添加标签到指定咖啡店
    |-------------------------------------------------------------------------------
    | 请求URL:            /api/v1/cafes/{id}/tags
    | 控制器方法:     API\CafesController@postAddTags
    | 请求方式:         POST
    | 功能描述:    用户为某个咖啡店添加标签
    */
    Route::post('/cafes/{id}/tags', 'API\CafesController@postAddTags');

    /*
    |-------------------------------------------------------------------------------
    | 删除指定咖啡店上的指定标签
    |-------------------------------------------------------------------------------
    | 请求URL:            /api/v1/cafes/{id}/tags/{tagID}
    | 控制器方法:     API\CafesController@deleteCafeTag
    | 请求方式:         DELETE
    | 功能描述:    用户从某个咖啡店上删除标签
    */
    Route::delete('/cafes/{id}/tags/{tagID}', 'API\CafesController@deleteCafeTag');

    /*
    |-------------------------------------------------------------------------------
    | 更新用户个人信息
    |-------------------------------------------------------------------------------
    | 请求URL:     /api/v1/user
    | 控制器方法:   API\UsersController@putUpdateUser
    | 请求方式:     PUT
    | 功能描述:     更新认证用户的个人信息
    */
    Route::put('/user', 'API\UsersController@putUpdateUser');

    /*
    |-------------------------------------------------------------------------------
    | 获取待编辑咖啡店数据
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cafes/{slug}/edit
    | Controller:     API\CafesController@getCafeEditData
    | Method:         GET
    | Description:    获取待编辑咖啡店数据
    */
    Route::get('/cafes/{id}/edit', 'API\CafesController@getCafeEditData');

    /*
    |-------------------------------------------------------------------------------
    | 执行更新咖啡店请求
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cafes/{slug}
    | Controller:     API\CafesController@putEditCafe
    | Method:         PUT
    | Description:    执行更新咖啡店请求
    */
    Route::put('/cafes/{id}', 'API\CafesController@putEditCafe');

    /*
    |-------------------------------------------------------------------------------
    | 删除指定咖啡店
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cafes/{slug}
    | Controller:     API\CafesController@deleteCafe
    | Method:         DELETE
    | Description:    删除指定咖啡店
    */
    Route::delete('/cafes/{id}', 'API\CafesController@deleteCafe');

});
