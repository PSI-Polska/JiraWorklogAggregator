function restore_options() {
    var popupTimeout = localStorage["popupTimeout"];
    var requestTimeout = localStorage["requestTimeout"];
    var badgeColor = localStorage["badgeColor"];
    var showPopup = localStorage["showPopup"];
    var revertTime = localStorage["revertTime"];
    var playGoHome = localStorage["playGoHome"];
    var jiraUrl = localStorage["jiraUrl"];
    var projectKey = localStorage["projectKey"];
	var dpProjectKey = localStorage["dpProjectKey"]
	var dpTaskRegexp = localStorage["dpTaskRegexp"]


    if (popupTimeout === undefined) {
        popupTimeout = 10;
    }
    if (requestTimeout === undefined) {
        requestTimeout = 1;
    }
    if (badgeColor === undefined) {
        badgeColor = '#6B4F4F';
    }
    if (showPopup === undefined) {
        showPopup = true;
    }
    if (revertTime === undefined) {
        revertTime = false;
    }
    if (playGoHome === undefined) {
        playGoHome = false;
    }
    $("#jiraUrl").val(jiraUrl);
    $("#projectKey").val(projectKey);
	$("#dpProjectKey").val(dpProjectKey);
    $("#dpTaskRegexp").val(dpTaskRegexp);
    $("#popupTimeout").val(popupTimeout);
    $("#requestTimeout").val(requestTimeout);
    $("#color").val(badgeColor);
    $("#info").hide();
    $('#showPopup').prop('checked', (showPopup == 'true' ? true : false));
    $('#revertTime').prop('checked', (revertTime == 'true' ? true : false));
    $('#playGoHome').prop('checked', (playGoHome == 'true' ? true : false));
};

function save_options() {
    localStorage["jiraUrl"] = $('#jiraUrl').val();
    localStorage["projectKey"] = $('#projectKey').val();
	localStorage["dpProjectKey"] = $('#dpProjectKey').val();
	localStorage["dpTaskRegexp"] = $('#dpTaskRegexp').val();


    localStorage["showPopup"] = $('#showPopup').prop("checked");

    localStorage["revertTime"] = $('#revertTime').prop("checked");

    localStorage["playGoHome"] = $('#playGoHome').prop("checked");

    //var badgeColor = '#' + document.getElementById('color').color;
    //localStorage["badgeColor"] = badgeColor;

    localStorage["popupTimeout"] = $("#popupTimeout").val();

    localStorage["requestTimeout"] = $("#requestTimeout").val();

    chrome.runtime.sendMessage({method: 'setOptions'});

    $("#info").html("Ustawienia zostały zaktualizowane.");
    $("#info").hide().fadeIn(2000);
};

var checkShowPopup = function () {
    if ($('#showPopup').prop("checked")) {
        $('#popupTimeout').prop("disabled", false);
    }
    else {
        $('#popupTimeout').prop("disabled", true);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    $("#save").click(function () {
        save_options();
    });

    $("#jiraUrl").bind('input', checkJiraUrlCorrection);

    $("#projectKey").bind('input', checkProjectKeyCorrection);


    function checkJiraUrlCorrection() {
        $.ajax({
            url: $("#jiraUrl").val() + 'rest/api/2/serverInfo',
            contentType: 'application/json',
            success: function (data, status, jqXHR) {
                $('#jiraUrlRow .test').removeClass('wrong');
                $('#jiraUrlRow .test').addClass('correct');

            },
            error: function (data, status, error) {
                $('#jiraUrlRow .test').removeClass('correct');
                $('#jiraUrlRow .test').addClass('wrong');
            },
        });
    }

    function checkProjectKeyCorrection() {
        $.ajax({
            url: $("#jiraUrl").val() + 'rest/api/2/project/' + $("#projectKey").val(),
            contentType: 'application/json',
            success: function (data, status, jqXHR) {
                $('#projectKeyRow .test').removeClass('wrong');
                $('#projectKeyRow .test').addClass('correct');
            },
            error: function (data, status, error) {
                $('#projectKeyRow .test').removeClass('correct');
                $('#projectKeyRow .test').addClass('wrong');
            },
        });
    }


    restore_options();
    checkShowPopup();

    checkJiraUrlCorrection();
    checkProjectKeyCorrection();


});