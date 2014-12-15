document.addEventListener('DOMContentLoaded', function () {
	console.log('initial login');
	var monday = getMonday();
	var saturday = getSaturday();
	var mondayString = monday.getFullYear() + '/' + (monday.getMonth()+1) + '/' + monday.getDate()
	var saturdayString = saturday.getFullYear() + '/' + (saturday.getMonth()+1) + '/' + saturday.getDate()
	$.ajax({
		   url: 'http://jira-bld-ppl.psi.de:8080/rest/api/2/search',
		   type: 'POST',
		   contentType: 'application/json',
		   data: '{"jql" : "project=ppljls and updatedDate > \'' + mondayString +'\' and updatedDate < \'' + saturdayString +'\' "}',
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
var mondayDay = now.getDate() - now.getDay() +1; 
var mondayDateWithTime = new Date(now.setDate(mondayDay));
var monday =  new Date(mondayDateWithTime.getFullYear(), mondayDateWithTime.getMonth(), mondayDateWithTime.getDate());
return monday;
}

function getSaturday() {
var now = new Date();
var saturdayDay = now.getDate() - now.getDay() +6; 
var saturdayDate = new Date(now.setDate(saturdayDay));
var saturdayDateDate =  new Date(saturdayDate.getFullYear(), saturdayDate.getMonth(), saturdayDate.getDate());
return saturdayDateDate;
}
			
		  

			
});

