$(document).on("pagebeforeshow", "#go-home", function(event, ui) {
	var refresh = function() {
		iportalen.mySwiper.currentSlide().refresh(true);
		history.back();
	}
	var day = iportalen.currentChild.day;
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var page = $("#go-home");
	var params = $.parseParams(window.location.search);
	var data = {
			id: params.id
	};
	var minutesSelect = page.find("#select-minutes");
	var hoursSelect = page.find("#select-hours");
	$.each(profile.setting.sendoff, function() {
		var minutes = new String(this);
		if (minutes.length == 1) minutes = "0" + this;
		minutesSelect.append($("<option>").text(minutes));
	});
	if (day.goHome) {
		var minutes = day.goHome.date.format("mm");
		minutesSelect.val(minutes);
		minutesSelect.selectmenu("refresh");
		var hours = day.goHome.date.hour();
		hoursSelect.val(hours);
		hoursSelect.selectmenu("refresh");
		page.find("#updateBar").show();
	} else {
		page.find("#createBar").show();
	}
	
	page.find("select").change(function() {
		if (minutesSelect.val() && hoursSelect.val()) {
			$("a.ui-btn-b").removeClass("ui-disabled");
		} else {
			$("a.ui-btn-b").addClass("ui-disabled");
		}
	});
	
	page.find("#btn-delete").click(function() {
		var dialog = page.find("#confirm-delete-go-home");
		dialog.find("#btn-confirm-delete-go-home").click(function() {
			RESTService.post("/gohome/cancel.do?" + $.param({id: data.id}), profile, data, refresh);
		});
		dialog.popup("open", { transition: "fade" });
	});
	page.find("#btn-update").click(function() {
		var date = new Date();
		date.setHours(hoursSelect.val(), minutesSelect.val());
		data.date = date;
		RESTService.post("/gohome/update.do", profile, data, refresh);
	});
	page.find("#btn-today").click(function() {
		var date = new Date();
		date.setHours(hoursSelect.val(), minutesSelect.val());
		data.date = date;
		RESTService.post("/activity/goHome.do", profile, data, refresh);
	});
	page.find("#btn-tomorrow").click(function() {
		var date = new Date(new Date().getTime()+(60*60*24*1000));
		date.setHours(hoursSelect.val(), minutesSelect.val());
		data.date = date;
		RESTService.post("/activity/goHome.do", profile, data, refresh);
	});
});
