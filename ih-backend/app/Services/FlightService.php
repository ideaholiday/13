public function search(array $p): array {
  if (env('USE_MOCK', true) === true) { /*...existing mock...*/ }

  $body = [
    "TripType" => "O", // ONE_WAY
    "Origin" => strtoupper($p['origin'] ?? 'DEL'),
    "Destination" => strtoupper($p['destination'] ?? 'BOM'),
    "PreferredDepartureTime" => $p['departDate'] ?? date('Y-m-d'),
    "Adults" => (int)($p['adults'] ?? 1),
    "Children" => (int)($p['children'] ?? 0),
    "Infants" => (int)($p['infants'] ?? 0),
    "CabinClass" => "E",
    "EndUserIp" => env('TBO_ENDUSER_IP','127.0.0.1'),
    "ClientId" => env('TBO_CLIENT_ID'),
    "UserName" => env('TBO_USERNAME'),
    "Password" => env('TBO_PASSWORD'),
  ];

  $client = new \GuzzleHttp\Client(['base_uri' => env('TBO_FLIGHT_BASE')]);
  $res = $client->post('/api/flight/Search', ['json' => $body, 'timeout' => 30]);
  $json = json_decode((string)$res->getBody(), true);

  // Map TBO response → your UI schema
  $results = [];
  foreach (($json['Response'] ?? []) as $it) {
    $results[] = [
      "resultId" => $it['ResultID'] ?? uniqid('res_'),
      "offerId"  => $it['OfferID'] ?? uniqid('off_'),
      "from"     => $body['Origin'],
      "to"       => $body['Destination'],
      "price"    => (float)($it['Fare'] ?? 0),
      "carrier"  => $it['Carrier'] ?? 'XX',
      "depart"   => $body['PreferredDepartureTime'],
    ];
  }
  return ["requestId" => uniqid("req_"), "results" => $results];
}
