<?php

namespace App\Http\Controllers\API;


use App\Http\Controllers\Controller;
use App\Models\Cafe;
use App\Models\Tag;
use Illuminate\Support\Facades\Request;

class TagsController extends Controller
{
    public function getTags()
    {
        $cafes = new Cafe();
        dd($cafes->find(8)->tags);

        $query = Request::get('search');

        if ($query == null || $query == '') {
            $tags = Tag::all();
        } else {
            $tags = Tag::where('name', 'LIKE', $query . '%')->get();
        }

        return response()->json($tags);
    }
}
