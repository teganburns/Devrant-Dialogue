layoutFuncs = {};
$(document).ready(function() {

// flag for sort animation
var isFilterOpen = false;
var closeModalTo = "";
var commentPrePop = "";
var numNotifs = 0;
var notifTimeout = null;
var fetchNotifTimeout = null;
var isNotifPage = false;
var lastNotifCheckTime = 0;

// animate sort in/out
$(".filter-link").on("click", function(e) {
	e.preventDefault();
	if (!isFilterOpen) {		
		isFilterOpen = true;
		$(".filter-top-bar").animate ({
			height: 44
		}, 200);
	} else {
		isFilterOpen = false;
		$(".filter-top-bar").animate ({
			height: 0
		}, 200);		
	}
});

$(".filter-top-bar").on("click", "input", function(e) {
	setDefaultSort($(this).val());
	window.location = "/feed/" + $(this).val();
	
	setTimeout(function() {
		$(".filter-top-bar").animate ({
			height: 0
		}, 200);		
	}, 400);

});

$(".news-close").on("click", function(e) {
	e.preventDefault();
	var $news_bar = $(this).closest(".news-bar");
	var news_id = $news_bar.attr("data-news-id");

    if (isLoggedIn()) {
        var params = getBaseLoggedInParams();
        params.news_id = news_id;

        $.ajax({
            url: "/api/users/me/mark-news-read",
            dataType: "json",
            method: "POST",
            data: params
        }).done(function(e) {

        }).fail(function(e) {

        }).always(function() {
            location.reload();
        });
    } else {
        var news_seen = Cookies.getJSON("news_seen");
        if (news_seen == undefined || news_seen == false) {
        	news_seen = [];
		}

		news_seen.push(news_id);
        var params = {expires:365};
        Cookies.set("news_seen", news_seen, params);
        location.reload();
    }

    $news_bar.remove();
});

$(".feed-top-icons").on("click", ".refresh", function(e) {
	e.preventDefault();
	window.location.reload();
});

$(".plusone").on("click", function(e) {
	e.preventDefault();

	if (!ga) {
		return;
	}

	ga('send', 'event', {
		eventCategory: 'Link',
		eventAction: 'click',
		eventLabel: 'upVote'
	});
});

$(".addrant-btn").on("click", function(e) {
	e.preventDefault();

	if (!ga) {
		return;
	}

	ga('send', 'event', {
		eventCategory: 'Link',
		eventAction: 'click',
		eventLabel: 'addRantCta'
	});
});

$(".minusone").on("click", function(e) {
	e.preventDefault();

	if (!ga) {
		return;
	}

	ga('send', 'event', {
		eventCategory: 'Link',
		eventAction: 'click',
		eventLabel: 'downVote'
	});
});

/*$(".rantlist-tags").on("click", function(e) {
	e.preventDefault();

	if (!ga) {
		return;
	}

	ga('send', 'event', {
		eventCategory: 'Link',
		eventAction: 'click',
		eventLabel: 'tag'
	});
});*/

var saveEmail = function(email, platform) {
	$.ajax({

		type:     "GET",
		url: 'https://www.hexicallabs.com/api/beta-list',
		data: {
			email: email,
			platform: platform,
			app: 3
		},
		dataType: "jsonp"
	});
};

var logDownloadButtonClick = function(label) {
	ga('send', 'event', {
		eventCategory: 'Outbound Link',
		eventAction: 'click',
		eventLabel: label,
		transport: 'beacon'
	});
};

var shareOnFb = function(url) {
	FB.ui({
		method: 'share',
		href: url,
	}, function(response){});
};

var shareOnTwitter = function(url) {
	var urlParams = [];
	urlParams.push("url=" + encodeURIComponent(url));
	urlParams.push("via=" +  encodeURIComponent("devRantApp"));
	var useUrl = "https://twitter.com/intent/tweet?" + urlParams.join("&");
	window.open(useUrl, "Twitter", "height=285,width=550,resizable=1");
};

$(".fb-share").on("click", function(e) {
	e.preventDefault();
	shareOnFb("https://devrant.com/rants/" + $(this).attr("data-rant-id"));
});

$(".twitter-share").on("click", function(e) {
	e.preventDefault();
	shareOnTwitter("https://devrant.com/rants/" + $(this).attr("data-rant-id"));
});

////////////////////
//     modal     //
//////////////////

var marginStart;
// animate signup modal in on skip
var modalIn = function () {
	$(".modal-app").fadeIn({queue: false, duration: 400});
	marginStart = $(".modal-content").css("margin-top");
	setTimeout( function() {
		$(".modal-content").css("margin-top", marginStart);
		$(".modal-content").fadeIn({queue: false, duration: 300});
		//$(".modal-margin-top-animate-in").css({top: modalTopMargin()}+"px !important");
		//$(modalForm).addClass("modal-margin-top-animate-in");
		$(".modal-content").animate ({
			marginTop: parseInt(marginStart)-30
		}, 300);
		$(".modal-x").fadeIn({queue: false, duration: 300});
	}, 100);	
};

// animate signup modal out on close
var modalOut = function () {
	//$(".modal-margin-top-animate-out").css({top: (parseInt(modalTopMargin())+40)+"px !important"});
	//$(modalForm).addClass("modal-margin-top-animate-out");
	$(".modal-content").animate ({
		marginTop: parseInt(marginStart)
	}, 300);	
	setTimeout( function() {
		$(".modal-content").fadeOut({queue: false, duration: 200});
		$(".modal-x").fadeOut({queue: false, duration: 200});
		$(".modal-app").fadeOut({queue: false, duration: 300});
	}, 100);
};

// open modal on link click
$(".modal-link").click(function(e) {
	e.preventDefault();
	signupModalIn(".signup-form");
});

// close modal signup on skip signup link click
$(".modal-overlay").click(function(e) {
	e.preventDefault();
	closeModalFromClick();
});

// close modal signup on close modal x
$(".modal-x").click(function(e) {
	e.preventDefault();
	closeModalFromClick();
});

var closeModalFromClick = function() {
	if ($("body").hasClass("state-logged-out") && $(".details-form").is(":visible")) {
		window.location = "/feed";
	}
	if (closeModalTo) {
		animateFormUp(".alert-modal", "." + closeModalTo);
		closeModalTo = "";
		return;
	}
	signupModalOut();
};

// (+) icon button up to post rant form
$(".addrant-btn").click(function(e) {
	e.preventDefault();
	if (isLoggedIn()) {
		openAddRantModal();
	} else {
		signupModalIn();
	}
});

// add comment button up to add comment form
$(".addcomment-btn").click(function(e) {
	e.preventDefault();
	if (isLoggedIn()) {
		var $elem = $postCommentForm.find(".comment-text-input");
		$elem.val("");
		$elem.trigger("keyup");
		signupModalIn(".post-comment-form");
	} else {
		signupModalIn();
	}
});

// open install modal for mobile web
$(".mobile-modal").click(function(e) {
	e.preventDefault();
	signupModalIn(".install-modal");
});

// open menu modal
$(".menu-icon a").click(function(e) {
	e.preventDefault();
	signupModalIn(".menu-modal");
});

// open edit profile menu
$(".profile-edit-btn").click(function(e) {
	e.preventDefault();
	signupModalIn(".details-form");
});

// menu to settings
$(".menu-settings").on("click", function(e) {
	e.preventDefault();
	animateFormDown(".menu-modal", ".settings-modal");	
});

// menu to stickers
$(".menu-stickers").on("click", function(e) {
	e.preventDefault();
	animateFormDown(".menu-modal", ".stickers-modal");	
});

var vpHeight;
var signUpAnimating = false;
var modalForm = ".signup-form";

var setCardHeight = function () {
	// get viewport height for setting card height		
	vpHeight = $(window).height();
	
	// set content centered height
	$(".content-centered").css("height", vpHeight+"px");
	
	// set interior page min-height
	$(".interior-content").css("min-height", vpHeight-130+"px");
			
	// set modal margins
	if(!signUpAnimating) {
		$(modalForm).css("top", modalTopMargin());		
	}
};

var modalTopMargin = function() {
	// set modal margins
	var modalHeight = $(modalForm).height();
	return (vpHeight-modalHeight)/2 +"px";			
};

setCardHeight();

// animate signup modal in on skip
var signupModalIn = function (starter) {	
	if(starter) {
		modalForm = starter;		
	}
	$(".modal-overlay").fadeIn({queue: false, duration: 400});
	setTimeout( function() {
		$(modalForm).css("top", (parseInt(modalTopMargin())+50)+"px");
		$(modalForm).fadeIn({queue: false, duration: 300});
		$(modalForm).animate ({
			top: modalTopMargin()
		}, 300);
		$(".modal-x").fadeIn({queue: false, duration: 300});
	}, 100);	
};

	layoutFuncs.signupModalIn = signupModalIn;

// animate signup modal out on close
var signupModalOut = function () {
	$(modalForm).animate ({
		top: (parseInt(modalTopMargin())+40)+"px"
	}, 300, function() {
		modalForm = ".signup-form";
	});	
	setTimeout( function() {
		$(modalForm).fadeOut({queue: false, duration: 200});
		$(".modal-x").fadeOut({queue: false, duration: 200});
		$(".modal-overlay").fadeOut({queue: false, duration: 300});
	}, 100);
};

// animate form down
var animateFormDown = function(formFrom, formTo) {
	signUpAnimating = true;
	modalForm = formTo;
	var signupFormTop = $(formFrom).position().top;
	var signUpFormHeight = $(formFrom).height();
	$(formTo).css("top", (signupFormTop+signUpFormHeight+50)+"px");
	$(formTo).fadeIn({queue: false, duration: 500});
	$(formFrom).fadeOut({queue: false, duration: 400});
	$(formFrom).animate({
		top: signupFormTop-signUpFormHeight
	}, 500);	
	$(formTo).animate({
		top: modalTopMargin()
	}, 500, function() {
		signUpAnimating = false;
	});		
};

// animate form up
var animateFormUp = function(formFrom, formTo) {
	signUpAnimating = true;
	modalForm = formTo;
	var loginFormTop = $(formFrom).position().top;
	var loginFormHeight = $(formFrom).height();
	var signUpFormHeight = $(formTo).height();
	$(formTo).css("top", (loginFormTop-signUpFormHeight-50)+"px");
	$(formTo).fadeIn({queue: false, duration: 500});
	$(formFrom).fadeOut({queue: false, duration: 400});
	$(formFrom).animate({
		top: loginFormTop+loginFormHeight
	}, 500);
	$(formTo).animate({
		top: modalTopMargin()
	}, 500, function() {
		signUpAnimating = false;
	});		
};

// signup login link animate down to login form
$(".signup-login-link").on("click", function(e) {
	e.preventDefault();
	animateFormDown(".signup-form", ".login-form");
});

// signup signup button animate down to signup details form
/*$(".signup-email-btn").on("click", function(e) {
	e.preventDefault();
	animateFormDown(".signup-form", ".details-form");
});*/

// login forgot link animate down to forgot form
$(".login-forgot-link").on("click", function(e) {
	e.preventDefault();
	animateFormDown(".login-form", ".forgot-form");
});

// login form link animate up to signup form
$(".login-signup-link").on("click", function(e) {
	e.preventDefault();
	animateFormUp(".login-form", ".signup-form");	
});

// forgot form link animate up to login form
$(".forgot-login-link").on("click", function(e) {
	e.preventDefault();
	animateFormUp(".forgot-form", ".login-form");	
});

// forgot form link animate up to signup form
$(".forgot-signup-link").on("click", function(e) {
	e.preventDefault();
	animateFormUp(".forgot-form", ".signup-form");	
});

var saveAuthInfo = function(token, save) {
	var params = {
		secure: true
	};

	if (save) {
		params.expires = 365;
	}

	Cookies.set('dr_token', token, params);
};

var isLoggedIn = function() {
	return Cookies.get("dr_token") != undefined;
};

var $signupForm = $(".signup-form");

$signupForm.on("click", ".signup-email-btn", function(e) {
	e.preventDefault();
	$signupForm.find(".signup-fields").removeClass("form-error");
	$(this).addClass("btn-loader");
	var self = this;
	$.ajax({
		url: "/api/users",
		dataType: "json",
		method: "POST",
		data: {
			app: 3,
			type: 1,
			email: $signupForm.find(".signup-fields.field-email input").val(),
			username: $signupForm.find(".signup-fields.field-username input").val(),
			password: $signupForm.find(".signup-fields.field-password .password-input").val(),
			guid: getMyGuid(),
			plat: 3,
			sid: getSessionStartTime(),
			seid: getSessionEventId()
		}
	}).always(function(e) {
		$(self).removeClass("btn-loader");
		if (!e.success) {
			if (e.error_field) {
				var $field = $signupForm.find(".signup-fields.field-" + e.error_field);
				$field.find(".error-text").text(e.error);
				$field.addClass("form-error");
			}
		} else {
			saveAuthInfo(e.auth_token, $signupForm.find(".signup-fields.field-password .save-login-input").prop("checked"));
			animateFormDown(".signup-form", ".details-form");
		}
	});
});

var $loginForm = $(".login-form");

$loginForm.on("click", ".signup-email-btn", function(e) { // here
	e.preventDefault();
	$loginForm.find(".signup-fields").removeClass("form-error");
	$(this).addClass("btn-loader");
	var self = this;
	$.ajax({
		url: "/api/users/auth-token",
		dataType: "json",
		method: "POST",
		data: {
			app: 3,
			username: $loginForm.find(".signup-fields.field-username input").val(),
			password: $loginForm.find(".signup-fields.field-password .password-input").val(),
			guid: getMyGuid(),
			plat: 3,
			sid: getSessionStartTime(),
			seid: getSessionEventId()
		}
	}).fail(function(e) {
		e = e.responseJSON;
		if (!e.success) {
			if (e.error) {
				var $field = $loginForm.find(".signup-fields.field-password");
				$field.find(".error-text").text(e.error);
				$field.addClass("form-error");
			}
		}
	}).done(function(e) {
		saveAuthInfo(e.auth_token, $loginForm.find(".signup-fields.field-password .save-login-input").prop("checked"))
		signupModalOut();
		window.location = "/feed";
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

var openAddRantModal = function() {
	signupModalIn(".post-rant-form");
};

var getBaseLoggedInParams = function() {
	var token = Cookies.getJSON("dr_token");
	var params = {};
	params.app = 3;

	params.token_id = token.id;
	params.token_key = token.key;
	params.user_id = token.user_id;
	params.guid = getMyGuid();
	params.plat = 3;
	params.sid = getSessionStartTime();
	params.seid = getSessionEventId();
	return params;
};

var $postRantForm = $(".post-rant-form");

$postRantForm.on("keyup", ".rant-text-input", function(e) {
	$postRantForm.find(".post-count").text(5000 - $(this).val().length);
});

$postRantForm.on("click", ".btn-post-rant", function(e) {
	e.preventDefault();
	$postRantForm.find(".signup-email-field").removeClass("form-error");
	$(this).addClass("btn-loader");
	var self = this;
	var formData = new FormData();
	var rantText = $postRantForm.find(".rant-text-input").val().trim();

	if (rantText.length == 0) {
		$postRantForm.find(".signup-email-field").addClass("form-error");
		$(this).removeClass("btn-loader");
		$postRantForm.find(".signup-email-field .error-text").text("Your rant must be between 6 and 5,000 characters.");
		return;
	}

	formData.append("app", 3);
	formData.append("rant", $postRantForm.find(".rant-text-input").val());
	formData.append('tags', $postRantForm.find(".tags-input").val());
	var token_info =  Cookies.getJSON("dr_token");
	formData.append("token_id", token_info.id);
	formData.append("token_key", token_info.key);
	formData.append("user_id", token_info.user_id);

	if ($postRantForm.find(".rant-attached").attr("data-image-attached") == 1) {
		formData.append('image', $postRantForm.find(".file-upload")[0].files[0]);
	}
	//formData.append('image', $postRantForm.find(".file-upload")[0].files[0]);
	$.ajax({
		url: "/api/devrant/rants",
		dataType: "json",
		method: "POST",
		data: formData,
		processData: false,
		contentType: false,
	}).done(function(e) {
		if (e.success) {
			window.location = "/rants/" + e.rant_id;
		} else {
			$postRantForm.find(".signup-email-field").addClass("form-error");
			$postRantForm.find(".signup-email-field .error-text").text(e.error);
		}
	}).fail(function(e) {
		var response = e.responseJSON;

		if (response && response.confirmed === false) {
			closeModalTo = "post-rant-form";
			animateFormDown(".post-rant-form", ".alert-modal");
			//signupModalIn(".alert-modal");
		}
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

var $postCommentForm = $(".post-comment-form");

$postCommentForm.on("keyup", ".comment-text-input", function(e) {
	$postCommentForm.find(".post-count").text(1000 - $(this).val().length);
});

$postCommentForm.on("click", ".btn-post-comment", function(e) {
	e.preventDefault();
	$postCommentForm.find(".signup-email-field").removeClass("form-error");
	$(this).addClass("btn-loader");
	var self = this;
	var commentText = $postCommentForm.find(".comment-text-input").val().trim();

	if (commentText.length < 1 || commentText.length > 1000) {
		$postCommentForm.find(".signup-email-field").addClass("form-error");
		$(this).removeClass("btn-loader");
		$postCommentForm.find(".signup-email-field .error-text").text("Your comment must be between 1 and 1,000 characters.");
		return;
	}

	var rant_id = $postCommentForm.attr("data-rant-id");
	var params = getBaseLoggedInParams();
	params.comment = commentText;

	$.ajax({
		url: "/api/devrant/rants/" + rant_id + "/comments",
		dataType: "json",
		method: "POST",
		data: params
	}).done(function(e) {
		if (e.success) {
			window.location = "/rants/" + rant_id;
		}
	}).fail(function(e) {
		var response = e.responseJSON;

		if (response && response.confirmed === false) {
			closeModalTo = "post-comment-form";
			animateFormDown(".post-comment-form", ".alert-modal");
			//signupModalIn(".alert-modal");
		}
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

$postRantForm.on("click", ".rant-attached", function(e) {
	e.preventDefault();
	if ($(this).attr("data-image-attached") == 1) {
		$(this).attr("data-image-attached", 0);
		$(this).find(".attach-text").text("Attach img/gif");
	} else {
		$postRantForm.find(".file-upload").click();
	}
})

$postRantForm.on("change", ".file-upload", function(e) {
	if ($(this).val() != "") {
		$postRantForm.find(".rant-attached").attr("data-image-attached", 1);
		$postRantForm.find(".attach-text").text("Remove image");
	}
});

$("body").on("click", ".vote-widget .btn-vote-circle", function(e) {
	if (!isLoggedIn()) {
		signupModalIn();
		return;
	}
	var current_vote_state;
	var vote_btn_points;
	var $widget_container = $(this).closest(".vote-widget");

	if ($widget_container.hasClass("vote-state-upvoted")) {
		current_vote_state = 1;
	} else if ($widget_container.hasClass("vote-state-downvoted")) {
		current_vote_state = -1;
	} else if ($widget_container.hasClass("vote-state-unvoted")) {
		current_vote_state = 0;
	} else if ($widget_container.hasClass("vote-state-novote")) {
		current_vote_state = -2;
	}

	if (current_vote_state == -2) {
		return;
	}

	if ($(this).hasClass("plusone")) {
		vote_btn_points = 1;
	} else {
		vote_btn_points = -1;
	}

	var add_class = "";
	var vote_type;

	if (vote_btn_points == 1) {
		if (vote_btn_points != current_vote_state) {
			vote_type = 1;
			add_class = "vote-state-upvoted";
			if (current_vote_state == -1) {
				vote_btn_points = 2;
			}
		} else {
			vote_type = 0;
			add_class = "vote-state-unvoted";
			vote_btn_points = -1;
		}
	} else {
		if (vote_btn_points != current_vote_state) {
			vote_type = -1;
			add_class = "vote-state-downvoted";
			if (current_vote_state == 1) {
				vote_btn_points = -2;
			}
		} else {
			vote_type = 0;
			add_class = "vote-state-unvoted";
			vote_btn_points = 1;
		}
	}
	var $content_container = $(this).closest(".rant-comment-row-widget");
	var content_id = $content_container.attr("data-id");
	var params = getBaseLoggedInParams(); // here // need to figure out where this cookie is set
	params.vote = vote_type;

	var content_type = $content_container.attr("data-type");
	var use_endpoint;

	if (content_type == "rant") {
		use_endpoint = "/api/devrant/rants/" + content_id + "/vote";
	} else {
		use_endpoint = "/api/comments/" + content_id + "/vote";
	}

	$.ajax({
		url: use_endpoint,
		dataType: "json",
		method: "POST",
		data: params
	}).done(function(e) {
		showStickersIfNeeded();
	}).fail(function(e) {
		var response = e.responseJSON;

		if (response && response.confirmed === false) {
			points -= vote_btn_points;
			$points_container.text(points);
			$widget_container.removeClass("vote-state-upvoted vote-state-downvoted vote-state-unvoted");
			signupModalIn(".alert-modal");
		}
	});

	$widget_container.removeClass("vote-state-upvoted vote-state-downvoted vote-state-unvoted");
	$widget_container.addClass(add_class);

	var $points_container = $widget_container.find(".votecount");
	var points = parseInt($points_container.text(), 10);
	points += vote_btn_points;
	$points_container.text(points);
});

$("body").on("click", ".rantlist-reply", function(e) {
	e.preventDefault();
	var $elem = $postCommentForm.find(".comment-text-input");
	$elem.val("@" + $(this).closest(".reply-row").attr("data-username") + " ");
	$elem.trigger("keyup");
	signupModalIn(".post-comment-form");
});

$(".details-page").on("click", ".rantlist-delete", function(e) {
	e.preventDefault();
	if (confirm("Are you sure you want to delete this rant?")) {
		var params = getBaseLoggedInParams();

		$.ajax({
			url: "/api/devrant/rants/" + $(this).closest(".details-page").attr("data-id") +  "?" + $.param(params),
			dataType: "json",
			method: "DELETE",
			//data: params
		}).done(function(e) {
			window.location = "/feed";
		});
	}
});

$(".details-page").on("click", ".rantlist-comment-delete", function(e) {
	e.preventDefault();

	if (confirm("Are you sure you want to delete this comment?")) {
		var params = getBaseLoggedInParams();
		var self = this;

		$.ajax({
			url: "/api/comments/" + $(this).closest(".rant-comment-row-widget").attr("data-id") +  "?" + $.param(params),
			dataType: "json",
			method: "DELETE",
			//data: params
		}).done(function(e) {
			window.location = "/rants/" + $(self).closest(".details-page.rant-comment-row-widget").attr("data-id");
		});
	}
});

$(".modal-verify-required").on("click", ".modal-alert-btn", function(e) {
	e.preventDefault();
	$(this).addClass("btn-loader");
	var params = getBaseLoggedInParams();
	var self = this;
	$.ajax({
		url: "/api/users/me/resend-confirm",
		dataType: "json",
		method: "POST",
		data: params
	}).done(function(e) {
		if (closeModalTo) {
			animateFormUp(".alert-modal", "." + closeModalTo);
			closeModalTo = "";
		} else {
			signupModalOut();
		}
		//animateFormDown(".modal-verify-required");
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

var logout = function() {
	Cookies.remove("dr_token", { secure: true });
	document.location = "/feed";
};

$(".menu-modal").on("click", ".menu-option-log-out a", function(e) {
	e.preventDefault();
	logout();
});

$(".settings-modal").on("click", ".menu-option-log-out a", function(e) {
	e.preventDefault();
	logout();
});

$(".settings-modal").on("click", ".menu-option-delete-account a", function(e) {
	e.preventDefault();
	if (confirm("Are you sure you want to delete your account?")) {
		var params = getBaseLoggedInParams();

		$.ajax({
			url: "/api/users/me?" + $.param(params),
			dataType: "json",
			method: "DELETE",
			//data: params
		}).done(function(e) {
			logout();
		});
	}
});

$(".menu-modal").on("click", ".menu-option-log-in a", function(e) {
	e.preventDefault();
	animateFormDown(".menu-modal", ".login-form");
});

var url = new URL(location.href);
var show_login = url.searchParams.get("login");

if (show_login == "1") {
	signupModalIn(".menu-modal");
	animateFormDown(".menu-modal", ".login-form");
} else {
	show_signup = url.searchParams.get("signup");

	if (show_signup) {
		signupModalIn(".menu-modal");
		animateFormDown(".menu-modal", ".signup-form");
	}
}

$(".profile-page").on("click", ".profile-edit-btn", function(e) {
	e.preventDefault();
	signupModalIn(".details-form");
});

$(".profile-page").on("click", ".avatar-blank.avatar-locked", function(e) {
	e.preventDefault();
	alert("You need 10 points to create an avatar! Try posting some rants and comments and you should be able to create one in no time at all!");

});

var $editProfileForm = $(".details-form");

$editProfileForm.on("click", ".signup-details-btn", function (e) {
	e.preventDefault();
	$(this).addClass("btn-loader");
	var self = this;
	var params = getBaseLoggedInParams();
	params.profile_about = $editProfileForm.find(".about-input").val();
	params.profile_skills = $editProfileForm.find(".skills-input").val();
	params.profile_location = $editProfileForm.find(".location-input").val();
	params.profile_github = $editProfileForm.find(".github-input").val();

	$.ajax({
		url: "/api/users/me/edit-profile",
		dataType: "json",
		method: "POST",
		data: params
	}).done(function(e) {
		if ($("body").hasClass("state-logged-in")) {
			window.location = "/users/" + $("body").attr("data-username");
		} else {
			window.location = "/feed";
		}
		//signupModalOut();
		//animateFormDown(".modal-verify-required");
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

var $forgotForm = $(".forgot-form");
$forgotForm.on("click", ".forgot-email-btn", function(e) {
	e.preventDefault();
	$(this).addClass("btn-loader");
	var self = this;
	var params = {
		app: 3,
		username: $forgotForm.find(".username-input").val(),
		guid: getMyGuid(),
		plat: 3,
		sid: getSessionStartTime(),
		seid: getSessionEventId()
	};

	$.ajax({
		url: "/api/users/forgot-password",
		dataType: "json",
		method: "POST",
		data: params
	}).done(function(e) {
		signupModalOut();
	}).always(function() {
		$(self).removeClass("btn-loader");
	});
});

var setDefaultSort = function(method) {
	var params = {
		expires: 730
	};

	Cookies.set('dr_feed_sort', method, params);
};
	var changeNotifIndicatorCount = function(count) {
		var $elem = $(".top-bar-notif, .menu-notif");
		$elem.each(function() {
			if (count > 0) {
				var use_notifs = count < 100 ? count : "99+";
				if (use_notifs < 10) {
					$(this).removeClass("notif-2digits");
				} else {
					$(this).addClass("notif-2digits");
				}
				$(this).text(use_notifs)
				$(this).css("display", $(this).attr("data-display-type"));
				if (isNotifPage) {
					$(".btn-notif-clear").css("visibility", "visible");
				}
			} else {
				$(this).css("display", "none");
				if (isNotifPage) {
					$(".btn-notif-clear").css("visibility", "hidden");
				}
			}
		});
	};
	/*$(".signup-email-btn").on("click", function(e) {
		e.preventDefault();
		animateFormDown(".signup-form", ".details-form");
	});*/
	var setNotifTimeout = function() {
		notifTimeout = setTimeout(updateNotifBadgeCount, 30000);
	};
	var updateNotifBadgeCount = function() {
		var params = getBaseLoggedInParams();
		params.ids = JSON.stringify([]);

		$.ajax({
			url: "/api/devrant/rants",
			dataType: "json",
			method: "GET",
			data: params
		}).done(function(e) {
			if (e.success && e.num_notifs !== undefined) {
				numNotifs = e.num_notifs;
				changeNotifIndicatorCount(numNotifs);
			}
		}).always(function() {
			setNotifTimeout();
		});
	};

	if (isLoggedIn()) {
		updateNotifBadgeCount();
	}

	var addNoitfRows = function(items, username_map) {
		var $notif_list_container = $(".notif-list");
		var prepend_tiems = [];
		for (var i = 0; i < items.length; ++i) {
			var $this_container = $("<li>").attr("data-rant-id", items[i].rant_id);
			var $a = $("<a>").attr("href", "/rants/" + items[i].rant_id);
			var $icon_span = $("<span>").addClass("icon" + (items[i].read ? "" : " notif-new"));
			$a.append($icon_span);
			var $notif_body_span = $("<span>").addClass("notif-body");
			var type = items[i].type;
			var useBodyText = "";
			var useIcon = "";
			if (type == "content_vote") {
				useBodyText = "<strong>" + username_map[items[i].uid] + "</strong> ++'d your rant!";
				useIcon = "icon-plus-circle1";
			} else if (type == "comment_discuss") {
				useBodyText = "New comments on a rant you commented on!";
				useIcon = "icon-feedback2";
			} else if (type == "comment_vote") {
				useBodyText = "<strong>" + username_map[items[i].uid] + "</strong> ++'d your comment!";
				useIcon = "icon-plus-circle1";
			} else if (type == "comment_content") {
				useIcon = "icon-feedback2";
				useBodyText = "<strong>" + username_map[items[i].uid] + "</strong> commented on your rant!"
			} else if (type == "comment_mention") {
				useIcon = "icon-feedback2";
				useBodyText = "<strong>" + username_map[items[i].uid] + "</strong> mentioned you in a comment!";
			} else if (type == "rant_sub") {
                useBodyText = "<strong>" + username_map[items[i].uid] + "</strong> posted a new rant!";
                useIcon = "icon-plus-circle1";
            }
			$notif_body_span.html(useBodyText);
			$icon_span.addClass(useIcon);
			$a.append($notif_body_span);
			$this_container.append($a);
			prepend_tiems.push($this_container);
		}
		$notif_list_container.prepend(prepend_tiems);
	};

	var setFetchNotifsTimer = function() {
		fetchNotifTimeout = setTimeout(fetchNotifs, 5000);
	};

	var fetchNotifs = function() {
		var params = getBaseLoggedInParams();
		params.last_time = lastNotifCheckTime;
		//params.ids = JSON.stringify([]);

		$.ajax({
			url: "/api/users/me/notif-feed",
			dataType: "json",
			method: "GET",
			data: params
		}).done(function(e) {
			if (e.success && e.data && e.data.items) {
				lastNotifCheckTime = e.data.check_time;
				addNoitfRows(e.data.items, e.data.username_map);
			}
		}).always(function() {
			setFetchNotifsTimer();
		});
	};

	if ($(".notif-list").length) {
		isNotifPage = true;
		fetchNotifs();

		var $notif_list = $(".notif-list");
		$notif_list.on("mousedown", "li", function() {
			var rant_id = $(this).attr("data-rant-id");
			var num_cleared = 0;
			$notif_list.find('li[data-rant-id="' + rant_id + '"]').each(function() {
				var $icon = $(this).find(".icon");
				if ($icon.hasClass("notif-new")) {
					++num_cleared;
					$icon.removeClass("notif-new");
				}
			});

			if (num_cleared) {
				if (notifTimeout) {
					clearTimeout(notifTimeout);
					notifTimeout = null;
					setNotifTimeout();
				}
				numNotifs -= num_cleared;
				changeNotifIndicatorCount(numNotifs);
			}
		});

		$(".btn-notif-clear").on("click", function() {
			if (notifTimeout) {
				clearTimeout(notifTimeout);
				notifTimeout = null;
				setNotifTimeout();
			}
			numNotifs = 0;
			var params = getBaseLoggedInParams();
			$.ajax({
				url: "/api/users/me/notif-feed?" + $.param(params),
				dataType: "json",
				method: "DELETE",
				data: {}
			}).done(function(e) {

			}).always(function() {

			});
			changeNotifIndicatorCount(numNotifs);
			$notif_list.find('li').each(function() {
				var $icon = $(this).find(".icon");
				if ($icon.hasClass("notif-new")) {
					$icon.removeClass("notif-new");
				}
			});
			//$(this).hide();
		});
	}
});


// Out of onload function //

var incrRantsViewed = function() {
	var num_rants_viewed = Cookies.get("dr_rants_viewed");

	if (num_rants_viewed == undefined) {
		num_rants_viewed = 1;
		var params = {
			expires: 730
		};

		params.secure = true;
	} else {
		++num_rants_viewed;
	}

	if (num_rants_viewed >= 2) {
		showStickersIfNeeded();
	}

	Cookies.set('dr_rants_viewed', num_rants_viewed, params);
};

var showStickersIfNeeded = function() {
	if (Cookies.get("dr_stickers_seen") == 1) {
		return;
	}

	layoutFuncs.signupModalIn(".stickers-modal");

	var params = {
		expires: 730
	};

	Cookies.set('dr_stickers_seen', 1, params);
};

var getMyGuid = function() {
	var s4;
	var curGuid = Cookies.get("dr_guid");

	if (curGuid != undefined) {
		return curGuid;
	}

	s4 = function() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};

	var guid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	var params = {
		expires: 730,
		secure: true
	};

	Cookies.set('dr_guid', guid, params);
	return guid;
};

var getSessionStartTime = function() {
	var st = Cookies.get("dr_session_start");

	if (st != undefined) {
		return st;
	}

	st = Date.now().toString();
	Cookies.set('dr_session_start', st);
	return st;
};

var getSessionEventId = function() {
	var st = Cookies.get("dr_event_id");

	if (st == undefined) {
		st = 1;
	}

	Cookies.set('dr_event_id', ++st);
	return st;
};
