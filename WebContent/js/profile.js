$(document).on("pageshow", "#profiles", function() {
	var page = $("#profiles");
	var listview = page.find("#profiles-list");
	$.each(iportalen.profiles.all(), function() {
		listview.append($("<li>").append($("<a>").prop("href", "login.html?"+this.user.realm).text(this.name)));
	});
	listview.listview("refresh");
	$('a').each(function() {
	    $(this).attr('data-transition','slidedown'); 
	});
});
$(document).on("pageshow", "#profile", function() {
	var page = $("#profile");
	
	var profile = iportalen.profiles.all()[0];
	var userProfile;
	RESTService.get("user.do?"+$.param({"userId": profile.user.userId}), profile, function(result) {
		if (result.status === 200) {
			userProfile = result.data;
			updateView();
		}
	});
	
	$("#profileForm").validate(
	{
		debug: true,
		rules: {
			firstName: {
				required: true
			},
			lastName: {
				required: true
			},
			zipcode: {
				digits: true
			},
			workZipcode: {
				digits: true
			},
			mobilePhone: {
				digits: true
			},
			phone: {
				digits: true
			}
		},
		errorPlacement: function (error, element) {				
			error.appendTo(element.closest('.ui-field-contain'));
		},
		submitHandler: function(form) {
			console.log("User profile update submitted");
			updateProfile();
			iportalen.profiles.userProfile(userProfile);
			postForm();
   			return false;
  		}
	});
	
	function updateView() {
		page.find("#firstName").val(userProfile.firstName);
		page.find("#lastName").val(userProfile.lastName);
		page.find("#address").val(userProfile.address);
		page.find("#zipcode").val(userProfile.zipcode);
		page.find("#city").val(userProfile.city);
		page.find("#email").val(userProfile.email);
		page.find("#mobilePhone").val(userProfile.mobilePhone);
		page.find("#phone").val(userProfile.phone);
		page.find("#privateInformation").prop("checked", userProfile.privateInformation).flipswitch("refresh");
		page.find("#workName").val(userProfile.workName);
		page.find("#workAddress").val(userProfile.workAddress);
		page.find("#workZipcode").val(userProfile.workZipcode);
		page.find("#workCity").val(userProfile.workCity);
		page.find("#workEmail").val(userProfile.workEmail);
		page.find("#workPhone").val(userProfile.workPhone);
	}
	
	function updateProfile() {
		userProfile.firstName = page.find("#firstName").val();
		userProfile.lastName = page.find("#lastName").val();
		userProfile.address = page.find("#address").val();
		userProfile.zipcode = page.find("#zipcode").val();
		userProfile.city = page.find("#city").val();
		userProfile.email = page.find("#email").val();
		userProfile.mobilePhone = page.find("#mobilePhone").val();
		userProfile.phone = page.find("#phone").val();
		userProfile.privateInformation = page.find("#privateInformation").prop("checked");
		userProfile.workName = page.find("#workName").val();
		userProfile.workAddress = page.find("#workAddress").val();
		userProfile.workZipcode = page.find("#workZipcode").val();
		userProfile.workCity = page.find("#workCity").val();
		userProfile.workEmail = page.find("#workEmail").val();
		userProfile.workPhone = page.find("#workPhone").val();
	}
	
	function postForm(index) {
		var profile = iportalen.profiles.all()[index || 0];
		if (profile) {
			RESTService.post("user.do", profile, userProfile, function(result) {
				if (result.status == 204) {
					postForm(index+1 || 1);
				} else {
					$("#popupError").popup("open", { transition: "fade" });					
				}
			});			
		} else {
			history.back();
		}
	}
});
iportalen.prototypes.profileFunctions = {
		protocol: function() {
			if (this.host === undefined) return;
			return /^localhost.*$/.test(this.host) ? "http://" : "https://";
		},
		url: function() {
			return this.protocol() + this.host;			
		},
		refreshSetting: function(callback) {
			var that = this;
			updateCallback = function(result) {
				if (result.status === 200) {
					that.setting = result.data;
				}
				if (callback !== undefined) {
					callback.call(null, result); 
				}
			};
			RESTService.get("setting.do", this, updateCallback);
		},
		refreshChildren: function(callback) {
			var that = this;
			var updateCallback = function(result) {
				if (result.status === 200) {
					that.user.children = result.data;
				}
				if (callback !== undefined) {
					callback.call(null, result); 
				}
			};
			RESTService.get("children.do", this, updateCallback);
		},
		refreshDay: function(child, callback) {
			child = $.grep(this.user.children, function(innerChild) {
				return innerChild.id == child.id;
			})[0];
			var that = this;
			var updateCallback = function(result) {
				if (result.status === 200) {
					child.day = result.data;
					child.day.lastUpdated = new Date();
					that.save();
				}
				if (callback !== undefined) {
					callback.call(null, result); 
				}
			};
			RESTService.get("/day.do?id=" + child.id, this, updateCallback);
		},
		save: function() {
			var realms = iportalen.profiles.getRealms();
			realms[this.user.realm] = new Date();
			localStorage["iportalen.profile."+this.user.realm] = JSON.stringify(this);
			iportalen.profiles.updateRealms(realms);
		}
};

iportalen.profiles = function() {

	newProfile = function(data) {
		return $.extend(Object.create(iportalen.prototypes.profileFunctions), data);
	}
	var loadProfile = function(realm) {
		var profile = localStorage["iportalen.profile."+realm];
		return newProfile(profile ? JSON.parse(profile) : {});
	}
	var remove = function(realm) {
		var savedProfiles = iportalen.profiles.getRealms(); 
		delete savedProfiles[realm];
		localStorage["iportalen.profiles"] = JSON.stringify(savedProfiles);
		localStorage.removeItem("iportalen.profile."+realm);
	}
	return {
		getRealms: function() {
			return localStorage["iportalen.profiles"] ? JSON.parse(localStorage["iportalen.profiles"]) : {};			
		},
		updateRealms: function(realms) {
			localStorage["iportalen.profiles"] = JSON.stringify(realms);			
		},
		getProfile: function(realm) {
			return loadProfile(realm);
		},
		addProfile: function(name, host, user) {
			if (host === undefined || user === undefined) throw "Both host and user must be specifed";
			var profile = this.getProfile(user.realm);
			profile.user = user;
			profile.host = host;
			profile.name = name;
			profile.save();
			if (iportalen.profiles.changed !== undefined) {
				iportalen.profiles.changed(profile);
			}
		},
		removeProfile: function(realm) {
			var profile = this.getProfile(realm);
			remove(realm);
			if (iportalen.profiles.changed !== undefined) {
				iportalen.profiles.changed(profile);
			}
		},
		isEmpty: function() {
			return this.all().length == 0;
		},
		all: function() {
			var profiles = [];
			var realms = this.getRealms();
			var that = this;
			$.each(realms, function(key, value) {
				profiles.push(that.getProfile(key));
			});
			return profiles;
		},
		userProfile: function(userProfile) {
			if (userProfile === undefined) {
				return JSON.parse(localStorage["userProfile"]);
			} else {
				localStorage["userProfile"] = JSON.stringify(userProfile);
			}
		}
	}
}();
