<?php

$test = [];
for ($i = 0; $i < rand(1,5); $i++) {
    $test[] = ["nr"=>rand()];   
} 
$test[] = ["nr"=>30];   
$test[] = ["nr"=>40];   
$test[] = ["nr"=>100];   


for ($i = 0; $i < 400; $i++) {
    $test[] = ["nr"=>$i*2];   
}
$test[] = ["nr"=>80];   
for ($i = 0; $i < rand(1,5); $i++) {
    $test[] = ["nr"=>rand()];   
}  
echo json_encode(["test"=>$test]);
