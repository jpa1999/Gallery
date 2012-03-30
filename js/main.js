var logged_in = false

var start_index
var end_index
var folders_loaded = false

var loaded_images = 0

$(document).ready(documentReady)

function documentReady() {

	$.template("folderItem", 
	
	"<li class='folder item' id='{{=id}}'>" 
	+ "<a class='thumb' href='#images-{{=id}}-{{=name}}'><img src='{{=folder_thumb_url}}'></a>" 
	+ "<div class='clear'></div>"
	+ "<div class='edit name' id='{{=id}}'>{{=name}}</div>" 
	+ "<div class='clear'></div></li>");

	$.template("folderHeader", "<div class='edit name' id='{{=id}}'>{{=name}}</div><div><a class='right' href='api/?q=remove_folder&id={{=id}}'>Poista</a></div><div class='clear'></div>")

	$.template("imageListItem","<li class='image item' id='{{=id}}'>"
	+"<a class='image_item' href='uploads/images/{{=filename}}.jpg'><img src='uploads/thumbs/{{=thumbname}}.jpg' /></a>"
	+"<div class='remove'><a href='api/?q=remove_image&id={{=id}}'>Poista</a></div>"
	+"</li>")
	
	addHashChangeListener()
	initView()
	initButtons()
	
	checkLogin()
}

initView = function() {
	processHash()
	changeViewByHash()
}
changeViewByHash = function() {
	
	resetViews()

	if( logged_in ) $(".admin").show()
	
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
// Login & Logout
//-----------------
showLogin = function(){
	$(".login").show()
	$(".login button").off("click")
	$(".login button").on("click", function(){ sendLogin() } )
}
sendLogin = function(){
	username = $(".login input[name=username]").val()
	password = $(".login input[name=password]").val()
	$.get("api/?q=login&username=" +username+ "&password=" + password, onLogin )
}
onLogin = function( data ){
	if(data=="true"){
		logged_in = true
		$(".login").hide()
		showLogout()
	}else{
		
	}
}
showLogout = function(){
	$(".logout").show()
	$(".logout button").off("click")
	$(".logout button").on("click", function(){ sendLogout() } )
}
sendLogout = function(){
	$(".logout").hide()
	$.get("api/?q=logout", onLogout )
	logged_in = false
}
onLogout = function( data ){
	alert( "Uloskirjautuminen onnistui" )
	showLogin()
}
checkLogin = function(){
	$.get("api/?q=check_login", onCheckLogin )
}
onCheckLogin = function( data ){
	logged_in = (data=="true")? true : false;
	alert("on check login " + logged_in)
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
	$(".images.box").html( "<div class='folder_header'></div><ul class='images_list'></ul><div class='clear'></div>" )
	$(".folders_list").html("")
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
/* onGeneralDataLoaded          */
/*------------------------------*/
onDataLoaded = function(){
	if( folders_loaded && images_loaded ){
		( on_folders )? showFolders() : showImages();
	}
}
/*------------------------------*/
/* Images                 */
/*------------------------------*/
initImages = function() {
	images_loaded = false
	parent = this
	$(".images_data").load("xml/images.xml?random=" + Math.random(), function(){ parent.onImagesDataLoaded() } )
}
onImagesDataLoaded = function(){
	images_loaded = true
	onDataLoaded()
	//showImages()
}
showImages = function(){
	//if( folders_loaded && images_loaded ){
		onImagesLoaded()
	//}
}
onImagesLoaded = function() {
	
	alert("Onimages loaded")
	showFolderHead()
	
	$('.image[folder_id="' + hash_status + '"]').each(onImageLoad)
	
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
	$(".images_list").disableSelection();
	
	$('a.image_item').lightBox();

}
onImageIndexChange = function() {
	$.get("api/?q=move_image&folder_id=" + hash_status + "&start=" + start_index + "&end=" + end_index, function(data) { alert( data) })
}
onImageLoad = function(index, item) {
	
	alert("sadasdasd")
	var thumbname = $(item).find(".thumbname").html()
	var filename = $(item).find(".filename").html()

	var id = $(item).attr("id")
	
	var data = [{
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
	
	query = ".images_data .image[folder_id='" + folder_id + "'].find('.thumbname')"
	folder_thumb_url = "uploads/thumbs/" + $( query ).html()
	alert( folder_thumb_url + " " + query )
	var data = [{
		name : $(element).find(".name").html(),
		folder_thumb_url : folder_thumb_url,
		id : $(element).attr("id")
	}]

	$(".folder_select").append("<option value=" + data[0].id + ">" + data[0].name + "</option>")
	$(".folders_list").append($.render(data, "folderItem"))

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