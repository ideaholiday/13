<?php
/**
 * Direct TBO API test WITHOUT proxy
 */

$config = [
    'url' => 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
    'payload' => [
        'ClientId' => 'tboprod',
        'UserName' => 'LKOM258',
        'Password' => 'New@api/LKO$582',
        'EndUserIp' => '157.245.100.148',
    ],
];

echo "=== Direct TBO API Test (No Proxy) ===\n\n";
echo "URL: " . $config['url'] . "\n";
echo "Payload: " . json_encode($config['payload'], JSON_PRETTY_PRINT) . "\n\n";

try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $config['url'],
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($config['payload']),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);
    
    echo "Sending request...\n";
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    echo "\nHTTP Code: $httpCode\n";
    
    if ($error) {
        echo "cURL Error: $error\n\n";
    }
    
    if ($response) {
        $json = json_decode($response, true);
        echo "Response:\n";
        echo json_encode($json, JSON_PRETTY_PRINT) . "\n";
        
        if (isset($json['TokenId'])) {
            echo "\n✅ SUCCESS! Got token: " . substr($json['TokenId'], 0, 20) . "...\n";
        } else if (isset($json['Error'])) {
            echo "\n❌ Authentication failed\n";
            echo "Error Code: " . $json['Error']['ErrorCode'] . "\n";
            echo "Error Message: " . $json['Error']['ErrorMessage'] . "\n";
        }
    } else {
        echo "No response received\n";
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
