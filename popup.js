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


        function loadTime(callback) {
            $.ajax({
                url: 'http://dotproject.psi.pl/index.php?m=projects&a=reports&project_id=399&report_type=userlogsaggrpertask&log_start_date=20141215&log_end_date=20141219&log_userfilter=0&do_report=submit#',
                data: {},
                success: function(data, status, jqXHR) {
                    var results = new Array();
                    var table = $($(data).find('.tbl'));
                    table.find('tr').each(function(tr) {
                        var tds = $(this).find('td');
                        if (tds.length === 6) {

                            if (isDevelopmentOrDocumentationTask(tds[2])) {

                                var username = getUniqueUserName($(tds[0]).html());
                                if (results[username] == undefined) {
                                    results[username] = new Array();
                                }
                                var date = getDate(tds[4]);
                                var entry = getEntry(tds[5]);

                                if (results[username][date.getDay() - 1] == undefined) {

                                    results[username][date.getDay() - 1] = entry
                                } else {

                                    results[username][date.getDay() - 1] += entry
                                }
                            }
                        }
                    });

                    callback.call(this, results);

                },
                error: function(data, status, error) {

                },
                dataType: 'html'
            });

            function isDevelopmentOrDocumentationTask(td) {
                return /Development|Documentation/.test($(td).html());
            }

            function getEntry(td) {
                return parseFloat($(td).html());
            }

            function getDate(td) {
                var test = $(td).html().split('/')
                return new Date(test[2], test[1] - 1, test[0])
            }

            function getUniqueUserName(username) {
                switch (username) {
                    case 'Bocian Michał':
                        return 'mbocian';
                    case 'Ćmil Michał':
                        return 'mcmil';
                    case 'Ostrowski Piotr':
                        return 'postrowski';
                    case 'Jaroszewicz Adrian':
                        return 'ajaroszewicz';
                    case 'Drąg Łukasz':
                        return 'ldrag';
                    case 'Becela Piotr':
                        return 'pbecela';
                    case 'Robakowski Przemko':
                        return 'probakowski';
                }
            }
        };




        $('#loader').html('<img src="img/ajax-loader.gif" />');
        $('#logsTable').remove();



        chrome.runtime.sendMessage({
            method: 'getHoursForUsers'
        }, function(response) {


            loadTime(function(data) {
                for (key in data) {
                    buildEmptyRow(key);
                    for (var i = 0; i < 5; i++) {
                        $('#' + key + ' .columnDay' + i + ' .dp').html((data[key][i]==undefined ? 0 : data[key][i]) + 'h');
                    }
                }
            });

            $('#loader').html('');
            $('#logs').append('<table id="logsTable"></table>');

            $('#logsTable').append('<tr><td>User</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thur</td><td>Fri</td></tr>');


            for (var key in response) {
				buildEmptyRow(key);
				for (var i = 0; i < 5; i++) {
					$('#' + key + ' .columnDay' + i + ' .jira').html((getTotal(response[key][i])/3600) + 'h');
				}
            }
            

            function buildEmptyRow(username) {
                if ($('#logsTable #' + username).length === 1) {
                    return;
                }
                $('#logsTable').append('<tr id="' + username + '"></tr>');
                $('#' + username).append('<td class="columnName">'+username+'</td>');
				
                for (var i = 0; i < 5; i++) {
                    $('#' + username).append('<td class="columnDay columnDay' + i + '"><div class="dp">0h</div><div class="jira">0h</div></td>');
                }

            }


            function getTotal(worklogs) {
                var total = 0;
                worklogs.forEach(function(worklog) {
                    total += worklog.timeSpentSeconds;
                });
                return total;
            }
        });
    });
});