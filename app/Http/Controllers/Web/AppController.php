<?php

namespace app\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class AppController extends Controller
{
    public function getApp()
    {
        return view('app');
    }

    public function getLogout()
    {
        Auth::logout();
        return redirect('/');
    }
}
