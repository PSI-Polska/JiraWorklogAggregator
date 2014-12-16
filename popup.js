document.addEventListener('DOMContentLoaded', function(){
		chrome.runtime.sendMessage({method:'getHoursForUsers'}, function(response){
		$('#logsTable').remove();
		$('#logs').append('<table id="logsTable"></table>');
		for(var key in response){
			$('#logsTable').append('<tr id="'+key+'"></tr>');
			
			$('#'+key).append('<td class="columnName">'+ key +'</td>');
			for(var i=0; i<6; i++){
				$('#'+key).append('<td class="columnDay columnDay'+i+'">'+ (getTotal(response[key][i])/3600) +'h</td>');
			}
		}
		chrome.runtime.sendMessage({method:'isLoggedInJira'}, function(response){
			$('#'+key).addClass('currentlyLogged');
		});

		
		function getTotal(worklogs) {
			var total = 0;
            worklogs.forEach(function(worklog) {
				total += worklog.timeSpentSeconds;
            });
            return total;
		}
	});
} );