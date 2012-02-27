<?PHP

require_once "simple_xml.class.php";

class Folders{

	var $folders_file_path;
	var $has_folders_file;
	
	function Folders( $file_path ){
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
	public function add( $id, $name, $description ){
		
		$folder = $this->xml->addChild( "div" );
		$folder->addAttribute( "class", "folder" );
		$folder->addAttribute( "id", $id );
			
		$name_node = $folder->addChild("div", $name );
		$name_node->addAttribute( "class", "name" );
			
		$description_node = $folder->addChild("div", $description );
		$description_node->addAttribute( "class", "description" );

		$this->save();
		
		forward("");	
	
	}
	public function edit(){
		
		$this->simple_xml->edit( "div[@id='" . $_POST['id'] . "']/div[@class='" . $_POST['attr'] . "']",  $_POST['value']);
		$this->save();
		echo $_POST['value'];
		
		//forward("");	
		
	}
	public function move( $start, $end ){
		
		$nodes = $this->xml->xpath( "div[@class='folder']");
		$nodes = $this->xml->moveArrayItem( $nodes, $start, $end );
		$this->xml = simplexml_import_dom( $this->foldersArrayToXML($nodes) );
		$this->save();
	}
	
	public function remove( $id ){
		$this->simple_xml->remove( "div[@id='" .$id. "']" );
		$this->save();
		forward("");	
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