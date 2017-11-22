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
			default:
				# code...
				break;
		}
	}


function callAPI($method, $url, $data = false){
    $curl = curl_init();
    $url = "http://localhost:8081/" . $url;
    //$url = "http://api.joshua.ovh:3012/" . $url;

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