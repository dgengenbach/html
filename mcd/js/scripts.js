/*!
    * Start Bootstrap - SB Admin v6.0.0 (https://startbootstrap.com/templates/sb-admin)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    (function($) {
    "use strict";
	var dmn = window.document.domain; //'localhost';
	//var dmn = '18.237.218.114';
	var REST_URL = 'http://'+dmn+'/cmx/cs/orcl-TCR_HUB_NEW';
	var AUTH_URL = 'http://'+dmn+'/e360/com.informatica.tools.mdm.web.auth/login';
	var BULK_URL = 'http://'+dmn+'/cmx/bulk/orcl-TCR_HUB_NEW';
	
	$.fn.getQueryParams = function( params, url ){
		var reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
		var queryString = reg.exec(url);
		return queryString ? queryString[1] : null;
	};
	
	//ajax complete logging
	$( document ).ajaxComplete(function( event, xhr, settings ) {
		$('#loader').hide()
		$( "#log" ).append( '<div>Making <strong>'+settings.type+'</strong> call to "<em>' + settings.url + '</em>". Response was <strong>'+xhr.statusText+'</strong></div>' );
	});
	
	
	//initialize ajax
	$.ajaxSetup({
		cache: true,
		beforeSend: function(xhr, settings) {
			//xhr.setRequestHeader ("Authorization", "Basic " + btoa("admin:admin"));
			//xhr.setRequestHeader ("Authorization", "Basic " + btoa("analyst:password1"));
			xhr.setRequestHeader("Content-Type","application/json");
			$('#loader').show()
		}
	});
	

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
	$("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
		if (this.href === path) {
			$(this).addClass("active");
		}
	});

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
	
	
	//authenticate as an mdm user
	$.fn.mdmAuth = function(){
		var creds = {
			user: 'admin',
			password: 'admin'
		}
		$.ajax({
			type:'POST',
			url: AUTH_URL,
			data:JSON.stringify(creds)}
		).then(function(response, sts, xhr){
			//now grab the logged in manager's uid
			var emloruid = $('#inputEmailAddress').val().trim();
			return $.ajax({
				type: "GET",
				url: REST_URL+'/CustomerPerson.json?action=query&filter=CustomerPersonElectronicAddress.etrncAddr=%27'+emloruid+'%27&caseInsensitive=true&outputView=CustomerPersonViewSimple&depth=2',
				dataType: 'json',
				cache: true,
			});
		}).then(function(response, sts, xhr){
			if(response.item.length == 0){
				window.location='login.html?status=nouserfound';
			}
			window.location='index.html?uid='+response.item[0].CustomerPersonViewSimple.rowidObject.trim();
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}
	
	//Fake the login function by looking up the user by their email or rowidObject
	$.fn.login = function(){
		console.log('Login called');
		var emloruid = $('#inputEmailAddress').val().trim();
		//check to see if its an email or an ID
		var n = emloruid.indexOf("@");
		if(n > 0) {
		//user is using an email to log in - look up user ID
			$.ajax({
				type: "GET",
				url: REST_URL+'/CustomerPerson.json?action=query&filter=CustomerPersonElectronicAddress.etrncAddr=%27'+emloruid+'%27&caseInsensitive=true&outputView=CustomerPersonViewSimple&depth=2',
				dataType: 'json',
				cache: true,
			}).done(function(response) {
				if(response.item.length == 0){
					console.log('No user found');
				}
				var mgrid = response.item[0].CustomerPersonViewSimple.rowidObject.trim();
				var nurl = "index.html"; 
				nurl += "?uid="+mgrid;
				window.location=nurl;
			}).fail(function(xhr, textStatus, errorThrown) {
				alert("Error: "+xhr.responseJSON.errorMessage);
			});
		} else {
			//user is using a userID to log in so just redirect
			window.location='index.html?uid='+emloruid
			//3510168
		}
	}

	//Grab the UID from the query string and load the user's data
	$.fn.loadUser = function() {
		var uid = $.fn.getQueryParams('uid',document.location.search);
		console.log('qs uid:'+uid);
		if(uid == null || typeof(uid) === 'undefined'){
			//no one is logged in
			window.location='login.html?status=loggedout';
		}
		//get logged in user info	
		$.ajax({
			type: "GET",
			url: REST_URL+'/CustomerPerson/'+uid+'.json?',
			dataType: 'json',
			cache: true,
		}).done(function(response) {
			//load the UI
			var mgrNm;
			mgrNm = response.fullNm;
			console.log(mgrNm);
			$('#loggedInAs').html(mgrNm);
			$('#slink').attr('href','index.html?uid='+uid);
			$('#qlink').attr('href','queries.html?uid='+uid);
			$('#tlink').attr('href','tasks.html?uid='+uid);
			$('#personImg').attr('src',response.imgUrl);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage );
			if(xhr.status == 401){
				window.location='login.html?status=loggedout';
			}
		});
	}

	$.fn.loadMenu = function(ed, clear) {
		var effectiveDate = '';
		if (typeof ed == 'undefined'){
			effectiveDate = $.format.date(new Date(), 'yyyy-MM-ddThh:mm:ss.000Z');
		} else {
			effectiveDate = ed;
			$('#menu').empty();
		}
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var storeMenuUrl = REST_URL+'/hierarchy/Store/entity/CustomerOrg/'+sid+'/children.json?returnTotal=true&firstRecord=1&recordsToReturn=20&readLabelsOnly=false&effectiveDate='+effectiveDate;
		
		$.ajax({
			type: "GET",
			url: storeMenuUrl,
			dataType: 'json',
			cache: true,
		}).done(function(response) {
			//load the UI
			var rel = response.relatedEntity;
			var list = '<ul class="list-group list-group-flush">';
			$.each(rel, function(i){
				var be = this.businessEntity[Object.keys(this.businessEntity)[0]];	
				var beType = this.entityType;
				//skip anything that is not a menu item
				if(beType != 'MenuItem'){ 
					console.log(beType+' found. Skipping');
					return;
				}
				var icon = '';
				$.each(be.link, function(x){
					if(this.rel == 'icon'){
						icon = this.href;
					}
				});
				var entityLabel = this.entityLabel;
				var rido = be.rowidObject.trim();
				var elClean = entityLabel.replace("'","").split(' ').join('-');
				var elId = elClean+rido;
				var relationshipLabel = this.relationshipLabel;
				
				console.debug('Adding list element with id: '+elId+rido);
				list += 
				'<li class="list-group-item" id="'+elId+'"><div class="mdm-tree-node"><div class="hierarchy-tree-node-image-area" style="background: rgb(255, 77, 0) none repeat scroll 0% 0%;"><img src="'+icon+'" class="hierarchy-tree-node-image" /> </div> '+entityLabel+' ('+relationshipLabel+')</div></li>';
			});
			list += '</ul>';
			console.log('Appending data to menu');
			if(clear){
				$('#menu').empty();
			}
			$('#menu').append(list);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}


	$.fn.loadMenuPromotion = function(childUrl) {
		//get the children from each menu item, filter the promotion and populate the list
		
		$.ajax({
			type: "GET",
			url: childUrl,
			dataType: 'json',
			cache: true,
		}).done(function(response) {
			//load the UI
			var rel = response.relatedEntity;
			var listItem = '';
			$.each(rel, function(i){
				var be = this.businessEntity[Object.keys(this.businessEntity)[0]];	
				var beType = this.entityType;
				//skip anything that is not a menu item
				if(beType != 'Promotion'){ 
					console.log(beType+' found. Skipping');
					return;
				}
				var icon = '';
				$.each(be.link, function(x){
					if(this.rel == 'icon'){
						icon = this.href;
					}
				});
				var entityLabel = this.entityLabel;
				var rido = be.rowidObject.trim();
				var elClean = entityLabel.replace("'","").split(' ').join('-');
				var elId = beType+rido;
				var relationshipLabel = this.relationshipLabel;
				
				console.debug('Adding list element with id: '+elId+rido);
				listItem += 
				'<li class="list-group-item" id="'+elId+'"><div class="mdm-tree-node"><div class="hierarchy-tree-node-image-area" style="background: rgb(255, 77, 0) none repeat scroll 0% 0%;"><img src="'+icon+'" class="hierarchy-tree-node-image" /> </div> '+entityLabel+' ('+relationshipLabel+')</div></li>';
				$('#menuItemList').append(listItem);
			});

		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}


	$.fn.loadPromotions = function(ed){
		var effectiveDate = '';
		if (typeof ed == 'undefined'){
			//set it to today
			//'2020-04-28T07:00:00.000Z'; //
			effectiveDate = $.format.date(new Date(), 'yyyy-MM-ddThh:mm:ss.000Z');
		} else {
			effectiveDate = ed;
			$('#menuItemList').empty();
		}
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var menuItemsUrl = REST_URL+'/hierarchy/Store/entity/CustomerOrg/'+sid+'/children.json?returnTotal=true&firstRecord=1&recordsToReturn=20&readLabelsOnly=false&effectiveDate='+effectiveDate;
		
		console.debug('Getting hierarchy for url: '+menuItemsUrl);
		
		$.ajax({
			type: "GET",
			url: menuItemsUrl,
			dataType: 'json',
			cache: true,
		}).done(function(response) {
			
			var rel = response.relatedEntity;
			var pel = '';
			$.each(rel, function(i){
				var be = this.businessEntity[Object.keys(this.businessEntity)[0]];	
				var beType = this.entityType;
				//skip anything that is not a menu item
				if(beType != 'MenuItem'){ 
					console.log(beType+' found. Skipping');
					return;
				}
				var rido = be.rowidObject.trim();
				var childUrl = REST_URL + '/hierarchy/Store/entity/' + beType + '/' + rido + '/children.json?returnTotal=true&firstRecord=1&recordsToReturn=20&readLabelsOnly=false&effectiveDate='+ effectiveDate;
				console.debug('Getting promotions for menu item: '+rido);
				pel = $.fn.loadMenuPromotion(childUrl);
			});

		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
		
	}
	

	$.fn.loadHierarchy = function(ed, elId, curl){
		var effectiveDate = '';
		if (typeof ed == 'undefined'){
			//set it to today
			//'2020-04-28T07:00:00.000Z'; //
			effectiveDate = $.format.date(new Date(), 'yyyy-MM-ddThh:mm:ss.000Z');
		} else {
			effectiveDate = ed;
			$('#hierarchy').empty();
		}
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var initialUrl = REST_URL+'/hierarchy/Store/entity/CustomerOrg/'+sid+'/children.json?returnTotal=true&firstRecord=1&recordsToReturn=20&readLabelsOnly=false&effectiveDate='+effectiveDate;
		
		var url = (typeof(curl) === 'undefined' ? initialUrl : curl);
		var toSel = (typeof(elId) === 'undefined' ? '#hierarchy' : elId);
		
		var elExists = $(elId);
		if (elExists.children().length > 1){
			//this child is already loaded
			console.log('Children aready loaded');
			return;
		}
		
		console.debug('Getting hierarchy for url: '+url);
		
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: true,
		}).done(function(response) {
			//load the UI
			var rel = response.relatedEntity;
			var list = '<ul class="list-group list-group-flush">';
			$.each(rel, function(i){
				var be = this.businessEntity[Object.keys(this.businessEntity)[0]];	
				var icon = '';
				$.each(be.link, function(x){
					if(this.rel == 'icon'){
						icon = this.href;
					}
				});
				var entityLabel = this.entityLabel;
				var rido = be.rowidObject.trim();
				var elClean = entityLabel.replace("'","").split(' ').join('-');
				var elId = elClean+rido;
				var relationshipLabel = this.relationshipLabel;
				
				var childUrl = REST_URL + '/hierarchy/Store/entity/' + this.entityType + '/' + rido + '/children.json?returnTotal=true&firstRecord=1&recordsToReturn=20&readLabelsOnly=false&effectiveDate='+ effectiveDate;
				console.debug('Adding list element with id: '+elId+rido);
				list += 
				'<li class="list-group-item" id="'+elId+'"><div class="mdm-tree-node"><div class="hierarchy-tree-node-image-area" style="background: rgb(255, 77, 0) none repeat scroll 0% 0%;"><a href="#" onclick="$.fn.loadHierarchy(undefined,\'#'+elId+'\',\''+childUrl+'\')"><img src="'+icon+'" class="hierarchy-tree-node-image" /></a> </div> '+entityLabel+' ('+relationshipLabel+')</div></li>';
			});
			list += '</ul>';
			console.log('Appending data to '+toSel);
			$(toSel).append(list);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
		
	}
	
	
	$.fn.addMenuItem = function() {
		var purl = REST_URL + '/MenuItemView?systemName=Admin'; 
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var burl = REST_URL + '/StoreMenuItem?systemName=Admin';
		var co = $('#Country').val();
		var cat = $('#Category').val();
		var mi = $('#MenuItem').val();
		var pl = $('#ProductLine').val();
		var sku = $('#sku').val();
		
		var menuData = {
				"sku":sku,
				"MenuItem":mi,
				"Country":co,
				"ProductLine":pl,
				"Category":cat
		}
		console.log(menuData);
		
		
		$.ajax({
			type: "POST",
			url: purl,
			dataType: 'json',
			data: JSON.stringify(menuData)
		}).then(function(response) {
			//TODO traverse the parent and get the rootRowId
			var rootRowId = '80023';
			var fromRido = sid;
			var toRido = response.MenuItemView.rowidObject;
			var effectiveDate = $.format.date(new Date(), 'yyyy-MM-ddThh:mm:ss.000Z');
			var relData = {
				"systemName": "Admin",
				"rootRowId": rootRowId,
				"items": [{
					"operation": "createRelationship",
					"relationship": "StoreMenuItem",
					"payload": {
						"from": {
							"rowidObject": fromRido
						},
						"to": {
							"rowidObject": toRido
						},
						"RelTypeCode": "Store Menu Item"
					}
				}],
				"effectiveDate": effectiveDate
			}
			console.log(relData);
			
			return $.ajax({
				type: "POST",
				url: BULK_URL,
				dataType: 'json',
				data: JSON.stringify(relData)
			});

		}).then(function(response) {
			console.log(response);
			$('#Country').val('');
			$('#Category').val('');
			$('#MenuItem').val('');
			$('#ProductLine').val('');
			$('#sku').val('');
			$('#menuItemModal').modal('hide');
			$.fn.loadMenu(undefined, true);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});	
		
	}
	
	$.fn.loadStores = function() {
		var uid = $.fn.getQueryParams('uid',document.location.search);
		var url = REST_URL + '/CustomerPerson/'+uid+'.json?action=related&returnTotal=true&firstRecord=1&recordsToReturn=100';
		/*
		var filters = $.fn.getQueryParams('filters',url);
		console.log('filters: '+filters);
		var filter = '';
		var filterInVal = '';
		if (filters != null) {
			filter = filters.split(' ')[0];
			filterInVal = filters.split(' ')[2].replace("['",'').replace("']",'');
		}
		console.log('FilteredInVal: '+filterInVal);
		*/
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: false
		}).done(function(response) {
			$('#stores').data('key',response);
			$('#stores').remove();
			var table = '<table class="table table-bordered hover" id="stores" width="100%" cellspacing="0"><thead><tr><th>Store Name</th><tbody>';
			//build out the table rows
			$.each(response.relatedEntity, function() {
				console.debug(this.relationshipType);
				if (this.relationshipType == 'StoreManager'){
					console.info('storeManager relationship found.');
					table += '<tr><td>'+this.entityLabel+' <a href="store.html?uid='+uid+'&sid='+this.relationship.from.rowidObject.trim()+'"><i class="fas fa-external-link-alt"></i></a></td></tr>';
				}
			});
			table += '</tbody></table>';
			$('#tableDiv').html(table);
			
			if(!$.fn.dataTable.isDataTable('#stores')){
				$('#stores').DataTable();
			}
			//load facets
			/*
			var facets = '';
			$.each(response.facet, function(i) {
				var fn = this.field.split('.')[this.field.split('.').length-1];
				var field = this.field.split('.').slice(1).join('.');
				console.log('Creating facet for '+fn);
				var facet = '<div class="col-sm-4" id="'+fn+'"><h5><i class="fas fa-filter"></i>'+fn.toUpperCase()+'</h5>';
				$.each(this.entry, function() {
					var checked = '';
					if (filterInVal == this.label){
						checked = 'checked="checked"';
					}
					facet += '<div class="form-check"><input class="form-check-input" type="checkbox" onclick="$.fn.facets(this);" value="'+field+'_'+this.label+'" id="'+this.label+'" '+checked+'><label class="form-check-label" for="'+this.label+'">'+this.label.toUpperCase()+' ('+this.count+')</label></div>'
				});
				facet += '</div>';
				facets += facet;
			});
			$('#facetsrow').empty();
			$('#facetsrow').append(facets);
			*/
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	
	}
	
	//load the stores for this district manager
	$.fn.loadDistStores = function() {
		var uid = $.fn.getQueryParams('uid',document.location.search);
		//if no uid, bail
		if(typeof(uid) === 'undefined'){
			window.location='login.html?status=nouid';
		}
		console.log('user found:'+uid+'. Loading records');
		var furl = REST_URL+'/Store.json?q='+uid+'&facets=CustomerOrgPostalAddress.PostalAddress.cntryCd.cntryDesc,CustomerOrgPostalAddress.PostalAddress.city,StoreClassification.Classification.classCd&firstRecord=1&recordsToReturn=100&recordStates=ACTIVE,PENDING&depth=10';
		//var url  = REST_URL+'/Store.json?q='+uid+'&firstRecord=1&recordsToReturn=100&recordStates=ACTIVE,PENDING&depth=10';
		$.fn.loadStores(furl);
	}
	
	//Load a single store by store ID (rowidObject)
	$.fn.loadStore = function() {
		var sid = $.fn.getQueryParams('sid',document.location.search);
		//if no sid, bail
		if(typeof(sid) === 'undefined'){
			window.location='login.html?status=nouid';
		}
		console.log('store id found:'+sid+'. Loading records');
		var url = REST_URL+'/CustomerOrg/'+sid+'.json?depth=10';
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: true
		}).done(function(response) {
			//console.log(response);
			$('#storeData').data('key',response);
			$('#fullNm').html(response.fullNm);
			$('#addrLn1').html(response.CustomerOrgPostalAddress.item[0].PostalAddress.addrLn1);
			//$('#addrLn2').html(response.CustomerOrgPostalAddress.item[0].PostalAddress.addrLn2);
			var pa = response.CustomerOrgPostalAddress.item[0].PostalAddress;
			var csz = pa.city + (typeof(pa.state) === 'undefined' ? '' : ' '+pa.state) + (typeof(pa.pstlCd) === 'undefined' ? '' : ' '+pa.pstlCd);
			$('#csz').html(csz);
			
			/*
			var store = response.storeBrand+'® '+response.classification;
			$('#storeType').html(store);
			$('#phnNum').attr('href','tel:'+response.CustomerOrgPhone.item[0].phnNum);
			$('#phnNum').html('<i class="fas fa-phone"></i> '+response.CustomerOrgPhone.item[0].phnNum);
			$('#etrncAddr').attr('href','mailto:'+response.CustomerOrgElectronicAddress.item[0].etrncAddr);
			$('#etrncAddr').html('<i class="fas fa-envelope"></i> '+response.CustomerOrgElectronicAddress.item[0].etrncAddr);
			*/
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}
	
	//Load the stores classification data from the 1toM child StoreClassification
	$.fn.loadStoreAttrs = function() {
		var sid = $.fn.getQueryParams('sid',document.location.search);
		//if no sid, bail
		if(typeof(sid) === 'undefined'){
			window.location='login.html?status=nouid';
		}
		console.log('store id found:'+sid+'. Loading records');
		var curl = REST_URL+'/Classification.json?action=query&filter=classifTyp=SA';
		var allAttrs;
		var url = REST_URL+'/Store/'+sid+'/StoreClassification.json?depth=10';
		var selAttrs;
		//First get the store to classification rels
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: true
		}).then(function(response) {
			//Then get all the classification items
			selAttrs = response.item;
			console.log(selAttrs);
			return $.ajax({
				type: "GET",
				url: curl,
				dataType: 'json',
				cache: true
			});
		}).then(function(response) {
			allAttrs = response.item;
			console.log(allAttrs);
			var attr='';
			var attrVal='';
			var cbs = '';
			var rido = '';
			//finally, loop over the list of all classifications and if the rel exists, check the checkbox
			$.each(allAttrs, function() {
				var lko = selAttrs.find(o => o.Classification.classVal === this.Classification.classifVal);
				var checked = '';
				var relid = '';
				attrVal = this.Classification.classifVal.replace(/'/g, "");
				rido = this.Classification.rowidObject.trim();
				if (typeof(lko) === 'undefined') {
					console.log(this.Classification.classifVal+' not found');
				} else {
					relid = lko.rowidObject.trim();
					checked = ' checked="checked"';
					console.log(this.Classification.classifVal+' found. rel id is:'+relid);
				}
				attr = '<div class="form-check"><input type="checkbox" onclick="$.fn.updateAttrs(this.id);" style="left:auto !important;" class="form-check-input" id="'+attrVal.split(' ').join('_')+sid+'"'+checked+' value="'+rido+'_'+relid+'"><label class="form-check-label" style="position: unset !important;" for="'+attrVal+sid+'">'+attrVal+'</label></div>';
				cbs += attr;
			});
			$('#attrs').html(cbs);

		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}
	
	//Call to the StoreClassification relationship object and POST or DELETE a rel
	$.fn.updateAttrs = function(id) {
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var cb = $('#'+id);
		var rids = cb.val().split('_');
		var classifId = rids[0];
		var relationshipId = rids[1];
		
		var checked = cb.is(":checked");
		var method = 'POST';
		var url = REST_URL+'/StoreClassification';
		var rel = {
			"from": {
				"rowidObject":sid
			},
			"to": {
				"rowidObject":classifId
			}
		}
		if (!checked) {
			method = 'DELETE';
			url += '/'+relationshipId;
			rel = null;
		}
		url += '?systemName=Admin';		
		
		$.ajax({
			type: method,
			url: url,
			dataType: 'json',
			data: JSON.stringify(rel)
		}).done(function(response){
			var alert='<div class="alert alert-success alert-dismissible fade show" role="alert" id="attrAlert" data-dismiss="alert"><strong>Success!</strong> Store attributes updated.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
			$('#attrsCardHeader').append(alert);
			if (method == 'POST'){
				var newRelId = response.StoreClassification.rowidObject;
				console.log('updating checkbox with new relationshipId: '+newRelId);
				cb.val(classifId+'_'+newRelId);
			}
			
		});
		
		
	}
	
	//Call to the task manager and load tasks
	$.fn.loadTasks = function(countOnly) {
		//owner=admin should filter tasks. Probably should create a role for DMs or use manager user
		var url = REST_URL+'/task.json?applicationName=Menu_Promotion&businessEntity=MenuItem,Promotion&rawStatus=RESERVED,IN_PROGRESS,READY,CREATED&recordsToReturn=50&taskType=AVOSBeFinalReview,AVOSBeUpdate';

		var uid = $.fn.getQueryParams('uid',document.location.search);
		//if no uid, bail
		if(typeof(uid) === 'undefined'){
			window.location='login.html?status=nouid';
		}
		console.log('user found:'+uid+'. Loading records');
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: true
		}).done(function(response) {
			if(!countOnly){
				var rows = $("#tasks > tbody");
				$.each(response.task, function() {
					rows.append('<tr><td>'+this.title+' <a href="'+REST_URL+'/task/'+this.taskId+'.json"><i class="fas fa-external-link-alt"></i></a></td><td>'+this.taskType.label+'</td><td>'+this.dueDate+'</td><td>'+(typeof(this.owner) === 'undefined' ? 'Unclaimed' : this.owner)+'</td></tr>');
				});
				$('#tasks').DataTable();
			}
			$('#taskCount').html(response.task.length);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+xhr.responseJSON.errorMessage);
		});
	}
	
	//Build the filter and load the query facets
	$.fn.facets = function(v) {
		var uid = $.fn.getQueryParams('uid',document.location.search);
		var storesData = $('#stores').data('key');
		var cb = $(v);
		
		var filterCat = cb.val().split('_')[0];
		var filterVal = cb.val().split('_')[1];
		var filterString = '';
		if(cb.prop('checked')){
			filterString = "&filters="+filterCat+" in ['"+filterVal+"']";
		}
		//filter the facets
		var furl = REST_URL+'/Store.json?q='+uid+filterString+'&facets=CustomerOrgPostalAddress.PostalAddress.cntryCd.cntryDesc,CustomerOrgPostalAddress.PostalAddress.city,StoreClassification.Classification.classCd&firstRecord=1&recordsToReturn=100&recordStates=ACTIVE,PENDING&depth=10';
		//console.log(furl);
		$.fn.loadStores(furl);	
	}
	
	//NOT USED - old facet method without filtering
	$.fn.facet = function(v) {
		var cb = $(v);
		var filterCat = cb.val().split('_')[0];
		var filterVal = cb.val().split('_')[1];
		var filterObj = $('#stores_filter > label > input');
		//create an array of filter strings
		var filterString = filterObj.val().split(' ');
		if(cb.prop('checked')){
			filterString.push(filterVal);

		} else {
			var i = filterString.indexOf(filterVal);
			//console.log('looking for '+ filterVal +' in "'+filterString.toString() +'" which has '+filterString.length+' elemnts. found at index: '+i);
			filterString.splice(i,1);
		}
		
		filterObj.val(filterString.toString().replace(/,/g,' '));
		filterObj.trigger('paste');
	}
	
	//Show the hour editor modal
	$.fn.popMenuModal = function() {
		$('#menuItemModal').modal();
	}
	
	//Reset the hour editor
	$.fn.clearHours = function(id) {
		var storeDataWas = $('#storeData').data('key');
		var dayHours = ['mondayHours','tuesdayHours','wednesdayHours','thursdayHours','fridayHours','saturdayHours','sundayHours'];
		var cb = $('#closed'+id).prop('checked');
		console.log('Box is checked: '+cb);
		if(cb) {
			$('#open'+id).val('');
			$('#close'+id).val('');
		} else {
			var oc = storeDataWas[dayHours[id]].split('-');
			$('#open'+id).val(oc[0]);
			$('#close'+id).val(oc[1]);
		}
	}
	
	//Call to MDM to update the hours for the BE
	$.fn.updateHours = function() {
		var sid = $.fn.getQueryParams('sid',document.location.search);
		var purl = REST_URL+'/Store/'+sid+'?systemName=Admin';
		var storeDataWas = $('#storeData').data('key');
		var dayHours = ['mondayHours','tuesdayHours','wednesdayHours','thursdayHours','fridayHours','saturdayHours','sundayHours'];
		var hrsString = ''
		var hoursObj = {}
		var i;
		//build the $original object
		for(i=0; i<dayHours.length; i++){
			hoursObj[dayHours[i]]=$('#open'+i).val()+'-'+$('#close'+i).val();
			if($('#open'+i).val().length == 0){
				hoursObj[dayHours[i]]='Closed';
			}
		}
		
		var og = {
			'mondayHours':storeDataWas.mondayHours,
			'tuesdayHours':storeDataWas.tuesdayHours,
			'wednesdayHours':storeDataWas.wednesdayHours,
			'thursdayHours':storeDataWas.thursdayHours,
			'fridayHours':storeDataWas.fridayHours,
			'saturdayHours':storeDataWas.saturdayHours,
			'sundayHours':storeDataWas.sundayHours
		}
		
		hoursObj["$original"] = og;
		console.log(hoursObj);
		
		$.ajax({
			type: "POST",
			url: purl,
			data: JSON.stringify(hoursObj),
			dataType: 'json'
		}).done(function(response) {
			$('#hoursModal').modal('hide');
			var alert='<div class="alert alert-success alert-dismissible fade show" role="alert" id="attrAlert" data-dismiss="alert"><strong>Success!</strong> Store hours change has been submitted for reivew.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
			$('#hoursAlert').append(alert);
			//window.location.reload();
			
		}).fail(function(xhr, textStatus, errorThrown) {
			$('#hoursModal').modal('hide');
			var msg = $.parseJSON(xhr.responseText);
			var alert='<div class="alert alert-success alert-danger fade show" role="alert" id="attrAlert" data-dismiss="alert"><strong>Uh-oh!</strong>'+xhr.responseJSON.errorMessage+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
			$('#hoursAlert').append(alert);
			console.log(msg);
		});
		
		
		
	}
})(jQuery);
