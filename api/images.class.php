<?PHP

require_once "simple_xml.class.php";

class Images{

	var $folders_file_path;
	var $has_folders_file;
	
	function Images( $file_path ){
    	$this->file_path = $file_path;
		$this->load();
	}
	//----------------
	// Load
	//----------------
	private function load(){
		$this->simple_xml = new SimpleXML();
		if( $this->simple_xml->loadFileToSimpleXML( $this->file_path )  ){
			$this->xml = $this->simple_xml->xml;
		}else{
			exit ("No folders file");	
		}
	}
	/*public function add( $id, $name, $description ){
		
		$folder = $this->xml->addChild( "div" );
		$folder->addAttribute( "class", "folder" );
		$folder->addAttribute( "id", $id );
			
		$name_node = $folder->addChild("div", $name );
		$name_node->addAttribute( "class", "name" );
			
		$description_node = $folder->addChild("div", $description );
		$description_node->addAttribute( "class", "description" );

		$this->save();
		
		forward("#images-" .  );	
	
	}*/
	public function edit(){
		
		$this->simple_xml->edit( "div[@id='" . $_POST['id'] . "']/div[@class='" . $_POST['attr'] . "']",  $_POST['value']);
		
		//$this->simple_xml->printR();
		$this->save();
		echo $_POST['value'];
		
		//forward("#images-" . );	
		
	}
	public function move( $start, $end, $folder_id ){
		
		echo print_r( $this->simple_xml->xml ) ;
		
		echo"###################################";
		//Split folder images and other images to two arrays
		$nodes = $this->xml->xpath( "div[@class='image'][@folder_id='" . $folder_id . "']");
		$other_nodes = $this->xml->xpath( "div[@class='image'][@folder_id!='" . $folder_id . "']");
		//Move image
		$nodes = $this->simple_xml->moveArrayItem( $nodes, $start, $end );
		//Combine arrays back together
		$combined_array = array_merge($nodes, $other_nodes );
		//Convert to xml
		$this->xml = simplexml_import_dom( $this->foldersArrayToXML( $combined_array ) );
		
		$this->simple_xml->xml = $this->xml;
		echo print_r( $this->simple_xml->xml ) ;
		$this->save();
	}
	
	public function remove( $id ){
		$this->simple_xml->remove( "div[@id='" .$id. "']" );
		$this->save();
		//forward("");	
		
		/*
		 * 	$id = cleanString( $_GET["id"] );
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
		 
		 */
	}
	//-----------------
	// Upload
	//-----------------
	public function upload(){
		
		if( !file_exists("../uploads")){
			mkdir("../uploads/");
		}
		if( !file_exists("../uploads/thumbs")){
			mkdir("../uploads/thumbs");
		}
		
		$description = cleanString( $_POST['description'] );
		$folder_id = cleanString( $_POST['folder_id'] );
		
		$foo = new Upload( $_FILES['image_field'] );
		if ($foo->uploaded) {
			 
			 
			 // BACKUP ORIGINAL
			$foo->Process('../uploads/originals/');
			 
			//SETTINGS
		  	
		  	$foo->image_convert = "jpg";
		  	$foo->image_unsharp = true;
			$foo->jpeg_quality = 90;
			
			
			
			$thumb_file_name = $foo->file_dst_name_body;
			// DO THUMB
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
			$foo->image_x = 500;
			$foo->image_ratio = true;
			$foo->Process('../uploads/images/');
			$image_file_name = $foo->file_dst_name_body;
			
		  	if($foo->processed){ 
			
				
				$image = $this->xml->addChild('div');
				$image->addAttribute("class","image");
				$image->addAttribute("folder_id",$folder_id);
				$image->addAttribute("id",  time( true ) );
					
				$filename_element = $image->addChild("div", $thumb_file_name);
				$filename_element ->addAttribute("class","thumbname");
					
				$filename_element = $image->addChild("div", $image_file_name);
				$filename_element ->addAttribute("class","filename");
					
				$description_element = $image->addChild("div", $description);
				$description_element ->addAttribute("class","description");
					
					
				$this->save();
				
				$foo->Clean(); 
				
			}else{ 
				echo 'error : ' . $foo->error; 
			}

		}
		
		forward("#images-" . $folder_id );
	}
	//-----------------
	// Save
	//-----------------
	private function save(){
		$this->simple_xml->save();
	}
	
	function foldersArrayToXML( $array ){
		
		$dom = new DOMDocument('1.0');
        $root = $dom->createElement('div');
		
		//Add attribute 
		$folders_attribute = $dom->createAttribute("class");
		$folders_attribute->value = "folders";
		$root->appendChild( $folders_attribute );
		
		$root = $dom->appendChild($root);
		
		foreach( $array as $folder_item ){
			$dom_item = dom_import_simplexml( $folder_item );
			$node = $dom->importNode($dom_item, true);
			$dom->documentElement->appendChild($node);
		}
		
		return $dom;
		
	}
}


?>