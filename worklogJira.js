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
            processResponse(data, function(map) {
                var results = new Object();
                for (var key in map) {
                    var obj = map[key];
                    results[key] = filterWorklogs(obj);
                }
                callback.onSuccess.call(this, results);

                function filterWorklogs(list) {
                    var worklogsInDays = new Object();
                    for (var i = 0; i < 6; i++) {
                        worklogsInDays[i] = filter(list, i);
                    }
                    return worklogsInDays;
                }

                function filter(list, dayOfWeek) {
                    return list.filter(function(worklog) {
                        return new Date(worklog.started) > getDateOfWeekDay(dayOfWeek) && new Date(worklog.started) < getDateOfWeekDay(dayOfWeek + 1);
                    });
                }
            });

            function processResponse(data, callback) {
                var map = new Object();
                var issuesCount = data.issues.length;
                (function() {
                    var mapC = map;
                    var issuesCountC = issuesCount
					retrieveWorklogsForIssues(data.issues,{success: function(worklogs){
						console.log(worklogs);
					},
					error: function(){
					},
					onFetch: function(progress){
					console.log(progress);
					}
					});
                })()
            }
			
			
        },
        error: function(data, status, error) {
            console.log('fail');
        },
    });
}

function retrieveWorklogsForIssues(issueKeys, callback) {
	var issuesLeft = issueKeys.length;
	var results = [];
	issueKeys.forEach(function(issueKey){
		retrieveWorklogsForIssue(issueKey,{
			success:function(issue,worklogs){
				issuesLeft--;
				callback.onFetch.call(this,(issueKeys.length-issuesLeft)/issueKeys.length,worklogs)
				results=results.concat(worklogs);
				if(issuesLeft==0){
					callback.success.call(this,results);
				}
			},
			error:function(data){
				callback.onFetch.call(this,data)
			}
		});
	});
}

function retrieveWorklogsForIssue(issue, callback) {
    $.ajax({
        url: localStorage["jiraUrl"] + 'rest/api/2/issue/' + issue.key + '/worklog',
        contentType: 'application/json',
        success: function(data, status, jqXHR) {
            callback.success.call(this,issue, data.worklogs);
        },
        error: function(data, status, error) {
            callback.error.call(this,issue, data);
        },
    });
}


function getDateOfWeekDay(day) {
    var now = new Date();
    var mondayDay = now.getDate() - now.getDay() + 1 + day;
    var mondayDateWithTime = new Date(now.setDate(mondayDay));
    var monday = new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
    return monday;
}