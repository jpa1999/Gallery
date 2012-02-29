var start_index
var end_index
var folders_loaded = false

$(document).ready(documentReady)

function documentReady() {

	$.template("folderItem", 
	
	"<li class='folder item' id='{{=id}}'>" 
	+ "<a href='#images-{{=id}}-{{=name}}'>Go to folder</a><br><br>" 
	+ "<span class='edit name' id='{{=id}}'>{{=name}}</span><br><br>" 
	+ "<a class='right' href='api/?q=remove_folder&id={{=id}}'>Poista kansio</a>" 
	+ "<div class='clear'></div></li>");

	$.template("folderHeader", "<div class='edit name' id='{{=id}}'>{{=name}}</div>")

	$.template("imageListItem","<li class='image item' id='{{=id}}'>"
	+"<img src='uploads/thumbs/{{=filename}}.jpg' />"
	+"<div><a href='api/?q=remove_image&id={{=id}}'>Poista</a></div>"
	+"</li>")
	
	addHashChangeListener()
	initView()
	initButtons()
}

initView = function() {
	processHash()
	changeViewByHash()
}
changeViewByHash = function() {
	
	resetViews()

	if(hash_target == "folders" || hash_target == "") {
		showFoldersView()
	}
	if(hash_target == "images") {
		showImagesView()
	}
}
showFoldersView = function() {
	on_folders = true
	on_images = false
	initFolders()
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
	$("button.admin.show").click( function(){ $(".admin.box").toggle() })
	
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
}
onImagesDataLoaded = function(){
	images_loaded = true
	showImages()
}
showImages = function(){
	if( folders_loaded && images_loaded ){
		onImagesLoaded()
	}
}
onImagesLoaded = function() {
	
	
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

}
onImageLoad = function(index, item) {
	var filename = $(item).find(".thumbname").html()
	var id = $(item).attr("id")
	
	var data = [{
		filename : filename,
		id : id
	}]

	$(".images_list").append( $.render(data, "imageListItem") )
}
/*-----------------------------*/
/* Folders                     */
/*-----------------------------*/
showFolderHead = function() {
	
	alert("show folder head")
	
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
	
	if( on_folders ){
		showFolders()
	}else{
		showImages()
	}
	
}
showFolders = function() {

	$(".folder").each(onFolder)
	$(".folders_list").sortable({
		start : function(event, ui) {
			start_index = ui.item.index()
		},
		update : function(event, ui) {
			end_index = ui.item.index();
			onIndexChange()
		},
		cursor : 'move'

	});
	$(".folders_list").disableSelection();

}
onIndexChange = function() {
	$.get("api/?q=move_folder&start=" + start_index + "&end=" + end_index, function(data) {
	})
}
onFolder = function(index, element) {

	//var name = $( element ).find(".name").html()
	//var id = 	$( element ).attr("id")

	var data = [{
		name : $(element).find(".name").html(),
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