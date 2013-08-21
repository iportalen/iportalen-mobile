$(document).bind("mobileinit", function ()
{
	$.mobile.defaultPageTransition = 'slide';
	$.mobile.page.prototype.options.backBtnText = 'Tilbage';
});

if (typeof Object.create !== 'function') {
	Object.create = function(o) {
		var F = new function() {};
		F.prototype = o;
		return new F();
	};
}

if (typeof Date.prettyTime !== "function") {
	Date.prototype.prettyTime = function() {
		return this.getHours() + ":" + (this.getMinutes() < 10 ? "0" : "") + this.getMinutes();
	};
}
if (typeof Date.jsonFormat !== "function") {
	Date.prototype.jsonFormat = function() {
		// "dd-MM-yyyy HH:mm:ss"
		return this.getDate() + "-" + (this.getMonth()+1) + "-" + this.getFullYear() + " " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
	};
}

$(document).on('pageinit', function(event) {
	if (Modernizr.localstorage == false) {
		$.mobile.changePage($("#no-support-local-storage"));
		return;
	} else if ('withCredentials' in new XMLHttpRequest() == false) {
		$.mobile.changePage($("#no-support-xhr"));
		return;
	} else {
		$(document).on("pageshow", "#home", function(event, ui) {
			if (iportalen.profiles.isEmpty()) {
				setTimeout(function() {
					$.mobile.changePage("login.html", {transition: "slidedown"});
				}, 500)
				;
			} 
		});
	}
	iportalen.mySwiper.addChildren = function(profile) {
		if (profile.user.children === undefined || profile.user.children.length === 0) return;
		$.each(profile.user.children, function() {
			console.log("Adding slider for " + this.firstName);
			var img;
			var name = $("<h2 style='text-align:center;'>").text(this.firstName).addClass("profile");
			if (this.pictureLastModified !== 0) {
				img = $("<img>").prop("id", "childImage" + this.realm + this.id).prop("src", profile.url() + "/mobile/childImage?"+$.param({"childId": this.id, "Authorization": window.btoa(profile.user.token)})).addClass("profile");
			} else {
				img = $("<img>").prop("id", "childImage" + this.realm + this.id).prop("src", "image/photo.png").addClass("profile");
			}
			var list = $("<ul data-role=listview data-inset=false data-divider-theme=a>").prop("id", "day" + this.realm + this.id);
			var slide = iportalen.mySwiper.createSlide((img !== undefined ? img.get(0).outerHTML : name.get(0).outerHTML) + list.get(0).outerHTML);
			slide.child = this;
			slide.renderDay = iportalen.renderDay;
			slide.refresh = function(force) {
				var oneMinute = 1000 * 60;
				$("#navn").text(slide.child.firstName);
				profile.setting.goHomeActivated ? $("#btn-go-home").show() : $("#btn-go-home").hide();
				$("#go-home-url").prop("href", "go-home.html?" + $.param({id:slide.child.id}));
				if (force || slide.child.day === undefined || slide.child.day.lastUpdated === undefined || slide.child.day.lastUpdated.getTime()+oneMinute < new Date().getTime()) {
					profile.refreshDay(slide.child, function(result) {
						if (result.status == 200 || result.status == 304) {
							slide.renderDay();
						}
					});
				}
			};
			slide.append();
			if (iportalen.mySwiper.slides.length == 1) {
				var innerSlide = slide;
				setTimeout(function() {
					iportalen.currentChild = innerSlide.child;
					innerSlide.refresh();
				});
			}
		});
		if (iportalen.mySwiper.slides.length == 1) {
			$("#home-footer").hide();
		} else {
			var swiperIndicator = $("#swiper-indicator");
			swiperIndicator.empty();
			for(var i = 0; i < iportalen.mySwiper.slides.length; i++) {
				var span = $("<span>").prop("id", "dot"+i).addClass("dot");
				if (i === iportalen.mySwiper.activeIndex) {
					span.addClass("active");
				}
				swiperIndicator.append(span).append("&nbsp;");
			};
		}
		

	};
	iportalen.mySwiper.transitionEnd(function(swiper) {
		if (swiper.previousIndex != swiper.activeIndex && iportalen.currentChild !== swiper.currentSlide().child) {
			$("#dot"+swiper.previousIndex).removeClass("active");
			$("#dot"+swiper.activeIndex).addClass("active");
			iportalen.currentChild = swiper.currentSlide().child; 
			swiper.currentSlide().refresh();
		}
	}, true);
	iportalen.profiles.changed = function(profile) {
		setTimeout(function() {
			console.log("Refreshing...");
			location.reload();
		}, 250);
	};
	if (event.target.id === "home") {
		setTimeout(function() {
			$("#home").height($("#home").height());
			iportalen.homeSize = $("#home").height();
			iportalen.mySwiper.resizeFix();
			$("#home").trigger("create");
			$.each(iportalen.profiles.all(), function() {
				var profile = this;
				profile.refreshSetting();
				this.refreshChildren(function(result) {
					if (result.status === 200) {
						// Meaning this is either new, or the children has changed
						$.each(result.data, function() {
							var child = this;
							$.each(iportalen.mySwiper.slides, function(index) {
								if (this.child.realm === child.realm) {
									iportalen.mySwiper.removeSlide(index);
									return false;
								}
							});
						});
						iportalen.mySwiper.addChildren(profile);
					}
				});
			});
		}, 100);
	}
});

$(document).on("pageshow", function(event, ui) {
	var page = $(event.target);
	if (page.find(".bottomBar:visible").length != 0) {
		page.find('[id^=btn]:visible').width(page.find('[id^=btn]:visible').width()-20);
		console.log("Resizing bottom buttons");
	}
});

