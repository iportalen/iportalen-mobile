$(document).on("pageshow", "#login", function() {
	
	var loginFunction = function() {
		var userId = page.find('#user').val();
		
		RESTService.get("login.do?" + $.param({user:userId, password:btoa(page.find('#password').val())}), profile, function(result) {
			if (result.status == 200) {
				profile.user = result.data;
				profile.refreshSetting(function(result) {
					iportalen.profiles.addProfile(profile.name, profile.host, profile.user);
					history.back();
				});
			}
		});
	};
	
	var page = $("#login");
	var realm = location.search.replace( "?", "" );
	var profile = iportalen.profiles.getProfile(realm);
	
	if (realm !== "" && profile === null) {
		history.back();
		return;
	}
	
	page.find("#title").text(profile.name || "Ny profil");
	if(profile.user) {
		page.find("#host").val(profile.host);
		page.find("#user").val(profile.user.userId);
		page.find("#edit-profile-div").show();
		page.find("#update-btn").click(function() {
			if (page.find("#update-btn").text() == "Opdater profil") {
				loginFunction();
			} else {
				$.mobile.changePage("confirm-delete-profile.html", {data: realm});
			}
		});
	} else {
		page.find("#new-profile-div").show();
	}
	page.find("#remember-me").prop("checked", (profile.user && profile.user.token) || true).checkboxradio("refresh");
	page.find("#host").focus();
	page.find("#user").focus(function() {
		var host = $("#host").val();
		if (host === profile.host) return;
		page.find("#login-btn").button("disable");
		if(host.indexOf(".") == -1 && host.indexOf(":") == -1) {
			$("#host").val(host+".iportalen.dk");
		}
		profile.host = $("#host").val(); 
		RESTService.get("name.do", profile, function(result) {
			if (result.status == 200) {
				page.find("#title").text(profile.name = result.data);
				page.find("#login-btn").button("enable");
			}
		});
	});
	
	page.find('#login-btn').click(loginFunction);
	
	if (realm) {
		page.find("input").change(function(event) {
			var changed = false;
			if (page.find("#host").val() !== profile.host) changed = true;
			if (page.find("#user").val() !== profile.user.userId) changed = true;
			if (page.find("#password").val() !== "") changed = true;
			if (page.find("#remember-me").prop("checked") && profile.user.token === null) changed = true;
			if (page.find("#remember-me").prop("checked") == false && profile.user.token !== null) changed = true;
			page.find("#update-btn").text(changed ? "Opdater profil" : "Slet profil").button("refresh");
		});		
	}
});

$(document).delegate('div[data-role=dialog]', 'pageinit', function(event) {
	if (event.target.id !== "confirm-delete") return;
	var page = $(event.target);
	var realm = location.search.replace( "?", "" );
	var profile = iportalen.profiles.getProfile(realm); 
	page.find("#delete-question").text("Slet " + profile.name+"?");
	page.find("#btn-delete").click(function() {
		iportalen.profiles.removeProfile(realm);
	});
});