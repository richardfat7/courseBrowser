<?php
    $url=$_GET['url'];
    if($url!="")
        echo file_get_contents($url);
?>