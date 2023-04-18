document.addEventListener("DOMContentLoaded", function () {
	const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');

	//Track the theme switch button
	function switchTheme(e) {
		console.log("Switching Theme!");
		if (e.target.checked) {
			document.documentElement.setAttribute("data-theme", "dark");
			localStorage.setItem("theme", "dark"); //add this
		} else {
			document.documentElement.setAttribute("data-theme", "light");
			localStorage.setItem("theme", "light"); //add this
		}
	}

	toggleSwitch.addEventListener("change", switchTheme, false);

	const currentTheme = localStorage.getItem("theme")
		? localStorage.getItem("theme")
		: null;

	if (currentTheme) {
		document.documentElement.setAttribute("data-theme", currentTheme);

		if (currentTheme === "dark") {
			toggleSwitch.checked = true;
		}
	}
});
