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
		}
		if (day.messages) {
			list.append(detailsUrl("messages.html", "Beskeder"));
		}
		if (stop === false) {
			if (day.activities) {
				$.each(day.activities, function() {
					if (this.notToday == false) {
                        var li = detailsUrl("#", this.name + " kl. " + iportalen.prettyTime(this.start));
                        li.attr("data-activity-id", this.id);
						list.append(li);
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

$("[data-reg-type]").on("click", function (event) {
   iportalen.dialogParams = {type: $(event.target).attr("data-reg-type")}
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
