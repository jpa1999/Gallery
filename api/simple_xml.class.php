<?PHP
	class SimpleXML{
	
		function SimpleXML(){
			
		}
		
		public function loadFileToSimpleXML( $file_path ){
			
			$this->file_path = $file_path;
			$this->createBackupFilename();
			
			
			if( file_exists( $file_path ) ){ 
				$this->xml = simplexml_load_file( $file_path );
				return true; 
			}else{  
				return false; 
			}
			
		}
		
		public function createBackupFilename(){
			//Do backup filename 
			$backup_file_path_array = explode( "/", $this->file_path );
			$filename = array_pop(  $backup_file_path_array );
			array_push( $backup_file_path_array, "backup" );
			array_push( $backup_file_path_array, date("Y_m_d_H-i-s")."_". $filename );
			$this->backup_file_path = implode( "/", $backup_file_path_array  );
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
			
			//echo "S EDIT";
			//$this->printR();
		}
		
		public function printR(){
			print_r( $this->xml->asXML() );
		}
		public function save(){
			
			//echo "Saving!: " . $this->printR();
			$this->xml->asXML( $this->file_path );	
			//Do backup
			$this->xml->asXML( $this->backup_file_path );	
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