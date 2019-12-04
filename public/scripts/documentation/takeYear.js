$(document).ready(function(){

	// fill in elements that require current year
	var year = moment().format("YYYY");
	$(".current-year").each(function(element){
		$(this).text(year);
	});
	
});