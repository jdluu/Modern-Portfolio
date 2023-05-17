document.addEventListener("DOMContentLoaded", function() {
	const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
	const currentTheme = localStorage.getItem("theme");

	// Function to switch the theme
	function switchTheme(e) {
		const theme = e.target.checked ? "dark" : "light";
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}

	// Add event listener to toggle switch
	toggleSwitch.addEventListener("change", switchTheme);

	// Set initial theme based on localStorage
	if (currentTheme) {
		document.documentElement.setAttribute("data-theme", currentTheme);
		toggleSwitch.checked = currentTheme === "dark";
	}
});
