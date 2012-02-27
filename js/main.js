var start_index
var end_index

$(document).ready(documentReady)

function documentReady() {

	$.template("folderItem", 
	
	"<li class='folder item' id='{{=id}}'>" 
	+ "<a href='#images-{{=id}}-{{=name}}'>Go to folder</a><br><br>" 
	+ "<span class='edit name' id='{{=id}}'>{{=name}}</span><br><br>" 
	+ "<a class='right' href='api/?q=remove_folder&id={{=id}}'>Poista kansio</a>" 
	+ "<div class='clear'></div></li>");

	$.template("folderHeader", "<span class='edit name' id='{{=id}}'>{{=name}}</span>")

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
	initFolders()
}
showImagesView = function() {
	showImages()
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
showImages = function() {
	$(".images_data").load("xml/images.xml?random=" + Math.random(), onImagesLoaded)
	showFolderHead()
}
onImagesLoaded = function() {
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
	var data = [{
		name : hash_parameter,
		id : hash_status
	}]
	$(".folder_header").append($.render(data, "folderHeader"))
	$('.folder_header .edit.name').editable('api/', {
		submitdata : {
			q : "edit",
			cat : "folder",
			attr : "name"
		}
	});

}
initFolders = function() {
	$(".folders_data").load("xml/folders.xml?random=" + Math.random(), onFoldersLoaded)
}
onFoldersLoaded = function(event) {

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

	//Edit name
	$('.folder .edit.name').editable('api/', {
		submitdata : {
			q : "edit",
			cat : "folder",
			attr : "name"
		}
	});
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