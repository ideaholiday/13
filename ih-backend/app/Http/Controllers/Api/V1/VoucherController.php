<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VoucherController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Voucher generation not implemented'], 501);
    }

    public function download(string $bookingId): JsonResponse
    {
        return response()->json(['message' => 'Voucher download not implemented'], 501);
    }

    public function sendEmail(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Voucher email not implemented'], 501);
    }
}
