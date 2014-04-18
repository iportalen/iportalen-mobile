$(document).on("pagebeforeshow", "#history", function(event, ui) {
	var child = iportalen.currentChild;
	var profile = iportalen.profiles.getProfile(child.realm);
    var requestParams = $.param({"id":child.id});
	
	var page = $("#history");
    RESTService.get("/history.do?"+requestParams, profile, function(result) {
        var content = $("#history-content");
        if (result.status === 200) {
            $.each(result.data, function() {
				var arrived = Date.jsonParse(this.arrived);
				var departure = this.departure ? Date.jsonParse(this.departure) : null;
				var text = this.weekday + " d."+arrived.prettyDate();
				if (this.allDay == false) {
					text += " " + arrived.prettyTime();
					if (departure) {
						text += " - " + departure.prettyTime();
					}
				}
                page.append($("<div data-role=footer data-theme='b'>").append($("<h3>").text(text)));
				var div = $("<div class='ui-content'>")
				if (this.areAtId === undefined) {
					div.text(this.comment || "Ingen kommentar");
				} else {
					var detailsParams = $.param({"id":this.areAtId, "name": this.areAtName});
					a = $("<a>").prop("href", "contact-details.html?"+detailsParams);
					a.text(this.comment);
					div.append(a);
				}
				page.append(div);
            });
			page.trigger("create");
        }
    });	
});