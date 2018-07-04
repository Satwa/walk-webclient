<?php
	header("Content-type:application/json");
	if(!isset($_GET['type'])){
		echo "{}";
	}else{
		$type = $_GET['type'];
        
		switch ($type) {
			case 'walk':
				if(isset($_POST["startLon"]) && isset($_POST["startLat"]) && isset($_POST["time"])){
 					echo callAPI("POST", "walk", $_POST);
				}else{
					echo "{}";
				}
				break;
			case 'walkid':
                if(isset($_GET['id'])){
                    echo callAPI("GET", "walk/".$_GET['id']);
                }else{
                    echo "{}";
                }
                break;
            case 'timeline':
                if(isset($_POST["startLon"]) && isset($_POST["startLat"])){
                    echo callAPI("POST", "walk/timeline", $_POST);
                }else{
                    echo "{}";
                }
                break;
            case 'saveWalk':
                if(isset($_GET['id'])){
                    echo callAPI("GET", "walk/".$_GET['id']."/share");
                }else{
                    echo "{}";
                }
                break;
            case 'illustration':
                $url = "http://api.walk.cafe:3012/";
                if(isset($_GET["wid"])){
                    if(file_get_contents($url."walk/".$_GET["wid"]."/picture")){
                        echo "{\"url\": \"".$url."walk/".$_GET["wid"]."/picture\"}";
                    }else{
                        echo "{\"url\": \"assets/no-file.jpg\"}";
                    }
                    //echo callAPI("GET", "walk/".$_GET["wid"]."/picture");
                }else {
                    echo "{\"url\": \"assets/no-file.jpg\"}";
                }
			default:
				# code...
				break;
		}
	}

    // if(file_get_contents("http://api.walk.cafe:3012/walk/370/picture")){
    //     echo "There's image";
    // }
    //echo(file_get_contents("http://api.walk.cafe:3012/walk/372/picture"));

function callAPI($method, $url, $data = false){
    $curl = curl_init();
    #$url = "http://localhost:8081/" . $url;
     $url = "http://api.walk.cafe:3012/" . $url;

    switch ($method){
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);

            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    //curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    //curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
}