import { readdirSync } from "node:fs";

export const sections = readdirSync("playground/src/pages", { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.map((folder) => folder.name);

export const routes = sections.flatMap((section) => {
	const files = readdirSync(`playground/src/pages/${section}`);

	return files.map((file) => {
		const route = file.replace(".astro", "");
		return { section, route };
	});
});
