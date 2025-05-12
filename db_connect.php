<?php
// db_connect.php

$host = 'localhost';
$db   = 'quiz_db'; // Change to your DB name
$user = 'root';   // Change to your MySQL user
$pass = '';       // Change to your MySQL password

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
echo "Connected successfully";
?>
