$(document).on("pagebeforeshow", "#history", function(event, ui) {
	var child = iportalen.currentChild;
	var profile = iportalen.profiles.getProfile(child.realm);
    var requestParams = $.param({"id":child.id});
	
	var page = $("#history");
    RESTService.get("/history.do?"+requestParams, profile, function(result) {
        var content = $("#history-content");
        if (result.status === 200) {
            $.each(result.data, function() {
				var text = this.arrived.format("dddd").capitalize() + " "+this.arrived.format("D MMM");
				if (this.allDay == false) {
					text += " " + this.arrived.format("LT");
					if (this.departure) {
						text += " - " + this.departure.format("LT");
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