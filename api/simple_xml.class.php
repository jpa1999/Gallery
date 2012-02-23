<?PHP
	class SimpleXML{
	
		function SimpleXML(){
			
		}
		
		public function loadFileToSimpleXML( $file_path ){
			
			$this->file_path = $file_path;
			
			if( file_exists( $file_path ) ){ 
				$this->xml = simplexml_load_file( $file_path );
				return true; 
			}else{  
				return false; 
			}
			
		}
		
		public function remove( $xpath ){
			$result = $this->xml->xpath( $xpath );
			if( count( $result ) > 0  ){
				$dom = dom_import_simplexml( $result[0] );
				$dom->parentNode->removeChild($dom);
			}else{
				echo "No such node";
			}
		}
		
		public function edit( $xpath, $value ){
			$result = $this->xml->xpath( $xpath );
			if( count( $result ) > 0  ){
				$dom = dom_import_simplexml( $result[0] );
				$dom->nodeValue = $value;
			}else{
				echo "No such node";
			}
		}
		
		public function printR(){
			print_r( $this->xml->asXML() );
		}
		public function save(){
			$this->xml->asXML( $this->file_path );	
		}
		
		public function moveArrayItem( $target_array, $old_index, $new_index ){
	
			while ( $old_index < 0 ) {
				$old_index += count( $target_array );
			}
			while ( $new_index < 0 ) {
				$new_index += count( $target_array );
			}
			if ( $new_index >= count( $target_array ) ) {
				$k = $new_index - count( $target_array );
				while (($k--) + 1) {
					array_push( $target_array,null );
				}
			}
			
			$temp_item = array_splice( $target_array, $old_index, 1 );
			$temp_item_2 = array_splice( $target_array, $new_index, 0, $temp_item ); 
	
			return $target_array; // for testing purposes
		}
	}
?>