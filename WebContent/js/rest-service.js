var RESTService = {

	get: function(url, profile, callback) {
		$.mobile.loading("show");
		if (url.charAt(0) != "/") url = "/" + url;
		$.ajaxSetup({ cache: false });
		var options = {
			url: profile.url() + "/mobile" + url, 
			crossDomain: false, 
			type: "GET", 
			dataType: "json", 
			beforeSend: function (request) {
				if (profile.user !== undefined) request.setRequestHeader("Authorization", "Basic: " + window.btoa(profile.user.token));
			}
		};
		
		$.ajax(options).done(function(data, textStatus, jqxhr) {
			console.log(url + " " + jqxhr.status);
			if (jqxhr.status == 304 || jqxhr.status == 204) {
				callback({data: null, status: jqxhr.status});	
			} else {
				callback({data: data, status: jqxhr.status, etag: jqxhr.getResponseHeader('ETag')});	
			}
			if (jqxhr.getResponseHeader('ETag')) console.log("ETag: " + jqxhr.getResponseHeader('ETag'));
			$.mobile.loading("hide");
		}).fail(function(jqxhr, textStatus, error) {
			callback({status: jqxhr.status, error: error});
			$.mobile.loading("hide");
		});		
	},
	post: function(url, profile, data, callback) {
		$.mobile.loading("show");
		if (url.charAt(0) != "/") url = "/" + url;
		var options = {
			url: profile.url() + "/mobile" + url, 
			crossDomain: false, 
			type: "POST", 
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			beforeSend: function (request) {
				if (profile.user !== undefined) request.setRequestHeader("Authorization", "Basic: " + window.btoa(profile.user.token));
			}
		};
		if (data) {
			options.data = JSON.stringify(data);
		}
		
		$.ajax(options).done(function(data, textStatus, jqxhr) {
			console.log(url + " " + jqxhr.status);
			if (jqxhr.getResponseHeader('ETag')) console.log("ETag: " + jqxhr.getResponseHeader('ETag'));
			if (jqxhr.status == 304 || jqxhr.status == 204) {
				callback({data: null, status: jqxhr.status});	
			} else {
				callback({data: data, status: jqxhr.status, etag: jqxhr.getResponseHeader('ETag')});	
			}
			$.mobile.loading("hide");
		}).fail(function(jqxhr, textStatus, error) {
			callback({status: jqxhr.status, error: error});
			$.mobile.loading("hide");
		});		
	}
};