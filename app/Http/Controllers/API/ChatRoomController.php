<?php

namespace App\Http\Controllers\API;

use App\Events\ChatMessageWasReceived;
use App\Events\PublicChatMessageWasReceived;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ChatRoomController extends Controller
{

    public function publicSendMessage(Request $request)
    {
        $user = Auth::user();
        broadcast(new PublicChatMessageWasReceived($request->input('message', ''), $user))->toOthers();
        return response()->json(['code' => 200, 'message' => 'success']);
    }

}
