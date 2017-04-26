<?php
require("db/db.php");

$buscar=$PDO->query("SELECT * from login");
$buscar->execute();
$lista=$buscar->fetchAll(PDO::FETCH_ASSOC);
var_dump($lista);