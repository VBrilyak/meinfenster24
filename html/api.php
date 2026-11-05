<?php
header('Content-Type: application/json');

$paths = [];

$envPath = getenv('SQLITE_DB_PATH');
if ($envPath) {
    $paths[] = $envPath;
}

$paths[] = __DIR__ . '/../db/rezensionen.sqlite';

$paths[] = '/var/www/html/html/db/rezensionen.sqlite';

$DB_PATH = null;
foreach ($paths as $p) {
    if ($p && is_readable($p) && file_exists($p)) {
        $DB_PATH = $p;
        break;
    }
}

if (!$DB_PATH) {
    http_response_code(500);
    echo json_encode([
        'error' => 'SQLite DB not found in known locations.',
        'tried' => $paths
    ]);
    exit;
}

try {
    $pdo = new PDO("sqlite:$DB_PATH");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
    SELECT
      r.r_id AS id,
      r.anzahl_sterne AS rating,
      r.name AS name,
      r.text AS text,
      (
        SELECT grafik
        FROM rezensionen_grafiken g
        WHERE g.r_id = r.r_id
        ORDER BY g.position ASC
        LIMIT 1
      ) AS image_path
    FROM rezensionen r
    WHERE r.active = 1
    ORDER BY r.r_id DESC
    LIMIT 100
  ";

    $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    $reviews = [];
    foreach ($rows as $row) {
        $reviews[] = [
            'id' => (int)($row['id'] ?? 0),
            'image' => $row['image_path'] ?? null,
            'rating' => (int)($row['rating'] ?? 0),
            'text' => $row['text'] ?? '',
            'name' => $row['name'] ?? ''
        ];
    }

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}