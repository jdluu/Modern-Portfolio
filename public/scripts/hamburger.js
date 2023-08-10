/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function toggleResponsive() {
	let navList = document.getElementById("nav-list");

	if (navList.className === "nav-list") {
		navList.className += " responsive";
	} else {
		navList.className = "nav-list";
	}
}
