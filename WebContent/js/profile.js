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
			RESTService.get("/v2/day.do?id=" + child.id, this, updateCallback);
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
			remove(realm);
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
		}
	}
}();