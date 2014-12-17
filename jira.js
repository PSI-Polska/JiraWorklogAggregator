if (/http:\/\/jira-bld-ppl.psi.de:8080\/browse\//.test(document.URL)) {
    $(document).ready(function() {
        getIssueTree(getIssueKey(),function(issues) {

            $('#tt_single_table_info').append('<dl id="jiraWorklogAggregatorEpic"></dl>')
            $('#jiraWorklogAggregatorEpic').append('<dt id="tt_single_text_remain" class="tt_text" title="Remaining Estimate - 40h">Aggregated:</dt>')

            var totalTimeSpent = 0;
            issues.forEach(function(issue) {
                totalTimeSpent += issue.fields.timespent;
            });
            $('#jiraWorklogAggregatorEpic').append('<dd id="tt_single_values_spent" class="tt_values" title="Time Spent - Not Specified">' + (totalTimeSpent) / 3600 + 'h</dd>');
        });
    });
}

if (/http:\/\/jira-bld-ppl.psi.de:8080\/issues\//.test(document.URL)) {
    $(document).ready(function() {
        var trs = $('#issuetable tr');
        trs.each(function(i, tr){
			if(!tr.classList.contains('rowheader')){
				var img  = $(tr).find('img')[0]
				if(img != undefined){
					if($(img).attr('src') === '/images/icons/ico_epic.png')
					{
						var epicKey = $(tr).attr('data-issuekey');
						getIssueTree(epicKey,function(issues){
							$(tr).find('.aggregatetimespent').html((aggregate(issues)/3600) + "h");
						});
					}
				}
			}
		});
    });
	
	function aggregate(issues){
		var totalTimeSpent = 0;
            issues.forEach(function(issue) {
                totalTimeSpent += issue.fields.timespent;
        });
		return totalTimeSpent;
	}
}




function getIssueKey() {
    var splitted = document.URL.split('/');
    var splittedJql = splitted[splitted.length - 1].split('?');
    return splittedJql[0];
}



function getIssueTree(epicKey, callback) {
    $.ajax({
        url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/issue/' + epicKey,
        contentType: 'application/json',
        success: function(data, status, jqXHR) {
            if (data.fields.issuetype.name == 'Epic') {
                var array = new Array();
                array.push(data);
                (function() {
                    var arrayC = array;
                    getIssuesInEpic(epicKey,function(issuesInEpic) {
                        if (issuesInEpic.length === 0) {
                            callback(arrayC);
                        }
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
                                if (count == 0) {
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


function getIssuesInEpic(epicKey, callback) {
    $.ajax({
        url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
        type: 'POST',
        data: '{"jql" : "cf[10096] = ' + epicKey + '" }',
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