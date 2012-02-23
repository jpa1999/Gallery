<?PHP
	session_start();
	
	require_once "class.upload_0.30.php";
	require_once "folders.class.php";
	
	$images_file_path = '../xml/images.xml';
	$has_images_file = file_exists( $images_file_path );
	
		
	$folders = new Folders( "../xml/folders.xml" );
	
	//---------------------------------
	// FOLDERS
	//---------------------------------
	if( $_GET["q"] == "add_folder" ){
		$name = cleanString( $_GET["name"] );
		$description = cleanString( $_GET["description"] );
		$id = time( true );
		$folders->add( $id, $name, $description );
	}
	
	if( $_GET["q"] == "move_folder" ){
		$start = 	(int) cleanString( $_GET["start"] ) ;
		$end = 		(int) cleanString( $_GET["end"] )  ;
		$folders->move( $start,$end );
	}
	
	if( $_GET["q"] == "remove_folder" ){
		$id = cleanString( $_GET["id"] );
		$folders->remove( $id );
	}
	
	if( $_POST["q"] == "edit" ){
		
		if( $_POST["cat"] == "folder" ){
			$folders->edit();
		}
		if( $_POST["cat"] == "image" ){
		
		}

		
	}
	


	//---------------------------------
	// removeIMAGES
	//---------------------------------
	if( $_GET["q"] == "remove_image" ){
		
		$id = cleanString( $_GET["id"] );
		$xml = loadFileToSimpleXML( "images" );
		
		$result = $xml->xpath( "div[@id='" .$id. "']");
			
		if( count( $result ) > 0  ){
			$dom=dom_import_simplexml( $result[0] );
        	$dom->parentNode->removeChild($dom);
		}else{
			echo "No such node";
		}
			
		$xml->asXML( $images_file );
		
		forward("");
	}
	//---------------------------------
	// UPLOAD IMAGES
	//---------------------------------
	if( $_POST["q"] == "upload" ){
		
		if( !file_exists("../uploads/thumbs/")){
			exit("No thumbs folder");
		}
		$description = cleanString( $_POST['description'] );
		$folder_id = cleanString( $_POST['folder_id'] );
		
		$foo = new Upload( $_FILES['image_field'] );
		if ($foo->uploaded) {
			 
			//SETTINGS
		  	
		  	$foo->image_convert = "jpg";
		  	$foo->image_unsharp = true;
			$foo->jpeg_quality = 90;
			
			 // DO THUMB
			 // save uploaded image with no changes
		 	$foo->file_new_name_body = 'thumb';
			$foo->image_resize = true;
			$foo->image_x = 180;
			$foo->image_ratio_y = true;
			$foo->Process('../uploads/thumbs/');
			$thumb_file_name = $foo->file_dst_name_body;
			// DO MAIN IMAGE
			$foo->file_new_name_body = 'image';
			$foo->image_resize = true;
			$foo->image_x = 600;
			$foo->image_ratio_y = true;
			$foo->Process('../uploads/images/');
			$image_file_name = $foo->file_dst_name_body;
			
		  	if($foo->processed){ 
			
				$xml = loadFileToSimpleXML( "images" );
				
				$xml = simplexml_load_file('../xml/images.xml');
				$image = $xml->addChild('div');
				$image->addAttribute("class","image");
				$image->addAttribute("folder_id",$folder_id);
				$image->addAttribute("id",  time( true ) );
					
				$filename_element = $image->addChild("div", $thumb_file_name);
				$filename_element ->addAttribute("class","thumbname");
					
				$filename_element = $image->addChild("div", $image_file_name);
				$filename_element ->addAttribute("class","filename");
					
				$description_element = $image->addChild("div", $description);
				$description_element ->addAttribute("class","description");
					
					
					
				file_put_contents( $images_file, $xml->asXML() );
				
				$foo->Clean(); 
				
			}else{ 
				echo 'error : ' . $foo->error; 
			}

		}
		
		forward("");
		
	}
	
	function processUpload(){
	
	
	}
	
	// LOGIN AND LOGOUT
	if( $_GET["q"] == "login" ){
		
		$username 	= cleanString( $_GET['username'] );
		$password 	= md5( cleanString( $_GET['password'] ) );
		
		if( empty($username)  		){ forward( "#etusivu-error-no_login_username");  return; }
		if( empty($password)  		){ forward( "#etusivu-error-no_login_password");  return; }
		
		if( $username=="Rakennustieto" && $password== md5( "Visio2012!" ) ){
			initUserSession( -1,"Pääkäyttäjä" );
			forward("#etusivu-login-ready");
		}
		
		forward( "#etusivu-error-wrong_password-or_username"); 

		
	}
	
	if( $_GET["q"] == "logout" ){
		session_start();
		session_unset();
		session_destroy();
		$_SESSION = array();
		
		forward();
	}
	
	
	
	function initUserSession( $user_id, $username){
		$_SESSION['logged_in'] = true;
		$_SESSION['user_id'] = $user_id;
		$_SESSION['username'] = $username;
	}
	
	
	function forward( $url_fragment = "" ){
		header("Location: ../" .  $url_fragment );	
	}
	
	
	
	//----------------------------
	// OUTPUT
	//----------------------------
	
	echo $result_string;
	

	//----------------------------
	// FUNCTIONS
	//----------------------------

	function cleanString( $string ){
		$string = strip_tags( $string );
		return $string;
	}
	
	function mysql2json($mysql_result,$name){
    
		 $json="{\n\"$name\": [\n";
		 $field_names = array();
		 $fields = mysql_num_fields($mysql_result);
		 for($x=0;$x<$fields;$x++){
			  $field_name = mysql_fetch_field($mysql_result, $x);
			  if($field_name){
				   $field_names[$x]=$field_name->name;
			  }
		 }
		 $rows = mysql_num_rows($mysql_result);
		 for($x=0;$x<$rows;$x++){
			  $row = mysql_fetch_array($mysql_result);
			  $json.="{\n";
			  for($y=0;$y<count($field_names);$y++) {
				   $json.="\"$field_names[$y]\" :	\"$row[$y]\"";
				   if($y==count($field_names)-1){
						$json.="\n";
				   }
				   else{
						$json.=",\n";
				   }
			  }
			  if($x==$rows-1){
				   $json.="\n}\n";
			  }
			  else{
				   $json.="\n},\n";
			  }
		 }
		 //$json.="]\n};";
		 $json.="]\n}";
		 return($json);
	}

	function array_insert(&$array, $insert, $position = -1) {
		 $position = ($position == -1) ? (count($array)) : $position ;
		 if($position != (count($array))) {
			  $ta = $array;
			  for($i = $position; $i < (count($array)); $i++) {
				   if(!isset($array[$i])) {
						die(print_r($array, 1)."\r\nInvalid array: All keys must be numerical and in sequence.");
				   }
				   $tmp[$i+1] = $array[$i];
				   unset($ta[$i]);
			  }
			  $ta[$position] = $insert;
			  $array = $ta + $tmp;
			  //print_r($array);
		 } else {
			  $array[$position] = $insert;          
		 }
			  
		 ksort($array);
		 return true;
	}
?>