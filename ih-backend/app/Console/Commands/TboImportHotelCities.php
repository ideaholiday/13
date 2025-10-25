<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TboImportHotelCities extends Command
{
    protected $signature = 'tbo:import-hotel-cities {file : Path to CSV/TSV/TXT file} {--out= : Output JSON path (defaults to TBO_HOTEL_CITY_MAP_FILE or ih-backend/data/tbo_hotel_cities.json)}';
    protected $description = 'Import TBO Hotel CityId mapping from CSV/TSV/TXT into JSON (byCode/byName)';

    public function handle(): int
    {
        $file = $this->argument('file');
        if (!is_string($file) || !file_exists($file)) {
            $this->error('Input file not found: '.$file);
            return self::FAILURE;
        }

        $out = $this->option('out');
        if (!$out) {
            $defaultPath = base_path('ih-backend/data/tbo_hotel_cities.json');
            $out = env('TBO_HOTEL_CITY_MAP_FILE', $defaultPath);
        }

        [$rows, $headers] = $this->readDelimitedFile($file);
        if (empty($rows)) {
            $this->error('No rows found in input file.');
            return self::FAILURE;
        }

        $hmap = $this->normalizeHeaders($headers);
        $byCode = [];
        $byName = [];

        foreach ($rows as $row) {
            $data = $this->rowAssoc($row, $headers);
            $cityId = $this->pick($data, $hmap['cityId']); // numeric string like 394603
            $name = $this->pick($data, $hmap['cityName']);
            $code3 = $this->pick($data, $hmap['iata3']); // BOM, DEL, etc.

            if ($cityId) {
                if ($code3) {
                    $byCode[strtoupper(trim($code3))] = (string) $cityId;
                }
                if ($name) {
                    $byName[strtolower(trim($name))] = (string) $cityId;
                }
            }
        }

        $map = [ 'byCode' => $byCode, 'byName' => $byName ];

        if (!is_dir(dirname($out))) {
            @mkdir(dirname($out), 0777, true);
        }
        file_put_contents($out, json_encode($map, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        $this->info('Wrote city map: '.$out);
        $this->info('byCode='.count($byCode).' | byName='.count($byName));
        return self::SUCCESS;
    }

    private function readDelimitedFile(string $file): array
    {
        $content = file_get_contents($file) ?: '';
        // Normalize newlines
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        $lines = array_values(array_filter(explode("\n", $content), fn($l) => trim($l) !== ''));
        if (empty($lines)) { return [[], []]; }

        // Detect delimiter by frequency
        $delims = [',', "\t", ';', '|'];
        $bestDelim = ',';
        $bestCount = -1;
        foreach ($delims as $d) {
            $c = substr_count($lines[0], $d);
            if ($c > $bestCount) { $bestCount = $c; $bestDelim = $d; }
        }

        $headers = $this->splitLine($lines[0], $bestDelim);
        $rows = [];
        for ($i = 1; $i < count($lines); $i++) {
            $rows[] = $this->splitLine($lines[$i], $bestDelim);
        }
        return [$rows, $headers];
    }

    private function splitLine(string $line, string $delim): array
    {
        // Simple CSV/TSV split with quoted-field support
        $out = [];
        $len = strlen($line);
        $buf = '';
        $inQ = false;
        for ($i=0; $i<$len; $i++) {
            $ch = $line[$i];
            if ($ch === '"') {
                $inQ = !$inQ;
                continue;
            }
            if (!$inQ && $ch === $delim) {
                $out[] = $buf; $buf = '';
            } else {
                $buf .= $ch;
            }
        }
        $out[] = $buf;
        return array_map(fn($v) => trim($v), $out);
    }

    private function normalizeHeaders(array $headers): array
    {
        $norm = array_map(fn($h) => strtolower(trim($h)), $headers);
        // Candidates
        $cityIdKeys = ['cityid','code','city code','tbo city id','tbo cityid','tbo code'];
        $nameKeys = ['name','cityname','city name'];
        $iataKeys = ['citycode','iata','iata code','iata_code','code3'];

        $mapFind = function(array $cands) use ($norm) {
            $idx = [];
            foreach ($cands as $cand) {
                $pos = array_search($cand, $norm, true);
                if ($pos !== false) $idx[] = $pos;
            }
            return $idx;
        };

        return [
            'cityId' => $mapFind($cityIdKeys),
            'cityName' => $mapFind($nameKeys),
            'iata3' => $mapFind($iataKeys),
        ];
    }

    private function rowAssoc(array $row, array $headers): array
    {
        $assoc = [];
        foreach ($headers as $i => $h) {
            $assoc[$h] = $row[$i] ?? null;
        }
        return $assoc;
    }

    private function pick(array $row, array $indices): ?string
    {
        foreach ($indices as $i) {
            $val = $row[array_keys($row)[$i]] ?? null;
            if ($val !== null && $val !== '') return (string) $val;
        }
        return null;
    }
}
