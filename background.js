/* GENERAL */
var currTime = -1;
var loggedIn = undefined;
var onClickListenerRegistered = false;

/* OPTIONS (default values or from local storage)*/
var userID = (localStorage["userID"] === undefined) ? -1 : localStorage["userID"];;
var popupTimeout = (localStorage["popupTimeout"] === undefined) ? 10 : localStorage["popupTimeout"];
var requestTimeout = (localStorage["requestTimeout"] === undefined) ? 1 : localStorage["requestTimeout"];
var badgeColor = (localStorage["badgeColor"] === undefined) ? '#6B4F4F' : localStorage["badgeColor"];
var targetUrl = 'dotproject.psi.pl';
var showPopup = (localStorage["showPopup"] === undefined) ? true : localStorage["showPopup"];
var revertTime = (localStorage["revertTime"] === undefined) ? false : localStorage["revertTime"];
var playGoHome = (localStorage["playGoHome"] === undefined) ? false : localStorage["playGoHome"];

/* TIMERS */
var popupTimer = null;
var requestTimer = null;
var hh = 0;
var mm = 0;

/* HTML content*/
var entrances = null;

/* TIME factor*/
var popupTimeFactor = 60000;
var requestTimeFactor = 60000;
var notificationShowupTime = 7000; // in seconds


isLoggedInJira();

var jiraStatus = new Object();


function isLoggedInJira(){
					console.log("checking...");
                    $.ajax({
                        url: 'http://jira-bld-ppl.psi.de:8080/rest/auth/1/session',
                        contentType: 'application/json',
                        success: function(data, status, jqXHR) {
							$.ajax({
								url: data.self,
								contentType: 'application/json',
								success : function(data,status, jqXHR){
									jiraStatus.connected = true;
									jiraStatus.user = data;	
								},
								eror : function(data,status,error){
									jiraStatus.connected = true;
									jiraStatus.user = data;
								},
							})
                        },
                        error: function(data, status, error) {
                            jiraStatus.connected = false;
                            jiraStatus.user = undefined;
                        },
                    });
}

function jiraRequestInterval(){
	isLoggedInJira();
}


requestTimer = createInterval(jiraRequestInterval, requestTimeout, requestTimeFactor, requestTimer);




chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.method == 'isLoggedInJira')
	{
		sendResponse(jiraStatus);
	}
	if(message.method == 'isLogged')
	{
		sendResponse({isLogged : loggedIn, url: targetUrl});
	}
	else if(message.method == 'getTimeForPopup')
	{
		readTime(function(){
			sendResponse({time:currTime, h: hh, m: mm, url: targetUrl, myEntrances : entrances});
		});
		return true;
	}
	else if(message.method == 'setOptions')
	{
		showPopup = localStorage["showPopup"];
		revertTime = localStorage["revertTime"];
		playGoHome = localStorage["playGoHome"];
		readTime(function(){
			popupInterval();
		});
		
		badgeColor = localStorage["badgeColor"];
		if(currTime != -1)
		{
			setBadgeText(currTime  + '');
		}
		popupTimeout = localStorage["popupTimeout"];
		popupTimer = createInterval(popupInterval, popupTimeout, popupTimeFactor, popupTimer);
		
		requestTimeout = localStorage["requestTimeout"];
		requestTimer = createInterval(requestInterval, requestTimeout, requestTimeFactor, requestTimer);
	}
});

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function setBadgeText(badgeText) {
	var details = {
		text : badgeText
	};
	chrome.browserAction.setBadgeBackgroundColor({"color": [hexToR(badgeColor), hexToG(badgeColor), hexToB(badgeColor), 125]});
	chrome.browserAction.setBadgeText(details);
}


function readTime(callback){
	if(userID === -1)
	{
		console.log('initial login');
		var siteUrl = 'http://'+targetUrl+'/?m=PSIEntranceLogger&tab=0';
		$.ajax({
		   url: siteUrl,
		   data: {},
		   success: function (data, status, jqXHR) {
				var isAuthorized = false;
				
				$(data).find('*:contains("Twój dzisiejszy całkowity czas w biurze:"):last').each(function(){
					
					userID = $(data).find('input[name$="selected_user"]').val();
					localStorage["userID"] = userID;
					
					var myArray = $(this).text().split(': ');
					var time = myArray[1];
					var timeArray = time.split(':');
					hh = timeArray[0];
					mm = timeArray[1];
					currTime = time;
					setBadgeText(currTime);
					loggedIn = true;
					isAuthorized = true;
				});

				if( !isAuthorized ) {
					setBadgeText('login');
					$(data).find('input:password[name="password"]').each(function(){
						loggedIn = false;
					});
				}
				if(callback !== undefined)
				{
					callback();
				}
				
		   },
		   error: function (data, status, error) {
				setBadgeText('error');
				loggedIn = undefined;
				if(callback !== undefined)
				{
					callback();
				}
		   },
		   dataType: 'html'
		});
	}
	else
	{
		console.log('Update for user ID = ' + userID);
		var siteUrl = 'http://dotproject.psipolska.com/modules/PSIEntranceLogger/offlineCheck.php?passkey=zaqwsxcderfv&userId=' + userID;
		$.ajax({
		   url: siteUrl,
		   data: {},
		   success: function (data, status, jqXHR) {
				var time = $(data).filter('#currentTime').text();
				var timeArray = time.split(':');
				hh = timeArray[0];
				mm = timeArray[1];		
				time=("" + hh).slice(-2)+':'+('0' + mm).slice(-2);
				currTime = time;
				entrances = $(data).filter('#entrances').html();
				if( isTrue(revertTime) )
				{
					var max = 480;
					var tLeft = max - ( parseInt(hh) * 60 + parseInt(mm) );
					var h = 8 - hh;
					var m = 60 - mm;
					var minutes = Math.abs(tLeft);
					var hours = Math.floor(minutes / 60);
					minutes %= 60;
					hours %= 60;
					var sign = (tLeft < 0) ? "-" : "";
					var ct = sign + ("" + (hours)).slice(-2)+':'+('0' + minutes).slice(-2);
					setBadgeText(ct);
				}
				else
				{
					setBadgeText(currTime);
				}
				
				// Play sound when you are in office between 7:45 - 8:00
				var s = (parseInt(hh)*60 + parseInt(mm));
				if( s >= 465 && s <= 480)
				{
					play();
				}
				
				loggedIn = true;
				
				if(callback !== undefined)
				{
					callback();
				}
		   },
		   error: function (data, status, error) {
				setBadgeText('error');
				loggedIn = undefined;
				if(callback !== undefined)
				{
					callback();
				}
		   },
		   dataType: 'html'
		});

	}
};

//readTime(function(){
//	popupInterval();
//});

var requestInterval = function() {
	readTime();
};

var popupInterval = function() {
	if(loggedIn && showPopup === 'true')
	{
		var msg = '';
		if(hh == 8)
		{
			msg = 'Minęło 8 godzin. Może już czas iść do domu?\n';
		}
		else if(hh == 9)
		{
			msg = 'Minęło 9 godzin. Zobacz ile osób siedzi w biurze... :) \n';
		}
		else if(hh == 10)
		{
			msg = 'Minęło 10 godzin. Serio! \n';
		}
		else if(hh >= 10)
		{
			msg = 'Minęło już ponad 10 godzin. Serio! \n';
		}
		var time = (hh).slice(-2)+':'+('0' + mm).slice(-2);
		msg = msg + 'Czas spędzony w biurze: ' + time;
		
		var opt = {
			type: "basic",
			title: "Entrance Logger Info",
			message: msg,
			iconUrl: "img/icon_128.png"
		}
		var id = 'PSInotification';
		var closeInterval;
		
		chrome.notifications.create(id, opt, function(){
			if(!onClickListenerRegistered)
			{
				console.log("Notification created. Registering onClicked listener");
				chrome.notifications.onClicked.addListener(function(){
					chrome.tabs.create({'url': 'http://'+targetUrl+'/?m=PSIEntranceLogger&tab=0'}, function(tab) {});
				});
				onClickListenerRegistered = true;
			}
			closeInterval = setInterval(function(){
				chrome.notifications.clear(id,function(){});
				clearInterval(closeInterval);
			}, notificationShowupTime);
		});
	}
};

function createInterval(callback, delay, factor, oldInterval) {
	clearInterval(oldInterval);
	return setInterval(callback, delay * factor);
};

function play(){
	if(isTrue(playGoHome))
	{
		var audio = new Audio();
		audio.addEventListener("canplaythrough", function(audio) { 
			this.play(); 
		}, false);
		audio.src = "/res/wind.mp3";
		audio.load();
	}
};

//popupTimer = createInterval(popupInterval, popupTimeout, popupTimeFactor, popupTimer);
//requestTimer = createInterval(requestInterval, requestTimeout, requestTimeFactor, requestTimer);

function install_notice() {
    if (localStorage.getItem('install_time'))
        return;

    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({url: "options.html"});
	chrome.tabs.create({url: 'http://'+targetUrl+'/?m=PSIEntranceLogger&tab=0'});
	alert('Proszę zaloguj się do DotProject w celu pobrania ID twojego użytkownika.');
}

function isTrue(input) {
    if (typeof input == 'string') {
        return input.toLowerCase() == 'true';
    }

    return !!input;
}

//install_notice();

