<?php

  try{
		
		$PDO = new PDO("mysql:host=robb0377.publiccloud.com.br;port=3306;dbname=atadesig2_intranet", "atade_intranet", "A25FCD7F@!", array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
		$PDO->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );
	}catch (PDOException $e){
	print_r ($e -> getMessage());
		
	}
  
