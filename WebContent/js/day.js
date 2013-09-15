iportalen.prettyTime = function(date) {
	return date.slice(11, 16);
};

iportalen.renderDay = function() {
	
	var detailsUrl = function(page, text) {
		return $("<li>").append($("<a>").prop("href", page).text(text));
	};
	
	var list = $("#day"+this.child.realm+this.child.id).listview();

	list.empty();

	if (this.child.day) {
		var stop = false;
		var day = this.child.day;
		if (day.sick === true) {
			list.append($("<li>").text(day.comment ? "Sygedag - " + day.comment : "Sygedag"));
			stop = true;
		} else if (day.vacation === true) {
			list.append($("<li>").text("Fridag"));
			stop = true;
		} else if (day.closingDay === true) {
			list.append($("<li>").text("Lukkedag"));
			stop = true;
		} else if (day.arrived) {
			list.append(detailsUrl("day.html", (day.departure ? "Gik kl. " : "Kom kl. ") + iportalen.prettyTime(day.departure ? day.departure : day.arrived)));
		} else if (day.arrived === undefined && day.departure === undefined && day.comment !== undefined) {
			list.append(detailsUrl("day.html", day.comment));
		}
		if (stop === false) {
            if (day.location) {
                list.append($("<li>").text("Er her - " + day.location));
            }
			if (day.messages) {
				list.append(detailsUrl("messages.html", "Beskeder"));
			}
			if (day.activities) {
				$.each(day.activities, function() {
					if (this.notToday == false) {
						list.append(detailsUrl("confirm-activity-cancellation.html?"+$.param({"id":this.id}), this.name + " kl. " + iportalen.prettyTime(this.start)));
					} else {
						list.append($("<li>").text(this.name+ " aflyst"));
					}
				});
			}
			if (day.goHome) {
				list.append(detailsUrl("go-home.html?"+$.param({"id":day.goHome.id}), "Sendes hjem kl. " + iportalen.prettyTime(day.goHome.date)));
			}
			if (day.optionalLeaveTime) {
				list.append(detailsUrl("optional.html?"+$.param({"id":day.optionalLeaveTime.id}), "Selvbestemmer fra kl. " + iportalen.prettyTime(day.optionalLeaveTime.beginTime)));
				if (day.optionalLeaveTime.sendHome) {
					list.append(detailsUrl("optional.html?"+$.param({"id":day.optionalLeaveTime.id}), "Sendes hjem kl. " + iportalen.prettyTime(day.optionalLeaveTime.endTime)));
				}
			}
		}
	}
	list.height(100);
	list.listview("refresh");
};

$(document).on("pageshow", "#day-details", function(event, ui) {
	var day = iportalen.currentChild.day;
	var page = $("#day-details");
	if (day.arrived) {
		page.find("#day-details-title").text(day.departure ? "Gået" : "Kommet");
	} else {
		page.find("#day-details-title").text(iportalen.currentChild.firstName);
	}
	if (day.arrived) page.find("#arrivedTime").text("Kl. " + iportalen.prettyTime(day.arrived));
	if (day.departure) page.find("#departureTime").text("Kl. " + iportalen.prettyTime(day.departure));
	if (day.comment) {
		page.find("#comment").append(day.comment);
	}
	if (day.areAtId) {
		var link = $("<a>").prop("href", "contact-details.html?"+$.param({"id":day.areAtId,"name":day.areAtName})).text(day.areAtName);
		page.find("#comment").append("Er hos ").append(link);
	}

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

$(document).delegate('div[data-role=dialog]', 'pageinit', function(event) {
	var refresh = function(result) {
		iportalen.mySwiper.currentSlide().refresh(true);
	};
	var params = $.parseParams(event.target.baseURI.slice(event.target.baseURI.indexOf('?')));
	var page = $(event.target);
	var profile = iportalen.profiles.getProfile(iportalen.currentChild.realm);
	var data = {
			"childId": iportalen.currentChild.id,
	};
	if (event.target.id === "confirm-activity-cancellation") {
		page.find("#btn-cancel-activity").click(function() {
			RESTService.post("/activity/notToday.do?" + $.param({"id":params.id}), profile, null, refresh);
		});
	}
	if (event.target.id === "message") {
		page.find("#message-comment").on('input', function(){
			if (page.find("#message-comment").val().length) {
				page.find("#btn-message-send").removeClass("ui-disabled");
			} else {
				page.find("#btn-message-send").addClass("ui-disabled");
			} 
		});
		page.find("#btn-message-send").click(function() {
			data.body = page.find("#message-comment").val();
			RESTService.post("/message.do", profile, data, refresh);
		});
	}
	if (event.target.id === "registration") {
		var isSick = params.type === "sick";
		if (isSick) {
			page.find("#registration-comment-box").show();
			page.find("#registration-title").text("Meld sygdom");
		} else {
			page.find("#registration-comment-box").hide();
			page.find("#registration-title").text("Meld fridag");
		}
		page.find("#btn-registration-today").click(function() {
			var today = new Date();
			data.from = today.jsonFormat();
			if (isSick) {
				data.comment = $("#registration-comment").val();
			}
			RESTService.post(isSick ? "/sickness.do" : "/vacation.do", profile, data, refresh);
		});
		page.find("#btn-registration-tomorrow").click(function() {
			var tomorrow = new Date(new Date().getTime()+(60*60*24*1000));
			data.from = tomorrow.jsonFormat();
			if (isSick) {
				data.comment = $("#registration-comment").val();
			}
			RESTService.post(isSick ? "/sickness.do" : "/vacation.do", profile, data, refresh);
		});
	}
});

$(document).on('click', function(event, ui) {
    if (event.target.id.match(/^childImage/)) {
        $(event.target).slideUp(function(){
            $("#childName"+event.target.id.slice("childImage".length)).slideDown(function() {
                iportalen.mySwiper.currentSlide().resizeEvents();
            });
        });
    }
    if (event.target.id.match(/^childName/)) {
        $(event.target).slideUp(function(){
            $("#childImage"+event.target.id.slice("childName".length)).slideDown(function() {
                iportalen.mySwiper.currentSlide().resizeEvents();
            });
        });
    }
});
