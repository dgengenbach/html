"use strict";
angular.module("customerAppUiApp", ["ngAnimate", "ngCookies", "ngMessages", "ngResource", "ngRoute", "ngSanitize"]).constant("CONFIG", {
	CustomerAppUrl : "/CustomerAppRest/rest",
	SifRestUrl : "/SifRestServices/orcl-TCR_HUB_NEW",
	CoCsUrl : "/active-bpel/services/REST",
	
	WriteService: "RestWriteParty",
	SourceSystem:"CRM",
	Theme : "airlines",
	CoCsCred : {
		login : "admin",
		password : "admin"
	},
	StrikeIronCred : {
		login : "informatica.na.sfdc@gmail.com",
		password : "Infa2015"
	}
}).config(["$routeProvider", "CONFIG", function (a, b) {
			a.when("/", {
				templateUrl : "views/" + b.Theme + "/main/index.html",
				controller : "MainCtrl"
			}).when("/about", {
				templateUrl : "views/about.html",
				controller : "AboutCtrl"
			}).when("/login", {
				templateUrl : "views/" + b.Theme + "/login/index.html",
				controller : "LoginCtrl",
				controllerAs : "loginCtrl"
			}).when("/register", {
				templateUrl : "views/" + b.Theme + "/register/index.html",
				controller : "RegisterCtrl",
				controllerAs : "registerCtrl"
			}).when("/registerPerson", {
				templateUrl : "views/" + b.Theme + "/registerPerson/index.html",
				controller : "RegisterCtrl",
				controllerAs : "registerCtrl"
			}).when("/myaccount", {
				templateUrl : "views/" + b.Theme + "/myaccount/index.html",
				controller : "MyAccountCtrl",
				controllerAs : "MyAcc"
			}).otherwise({
				redirectTo : "/register"
			})
		}
	]), (jQuery), angular.module("customerAppUiApp").controller("MainCtrl", ["$scope", function (a) {
			a.awesomeThings = ["HTML5 Boilerplate", "AngularJS", "Karma"]
		}
	]), angular.module("customerAppUiApp").controller("AboutCtrl", ["$scope", function (a) {
			a.awesomeThings = ["HTML5 Boilerplate", "AngularJS", "Karma"]
		}
	]), angular.module("customerAppUiApp").controller("LoginCtrl", ["$scope", "$location", "UserService", function (a, b, c) {
			var d = this;
			this.login = function () {
				c.login(d.username, d.password).then(function () {
					b.path("/myaccount")
				}, function () {
					d.error = "Incorrect Username or Password"
				})
			}
		}
	]), angular.module("customerAppUiApp").controller("RegisterCtrl", ["$scope", "$q", "$location", "PartyService", "UserService","$interval", function (a, b, c, d, e,f) {
			var g = this;
			var userdata;
			$.getJSON('http://freegeoip.net/json/?callback=?', function(data) {
				userdata  =data;
			});
			
			g.party = {},
			g.showPopup = false,
			g.showLoading = false,
			g.showLog = false,
			
			g.phonesToSave = [],
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
            	g.showPopup = true;
                    	
				
			},
			g.fn = function ()
			{
				g.progress += 10;
			},
			g.ok = function () {
				c.path("myaccount")
			},
			g.UserException = function (message,data) {
				   this.message = message;
				   this.name = 'UserException';
				   this.data = data;
				},
			g.reg = function () {
				
				g.partyS = new d,
				g.progress = 10,
				g.showLoading = true,
				angular.forEach(g.party, function (a, b) {
					"address" !== b && (g.partyS[b] = a)
				}),
				g.partyS.login = g.party.email.emailAddress,
				g.partyS.addresses = [],
				g.partyS.addresses.push(g.party.address),
				g.partyS.phones = g.phonesToSave = _.filter(g.party.phones, function (a) {
						return null != a.phoneNumber && "" != a.phoneNumber
					});
				g.partyS.$save(function (a, b) {
					console.log("Location="+b("Location"));
					console.log(a);
					g.party.id = a.id;
					g.progress += 10;
					
				}).then(function () {
					
					g.int1 = f(g.fn, 1000, 7, true, null);
					try{
					 e.setUser(angular.copy(g.party));
					 return e.saveInMDM();
					}
					catch(error)
                    {
                 	     f.cancel( g.int1);
	                    	 g.showLoading = false;
						     g.message("Error " + (error.statusText!=null?error.statusText:error.message),error.data!=null?error.data:error.stack);
	                         console.log("Error " + error.data); // Error!
	                         g.log("Error " + error.data); 
	                         
                    }
				}).then(function (a) {
					console.log("Test:", a);
					f.cancel( g.int1),
					g.showLoading = false,
					g.partyS.mdmId = a.data.WriteView.NewRowID.$t,
					g.party.mdmId = a.data.WriteView.NewRowID.$t,
					e.setUser(angular.copy(g.party)),
					g.partyS.$update(),
					g.message("You have been successfully registered",""),
					g.showPopup = true
				},
				function(error) {
                	f.cancel( g.int1);
               	    g.showLoading = false;
				    g.message("Error " + error.status + ": " + error.statusText,error.data);
                    console.log("Error " + error.data); // Error!
                    g.log("Error " + error.data); 
				}
				)
			}
		}
	]), angular.module("customerAppUiApp").controller("MyAccountCtrl", ["$scope", "$location", "PartyService", "UserService", function (a, b, c, d) {
			var e = this;
			e.isDisabled = !0,
			d.User ? e.User = d.User : b.path("/login"),
			e.save = function () {
				e.PartyS = new c,
				angular.forEach(e.User, function (a, b) {
					e.PartyS[b] = a
				}),
				e.PartyS.$update().then(function () {
					d.saveInMDM()
				})
			}
		}
	]), angular.module("customerAppUiApp").factory("PartyService", ["$resource", "CONFIG", function (a, b) {
			var c = a(b.CustomerAppUrl + "/people/:personId", {
					personId : "@id"
				}, {
					update : {
						method : "PATCH",
						transformResponse : function (a, b) {
							return b
						}
					}
				});
			return c
		}
	]), angular.module("customerAppUiApp").service("UserService", ["$http", "$q", "CONFIG", "CompositeService", function (a, b, c, d) { {
				var e = this;
				b.defer()
			}
			e.User = null,
			e.id = null;
			e.MdmCO = null,
			e.login = function (d, f) {
				var g = b.defer();
				return a.get(c.CustomerAppUrl + "/people/search/findByLoginAndPassword/?login=" + d + "&password=" + f).then(function (a) {
					a.data && a.data._embedded && a.data._embedded.people ? (e.User = a.data._embedded.people[0], e.User.dateOfBirth = e.User.dateOfBirth ? new Date(e.User.dateOfBirth) : e.User.dateOfBirth, g.resolve(!0)) : g.reject(!1)
				}),
				g.promise
			},
			e.setUser = function (a) {
				e.User = a,
				e.User.dateOfBirth = e.User.dateOfBirth ? new Date(e.User.dateOfBirth) : e.User.dateOfBirth
			},
			e.saveInMDM = function (a, b) {
				var a = a || e.User,
				b = b || e.generateMdmCO(a);
				return a ? d.createCo("/"+c.WriteService, b,null) : !1
			},
			e.generateMdmCO = function (a) {
				
				
				var d = angular.copy(a);
				
				
			     d.sourceKey ="CRM-"+(a.address.country==null?"":a.address.country)+"-"+a.id;
			     d.BEName = d.frstNm?"CustomerPerson":"CustomerOrg";
				
				return d
			},
			e.addDataToMdmCO = function (a, b) {
				a && b && ($.extend( a, b ));
			}
		}
	]), angular.module("customerAppUiApp").directive("formatDate", function () {
	return {
		require : "ngModel",
		link : function (a, b, c, d) {
			d.$formatters.push(function (a) {
				return a ? new Date(a) : void 0
			})
		}
	}
}), angular.module("customerAppUiApp").service("AddressCleansingService", ["$http", "CONFIG", function (a, b) {
			this.cleanAddress = function (c) {
				return a.post(b.SifRestUrl + "/cleanse/Custom%7CCleanse%20Address", c)
			}
		}
	]), angular.module("customerAppUiApp").service("PhoneCleansingService", ["$http", "CONFIG", function (a, b) {
			var c = {
				Password : b.StrikeIronCred.password,
				UserID : b.StrikeIronCred.login
			};
			this.cleanPhone = function (d) {
				return c.PhoneNumber = d,
				a.post(b.SifRestUrl + "/cleanse/Custom%7CParse%20Phone%20Number", c)
			}
		}
	]), angular.module("customerAppUiApp").service("EmailCleansingService", ["$http", "CONFIG", function (a, b) {
			var c = {
				validate : true
			};
			this.validateEmail = function (d) {
				return c.Email = d,
				a.post(b.SifRestUrl + "/cleanse/Informatica%20Data%20as%20a%20Service%7CEmail%20Address%20Verification", c)
			}
		}
	]), angular.module("customerAppUiApp").directive("infaAddress", ["AddressCleansingService", function (a) {
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
					var c = [],
					d = {
						"Address Line 1" : "addressLine1",
						"Address Line 2" : "addressLine2",
						City : "cityName",
						"Country Code" : "country",
						Latitude : "latitude",
						Longitude : "longitude",
						"Postal Code" : "postalCd",
						State : "stateProvince",
						"Street Name" : "streetName",
						"Street Number" : "streetNumber",
						"Validation Status" : "validationStatus"
					},
					e = {
						addressLine1 : "Address Line 1",
						addressLine2 : "Address Line 2",
						streetName : "Street Name",
						streetNumber : "Street Number",
						cityName : "City",
						stateProvince : "State",
						postalCd : "Postal Code",
						country : "Country Code"
					};
					b.address.country = "USA",
					b.isValidAddressField = function (a) {
						return ("Y" == b.address.validationStatus || "C4" == b.address.validationStatus || "V4" == b.address.validationStatus) && c.indexOf(e[a]) > -1
					},
					b.cleanseAddress = function () {
						var e = {
							"Address Line 1" : b.address.addressLine1,
							"Address Line 2" : b.address.addressLine2,
							City : b.address.cityName,
							State : b.address.stateProvince,
							"Zip Code" : b.address.postalCd,
							"Country Code" : b.address.country
						};
						a.cleanAddress(e).then(function (a) {
							console.log(a),
							b.addressValidationStatus = {},
							angular.forEach(a.data, function (a, e) {
								b.address[d[e]] = a,
								c.push(e),
								"Validation Status" === e && ("Y" === a || "C4" === a || "V4" === a ? (b.address.validationStatusDescription = "Valid", b.address.validationStyle = "alert-success") : (b.address.validationStatusDescription = "Invalid", b.address.validationStyle = "alert-warning"))
							})
						})
					}
				}
			}
		}
	]).directive("infaAddressFields", ["$q", "AddressCleansingService", function (a) {
			return {
				restrict : "AE",
				require : "ngModel",
				link : function (b, c, d, e) {
					e.$asyncValidators.address = function (c) {
						if (e.$isEmpty(c))
							return a.when();
						var d = a.defer();
						return PhoneCleansingService.cleanPhone(c).then(function (a) {
							a.data.DecoratedPhoneNumber && (c = a.data.DecoratedPhoneNumber),
							b.phone.validationStatusDescription = a.data.StatusDescription,
							"201" == a.data.StatusNbr ? (b.phone.validationStatus = "Valid", d.resolve()) : (b.phone.validationStatus = "Invalid", d.reject())
						}, function (a) {
							console.log(a),
							b.phone.validationStatus = "Invalid",
							b.phone.validationStatusDescription = a.statusText,
							d.reject()
						}),
						d.promise
					}
				}
			}
		}
	]), angular.module("customerAppUiApp").directive("infaPhones", function () {
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
			},
			a.cleansePhones = function () {
				a.$broadcast("cleansePhone")
			}
		}
	}
}), angular.module("customerAppUiApp").directive("infaEmail", ["EmailCleansingService", function (a) {
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
					b.validateEmail = function () {
						a.validateEmail(b.email.emailAddress).then(function (a) {
							b.email.emailAddress,
							b.email.validationStatus = a.data.StatusDescription + " : " + a.data.ReasonDescription,
							b.email.validationStyle = "200" == a.data.StatusNbr ? "alert-success" : "alert-warning"
						})
					}
				}
			}
		}
	]).directive("infaEmailField", ["$q", "EmailCleansingService", function (a, b) {
			return {
				restrict : "AE",
				require : "ngModel",
				link : function (c, d, e, f) {
					f.$asyncValidators.email = function (d) {
						if (f.$isEmpty(d))
							return a.when();
						var e = a.defer();
						return b.validateEmail(d).then(function (a) {
							c.email.emailAddress,
							c.email.validationStatus = a.data.StatusDescription + " : " + a.data.ReasonDescription,
							"200" == a.data.StatusNbr ? e.resolve() : e.reject()
						}, function (a) {
							console.log(a),
							c.email.emailValidationStatus = {},
							c.email.emailValidationStatus.status = a.statusText,
							e.reject()
						}),
						e.promise
					}
				}
			}
		}
	]), angular.module("customerAppUiApp").directive("infaPhone", ["PhoneCleansingService", function (a) {
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
					function c() {
						b.phone.phoneNumber ? a.cleanPhone(b.phone.phoneNumber).then(function (a) {
							a.data.DecoratedPhoneNumber && (b.phone.phoneNumber = a.data.DecoratedPhoneNumber),
							b.phone.validationStatusDescription = a.data.StatusDescription,
							"201" == a.data.StatusNbr ? (b.phone.validationStatus = "Valid", b.phone.validationStyle = "alert-success") : (b.phone.validationStatus = "Invalid", b.phone.validationStyle = "alert-warning")
						}) : b.phone.validationStatus = null
					}
					b.phone = b.phone || {},
					b.getTemplateUrl = function () {
						return b.templateUrl
					},
					b.$on("cleansePhone", function () {
						c()
					}),
					b.cleansePhone = c
				}
			}
		}
	]).directive("infaPhoneField", ["$q", "PhoneCleansingService", function (a, b) {
			return {
				restrict : "AE",
				require : "ngModel",
				link : function (c, d, e, f) {
					f.$asyncValidators.phone = function (d) {
						if (f.$isEmpty(d))
							return a.when();
						var e = a.defer();
						return b.cleanPhone(d).then(function (a) {
							a.data.DecoratedPhoneNumber && (c.phone.phoneNumber = a.data.DecoratedPhoneNumber),
							c.phone.validationStatusDescription = a.data.StatusDescription,
							"201" == a.data.StatusNbr ? (c.phone.validationStatus = "Valid", c.phone.validationStyle = "alert-success", e.resolve()) : (c.phone.validationStatus = "Invalid", c.phone.validationStyle = "alert-warning", e.reject())
						}, function (a) {
							console.log(a),
							c.phone.validationStatus = "Invalid",
							c.phone.validationStatusDescription = a.statusText,
							e.reject()
						}),
						e.promise
					}
				}
			}
		}
	]), angular.module("customerAppUiApp").service("CompositeService", ["$http", "CONFIG", function (a, b) {
			function c(c, d, e, f) {
				var g = b.CoCsUrl + d;
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
			this.createCo = function (a, b, params) {
				return c("POST", a, b, params)
			},
			this.updateCo = function (a, b, params) {
				return c("POST", a, b, params)
			},
			this.deleteCo = function (a, b) {
				return c("DELETE", a, null, b)
			}
		}
	]);
