$(document).on("pagebeforeshow", "#go-home", function(event, ui) {
	var refresh = function() {
		iportalen.mySwiper.currentSlide().refresh();
		history.back();
	}
	var day = iportalen.currentChild.day;
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var page = $("#go-home");
	var params = $.parseParams(window.location.search);
	var data = {
			id: params.id
	};
	if (day.goHome && day.goHome.deleted) {
		RESTService.post("/gohome/cancel.do?" + $.param({id: data.id}), profile, data, refresh);
	} else {
		var minutesSelect = page.find("#select-minutes");
		var hoursSelect = page.find("#select-hours");
		$.each(profile.setting.sendoff, function() {
			var minutes = new String(this);
			if (minutes.length == 1) minutes = "0" + this;
			minutesSelect.append($("<option>").text(minutes));
		});
		if (day.goHome) {
			var minutes = day.goHome.date.slice(14,16);
			minutesSelect.val(minutes);
			minutesSelect.selectmenu("refresh");
			hoursSelect.val(day.goHome.date.slice(11,13));
			hoursSelect.selectmenu("refresh");
			page.find("#updateBar").show();
		} else {
			page.find("#createBar").show();
		}
		
		page.find("select").change(function() {
			if (minutesSelect.val() && hoursSelect.val()) {
				$("a[data-theme=b]").removeClass("ui-disabled");
			} else {
				$("a[data-theme=b]").addClass("ui-disabled");
			}
		});
		
		page.find("#btn-delete").click(function() {
			$.mobile.changePage("confirm-delete-go-home.html");
		});
		page.find("#btn-update").click(function() {
			var date = new Date();
			date.setHours(hoursSelect.val(), minutesSelect.val());
			data.date = date.jsonFormat();
			RESTService.post("/gohome/update.do", profile, data, refresh);
		});
		page.find("#btn-today").click(function() {
			var date = new Date();
			date.setHours(hoursSelect.val(), minutesSelect.val());
			data.date = date.jsonFormat();
			RESTService.post("/activity/goHome.do", profile, data, refresh);
		});
		page.find("#btn-tomorrow").click(function() {
			var date = new Date(new Date().getTime()+(60*60*24*1000));
			date.setHours(hoursSelect.val(), minutesSelect.val());
			data.date = date.jsonFormat();
			RESTService.post("/activity/goHome.do", profile, data, refresh);
		});
	}
});

$(document).delegate('div[data-role=dialog][id=confirm-delete-go-home]', 'pageinit', function(event) {
	var page = $(event.target);
	page.find("#btn-delete").click(function() {
		iportalen.currentChild.day.goHome.deleted = true;
	});
});
