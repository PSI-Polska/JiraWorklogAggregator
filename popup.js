document.addEventListener('DOMContentLoaded', function() {
    console.log('initial login');
    var monday = getDateOfWeekDay(0);
    var saturday = getDateOfWeekDay(5);
    var mondayString = monday.getFullYear() + '/' + (monday.getMonth() + 1) + '/' + monday.getDate()
    var saturdayString = saturday.getFullYear() + '/' + (saturday.getMonth() + 1) + '/' + saturday.getDate()
    $.ajax({
        url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
        type: 'POST',
        contentType: 'application/json',
        data: '{"jql" : "project=ppljls and updatedDate > \'' + mondayString + '\' and updatedDate < \'' + saturdayString + '\' "}',
        success: function(data, status, jqXHR) {
            console.log('success');
            console.log(data);
            processResponse(data);
        },
        error: function(data, status, error) {
            console.log('fail');
        },
    });

    function getDateOfWeekDay(day) {
        var now = new Date();
        var mondayDay = now.getDate() - now.getDay() + 1 + day;
        var mondayDateWithTime = new Date(now.setDate(mondayDay));
        var monday = new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
        return monday;
    }

    function processResponse(data) {
        data.issues.forEach(function(entry) {
            retrieveWorklogs(entry.key, function(data) {
                console.log(data);
            });
        });

        function retrieveWorklogs(issueKey, callback) {
            $.ajax({
                url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/issue/' + issueKey + '/worklog',
                contentType: 'application/json',
                success: function(data, status, jqXHR) {
                    callback.call(this,data);
                },
                error: function(data, status, error) {
                    console.log('fail');
                },
            });
        }
    }
});