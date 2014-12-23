﻿
document.addEventListener('DOMContentLoaded', function() {

    chrome.runtime.sendMessage({
        method: 'getJiraLogin'
    }, function(response) {
        if (response.connected == false) {
            $('#message').append('Could not connect to Jira. <a href="options.html" target="_blank">[settings]</a>');
            return;
        }

        if (response.user === undefined) {
            $('#message').append('You are not logged in into Jira. <a href="' + localStorage['jiraUrl'] + '" target="_blank">[log in]</a>');
            return;
        }



        var shiftWeek = function(shift) {
			if(shift == 0){
				startDay = getDateOfWeekDay(new Date(), 0);
				endDay = getDateOfWeekDay(new Date(), 4);
			}else{
				startDay = getDateOfWeekDay(addDays(startDay, shift * 7), 0);
				endDay = getDateOfWeekDay(addDays(endDay, shift * 7), 4);
			}
			$('#nav').slideUp();
            $('#logsTable').slideUp({
                complete: function() {
                    $('#progress').slideDown({
                        complete: function() {
                            $('#logsTable').remove();
                        }
                    });

                    circle.animate(0.05);
                    getTable(startDay, endDay, {
                        success: function(data) {
                            drawTable(startDay, endDay, data);
                            $('#progress').slideUp({
                                complete: function() {
                                    $('#logsTable').slideDown();
									$('#nav').slideDown();

                                }
                            });
                        },
                        onProgress: function(progress) {
                            circle.animate(progress);
                        }
                    });
                }
            });
        }


        $('#next-button').click(function() {
            (shiftWeek(1))
        });
        $('#prev-button').click(function() {
            (shiftWeek(-1))
        });
        $('#now-button').click(function() {
            (shiftWeek(0))
        });

        var circle = new ProgressBar.Circle('#progress', {
            color: '#555',
            trailColor: '#eee',
            strokeWidth: 10,
            duration: 10,
            easing: 'easeInOut'
        });
        circle.set(0.05);

        var startDay = getDateOfWeekDay(new Date(), 0);
        var endDay = getDateOfWeekDay(new Date(), 4);

        circle.animate(0.05);
        getTable(startDay, endDay, {
            success: function(data) {
                drawTable(startDay, endDay, data);
                $('#progress').slideUp({
                    complete: function() {
                        $('#logsTable').slideDown();
						$('#nav').slideDown();
                    }
                });
            },
            onProgress: function(progress) {
                circle.animate(progress);
            }
        });
    });
});

function drawTable(startDay, endDay, tableData) {
    $('#logs').append('<table id="logsTable" style="display: none"></table>');
    $('#logsTable').append('<tr><td colspan="2" rowspan="2">User</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thur</td><td>Fri</td></tr>');
    $('#logsTable').append('<tr><td>' + addDays(startDay, 0).format('dd/mm') + '</td><td>' + addDays(startDay, 1).format('dd/mm') + '</td><td>' + addDays(startDay, 2).format('dd/mm') + '</td><td>' + addDays(startDay, 3).format('dd/mm') + '</td><td>' + addDays(startDay, 4).format('dd/mm') + '</td></tr>');


    for (var key in tableData) {
        $('#logsTable').append('<tr id="' + key + '-row-jira"><td rowspan="2" class="' + key + '-cell">' + key + '</td></tr>');
        $('#logsTable').append('<tr id="' + key + '-row-dp">');

        $('#' + key + '-row-jira').append('<td>j</td>');
        $('#' + key + '-row-dp').append('<td>dp</td>');


        for (var i = 0; i < 5; i++) {

            $('#' + key + '-row-jira').append('<td class="columnDay columnDay' + i + '"><div class="jira">' + (tableData[key][i]['jira'] === undefined ? 0 : tableData[key][i]['jira']).toFixed(1) + 'h</div>');
            $('#' + key + '-row-dp').append('<td class="columnDay columnDay' + i + '"><div class="dp">' + (tableData[key][i]['dp'] === undefined ? 0 : tableData[key][i]['dp']).toFixed(1) + 'h</div>');
        }
    }
}

function getTable(startDay, endDay, callback) {

    var dpCompleted = false;
    var jiraCompleted = false;

    var tableData = [];

    function partCompleted() {
        if (jiraCompleted && dpCompleted) {
            callback.success.call(this, tableData)
        }
    }

    getTimeFromDotProject(startDay, endDay, {
        success: function(data) {
            for (var key in data) {
                if (tableData[key] === undefined) {
                    tableData[key] = [];
                }
                for (var i = 0; i < 5; i++) {
                    if (tableData[key][i] === undefined) {
                        tableData[key][i] = [];
                    }
                    tableData[key][i]['dp'] = data[key][i] === undefined ? 0 : data[key][i];
                }
            }
            dpCompleted = true;
            partCompleted();
        },
        error: function(data) {
            alert(data);
        }
    });

    getHoursForUsers(startDay, endDay, {
        onProgress: function(progress) {
            callback.onProgress.call(this, progress);
        },
        onStartFetching: function(data) {

        },

        onSuccess: function(response) {

            for (key in response) {
                if (tableData[key] === undefined) {
                    tableData[key] = [];
                }
                for (var i = 0; i < 5; i++) {
                    if (tableData[key][i] === undefined) {
                        tableData[key][i] = [];
                    }
                    tableData[key][i]['jira'] = getTotal(response[key].getForDay(addDays(startDay, i))) / 3600;
                }
            }

            function getTotal(worklogs) {
                var total = 0;
                worklogs.forEach(function(worklog) {
                    total += worklog.timeSpentSeconds;
                });
                return total;
            }

            var forEach = function(obj, func) {
                var arr = [];
                for (key in obj)
                    arr.push(key);

                arr.sort();
                arr.forEach(func);
            };

            jiraCompleted = true;
            partCompleted();
        }
    });
}