<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\SeoTextController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/robots.txt', [SeoTextController::class, 'robots']);
Route::get('/humans.txt', [SeoTextController::class, 'humans']);

Route::get('/{slug}', [PageController::class, 'show'])
    ->where('slug', '^(?!admin$)(?!login$)(?!register$)(?!up$)[A-Za-z0-9-]+$')
    ->name('pages.show');
