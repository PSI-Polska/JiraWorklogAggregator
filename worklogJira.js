function getHoursForUsers(startDay, endDay, callback) {
	endDay=addDays(endDay,1)
    var mondayString = startDay.getFullYear() + '/' + (startDay.getMonth() + 1) + '/' + startDay.getDate()
    var saturdayString = endDay.getFullYear() + '/' + (endDay.getMonth() + 1) + '/' + endDay.getDate()
    $.ajax({
        url: localStorage["jiraUrl"] + 'rest/api/2/search',
        type: 'POST',
        contentType: 'application/json',
        data: '{"jql" : "project=' + localStorage["projectKey"] + ' and updatedDate > \'' + mondayString + '\' ORDER BY updatedDate", "maxResults":1000 }',
        success: function(data, status, jqXHR) {
            console.log('success');
            callback.onStartFetching.call(this, data);

            retrieveWorklogsForIssues(data.issues, {
                success: function(worklogs) {
                    var worklogsPerUser = [];
                    worklogs.filter(function(worklog) {
                        return new Date(worklog.started) > startDay && new Date(worklog.started) < endDay;
                    }).forEach(function(worklog) {
                        var worklogOwner = worklog.author.name;
                        if (worklogsPerUser[worklogOwner] === undefined) {
                            worklogsPerUser[worklogOwner] = [];
                            worklogsPerUser[worklogOwner].getForDay = function(date) {
                                return this.filter(function(worklog) {
                                    return new Date(worklog.started) > new Date(date.setHours(0, 0, 0, 0)) && new Date(worklog.started) < new Date(date.setHours(23, 59, 59, 99));
                                });
                            };
                        }
                        worklogsPerUser[worklogOwner].push(worklog)
                    });
					callback.onSuccess(worklogsPerUser);
                },
                error: function() {
                    callback.error.call(this);
                },
                onFetch: function(issue, progress) {
                    callback.onProgress.call(this, progress);
                }
            });},
        error: function(data, status, error) {
            console.log('fail');
        },
    });
}

function processResponse(data, callback) {

}

function retrieveWorklogsForIssues(issueKeys, callback) {
    var issuesLeft = issueKeys.length;
    var results = [];
    issueKeys.forEach(function(issueKey) {
        retrieveWorklogsForIssue(issueKey, {
            success: function(issue, worklogs) {
                issuesLeft--;
                callback.onFetch.call(this, issue, (issueKeys.length - issuesLeft) / issueKeys.length, worklogs)
                results = results.concat(worklogs);
                if (issuesLeft == 0) {
                    callback.success.call(this, results);
                }
            },
            error: function(data) {
                callback.onFetch.call(this, data)
            }
        });
    });
}

function retrieveWorklogsForIssue(issue, callback) {
    $.ajax({
        url: localStorage["jiraUrl"] + 'rest/api/2/issue/' + issue.key + '/worklog',
        contentType: 'application/json',
        success: function(data, status, jqXHR) {
            callback.success.call(this, issue, data.worklogs);
        },
        error: function(data, status, error) {
            callback.error.call(this, issue, data);
        },
    });
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function getDateOfWeekDay(ref,day) {
    var mondayDay = ref.getDate() - ref.getDay() + 1 + day;
    var mondayDateWithTime = new Date(ref.setDate(mondayDay));
    var monday = new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
    return monday;
}