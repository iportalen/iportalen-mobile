$("#btn-message").click(function() {
	var data = {
			"childId": iportalen.currentChild.id,
	};
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var dialog = $("#message");
	dialog.find("#message-comment").val("");
	dialog.find("#message-comment").on('input', function(){
		if (dialog.find("#message-comment").val().length) {
			dialog.find("#btn-message-send").removeClass("ui-disabled");
		} else {
			dialog.find("#btn-message-send").addClass("ui-disabled");
		} 
	});
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
		page.append($("<h3>").addClass("normal-text").text("Fra " + this.from));
		page.append($("<span>").addClass("small-text").text("Kl. " + new Date(this.timestamp).prettyTime()));
		page.append($("<p>").addClass("normal-text").html(this.body.replace(/\n/g, "<br>")));
		page.append($("<hr>"));
	});
});