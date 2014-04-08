$(document).on("pagebeforeshow", "#feedback", function(event, ui) {
	var child = iportalen.currentChild;
	var profile = iportalen.profiles.getProfile(child.realm);

    var params = $.parseParams(window.location.search);
    var requestParams = $.param({"id":params.id, "childId":child.id});
	var page = $("#feedback");
	page.find("#feedback-title").text(iportalen.currentChild.day.feedback.name);
    RESTService.get("/holiday.do?"+requestParams, profile, function(result) {
        var content = $("#feedback-content");
        if (result.status === 200) {
            $.each(result.data, function() {
                content.append($("<div data-role=header data-theme='b'>").append($("<h3>").text("Uge " + this.weekOfYear)));
				var div = $("<div class='ui-content' role='main'>");
				div.append(getFieldset("Mandag", this.monday, this.mondayComes, this.mondayOff, this.mondayClosingDay));
				div.append(getFieldset("Tirsdag", this.tuesday, this.tuesdayComes, this.tuesdayOff, this.tuesdayClosingDay));
				div.append(getFieldset("Onsdag", this.wednesday, this.wednesdayComes, this.wednesdayOff, this.wednesdayClosingDay));
				div.append(getFieldset("Torsdag", this.thursday, this.thursdayComes, this.thursdayOff, this.thursdayClosingDay));
				div.append(getFieldset("Fredag", this.friday, this.fridayComes, this.fridayOff, this.fridayClosingDay));
				content.append(div);

            });
			$("#feedback").trigger("create");
			page.find("[data-time]").click(function(event) {
				var data = {id: parseInt(params.id), childId: child.id, comes: $(event.currentTarget).val(), date: new Date(parseFloat($(event.currentTarget).attr("data-time"))).jsonFormat()}
				RESTService.post("/holiday/feedback.do", profile, data, function(response) {
					//Do nothing
				});
			});
        }
    });
	
	function getFieldset(dayOfWeek, date, coming, notComing, closingDay) {
		if (!date) return null;
		date = Date.jsonParse(date);
		var fieldset = $("<fieldset data-role='controlgroup' data-type='horizontal'>");
		fieldset.append($("<legend class='form-text'>").text(dayOfWeek + " d."+date.prettyDate()));
		var comingButton = $("<input type='radio'>").prop("name", "coming-"+date.getTime()).prop("id", "coming-"+date.getTime()).prop("value", true).attr("data-time", date.getTime());
		fieldset.append(comingButton);
		fieldset.append($("<label>").prop("for", "coming-"+date.getTime()).text("Kommer"));
		var notComingButton = $("<input type='radio'>").prop("name", "coming-"+date.getTime()).prop("id", "notComing-"+date.getTime()).prop("value", false).attr("data-time", date.getTime());
		fieldset.append(notComingButton);
		fieldset.append($("<label>").prop("for", "notComing-"+date.getTime()).text("Kommer ikke"));
		if (coming === true && notComing === false) {
			comingButton.prop("checked", "checked");
		}
		if (notComing === true && coming === false) {
			notComingButton.prop("checked", "checked");
		}
		return fieldset;
	}
});

$(document).on("pageshow", "#planned-holiday", function(event, ui) {
	var child = iportalen.currentChild;
	var profile = iportalen.profiles.getProfile(child.realm);
	var requestParams = $.param({"childId":child.id});
	var page = $("#planned-holiday");
	var list = page.find("#planned-holiday-list");
    RESTService.get("/holiday/planned.do?" + requestParams, profile, function(result) {
		if (result.status == 200) {
		var previousWeekNumber = -1;
			$.each(result.data, function() {
				if (previousWeekNumber != this.weekNumber) {
					previousWeekNumber = this.weekNumber;
					list.append($("<li>").attr("data-role", "list-divider").attr("data-theme", 'b').text("Uge " + this.weekNumber))
				}
				var li = $("<li>").text(Date.jsonParse(this.date).prettyDate() + " (" + this.weekday +")");
				if (this.closingDay) {
					li.text(li.text() + " - Lukkedag");
				}
				list.append(li);
			});
			list.listview("refresh");
		}
    });
});
