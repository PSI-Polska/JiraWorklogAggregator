/* GENERAL */
var currTime = -1;
var loggedIn = undefined;
var onClickListenerRegistered = false;

/* OPTIONS (default values or from local storage)*/
var userID = (localStorage["userID"] === undefined) ? -1 : localStorage["userID"];
;
var popupTimeout = (localStorage["popupTimeout"] === undefined) ? 10 : localStorage["popupTimeout"];
var requestTimeout = (localStorage["requestTimeout"] === undefined) ? 1 : localStorage["requestTimeout"];
var badgeColor = (localStorage["badgeColor"] === undefined) ? '#6B4F4F' : localStorage["badgeColor"];
var targetUrl = 'dotproject.psi.pl';
var showPopup = (localStorage["showPopup"] === undefined) ? true : localStorage["showPopup"];
var revertTime = (localStorage["revertTime"] === undefined) ? false : localStorage["revertTime"];
var playGoHome = (localStorage["playGoHome"] === undefined) ? false : localStorage["playGoHome"];
var jiraUrl = localStorage["jiraUrl"]
var projectKey = localStorage["projectKey"]


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


function getJiraLogin(callback) {
    console.log("checking...");
    var jiraStatus = new Object();
    $.ajax({
        url: localStorage["jiraUrl"] + 'rest/api/2/serverInfo',
        contentType: 'application/json',
        success: function (data, status, jqXHR) {
            jiraStatus.connected = true;
            $.ajax({
                url: localStorage["jiraUrl"] + 'rest/auth/1/session',
                contentType: 'application/json',
                success: function (data, status, jqXHR) {
                    $.ajax({
                        url: data.self,
                        contentType: 'application/json',
                        success: function (data, status, jqXHR) {
                            jiraStatus.user = data;
                            callback.call(this, jiraStatus);
                        },
                        error: function (data, status, error) {
                            callback.call(this, jiraStatus);
                        },
                    })
                },
                error: function (data, status, error) {
                    callback.call(this, jiraStatus);
                },
            })
        },
        error: function (data, status, error) {
            jiraStatus.connected = false;
            jiraStatus.user = undefined;
            callback.call(this, jiraStatus);

        },
    });
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.method == 'getJiraLogin') {
        getJiraLogin(function (data) {
            sendResponse(data);
        });
        return true;
    }
    if (message.method == 'getJiraUrl') {
        sendResponse(localStorage['jiraUrl']);
    }
    if (message.method == 'getHoursForUsers') {
        getHoursForUser(function (data) {
            sendResponse(data);
        });
        return true;
    }
});

function getDateOfWeekDay(day) {
    var now = new Date();
    var mondayDay = now.getDate() - now.getDay() + 1 + day;
    var mondayDateWithTime = new Date(now.setDate(mondayDay));
    var monday = new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
    return monday;
}

function setBadgeText(badgeText) {
    var details = {
        text: badgeText
    };
    chrome.browserAction.setBadgeText(details);
}

var requestInterval = function () {

	if(localStorage["surname"]!=""){		
		personInOffice(localStorage["surname"],{error:function(data){setBadgeText("?");},success: function(data){
		if(data!==null){
			setBadgeText("x");
		}
		else{
			setBadgeText("");
		}}}	);
	}
	else{
		setBadgeText("");
	}
};

var presenceInterval=null;
presenceInterval = createInterval(requestInterval, 5000, presenceInterval);

function createInterval(callback, delay, oldInterval) {
    clearInterval(oldInterval);
    return setInterval(callback, delay);
};




function personInOffice(person, callback){
			 $.ajax({
                url: 'http://dotproject.psi.pl/index.php?m=PSIEntranceLogger&tab=1',
                data: {},
                success: function(data, status, jqXHR) {
                    var results = new Array();
					var wrappedData = $(data);
                    var table = $(wrappedData.find('.tabox'));
					var result = null;
                    table.find('tr').each(function(tr) {
                        var tds = $(this).find('td');
                        if (tds.length === 6) {
							if($(tds[1]).text().toLowerCase()===person.toLowerCase()){
								result = tds;
							}
						}
                    });
					callback.success.call(this, result);
                },
                error: function(data, status, error) {
                    callback.error.call(this, data);
                dataType: 'html'
                },
            });
}
