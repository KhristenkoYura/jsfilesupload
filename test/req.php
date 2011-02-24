<?
header('Content-Type: text/plain; charset=utf-8');
sleep(rand(1,3));
//sleep(20);
print_r($_REQUEST);
print_r($_FILES);
//copy($_FILES['files']['tmp_name'], 'image.jpg');

