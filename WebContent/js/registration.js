$("#btn-sickness,#btn-vacation").click(function(event) {
	var isSick = event.currentTarget.id == "btn-sickness";
	var dialog = $("#registration"); 
	if (isSick) {
		dialog.find("#registration-comment-box").show();
		dialog.on("popupafteropen ", function () {
			dialog.find("#registration-comment").focus();
		});
	} else {
		dialog.find("#registration-comment-box").hide();
	}
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var data = {
			"childId": iportalen.currentChild.id,
	};
	dialog.find("a[id^=btn]").off("click");
	dialog.find("#btn-registration-today").click(function() {
		var today = new Date();
		data.from = today;
		if (isSick) {
			data.comment = $("#registration-comment").val();
		}
		RESTService.post(isSick ? "/sickness.do" : "/vacation.do", profile, data, iportalen.mySwiper.currentSlide().refresh);
	});
	dialog.find("#btn-registration-tomorrow").click(function() {
		var tomorrow = new Date(new Date().getTime()+(60*60*24*1000));
		data.from = tomorrow;
		if (isSick) {
			data.comment = $("#registration-comment").val();
		}
		RESTService.post(isSick ? "/sickness.do" : "/vacation.do", profile, data, iportalen.mySwiper.currentSlide().refresh);
	});

	dialog.find("#registration-title").text(isSick ? "Meld sygdom" : "Meld fridag");
	dialog.popup("open", { transition: "fade" });	
});