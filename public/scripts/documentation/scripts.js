$(document).ready(function(){

	// smooth scroling to IDs
	document.querySelectorAll("button.scroll").forEach(anchor => {
	    anchor.addEventListener("click", function (e) {
	        e.preventDefault();
	        document.querySelector(this.getAttribute("data-href")).scrollIntoView({
	            behavior: "smooth"
	        });
	    });
	});

	document.querySelectorAll("a.scroll").forEach(anchor => {
	    anchor.addEventListener("click", function (e) {
	        e.preventDefault();
	        document.querySelector(this.getAttribute("href")).scrollIntoView({
	            behavior: "smooth"
	        });
	    });
	});
	
});