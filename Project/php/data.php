<?php 
    // MAMP: change document root of web server to project folder

    $username = "InfoVis"; 
    $password = "infovis";   
    $host = "localhost";
    $port = 8889; //MySQL port
    $database="avda";
    
    $server = mysql_connect("$host:$port", $username, $password);
    $connection = mysql_select_db($database, $server);

    $day = $_GET['day'];
    $limit = $_GET['limit'];
    $offset = $_GET['offset'];

    $myquery = "
        SELECT  Timestamp, id, type, X, Y
        FROM  $day
        ORDER BY Timestamp ASC
        LIMIT $offset,$limit
        ";
    $query = mysql_query($myquery);
    
    if ( ! $query ) {
        echo mysql_error();
        die;
    }
    
    $data = array();
    
    for ($x = 0; $x < mysql_num_rows($query); $x++) {
        $data[] = mysql_fetch_assoc($query);
    }
    
    echo json_encode($data);     
     
    mysql_close($server);
?>
