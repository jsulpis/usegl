import { readdirSync } from "node:fs";

const files = readdirSync("playground/src/pages");

export const routes = files
	.map((file) => file.replace(".astro", ""))
	.filter((route) => route !== "index");
