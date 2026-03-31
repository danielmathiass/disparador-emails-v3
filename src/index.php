<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

var_dump(file_get_contents('php://input'));     

exit();