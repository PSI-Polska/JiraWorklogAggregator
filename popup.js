document.addEventListener('DOMContentLoaded', function(){
		chrome.runtime.sendMessage({method:'getHoursForUsers'}, function(response){
			console.log(response);
	});
} );