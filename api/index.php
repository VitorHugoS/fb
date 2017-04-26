<?php
require("db/db.php");

$requisicao=$_POST["chamada"];

switch ($requisicao) {
	case 'usuarios':
		$buscar=$PDO->query("SELECT * from login");
		$buscar->execute();
		$lista=$buscar->fetchAll(PDO::FETCH_ASSOC);
		return json_encode($lista);
		break;
	
	default:
		return "error get request"; 
	break;
}

