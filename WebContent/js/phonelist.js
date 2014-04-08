iportalen.phoneList = function() {
	
	var phoneList = {};
	
	var getPhoneList = function(realm) {
		if (phoneList[realm] === undefined) {
			phoneList[realm] = {};
		}
		return phoneList[realm];
	};
	
	return {
		departments: function(callback) {
			var realm = iportalen.currentChild.realm;
			if (getPhoneList(realm).departments === undefined) {
				var profile = iportalen.profiles.getProfile(realm);
				RESTService.get("/departments.do", profile, function(result) {
					if (result.status === 200) {
						getPhoneList(realm).departments = result.data;
						callback(result.data);
					}
				});
			} else {
				callback(getPhoneList(realm).departments);
			}
		},
		phoneListDepartment: function(departmentId, callback) {
			var realm = iportalen.currentChild.realm;
			if (getPhoneList(realm)["department"+departmentId] === undefined) {
				var profile = iportalen.profiles.getProfile(realm);
				RESTService.get("/phoneList.do?classId=" + departmentId, profile, function(result) {
					if (result.status === 200) {
						getPhoneList(realm)["department"+departmentId] = result.data;
						callback(result.data);
					}
				});
			} else {
				callback(getPhoneList(realm)["department"+departmentId]);
			}
		},
		phoneListChild: function(callback) {
			var realm = iportalen.currentChild.realm;
			var childId = iportalen.currentChild.id;
			if (getPhoneList(realm)["child"+childId] === undefined) {
				var profile = iportalen.profiles.getProfile(realm);
				RESTService.get("/phoneList.do?id=" + childId, profile, function(result) {
					if (result.status === 200) {
						getPhoneList(realm)["child"+childId] = result.data;
						callback(result.data);
					}
				});
			} else {
				callback(getPhoneList(realm)["child"+childId]);
			}
		}
	};
}();

$(document).on("pageshow", "#departments", function(event, ui) {
	iportalen.phoneList.departments(function(departments) {
		var list = $("#departments-list").listview();
		list.empty();
		$.each(departments, function () {
			list.append($("<li>").append($("<a>").prop("href", "phonelist.html?"+$.param({"id":this.id, "name" : this.name})).text(this.name)));
		});
		list.listview("refresh");
	});
});

$(document).on("pageshow", "#phonelist", function(event, ui) {
	
	var displayChildren = function(children) {
		var list = $("#phonelist-list").listview();
		list.empty();
		$.each(children, function () {
			list.append($("<li>").append($("<a>").prop("href", "contact-details.html?"+$.param({"id":this.id, "name":this.firstName})).text(this.firstName + " " + this.lastName)));
		});
		list.listview("refresh");
	};
	
	var params = $.parseParams(window.location.search);
	$("#phonelist-title").text("Telefonliste");
	if (params.id === undefined) {
		iportalen.phoneList.phoneListChild(displayChildren);
	} else {
		$("#phonelist-title").append(" - " + params.name);
		iportalen.phoneList.phoneListDepartment(params.id, displayChildren);
	}
});

$(document).on("pageshow", "#contact-details", function(event, ui) {
	var params = $.parseParams(window.location.search);
	var realm = iportalen.currentChild.realm;
	$("#contact-title").text(params.name + (params.name.match("s$") ? "'" : "'s") + " forældre");
	RESTService.get("user.do?" + $.param({"childId":params.id}), iportalen.profiles.getProfile(realm), function(result) {
		if (result.status === 200) {
			var legal1 = result.data[0]; 
			var legal2 = result.data[1]; 
			if (legal1 !== undefined) {
				$("#legal1-title-header").show();
				$("#legal1-title").text(legal1.firstName + " " + legal1.lastName);
				var legal1Content = $("#legal1-content");
				addAddress(legal1Content, legal1);
				addPhone(legal1Content, legal1);
				addMobile(legal1Content, legal1);
				addEmail(legal1Content, legal1);
			}
			if (legal2 !== undefined) {
				$("#legal2-title-header").show();
				$("#legal2-title").text(legal2.firstName + " " + legal2.lastName);
				var legal2Content = $("#legal2-content");
				addAddress(legal2Content, legal2);
				addPhone(legal2Content, legal2);
				addMobile(legal2Content, legal2);
				addEmail(legal2Content, legal2);
			}
		}
	});
	
	var addAddress = function(table, legal) {
		if (legal.address || legal.zipcode || legal.city) {
			var paragraf = $("<p>");
			table.append(paragraf);
			var address = legal.address || "";
			var city = null;
			if (legal.zipcode || legal.city) {
				city = legal.zipcode + " " || "";
				city += legal.city || "";
			}
			var link = $("<a class='ui-btn ui-btn-icon-left ui-icon-location ui-corner-all'>").prop("href", "https://maps.google.dk/?q="+address+" "+city);
			link.prop("target", "_blank");
			link.append(address);
			if (city) {
				if (address.length !== 0) link.append($("<br>"));
				link.append(city);
			}
			paragraf.append(link);
		}
	};
	var addPhone = function(table, legal) {
		addPhoneRow(table, legal, legal.phone);
	};
	var addMobile = function(table, legal) {
		addPhoneRow(table, legal, legal.mobilePhone);
	};
	var addPhoneRow = function(table, legal, number) {
		if (number) {
			var paragraf = $("<p>");
			table.append(paragraf);
			var link = $("<a class='ui-btn ui-btn-icon-left ui-icon-phone ui-corner-all'>").prop("href", "tel:"+number).text(number);
			paragraf.append(link);
		}
	};
	var addEmail = function(table, legal) {
		if (legal.email) {
			var paragraf = $("<p>");
			table.append(paragraf);
			var link = $("<a class='ui-btn ui-btn-icon-left ui-icon-mail ui-corner-all'>").prop("href", "mailto:"+legal.email).text(legal.email);
			paragraf.append(link);
		}
	};
});


