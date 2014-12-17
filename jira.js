if (/http:\/\/jira-bld-ppl.psi.de:8080\/browse\//.test(document.URL)) {
    $(document).ready(function() {
        if (/http:\/\/jira-bld-ppl.psi.de:8080\/browse\//.test(document.URL)) {

        }

        function getIssueKey() {
            var splitted = document.URL.split('/');
            return splitted[splitted.length - 1];
        }

        getIssueTree(function(issues) {
		
			$('#tt_single_table_info').append('<dl id="jiraWorklogAggregatorEpic"></dl>')
			$('#jiraWorklogAggregatorEpic').append('<dt id="tt_single_text_remain" class="tt_text" title="Remaining Estimate - 40h">Aggregated:</dt>')
		
			var totalTimeSpent = 0;
			issues.forEach(function(issue){
				totalTimeSpent += issue.fields.timespent;
			});
			 $('#jiraWorklogAggregatorEpic').append('<dd id="tt_single_values_spent" class="tt_values" title="Time Spent - Not Specified">'+(totalTimeSpent)/3600+'h</dd>');
        });


        function getIssueTree(callback) {
            $.ajax({
                url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/issue/' + getIssueKey(),
                contentType: 'application/json',
                success: function(data, status, jqXHR) {
                    if (data.fields.issuetype.name == 'Epic') {
						var array = new Array();
						array.push(data);
						(function(){
						var arrayC = array;
							getIssuesInEpic(function(issuesInEpic) {
								if(issuesInEpic.length ===0){
									callback(arrayC);
								}
								console.log(issuesInEpic.length);
								for (var i = 0; i < issuesInEpic.length; i++) {
									var issueInEpic = issuesInEpic[i];
									arrayC.push(issueInEpic);
									
									var count = issuesInEpic.length;
									
									getSubtasks(issueInEpic, function(subtasks) {
										for (var j = 0; j < subtasks.length; j++) {
											var subtask = subtasks[j];
											arrayC.push(subtask);										
										}
										count--;
										if(count==0)
										{
											callback(arrayC);
										}
									});
								}
							})
						})();
                    }
                },
                error: function(data, status, error) {
                    console.log('fail');
                },
            });




        }


        function getIssuesInEpic(callback) {
            $.ajax({
                url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
                type: 'POST',
                data: '{"jql" : "cf[10096] = ' + getIssueKey() + '" }',
                contentType: 'application/json',
                success: function(data, status, jqXHR) {
                    callback.call(this, data.issues);
                },
                error: function(data, status, error) {
                    console.log('fail');
                },
            });
        }

        function getSubtasks(parent, callback) {
            $.ajax({
                url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
                type: 'POST',
                data: '{"jql" : "parent =  ' + parent.key + ' "}',
                contentType: 'application/json',
                success: function(data, status, jqXHR) {
                    callback.call(this, data.issues);
                },
                error: function(data, status, error) {
                    console.log('fail');
                },
            });
        }


    });
}