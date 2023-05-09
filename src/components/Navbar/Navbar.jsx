import React, { useState, useEffect } from "react";
import site from "../../data/site.json";
const { nav } = site;
import "./Navbar.css";

const Navbar = () => {
	const [color, setColor] = useState(false);

	useEffect(() => {
		window.addEventListener("scroll", () => handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	function handleScroll() {
		if (window.scrollY > 50) {
			setColor(true);
		} else {
			setColor(false);
		}
	}

	return (
		<header id="header" className={color ? "active" : ""}>
			<ul id="topNavList">
				{nav.map((item, i) => (
					<li key={i}>
						<a href={item.link} target={item.target} rel="noopener noreferrer">
							{item.name}
						</a>
					</li>
				))}
				<li>
					<label className="switch" aria-label="Toggle Switch">
						<input type="checkbox" />
						<span className="slider round"></span>
					</label>
					<script src="../src/scripts/theme.js"></script>
				</li>
			</ul>
		</header>
	);
};
export default Navbar;
