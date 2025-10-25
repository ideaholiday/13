<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Standardize API response format with data and meta
     */
    protected function paginatedResponse($data, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => now()->toISOString(),
                'version' => '1.0',
            ], $meta)
        ]);
    }

    /**
     * Create paginated response from Laravel paginator
     */
    protected function paginatedResponseFromPaginator(LengthAwarePaginator $paginator, array $additionalMeta = []): JsonResponse
    {
        $meta = [
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'pageSize' => $paginator->perPage(),
            'lastPage' => $paginator->lastPage(),
            'hasMorePages' => $paginator->hasMorePages(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];

        return $this->paginatedResponse($paginator->items(), array_merge($meta, $additionalMeta));
    }

    /**
     * Create paginated response from array data
     */
    protected function paginatedResponseFromArray(array $data, Request $request, int $total = null, array $additionalMeta = []): JsonResponse
    {
        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 25);
        
        // Limit page size to prevent abuse
        $pageSize = min($pageSize, 100);
        
        $total = $total ?? count($data);
        $offset = ($page - 1) * $pageSize;
        
        $paginatedData = array_slice($data, $offset, $pageSize);
        
        $meta = [
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
            'lastPage' => (int) ceil($total / $pageSize),
            'hasMorePages' => $page < ceil($total / $pageSize),
            'from' => $total > 0 ? $offset + 1 : null,
            'to' => $total > 0 ? min($offset + $pageSize, $total) : null,
        ];

        return $this->paginatedResponse($paginatedData, array_merge($meta, $additionalMeta));
    }

    /**
     * Create simple response with data and meta
     */
    protected function successResponse($data, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => now()->toISOString(),
                'version' => '1.0',
            ], $meta)
        ]);
    }

    /**
     * Create error response with standardized format
     */
    protected function errorResponse(string $message, int $status = 400, array $errors = [], array $meta = []): JsonResponse
    {
        return response()->json([
            'error' => [
                'message' => $message,
                'code' => $status,
                'errors' => $errors,
            ],
            'meta' => array_merge([
                'timestamp' => now()->toISOString(),
                'version' => '1.0',
            ], $meta)
        ], $status);
    }
}
