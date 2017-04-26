<?php
require("db/db.php");

$requisicao=$_POST["request"];

switch ($requisicao) {
	case 'usuarios':
		$buscar=$PDO->query("SELECT * from login");
		$buscar->execute();
		$lista=$buscar->fetchAll(PDO::FETCH_ASSOC);
		return $lista;
		break;
	
	default:
		echo "error get request"; 
	break;
}

