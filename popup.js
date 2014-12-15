﻿document.addEventListener('DOMContentLoaded', function() {
    console.log('initial login');
    var monday = getDateOfWeekDay(0);
    var saturday = getDateOfWeekDay(5);
    var mondayString = monday.getFullYear() + '/' + (monday.getMonth() + 1) + '/' + monday.getDate()
    var saturdayString = saturday.getFullYear() + '/' + (saturday.getMonth() + 1) + '/' + saturday.getDate()
    $.ajax({
        url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
        type: 'POST',
        contentType: 'application/json',
        data: '{"jql" : "project=ppljls and updatedDate > \'' + mondayString + '\' and updatedDate < \'' + saturdayString + '\' ORDER BY updatedDate" }',
        success: function(data, status, jqXHR) {
            console.log('success');
            processResponse(data, function(map) {
                console.log(map);

                for (var key in map) {
                    var obj = map[key];
                    var filtered = filterWorklogs(obj);
                }

                console.log(filtered);


                function filterWorklogs(list) {
                    return list.filter(function(worklog) {
                        return new Date(worklog.started) > monday && new Date(worklog.started) < saturday;
                    });
                }

            });
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

    function processResponse(data, callback) {

        var map = new Object();
        var issuesCount = data.issues.length;
        (function() {
            var mapC = map;
            var issuesCountC = issuesCount
            data.issues.forEach(function(entry) {
                (
                    function() {
                        retrieveWorklogs(entry.key, function(worklogs) {
                            worklogs.forEach(function(worklog) {
                                if (mapC[worklog.author.displayName] == undefined) {
                                    mapC[worklog.author.displayName] = new Array();
                                }
                                mapC[worklog.author.displayName].push(worklog);
                            })
                            issuesCountC = issuesCountC - 1;
                            if (issuesCountC == 0) {
                                callback.call(this, mapC);
                            }
                        })
                    }
                )()
            });
        })()

        function retrieveWorklogs(issueKey, callback) {
            $.ajax({
                url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/issue/' + issueKey + '/worklog',
                contentType: 'application/json',
                success: function(data, status, jqXHR) {
                    callback.call(this, data.worklogs);
                },
                error: function(data, status, error) {
                    console.log('fail');
                },
            });
        }
    }
});