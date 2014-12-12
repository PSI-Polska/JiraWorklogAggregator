document.addEventListener('DOMContentLoaded', function () {
	console.log('initial login');
	var monday = getMonday();
	var saturday = getSaturday();
	$.ajax({
		   url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search?jql=project=ppljls%20and%20updatedDate>"' + monday.getFullYear() + '/' + monday.getMonth() + '/' + monday.getDay()+ '"',
		   data: {},
		   success: function (data, status, jqXHR) {
					console.log('success');
					console.log(data);

		   },
		   error: function (data, status, error) {
				   					console.log('fail');

		   },
		  });
		  
		  function getMonday() {
   var now = new Date();
   var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate()+(1 - now.getDay()));
   return monday;
}

		  function getSaturday() {
   var now = new Date();
   var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate()+(6 - now.getDay()));
   return monday;
}
			
		  

			
});

