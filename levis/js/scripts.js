/*!
    * Start Bootstrap - SB Admin v6.0.0 (https://startbootstrap.com/templates/sb-admin)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    (function($) {
    "use strict";
	
	$.fn.getQueryParams = function( params, url ){
  
		var href = url;
		//this expression is to get the query strings
		var reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
		var queryString = reg.exec(href);
		return queryString ? queryString[1] : null;
	};
	
	//ajax complete logging
	$( document ).ajaxComplete(function( event, xhr, settings ) {
		$('#loader').hide()
		$( "#log" ).append( '<div>Making <strong>'+settings.type+'</strong> call to "<em>' + settings.url + '</em>". Response was <strong>'+xhr.statusText+'</strong></div>' );
	});
	
	var REST_URL = 'http://localhost/cmx/cs/orcl-TCR_HUB_NEW';
	//initialize ajax
	$.ajaxSetup({
		cache: true,
		beforeSend: function(xhr, settings) {
			//xhr.setRequestHeader ("Authorization", "Basic " + btoa("admin:admin"));
			xhr.setRequestHeader ("Authorization", "Basic " + btoa("analyst:password1"));
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
				alert("Error: "+msg.errorMessage);
			});
		} else {
			//user is using a userID to log in so just redirect
			window.location='index.html?uid='+emloruid
			//3510168
		}
	}

	
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
			//get user
			var mgrNm;
			mgrNm = response.fullNm;
			console.log(mgrNm);
			$('#loggedInAs').html(mgrNm);
			$('#slink').attr('href','index.html?uid='+uid);
			$('#qlink').attr('href','queries.html?uid='+uid);
			$('#tlink').attr('href','tasks.html?uid='+uid);
			$('#personImg').attr('src',response.imgUrl);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+msg.errorMessage);
		});
	}

	
	$.fn.loadStores = function(url) {
		var uid = $.fn.getQueryParams('uid',document.location.search);
		var filters = $.fn.getQueryParams('filters',url);
		console.log('filters: '+filters);
		var filter = '';
		var filterInVal = '';
		if (filters != null) {
			filter = filters.split(' ')[0];
			filterInVal = filters.split(' ')[2].replace("['",'').replace("']",'');
		}
		console.log('FilteredInVal: '+filterInVal);
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: false
		}).done(function(response) {
			$('#stores').data('key',response);
			$('#stores').remove();
			var table = '<table class="table table-bordered hover" id="stores" width="100%" cellspacing="0"><thead><tr><th>Store Name</th><th>City</th><th>Phone</th><th>Manager</th><th>Attrs</th><th>Brand</th><th>Type</th><th>Country</th></tr></thead><tbody>';
			$.each(response.item, function() {
				var attrs = '';
				$.each(this.Store.StoreClassification.item, function() {
					attrs += this.Classification.classCd+',';
				});
				var contacts = this.Store.CustomerOrgContacts.item;
				var role = contacts.find(o => o.rle1 === 'Manager');
				var managerName = role.Party.fullNm;
				var countryCode = '';
				if(typeof this.Store.CustomerOrgPostalAddress.item[0].PostalAddress.cntryCd === 'undefined'){
					countryCode = '';
				} else {
					countryCode = this.Store.CustomerOrgPostalAddress.item[0].PostalAddress.cntryCd.cntryDesc;
				}
				table += '<tr><td>'+this.Store.fullNm+' <a href="store.html?uid='+uid+'&sid='+this.Store.rowidObject.trim()+'"><i class="fas fa-external-link-alt"></i></a></td><td>'+this.Store.CustomerOrgPostalAddress.item[0].PostalAddress.city+'</td><td>'+this.Store.CustomerOrgPhone.item[0].phnNum+'</td><td>'+managerName+'</td><td>'+attrs+'</td><td>'+this.Store.storeBrand+'</td><td>'+this.Store.classification+'</td><td>'+countryCode+'</td></tr>';
			});
			table += '</tbody></table>';
			$('#tableDiv').html(table);
			
			if(!$.fn.dataTable.isDataTable('#stores')){
				$('#stores').DataTable({
					"columnDefs": [
						{
							"targets": [ 4 ],
							"visible": false,
							"searchable": true
						},
						{
							"targets": [ 5 ],
							"visible": false,
							"searchable": true
						},
						{
							"targets": [ 6 ],
							"visible": false,
							"searchable": true
						},
						{
							"targets": [ 7 ],
							"visible": false,
							"searchable": true
						}
					]
				});
			}
			//load facets
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
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+msg.errorMessage);
		});
	
	}
	
	
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
	
	
	$.fn.loadStore = function() {
		var sid = $.fn.getQueryParams('sid',document.location.search);
		//if no sid, bail
		if(typeof(sid) === 'undefined'){
			window.location='login.html?status=nouid';
		}
		console.log('store id found:'+sid+'. Loading records');
		var url = REST_URL+'/Store/'+sid+'.json?depth=10';
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
			
			$('#monHrs').html(response.mondayHours);
			$('#tueHrs').html(response.tuesdayHours);
			$('#wedHrs').html(response.wednesdayHours);
			$('#thuHrs').html(response.thursdayHours);
			$('#friHrs').html(response.fridayHours);
			$('#satHrs').html(response.saturdayHours);
			$('#sunHrs').html(response.sundayHours);
			$('#imgUrl').attr('src',response.imgUrl);
			
			//intialize form values	
			var dayHours = [response.mondayHours,response.tuesdayHours,response.wednesdayHours,response.thursdayHours,response.fridayHours,response.saturdayHours,response.sundayHours];
			var dayNames = ['Mon','Tue','Wed','Thur','Fri','Sat','Sun'];
			var i;
			for(i=0; i<dayHours.length; i++){
				var hours = '';
				var hrs = dayHours[i].split('-');
				var open = '';
				var close = '';
				var closedCB = '<input type="checkbox" class="form-control" id="closed'+i+'" value="Closed" style="left:auto !important;" onclick="$.fn.clearHours('+i+')">';
				if(hrs.length == 2){
					open = hrs[0].trim();
					close = hrs[1].trim();
				} else if(dayHours[i].toUpperCase() == 'CLOSED') {
					open = '';
					close = '';
					closedCB = '<input type="checkbox" class="form-control" id="closed'+i+'" value="Closed" style="left:auto !important;" checked="checked" onclick="$.fn.clearHours('+i+');">';
				}
				hours += '<div class="form-row"><div class="col">'+dayNames[i]+'</div>';
				hours += '<div class="col"><input type="time" class="form-control" id="open'+i+'" value="'+open+'"></div>';
				hours += '<div class="col"><input type="time" class="form-control" id="close'+i+'" value="'+close+'"></div>';
				hours += '<div class="col">'+closedCB+'</div></div>';
				$('#hoursForm').append(hours);
			}
			
			var store = response.storeBrand+'® '+response.classification;
			$('#storeType').html(store);
			$('#phnNum').attr('href','tel:'+response.CustomerOrgPhone.item[0].phnNum);
			$('#phnNum').html('<i class="fas fa-phone"></i> '+response.CustomerOrgPhone.item[0].phnNum);
			$('#etrncAddr').attr('href','mailto:'+response.CustomerOrgElectronicAddress.item[0].etrncAddr);
			$('#etrncAddr').html('<i class="fas fa-envelope"></i> '+response.CustomerOrgElectronicAddress.item[0].etrncAddr);
		}).fail(function(xhr, textStatus, errorThrown) {
			alert("Error: "+msg.errorMessage);
		});
	}
	
	
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
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			cache: true
		}).then(function(response) {
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
			alert("Error: "+msg.errorMessage);
		});
	}
	
	
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
	
	
	$.fn.loadTasks = function(countOnly) {
		//owner=admin should filter tasks. Probably should create a role for DMs or use manager user
		var url = REST_URL+'/task.json?applicationName=Customer360&businessEntity=Classification,CustomerOrg,CustomerPerson,Store&rawStatus=RESERVED,IN_PROGRESS,READY,CREATED&recordsToReturn=50&taskType=AVOSBeFinalReview,AVOSBeUpdate';
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
			alert("Error: "+msg.errorMessage);
		});
	}
	
	
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
	
	
	$.fn.editHours = function() {
		$('#hoursModal').modal();
	}
	
	
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
			var alert='<div class="alert alert-success alert-danger fade show" role="alert" id="attrAlert" data-dismiss="alert"><strong>Uh-oh!</strong>'+msg.errorMessage+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
			$('#hoursAlert').append(alert);
			console.log(msg);
		});
		
		
		
	}
})(jQuery);
