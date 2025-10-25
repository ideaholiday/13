<?php

namespace App\Support;

class HotelCityLookup
{
    /**
     * Resolve a CityId from provided inputs using a simple local mapping file if available.
     * Precedence: explicit $cityId -> mapping by cityCode -> mapping by cityName (case-insensitive)
     */
    public static function resolveCityId(?string $cityId, ?string $cityCode, ?string $cityName): ?string
    {
        if (!empty($cityId)) {
            return $cityId;
        }

        $map = self::loadMap();
        if (empty($map)) {
            return null;
        }

        // Normalize keys
        $codeKey = $cityCode ? strtoupper(trim($cityCode)) : null;
        $nameKey = $cityName ? strtolower(trim($cityName)) : null;

        if ($codeKey && isset($map['byCode'][$codeKey])) {
            return (string) $map['byCode'][$codeKey];
        }
        if ($nameKey && isset($map['byName'][$nameKey])) {
            return (string) $map['byName'][$nameKey];
        }

        return null;
    }

    /**
     * Map structure:
     * {
     *   "byCode": { "BOM": "394629" },
     *   "byName": { "mumbai": "394629" }
     * }
     */
    private static function loadMap(): array
    {
        $defaultJson = base_path('ih-backend/data/tbo_hotel_cities.json');
        $jsonPath = env('TBO_HOTEL_CITY_MAP_FILE', $defaultJson);
        $csvPath = env('TBO_HOTEL_CITY_CSV_FILE');

        $map = ['byCode' => [], 'byName' => []];

        // Load JSON first if available
        try {
            if (is_string($jsonPath) && file_exists($jsonPath)) {
                $raw = file_get_contents($jsonPath);
                $json = json_decode($raw, true);
                if (is_array($json)) {
                    $map['byCode'] = isset($json['byCode']) && is_array($json['byCode']) ? $json['byCode'] : [];
                    $map['byName'] = isset($json['byName']) && is_array($json['byName']) ? $json['byName'] : [];
                }
            }
        } catch (\Throwable $e) {
            // ignore JSON load errors
        }

        // Optionally merge CSV if configured
        try {
            if (is_string($csvPath) && file_exists($csvPath)) {
                $rows = self::readDelimitedFile($csvPath);
                if (!empty($rows)) {
                    [$headers, $data] = $rows;
                    [$cityIdIdx, $nameIdx, $codeIdx] = self::detectHeaderIndices($headers);
                    foreach ($data as $row) {
                        $id = self::pickIndex($row, $cityIdIdx);
                        if (!$id) { continue; }
                        $code3 = self::pickIndex($row, $codeIdx);
                        $name = self::pickIndex($row, $nameIdx);
                        if ($code3) { $map['byCode'][strtoupper(trim($code3))] = (string) $id; }
                        if ($name) { $map['byName'][strtolower(trim($name))] = (string) $id; }
                    }
                }
            }
        } catch (\Throwable $e) {
            // ignore CSV merge errors
        }

        return $map;
    }

    private static function readDelimitedFile(string $path): array
    {
        $content = @file_get_contents($path);
        if ($content === false) { return []; }
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        $lines = array_values(array_filter(explode("\n", $content), fn($l) => trim($l) !== ''));
        if (count($lines) === 0) { return []; }
        $header = $lines[0];
        $delims = [',', "\t", ';', '|'];
        $best = ','; $bestC = -1;
        foreach ($delims as $d) {
            $c = substr_count($header, $d);
            if ($c > $bestC) { $bestC = $c; $best = $d; }
        }
        $headers = str_getcsv($header, $best);
        $rows = [];
        for ($i=1; $i<count($lines); $i++) {
            $rows[] = str_getcsv($lines[$i], $best);
        }
        return [$headers, $rows];
    }

    private static function detectHeaderIndices(array $headers): array
    {
        $norm = array_map(fn($h) => strtolower(trim((string)$h)), $headers);
        $findAll = function(array $cands) use ($norm) {
            $out = [];
            foreach ($cands as $c) {
                $pos = array_search($c, $norm, true);
                if ($pos !== false) { $out[] = $pos; }
            }
            return $out;
        };
        $cityIdIdx = $findAll(['cityid','code','city code','tbo city id','tbo cityid','tbo code','city id','id']);
        $nameIdx = $findAll(['name','cityname','city name']);
        $codeIdx = $findAll(['citycode','iata','iata code','iata_code','code3','iata3']);
        return [$cityIdIdx, $nameIdx, $codeIdx];
    }

    private static function pickIndex(array $row, array $indices): ?string
    {
        foreach ($indices as $i) {
            if (isset($row[$i]) && trim((string)$row[$i]) !== '') {
                return (string) $row[$i];
            }
        }
        return null;
    }
}
