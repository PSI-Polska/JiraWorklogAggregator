document.addEventListener('DOMContentLoaded', function(){

        chrome.runtime.sendMessage({method:'getJiraLogin'}, function(response){
          if(response.connected==false){
            $('#message').append('Could not connect to Jira. <a href="options.html" target="_blank">[settings]</a>');
            return;
          }

          if(response.user===undefined){
            $('#message').append('You are not logged in into Jira. <a href="'+localStorage['jiraUrl']+'" target="_blank">[log in]</a>');
            return;
          }



        $('#loader').html('<img src="img/ajax-loader.gif" />'); 
        $('#logsTable').remove();

        chrome.runtime.sendMessage({method:'getHoursForUsers'}, function(response){
        $('#loader').html(''); 
		$('#logs').append('<table id="logsTable"></table>');

       $('#logsTable').append('<tr><td>User</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thur</td><td>Fri</td></tr>');

		
        for(var key in response){
            $('#logsTable').append('<tr id="'+key+'"></tr>');
            
            $('#'+key).append('<td class="columnName">'+ key +'</td>');
            for(var i=0; i<5; i++){
                $('#'+key).append('<td class="columnDay columnDay'+i+'">'+ (getTotal(response[key][i])/3600) +'h</td>');
            }
        }
        chrome.runtime.sendMessage({method:'isLoggedInJira'}, function(response){
            $('#'+response.user.name).addClass('currentlyLogged');
        });

        
        function getTotal(worklogs) {
            var total = 0;
            worklogs.forEach(function(worklog) {
                total += worklog.timeSpentSeconds;
            });
            return total;
        }

        });



    });
} );