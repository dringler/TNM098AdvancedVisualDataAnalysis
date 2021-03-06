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
    $limit = (int)$_GET['limit'];
    $offset = (int)$_GET['offset'];
    $sampling = $_GET['sampling'];
    $samplingRate = (float)$_GET['samplingRate'];
    $allIDsChecked = $_GET['allIDsChecked'];
    $selectedID = (int)$_GET['selectedID'];
    $typeSelectionString = $_GET['typeSelectionString'];

    $myquery = "";

    //sampling
    if ($sampling == 'true') {
        if ($typeSelectionString == "") { //all types
            if ($allIDsChecked === 'true') {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE rand() <= $samplingRate
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            } else {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE id = $selectedID AND rand() <= $samplingRate
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            }
        } else { //type = movement or check-in
            if ($allIDsChecked === 'true') {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE type = '$typeSelectionString' AND rand() <= $samplingRate
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            } else {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE id = $selectedID AND type = '$typeSelectionString' AND rand() <= $samplingRate
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            }
        }

    } else { //no sampling
        if ($typeSelectionString == "") { //all types
            if ($allIDsChecked === 'true') {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            } else {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE id = $selectedID
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            }
        } else { //type = movement or check-in
            if ($allIDsChecked === 'true') {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE type = '$typeSelectionString'
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            } else {
                $myquery = "
                    SELECT  Timestamp, id, type, X, Y
                    FROM  $day
                    WHERE id = $selectedID AND type = '$typeSelectionString'
                    ORDER BY Timestamp ASC
                    LIMIT $offset,$limit
                    ";
            }
        }
    }

    

   
    
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
