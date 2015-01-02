$(document).on("pageshow", "#feedback", function(event, ui) {
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
                
				var div = $("<div class='ui-content' role='main'>");
				div.append(getFieldset(this.monday, this.mondayComes, this.mondayOff, this.mondayClosingDay));
				div.append(getFieldset(this.tuesday, this.tuesdayComes, this.tuesdayOff, this.tuesdayClosingDay));
				div.append(getFieldset(this.wednesday, this.wednesdayComes, this.wednesdayOff, this.wednesdayClosingDay));
				div.append(getFieldset(this.thursday, this.thursdayComes, this.thursdayOff, this.thursdayClosingDay));
				div.append(getFieldset(this.friday, this.fridayComes, this.fridayOff, this.fridayClosingDay));
				if (div.children().length != 0) {
					content.append($("<div data-role=header data-theme='b'>").append($("<h3>").text("Uge " + this.weekOfYear)));
					content.append(div);
				}
            });
			$("#feedback").trigger("create");
			page.find("[data-time]").click(function(event) {
				var data = {id: parseInt(params.id), childId: child.id, comes: $(event.currentTarget).val(), date: new Date(parseFloat($(event.currentTarget).attr("data-time")))}
				RESTService.post("/holiday/feedback.do", profile, data, function(response) {
					//Do nothing
				});
			});
        }
    });
	
	function getFieldset(date, coming, notComing, closingDay) {
		if (!date) return null;
		var dayOfWeek = date.format("dddd").capitalize();
		var fieldset = $("<fieldset data-role='controlgroup' data-type='horizontal'>");
		fieldset.append($("<legend class='form-text'>").text(dayOfWeek + " d."+date.format("LL")));
		var comingButton = $("<input type='radio'>").prop("name", "coming-"+date.unix()).prop("id", "coming-"+date.unix()).prop("value", true).attr("data-time", date.valueOf());
		fieldset.append(comingButton);
		fieldset.append($("<label>").prop("for", "coming-"+date.unix()).text("Kommer"));
		var notComingButton = $("<input type='radio'>").prop("name", "coming-"+date.unix()).prop("id", "notComing-"+date.unix()).prop("value", false).attr("data-time", date.valueOf());
		fieldset.append(notComingButton);
		fieldset.append($("<label>").prop("for", "notComing-"+date.unix()).text("Kommer ikke"));
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
				if (previousWeekNumber != this.date.format("W")) {
					previousWeekNumber = this.date.format("W");
					list.append($("<li>").attr("data-role", "list-divider").attr("data-theme", 'b').text("Uge " + previousWeekNumber))
				}
				var li = $("<li>").text(this.date.format("L") + " (" + this.date.format("dddd") +")");
				if (this.closingDay) {
					li.text(li.text() + " - Lukkedag");
				}
				list.append(li);
			});
			if (list.children().length === 0) {
				list.append($("<li>").append($("<i>").text("Ingen planlagt ferie")));
			}
			list.listview("refresh");
		}
    });
});
