function getHoursForUsers(callback) {
    var monday = getDateOfWeekDay(0);
    var saturday = getDateOfWeekDay(5);
    var mondayString = monday.getFullYear() + '/' + (monday.getMonth() + 1) + '/' + monday.getDate()
    var saturdayString = saturday.getFullYear() + '/' + (saturday.getMonth() + 1) + '/' + saturday.getDate()
    $.ajax({
        url: localStorage["jiraUrl"] + 'rest/api/2/search',
        type: 'POST',
        contentType: 'application/json',
        data: '{"jql" : "project=' + localStorage["projectKey"] + ' and updatedDate > \'' + mondayString + '\' and updatedDate < \'' + saturdayString + '\' ORDER BY updatedDate", "maxResults":1000 }',
        success: function(data, status, jqXHR) {
            console.log('success');
            callback.onStartFetching.call(this, data);

            retrieveWorklogsForIssues(data.issues, {
                success: function(worklogs) {

                    var worklogsPerUser = [];
                    worklogs.filter(function(worklog) {
                        return new Date(worklog.started) > monday && new Date(worklog.started) < saturday;
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
                    console.log(worklogsPerUser['mcmil'].getForDay(addDays(new Date(), -2)));
                },
                error: function() {
                    callback.error.call(this);
                },
                onFetch: function(issue, progress) {
                    callback.onProgress.call(this, progress);
                    console.log(progress);
                }
            });


        },
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

function getDateOfWeekDay(day) {
    var now = new Date();
    var mondayDay = now.getDate() - now.getDay() + 1 + day;
    var mondayDateWithTime = new Date(now.setDate(mondayDay));
    var monday = new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
    return monday;
}