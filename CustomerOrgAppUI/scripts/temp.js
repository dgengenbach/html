"use strict";
angular.module("gdprAppUiApp", ["ngAnimate", "ngCookies", "ngMessages", "ngResource", "ngRoute", "ngSanitize"]).constant("CONFIG", {
	CustomerAppUrl : "/CustomerAppRest/rest",
	SifRestUrl : "/SifRestServices/orcl-DEMO_WEMBLEY",
	CoCsUrl : "/cmx/cs/orcl-DEMO_WEMBLEY",
	baseURLAVOS: "/active-bpel/services/REST/",	
	Theme : "gdpr",
	CoCsCred : {
		login : "admin",
		password : "admin"
	}
}).config(["$routeProvider", "CONFIG", function (a, b) {
			a.when("/", {
				templateUrl : "views/" + b.Theme + "/search/index.html",
				controller : "searchCtrl",
				controllerAs : "searchCtrl"
			}).when("/search", {
				templateUrl : "views/" + b.Theme + "/search/index.html",
				controller : "searchCtrl",
				controllerAs : "searchCtrl"
			}).otherwise({
				redirectTo : "/search"
			})
		}
	]), function (a) {
		window.CSClient = window.CSClient || {
			baseUrl : "/cmx/cs/orcl-DEMO_WEMBLEY",
			user : "admin",
			pass : "admin",
			process : function (b, c, d, e) {
				var f = this.baseUrl + c + ".json?" + a.param(e);
				return a.ajax({
					method : b,
					url : f,
					data : JSON.stringify(d),
					beforeSend : function (a) {
						a.setRequestHeader("Authorization", "Basic " + btoa(CSClient.user + ":" + CSClient.pass))
					}
				})
			},
			readCo : function (a, b) {
				return this.process("GET", a, null, b)
			},
			createCo : function (a, b, c) {
				return this.process("POST", a, b, c)
			},
			updateCo : function (a, b, c) {
				return this.process("PUT", a, b, c)
			},
			deleteCo : function (a, b) {
				return this.process("DELETE", a, null, b)
			}
		}
	}
	(jQuery), angular.module("gdprAppUiApp").controller("MainCtrl", ["$scope", function (a) {
			a.awesomeThings = ["HTML5 Boilerplate", "AngularJS", "Karma"]
		}
	]), angular.module("gdprAppUiApp").controller("searchCtrl", ["$scope", "$q", "$location", "CompositeService", "GDPRService","$interval",  function (a, b,c,d,e,f) {
			var g = this;		
			
			g.showPopup = false,
			g.showLoading = false,
			g.showLog = false,
			g.showContacts = false,
			g.isSAR = false,
			g.isInvoice = false,
			g.person = {},	
			g.toggleLog = function () {
				g.showLog = (g.showLog==false?true:false);
			},
			g.log = function(msg, json) {
                $('#log').before("<hr/><b>" + msg + "</b>");
                $('#log').before("<pre>" + JSON.stringify(json, undefined, 2) + "</pre>");
            },
            g.message = function(msgH, msgB) {
            	g.messageHead = msgH,
            	g.messageBody = msgB.substr(0,220),
            	g.showPopup = true,
            	g.showContacts = false;          	
				
			},
			g.fn = function ()
			{
				g.progress += 10;
			},
			g.ok = function () {
			
				c.path("main")
			},
			g.UserException = function (message,data) {
				   this.message = message;
				   this.name = 'UserException';
				   this.data = data;
				}
			g.search = function (){
				g.person = {},
				g.progress = 10,
				g.showLoading = true,
				d.searchCo(
						"/Person",
						{
	                        q: g.searchString
	                    }
						).then(
			                    function (result) {
			                    	g.progress += 10;
			                       /* g.log("PERSON FOUND:", result);*/
			                       try{
			                    	   if(result.data.recordCount==0)
			                    		   {
			                    		   throw new g.UserException("No data found","Search returned 0 records");
			                    		   }
			                    	g.rowid = result.data.item[0].Person.rowidObject.trim();
			                        g.int1 = f(g.fn, 1000, 7, true, null);
			                        return e.readFilteredCo(
			                                "/RestReadPerson",
			                                {
			                                    rowId: g.rowid,
			                                    recordState: "ACTIVE",
												filter:g.policy
			                                }
			                        );
			                       }catch(error)
			                       {
			                    	     f.cancel( g.int1);
				                    	 g.showLoading = false;
									     g.message("Error " + (error.statusText!=null?error.statusText:error.message),error.data!=null?error.data:error.stack);
				                         console.log("Error " + error.data); // Error!
				                         g.log("Error " + error.data); 
				                         
			                       }
			                    }
			            ).then(
			                    function (result) {
			                    	try{
			                    	f.cancel( g.int1);
			                    		 
			                    	var personView = result.data.object.PersonView;
			                    	g.isSAR=g.policy=="SAR"?true:false;
			                    	g.isInvoice=g.policy=="Invoicing"?true:false;
			                    	if(personView.namePrefixCd){
			                    	g.person.prefix	= personView.namePrefixCd.namePrefixDisp;
			                    	}
								    g.person.firstName = personView.firstName;
								    g.person.middleName = personView.middleName;
									g.person.lastName = personView.lastName;
									
									if(personView.birthdate){
									g.person.dateOfBirth = new Date(personView.birthdate.$t);
									}
									if(personView.genderCd){
									g.person.gender  = personView.genderCd.genderCd;
									}
									if(personView.VATNumber&&personView.VATNumber.item){
										g.person.vatNumber = personView.VATNumber.item.vatNumber;
										}
									if (personView.GDPRConsents.item&&g.isSAR){
										if (personView.GDPRConsents.item.length>0){
											g.person.GDPRConsents = "";
											for(var i=0;i<personView.GDPRConsents.item.length;i++)
												try{
												
												g.person.GDPRConsents+=personView.GDPRConsents.item[i].consentDesc.$t + ' Proof:'+ personView.GDPRConsents.item[i].consentProofUrl.$t+'\n';
												}catch(e)
												{
													g.person.GDPRConsents+=personView.GDPRConsents.item[i].consentDesc!=null?personView.GDPRConsents.item[i].consentDesc.$t:'Unknown consent' + ' Proof: \n';
												}
										}
										else
											try{
											g.person.GDPRConsents=personView.GDPRConsents.item.consentDesc.$t + ' Proof:'+ personView.GDPRConsents.item.consentProofUrl.$t;
											}catch(e)
											{
												g.person.GDPRConsents=personView.GDPRConsents.item.consentDesc.$t + ' Proof:\n';
											}
										
									}
									if (personView.Address&&personView.Address.item){
										if (personView.Address.item.length>0){
											g.person.addresses = [];
											for(var i=0;i<personView.Address.item.length;i++)
												{ var address = {};
												if(personView.Address.item[i].addressTypeCd){
												address.addressType =  personView.Address.item[i].addressTypeCd.addressTypeDisp;
												}
												address.addressLine1 = personView.Address.item[i].addressLine1
												address.addressLine2 = personView.Address.item[i].addressLine2;
												address.city = personView.Address.item[i].cityName;
												address.state = personView.Address.item[i].stateProvince;
												address.postalCd = personView.Address.item[i].postalCd;
												address.country = personView.Address.item[i].countryCode.countryCodeIso3.$t;
												g.person.addresses.push(address);
												}
										}
										else{
											g.person.addresses = [];
											var address = {};
											if(personView.Address.item.addressTypeCd){
												address.addressType = personView.Address.item.addressTypeCd.addressTypeDisp;
											}
											address.addressLine1 = personView.Address.item.addressLine1;
											address.addressLine2 = personView.Address.item.addressLine2;
											address.city = personView.Address.item.cityName;
											address.state = personView.Address.item.stateProvince;
											address.postalCd = personView.Address.item.postalCd;
											address.country = personView.Address.item.countryCode.countryCodeIso3.$t;
											g.person.addresses.push(address);
										}
									}
									if (personView.Telecom&&personView.Telecom.item){
										if(personView.Telecom.item.length>0)
											{
											g.person.phones = [];
											for(var i=0;i<personView.Telecom.item.length;i++)
												{ var phone = {};
												phone.phoneNumber = personView.Telecom.item[i].phoneNumber;
												phone.phoneCountry = personView.Telecom.item[i].phoneCountryCd;
												if(personView.Telecom.item[i].telecomTypeCd){
												phone.phoneType = personView.Telecom.item[i].telecomTypeCd.telecomTypeDisp;
												}
												g.person.phones.push(phone);
												}
											}
										else
											{g.person.phones = [];
											 var phone = {};
											 phone.phoneNumber = personView.Telecom.item.phoneNumber;
											 phone.phoneCountry = personView.Telecom.item.phoneCountryCd;
											if(personView.Telecom.item.telecomTypeCd){
												phone.phoneType = personView.Telecom.item.telecomTypeCd.telecomTypeDisp;
											}
											g.person.phones.push(phone);
											}
								
									}
									if(personView.URL&&personView.URL.item){
										if(personView.URL.item.length>0)
										{ g.person.emails = [];
										for(var i=0;i<personView.URL.item.length;i++)
											{var email = {};
											email.emailAddress = personView.URL.item[i].electronicAddress;
											g.person.emails.push(email);
											
											}
										}
									else
										{g.person.emails = [];
										g.person.emails.push(
												{
													emailAddress : personView.URL.item.electronicAddress
												}
												);
										}
									}
								
									g.progress += 10;
			                        g.log("SEARCH RETURNED PERSON:", result);
									g.showContacts = true;
									g.showLoading = false;
			                    	}
			                    	catch(error){

			                    	     f.cancel( g.int1);
				                    	 g.showLoading = false;
									     g.message("Error " + (error.statusText!=null?error.statusText:error.message),error.data!=null?error.data:error.stack);
				                         console.log("Error " + error.data); // Error!
				                         g.log("Error " + error.data); 
			                    	}
			                    	
			                    }, function(error) {
			                    	f.cancel( g.int1);
			                    	 g.showLoading = false;
								     g.message("Error " + error.statusText,error.data);
			                         console.log("Error " + error.data); // Error!
			                         g.log("Error " + error.data); 
									 
							}
			            )
				
			}
			
		}
	]),angular.module("gdprAppUiApp").directive("formatDate", function () {
	return {
		require : "ngModel",
		link : function (a, b, c, d) {
			d.$formatters.push(function (a) {
				return a ? new Date(a) : void 0
			})
		}
	}
}),angular.module("gdprAppUiApp").directive("infaPhones", function () {
	return {
		template : '<ng-include src="getTemplateUrl()"/>',
		restrict : "AE",
		scope : {
			phones : "=infaPhones",
			templateUrl : "@"
		},
		link : function (a) {
			a.phones = a.phones || [{}

				],
			a.getTemplateUrl = function () {
				return a.templateUrl
			}
		}
	}
}),angular.module("gdprAppUiApp").directive("infaEmails", function () {
	return {
		template : '<ng-include src="getTemplateUrl()"/>',
		restrict : "AE",
		scope : {
			emails : "=infaEmails",
			templateUrl : "@"
		},
		link : function (a) {
			a.emails = a.emails || [{}

				],
			a.getTemplateUrl = function () {
				return a.templateUrl
			}
		}
	}
}),angular.module("gdprAppUiApp").directive("infaAddresses", function () {
	return {
		template : '<ng-include src="getTemplateUrl()"/>',
		restrict : "AE",
		scope : {
			addresses : "=infaAddresses",
			templateUrl : "@"
		},
		link : function (a) {
			a.addresses = a.addresses || [{}

				],
			a.getTemplateUrl = function () {
				return a.templateUrl
			}
		}
	}
}),angular.module("gdprAppUiApp").directive("infaPhone", function () {
	return {
		templateUrl : function (a, b) {
			return b.templateUrl
		},
		restrict : "AE",
		scope : {
			phone : "=",
			templateUrl : "@"
		},
		link : function (b) {
			
			b.phone = b.phone || {},
			b.getTemplateUrl = function () {
				return b.templateUrl
			},
			b.$on()
		
		}
	}
}
),angular.module("gdprAppUiApp").directive("infaEmail", function () {
			return {
				templateUrl : function (a, b) {
					return b.templateUrl
				},
				restrict : "AE",
				scope : {
					email : "=",
					templateUrl : "@"
				},
				link : function (b) {
					b.email = b.email || {},
					b.getTemplateUrl = function () {
						return b.templateUrl
					},
					b.$on()
					
					
				}
			}
		}
),angular.module("gdprAppUiApp").directive("infaAddress", function() {
		return {
			templateUrl : function (a, b) {
				return b.templateUrl
			},
			restrict : "AE",
			scope : {
				address : "=",
				templateUrl : "@"
			},
			link : function (b) {
				b.address = b.address || {},
				b.getTemplateUrl = function () {
					return b.templateUrl
				};
			
				
     			b.$on()
				
			}
		}
	}
),angular.module("gdprAppUiApp").service("CompositeService", ["$http", "CONFIG", function (a, b) {
			function c(c, d, e, f) {
				var g = b.CoCsUrl + d + ".json";
				return a({
					method : c,
					url : g,
					params : f,
					data : JSON.stringify(e),
					headers : {
						Authorization : "Basic " + btoa(b.CoCsCred.login + ":" + b.CoCsCred.password)
					}
				})
			}
			this.readCo = function (a, b) {
				return c("GET", a, null, b)
			},
			this.createCo = function (a, b, d) {
				return c("POST", a, b, d)
			},
			this.updateCo = function (a, b, d) {
				return c("PUT", a, b, d)
			},
			this.deleteCo = function (a, b) {
				return c("DELETE", a, null, b)
			},
			this.searchCo = function (url, params) {
	            return c("GET", url, null, params);
	        }
		}
	]),angular.module("gdprAppUiApp").service("GDPRService", ["$http", "CONFIG", function (a, b) {
		function c(c, d, e, f) {
			var g = b.baseURLAVOS + d;
			return a({
				method : c,
				url : g,
				params : f,
				data : JSON.stringify(e),
				headers : {
					Authorization : "Basic " + btoa(b.CoCsCred.login + ":" + b.CoCsCred.password)
				}
			})
		}
		
        this.readFilteredCo = function (url, params) {
            return c("GET", url, null, params);
        }
	}
]);
