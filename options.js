function restore_options() {
    var jiraUrl = localStorage["jiraUrl"];
    var projectKey = localStorage["projectKey"];
	var dpProjectKey = localStorage["dpProjectKey"];
	var dpTaskRegexp = localStorage["dpTaskRegexp"];
	var surname = localStorage["surname"];
	
    $("#jiraUrl").val(jiraUrl);
    $("#projectKey").val(projectKey);
	$("#dpProjectKey").val(dpProjectKey);
    $("#dpTaskRegexp").val(dpTaskRegexp);
	$("#surname").val(surname);
	
};

function save_options() {
    localStorage["surname"] = $('#surname').val();
    localStorage["jiraUrl"] = $('#jiraUrl').val();
    localStorage["projectKey"] = $('#projectKey').val();
	localStorage["dpProjectKey"] = $('#dpProjectKey').val();
	localStorage["dpTaskRegexp"] = $('#dpTaskRegexp').val();

    chrome.runtime.sendMessage({method: 'setOptions'});

    $("#info").html("Ustawienia zostały zaktualizowane.");
    $("#info").hide().fadeIn(2000);
};


document.addEventListener('DOMContentLoaded', function () {
	
	if(localStorage["installationDate"] == undefined){
		localStorage["installationDate"] = new Date();
	}
	
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
    checkJiraUrlCorrection();
    checkProjectKeyCorrection();


});