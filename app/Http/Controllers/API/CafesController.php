<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditCafeRequest;
use App\Http\Requests\StoreCafeRequest;
use App\Models\Cafe;
use App\Models\CafePhoto;
use App\Models\Company;
use App\Services\CafeService;
use App\Utilities\GaodeMaps;
use App\Utilities\Tagger;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CafesController extends Controller
{
    /*
    |-------------------------------------------------------------------------------
    | Get All Cafes
    |-------------------------------------------------------------------------------
    | URL:            /api/v1/cafes
    | Method:         GET
    | Description:    Gets all of the cafes in the application
    */
    public function getCafes()
    {
        $cafes = Cafe::with('brewMethods')
            ->with(['tags' => function (Relation $query) {
                $query->select('name');
            }])
            ->with('company')
            ->withCount('userLike')
            ->withCount('likes')
            ->get();
        return response()->json($cafes);

    }

    /*
     |-------------------------------------------------------------------------------
     | Get An Individual Cafe
     |-------------------------------------------------------------------------------
     | URL:            /api/v1/cafes/{id}
     | Method:         GET
     | Description:    Gets an individual cafe
     | Parameters:
     |   $id   -> ID of the cafe we are retrieving
    */
    public function getCafe($id)
    {
        $cafe = Cafe::where('id', '=', $id)
            ->with('brewMethods')
            ->withCount('userLike')
            ->with('tags')
            ->with(['company' => function ($query) {
                $query->withCount('cafes');
            }])
            ->withCount('likes')
            ->first();
        return response()->json($cafe);

    }

    /*
     |-------------------------------------------------------------------------------
     | Adds a New Cafe
     |-------------------------------------------------------------------------------
     | URL:            /api/v1/cafes
     | Method:         POST
     | Description:    Adds a new cafe to the application
    */
    public function postNewCafe(Request $request)
    {
        $cafeService = new CafeService();
        $cafe = $cafeService->addCafe($request->all(), Auth::user()->id);

        $company = Company::where('id', '=', $cafe->company_id)
            ->with('cafes')
            ->first();

        return response()->json($company, 201);

    }

    public function postLikeCafe($cafeID)
    {
        $cafe = Cafe::where('id', '=', $cafeID)->first();
        $cafe->likes()->attach(Auth::user()->id, [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
        return response()->json(['cafe_liked' => true], 201);
    }

    public function deleteLikeCafe($cafeID)
    {
        $cafe = Cafe::where('id', '=', $cafeID)->first();

        $cafe->likes()->detach(Auth::user()->id);

        return response(null, 204);
    }

    /**
     * 给咖啡店添加标签
     * @param $request
     * @param $cafeID
     * @return JsonResponse
     */
    public function postAddTags(Request $request, $cafeID)
    {
        // 从请求中获取标签信息
        $tags = $request->input('tags');
        $cafe = Cafe::find($cafeID);

        // 处理新增标签并建立标签与咖啡店之间的关联
        Tagger::tagCafe($cafe, $tags, Auth::user()->id);

        // 返回标签
        $cafe = Cafe::where('id', '=', $cafeID)
            ->with('brewMethods')
            ->with('userLike')
            ->with('tags')
            ->first();

        return response()->json($cafe, 201);
    }

    /**
     * 删除咖啡店上的指定标签
     * @param $cafeID
     * @param $tagID
     * @return Response
     */
    public function deleteCafeTag($cafeID, $tagID)
    {
        DB::table('cafes_users_tags')->where('cafe_id', $cafeID)->where('tag_id', $tagID)->where('user_id', Auth::user()->id)->delete();
        return response(null, 204);
    }


    // 获取咖啡店编辑表单数据
    public function getCafeEditData($id)
    {
        $cafe = Cafe::where('id', '=', $id)
            ->with('brewMethods')
            ->withCount('userLike')
            ->with(['company' => function ($query) {
                $query->withCount('cafes');
            }])
            ->first();
        return response()->json($cafe);
    }

    // 更新咖啡店数据
    public function putEditCafe($id, EditCafeRequest $request)
    {
        $cafe = Cafe::where('id', '=', $id)->with('brewMethods')->first();

        $cafeService = new CafeService();
        $updatedCafe = $cafeService->editCafe($cafe->id, $request->all(), Auth::user()->id);

        $company = Company::where('id', '=', $updatedCafe->company_id)
            ->with('cafes')
            ->first();

        return response()->json($company, 200);
    }

    // 删除咖啡店
    public function deleteCafe($id)
    {
        $cafe = Cafe::where('id', '=', $id)->first();
        $cafe->delete();
        return response()->json(['message' => '删除成功'], 204);
    }
}
