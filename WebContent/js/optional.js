$(document).on("pagebeforeshow", "#optional", function(event, ui) {
	var refresh = function() {
		iportalen.mySwiper.currentSlide().refresh(true);
		history.back();
	};
	var day = iportalen.currentChild.day;
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var page = $("#optional");
	var params = $.parseParams(window.location.search);
	var data = {
			id: params.id
	};
	if (day.optional && day.optional.deleted) {
		RESTService.post("/optionalleavetime/cancel.do", profile, data, refresh);
	} else {
		var minutesSelectors = page.find("select[id$=-minutes]");
		var hoursSelectors = page.find("select[id$=-hours]");
		$.each(profile.setting.sendoff, function() {
			var minutes = new String(this);
			if (minutes.length == 1) minutes = "0" + this;
			minutesSelectors.append($("<option>").text(minutes));
		});
		var startHourSelect = page.find("#start-hours");
		var endHourSelect = page.find("#end-hours");
		var startMinuteSelect = page.find("#start-minutes");
		var endMinuteSelect = page.find("#end-minutes");
		var sendHome = page.find("#sendHome");
		if (day.optionalLeaveTime) {
			var startMinutes = day.optionalLeaveTime.beginTime.slice(14,16);
			var endMinutes = day.optionalLeaveTime.endTime ? day.optionalLeaveTime.endTime.slice(14,16) : "";
			startMinuteSelect.val(startMinutes);
			endMinuteSelect.val(endMinutes);
			minutesSelectors.selectmenu("refresh");
			var hours = day.optionalLeaveTime.beginTime.slice(11,13);
			if (hours.charAt(0) === '0') hours = hours.slice(1,2);
			startHourSelect.val(hours);
			hours = day.optionalLeaveTime.endTime.slice(11,13);
			if (hours.charAt(0) === '0') hours = hours.slice(1,2);
			endHourSelect.val(hours);
			hoursSelectors.selectmenu("refresh");
			sendHome.prop("checked", day.optionalLeaveTime.sendHome);
			sendHome.checkboxradio("refresh");
			page.find("#updateBar").show();
		} else {
			page.find("#createBar").show();
		}
		
		page.find("select").change(function() {
			if (startMinuteSelect.val() && startHourSelect.val()) {
				$("a[data-theme=b]").removeClass("ui-disabled");
			} else {
				$("a[data-theme=b]").addClass("ui-disabled");
			}
			if (endMinuteSelect.val() && endHourSelect.val()) {
				sendHome.removeClass("ui-disabled");
			} else {
				sendHome.addClass("ui-disabled");
			}
		});
		
		page.find("#btn-delete").click(function() {
			$.mobile.changePage("confirm-delete-optional.html");
		});
		page.find("#btn-update").click(function() {
			var beginTime = new Date();
			beginTime.setHours(startHourSelect.val(), startMinuteSelect.val());
			data.beginTime = beginTime.jsonFormat();
			if (sendHome.hasClass("ui-disabled") === false) {
				var endTime = new Date();
				endTime.setHours(endHourSelect.val(), endMinuteSelect.val());
				data.endTime = endTime.jsonFormat();
				data.sendHome = sendHome.is(":checked");
			} 
			RESTService.post("/optionalleavetime/update.do", profile, data, refresh);
		});
		page.find("#btn-today").click(function() {
			RESTService.post("/TODO", profile, data, refresh);
		});
		page.find("#btn-tomorrow").click(function() {
			RESTService.post("/TODO", profile, data, refresh);
		});
	}
});

$(document).delegate('div[data-role=dialog][id=confirm-delete-optional]', 'pageinit', function(event) {
	var page = $(event.target);
	page.find("#btn-delete").click(function() {
		iportalen.currentChild.day.optionalLeaveTime.deleted = true;
	});
});
