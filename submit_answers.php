<?php
header('Content-Type: application/json');
require 'db_connect.php';

$questions = array();

$qsql = "SELECT * FROM questions";
$qres = $conn->query($qsql);

while ($row = $qres->fetch_assoc()) {
    $qid = $row['id'];
    $osql = "SELECT id, option_text FROM options WHERE question_id=$qid";
    $ores = $conn->query($osql);
    $options = array();
    while ($orow = $ores->fetch_assoc()) {
        $options[] = array(
            'id' => $orow['id'],
            'text' => $orow['option_text'],
        );
    }
    $questions[] = array(
        'id' => $row['id'],
        'text' => $row['question_text'],
        'options' => $options,
    );
}

echo json_encode(['questions' => $questions]);
?>
