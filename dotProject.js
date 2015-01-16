        function getTimeFromDotProject(start, end, callback) {

            $.ajax({
                url: 'http://dotproject.psi.pl/index.php?m=projects&a=reports&project_id='+ localStorage["dpProjectKey"] +'&report_type=userlogsaggrpertask&log_start_date=' + start.getFullYear() + ((start.getMonth() + 1) < 10 ? '0' + (start.getMonth() + 1) : (start.getMonth() + 1)) + (start.getDate() < 10 ? '0' + start.getDate() : start.getDate()) + '&log_end_date=' + end.getFullYear() + ((end.getMonth() + 1) < 10 ? '0' + (end.getMonth() + 1) : (end.getMonth() + 1)) + (end.getDate() < 10 ? '0' + end.getDate() : end.getDate()) + '&log_userfilter=0&do_report=submit#',
                data: {},
                success: function(data, status, jqXHR) {
                    var results = new Array();
                    var table = $($(data).find('.tbl'));
                    table.find('tr').each(function(tr) {
                        var tds = $(this).find('td');
                        if (tds.length === 6) {

                            if (isDevelopmentOrDocumentationTask(tds[2])) {

                                var username = $(this).attr('username-key');
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

                    callback.success.call(this, results);

                },
                error: function(data, status, error) {
                    callback.error.call(this, data);
                dataType: 'html'
                },
            });

            function isDevelopmentOrDocumentationTask(td) {
                return new RegExp(localStorage["dpTaskRegexp"]).test($(td).html());
            }

            function getEntry(td) {
                return parseFloat($(td).html());
            }

            function getDate(td) {
                var test = $(td).html().split('/')
                return new Date(test[2], test[1] - 1, test[0])
            }

        }