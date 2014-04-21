$("#btn-message").click(function() {
	var data = {
			"childId": iportalen.currentChild.id,
	};
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var dialog = $("#message");
	dialog.find("#message-comment").val("");
	dialog.find("#btn-message-send").addClass("ui-disabled");
	dialog.find("#message-comment").on('input', function(){
		if (dialog.find("#message-comment").val().length) {
			dialog.find("#btn-message-send").removeClass("ui-disabled");
		} else {
			dialog.find("#btn-message-send").addClass("ui-disabled");
		} 
	});
	dialog.find("a[id^=btn]").off("click");
	dialog.find("#btn-message-send").click(function() {
		data.body = dialog.find("#message-comment").val();
		RESTService.post("/message.do", profile, data, iportalen.mySwiper.currentSlide().refresh);
	});
	dialog.popup("open", { transition: "fade" });
});


$(document).on("pageshow", "#messages", function(event, ui) {
	var day = iportalen.currentChild.day;
	var page = $("#messages");
	$.each(day.messages, function() {
		var div = $("<div data-role='list-divider' class='ui-li ui-li-divider ui-bar-b ui-first-child private-header'>")
		div.append($("<span>").addClass("normal-text").text("Fra " + this.from))
		div.append($("<span>").addClass("normal-right-text").text(moment(new Date(this.timestamp)).fromNow()));
		page.append(div);
		page.append($("<p>").addClass("normal-text").html(this.body.replace(/\n/g, "<br>")));
	});
	page.trigger("create");
});