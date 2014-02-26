$(document).on("click", "[data-activity-id]", function (event) {
   iportalen.dialogParams = {id: $(event.target).parent().attr("data-activity-id")}
	$("#confirm-activity-cancellation").popup("open", { transition: "fade" });
});

$("#btn-cancel-activity").click(function() {
	var data = {
			"childId": iportalen.currentChild.id,
	};
	var params = iportalen.dialogParams;
    iportalen.dialogParams = undefined;
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	RESTService.post("/activity/notToday.do?" + $.param({"id":params.id}), profile, null, iportalen.mySwiper.currentSlide().refresh);
});

