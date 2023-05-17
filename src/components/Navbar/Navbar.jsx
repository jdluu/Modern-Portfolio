import React, { useState, useEffect } from "react";
import site from "../../data/site.json";
const { nav } = site;
import "./Navbar.css";

const Navbar = () => {
	return (
		<header id="header">
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
					<script type="text/javascript" src="/scripts/theme.js"></script>
				</li>
			</ul>
		</header>
	);
};
export default Navbar;
