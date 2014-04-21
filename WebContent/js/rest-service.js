var RESTService = {
	getCommonOptions: function(profile, url) {
		return {
			url: profile.url() + "/mobile/v3" + url,
			crossDomain: true,
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			converters: {"text json": function (jsonValue) {
				return JSON.parse(jsonValue, function(key, value) {
					if(typeof value == "string" && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return moment(value);
					return value;
				});
			}},
			beforeSend: function (request) {
				if (profile.user !== undefined) request.setRequestHeader("Authorization", "Basic: " + window.btoa(profile.user.token));
			}
		};

	},
	get: function(url, profile, callback) {
		$.mobile.loading("show");
		if (url.charAt(0) != "/") url = "/" + url;
		$.ajaxSetup({ cache: false });
		var options = this.getCommonOptions(profile, url);
		options.type = "GET"

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
		var options = this.getCommonOptions(profile, url);
		options.type = "POST"
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
