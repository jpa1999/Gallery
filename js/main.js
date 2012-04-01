var logged_in = false

var start_index
var end_index
var folders_loaded = false
var admin_checked = false

var loaded_images = 0

$(document).ready(documentReady)

function documentReady() {

	$.template("folderItem", 
	
	"<li class='folder item' id='{{=id}}'>" 
	+ "<div class='thumb_holder'>"
		+ "<a class='thumb' href='#images-{{=id}}-{{=name}}'><img src='{{=folder_thumb_url}}'></a>" 
		+ "<div class='clear'></div>"
	+ "</div>"
	+ "<div class='edit name' id='{{=id}}'><a href='#images-{{=id}}-{{=name}}'>{{=name}}</a></div>" 
	+ "<div class='clear'></div></li>");
	
	// Folder header
	$.template("folderHeader", "<div class='left'><a href='index.html'>Kansiot  &nbsp; &#9654; &nbsp; </a> <span class='edit name' id='{{=id}}'>{{=name}}</span></div>"
												+"<div><a class='right danger admin' href='javascript:removeFolder({{=id}})'>Poista</a>"
												+"</div><div class='clear'></div>")
	
	// Image item
	$.template("imageListItem","<li class='image item' id='{{=id}}'>"
	+ "<div class='thumb_holder'>"
		+"<a class='image_item' href='uploads/images/{{=filename}}.jpg' title='{{=image_description}}'><img src='uploads/thumbs/{{=thumbname}}.jpg' /></a>"
	+ "</div>"
	+ "<div class='edit name' id='{{=id}}'>{{=image_description}}</div>" 
	+"<div class='remove admin'><a class='danger' href='api/?q=remove_image&id={{=id}}'>Poista</a></div>"
	+"</li>")
	
	// Add folder
	add_folder_form_template = 
	'<div class="folders_admin admin tools box">'
		+ '<div class="folders container">'
			+ '<form action="api" method="get">'
				+ 'Lisää kuvakansio:'
				+ '<input type="text" name="name" placeholder="Kansion nimi"/>'
				+ '<input type="text" name="description" placeholder="Kansion kuvaus" />'
				+ '<input type="hidden" name="q" value="add_folder" />'
				+ '<button type="submit">Lisää uusi kansio</button>'
			+ '</form>'
		+ '</div>'
	+ '</div>'
	
	// Add image 
	add_image_form_template = 
		'<div class="add_images admin tools box">'
			+ '<form enctype="multipart/form-data" method="post" action="api/index.php">'
				+'Lisää kuva:'
				+ '<input type="text" class="description" name="description" placeholder="Kuvan otsikko">'
				+ '<input type="hidden" name="folder_id" value="">'
				+ '<input id="image_field" type="file" size="32" name="image_field" value="">'
				+ '<input type="hidden" name="q" value="upload" />'
				+ '<input type="submit" name="Submit" value="upload">  '
			+ '</form>'
		 + ' </div>' 
	
	addHashChangeListener()
	initView()
	initButtons()
	
	checkLogin()
}


/*------------------------------*/
/* On All Data Loaded start rendering    */
/*------------------------------*/
onDataLoaded = function(){
	if( folders_loaded && images_loaded && admin_checked ){
		( on_folders )? showFolders() : showImages();
	}
}

initView = function() {
	processHash()
	changeViewByHash()
}
changeViewByHash = function() {
	
	resetViews()
	tryShowingAdminTools()
	
	if(hash_target == "folders" || hash_target == ""  || hash_target == "login") {
		showFoldersView()
	}
	if( hash_target == "login") {
		showLogin()
	}
	if(hash_target == "images") {
		showImagesView()
	}
}
//-----------------
// Admin tools
//-----------------
tryShowingAdminTools = function(){
	
	if( logged_in ){
		$(".admin").show()
		//$( ".folder_select" ).vall( hash_status ) 
		
		showLogout()
	}
}
tryHidingAdminTools = function(){
	$(".admin").hide()
}
//-----------------
// Login & Logout
//-----------------
showLogin = function(){
	$(".login").show()
	$(".login button").off("click")
	$(".login button").on("click", function(){ sendLogin() } )
}
sendLogin = function(){
	alert("SEnd")
	username = $(".login input[name=username]").val()
	password = $(".login input[name=password]").val()
	$.get("api/?q=login&username=" +username+ "&password=" + password, onLogin )
}
onLogin = function( data ){
	if(data=="true"){
		logged_in = true
		$(".login").hide()
		showLogout()
		tryShowingAdminTools()
	}else{
		
	}
}
showLogout = function(){
	$(".logout").show()
	$("button.logout").off("click")
	$("button.logout").on("click", function(){ sendLogout() } )
}
sendLogout = function(){
	$(".logout").hide()
	$.get("api/?q=logout", onLogout )
	logged_in = false
	
	tryHidingAdminTools()
}
onLogout = function( data ){
	//showLogin()
}
checkLogin = function(){
	$.get("api/?q=check_login", onCheckLogin )
}
onCheckLogin = function( data ){
	admin_checked = true;
	logged_in = (data=="true")? true : false;
	if( logged_in) tryShowingAdminTools()
	
	onDataLoaded()
}

//--------------
// ShowFolders
//--------------
showFoldersView = function() {
	on_folders = true
	on_images = false
	initFolders()
	initImages()
}
showImagesView = function() {
	
	on_images = true;
	on_folders = false;
	initFolders()
	initImages()
	
}
resetViews = function() {
	$(".images.box").html( "<div class='folder_header'></div>" )
	$(".images.box").append( 	add_image_form_template )
	$(".images.box").append( "<ul class='images_list'></ul>" )
	$(".images.box").append( "</ul><div class='clear'></div>" )
	
	$(".folders.box").html(  add_folder_form_template  )
	$(".folders.box").append( '<ul class="folders_list"></ul>' )
	$(".folders.box").append( '<div class="clear"></div>' )
}

initButtons = function(){
	
	
}
/*------------------------------*/
/* Hash change                  */
/*------------------------------*/
addHashChangeListener = function() {
	var parent = this
	jQuery(window).hashchange(function() {
		parent.onHashChange()
	});
}
onHashChange = function() {
	processHash()
	changeViewByHash()
}


/*------------------------------*/
/* Images                 */
/*------------------------------*/
initImages = function() {
	images_loaded = false
	parent = this
	$(".images_data").load("xml/images.xml?random=" + Math.random(), function(){ parent.onImagesDataLoaded() } )
	$(".folders.box").hide()
	$(".images.box").show()
	
}
onImagesDataLoaded = function(){
	images_loaded = true
	onDataLoaded()
	//showImages()
}
showImages = function(){
	//if( folders_loaded && images_loaded ){
		onImagesLoaded()
		
		$(".add_images input[ name='folder_id' ]").val(  hash_status )
	//}
}
onImagesLoaded = function() {
	
	showFolderHead()
	
	$('.image[folder_id="' + hash_status + '"]').each( onImageLoad )
	
	//Set sortable for images
	$(".images_list").sortable({
		start : function(event, ui) {
			start_index = ui.item.index()
		},
		update : function(event, ui) {
			end_index = ui.item.index();
			onImageIndexChange()
		},
		cursor : 'move'

	});
	//Set jeditable for image descriptions
	if( logged_in ){
		$('.images_list .edit.name').editable('api/', {
			submitdata : {
				q : "edit",
				cat : "image",
				attr : "description"
			},
			indicator : "Saving...",
			complete : function (xhr, textStatus){ alert("kukkuu") }
		});
	}else{
		alert("Not logged in")
	}
	
	$(".images_list").disableSelection();
	
	$('a.image_item').lightBox();

}
onImageIndexChange = function() {
	$.get("api/?q=move_image&folder_id=" + hash_status + "&start=" + start_index + "&end=" + end_index, function(data) {  /* alert( data ) */ })
}
onImageLoad = function(index, item) {
	
	var thumbname = $(item).find(".thumbname").html()
	var filename = $(item).find(".filename").html()
	var image_description = $(item).find(".description").html()
	
	var id = $(item).attr("id")
		
	var data = [{
		image_description : image_description,
		thumbname : thumbname,
		filename : filename,
		id : id
	}]

	$(".images_list").append( $.render(data, "imageListItem") )
	

	
	
}
/*-----------------------------*/
/* Folders                     */
/*-----------------------------*/
showFolderHead = function() {
	
	var data = [{
		name : $(".folders_data .folders #" + hash_status + " .name" ).html(),
		id : hash_status
	}]
	$(".folder_header").append($.render(data, "folderHeader"))
	$('.folder_header .edit.name').editable('api/', {
		submitdata : {
			q : "edit",
			cat : "folder",
			attr : "name"
		},
		indicator : "Saving...",
		complete : function (xhr, textStatus){ alert("kukkuu") }
	});

}
initFolders = function() {
	folders_loaded = false
	var parent = this
	$(".folders_data").load("xml/folders.xml?random=" + Math.random(), function(){ parent.onFoldersDataLoaded() }  )
}

onFoldersDataLoaded = function(){	
	folders_loaded = true
	onDataLoaded()	
}


showFolders = function() {
	
	$(".folders.box").show()
	$(".images.box").hide()
	
	$(".folder").each(onFolder)
	$(".folders_list").sortable({
		start : function(event, ui) {
			start_index = ui.item.index()
		},
		update : function(event, ui) {
			end_index = ui.item.index();
			onFolderIndexChange()
		},
		cursor : 'move'

	});
	$(".folders_list").disableSelection();

}
onFolderIndexChange = function() {
	$.get("api/?q=move_folder&start=" + start_index + "&end=" + end_index, function(data) {
	})
}
onFolder = function(index, element) {

	//var name = $( element ).find(".name").html()
	var folder_id = $( element ).attr("id")
	
	query = ".images_data .image[folder_id='" + folder_id + "']"
	folder_thumb_url = "uploads/thumbs/" + $( query ).find('.thumbname').html() + ".jpg"
	 
	var data = [{
		name : $(element).find(".name").html(),
		folder_thumb_url : folder_thumb_url,
		id : $(element).attr("id")
	}]

	$(".folder_select").append("<option value=" + data[0].id + ">" + data[0].name + "</option>")
	$(".folders_list").append($.render(data, "folderItem"))

}


removeFolder= function( folder_id ){
	alert("Folder_id" + folder_id )
	confirm_folder_remove = confirm("Haluatko poistaa koko kansion numero: " + folder_id + "?");
	if( confirm_folder_remove ){
		document.location(  "api/?q=remove_folder&id=" + folder_id   )
	}
	
}
/*---------------------------------*/
/* Hash                            */
/*---------------------------------*/
function processHash() {
	if(window.location.hash != false) {
		hash = window.location.hash.substring(1)
		hash_array = hash.split("-")
		hash_target = hash_array[0]
		hash_status = hash_array[1]
		hash_parameter = hash_array[2]
	} else {
		hash_array = null
		hash_target = ""
		hash_status = ""
		hash_parameter = ""
	}
}

/*---------------------------------*/
/* Hash                            */
/*---------------------------------*/