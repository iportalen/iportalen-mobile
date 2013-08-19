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
				$("#legal1-title").text(legal1.firstName + " " + legal1.lastName);
				addAddress($("#legal1-table"), legal1);
				addPhone($("#legal1-table"), legal1);
				addMobile($("#legal1-table"), legal1);
				addEmail($("#legal1-table"), legal1);
			}
			if (legal2 !== undefined) {
				$("#legal2-title").text(legal2.firstName + " " + legal2.lastName);
				addAddress($("#legal2-table"), legal2);
				addPhone($("#legal2-table"), legal2);
				addMobile($("#legal2-table"), legal2);
				addEmail($("#legal2-table"), legal2);
			}
		}
	});
	
	var addAddress = function(table, legal) {
		if (legal.address || legal.zipcode || legal.city) {
			var tr = $("<tr>");
			table.append(tr);
			var address = legal.address || "";
			var city = null;
			if (legal.zipcode || legal.city) {
				city = legal.zipcode + " " || "";
				city += legal.city || "";
			}
			tr.append($("<td>").addClass("details").prop("valign", "top").text("Adresse"));
			var td = $("<td>");
			td.addClass("details");
			var link = $("<a>").prop("href", "https://maps.google.dk/?q="+address+" "+city);
			link.prop("target", "_blank");
			link.append(address);
			if (city) {
				if (address.length !== 0) link.append($("<br>"));
				link.append(city);
			}
			td.append(link);
			tr.append(td);
		}
	};
	var addPhone = function(table, legal) {
		addPhoneRow(table, legal, legal.phone, "Telefon");
	};
	var addMobile = function(table, legal) {
		addPhoneRow(table, legal, legal.mobilePhone, "Mobil");
	};
	var addPhoneRow = function(table, legal, number, header) {
		if (number) {
			var tr = $("<tr>");
			table.append(tr);
			tr.append($("<td>").addClass("details").prop("valign", "top").text(header));
			var td = $("<td>");
			td.addClass("details");
			var link = $("<a>").prop("href", "tel:"+number).text(number);
			td.append(link);
			tr.append(td);
		}
	};
	var addEmail = function(table, legal) {
		if (legal.email) {
			var tr = $("<tr>");
			table.append(tr);
			tr.append($("<td>").addClass("details").prop("valign", "top").text("E-mail-adresse"));
			var td = $("<td>");
			td.addClass("details");
			var link = $("<a>").prop("href", "mailto:"+legal.email).text(legal.email);
			td.append(link);
			tr.append(td);
		}
	};
});


