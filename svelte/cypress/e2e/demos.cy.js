const cases = [
	"/base/:skin",
	"/filter-builder-line/:skin",
	"/filter-builder-simple/:skin",
	"/filter-builder-options/:skin",
	"/filter-builder-dates/:skin",
	"/filter-builder-api/:skin",
	"/filter-builder-locales/:skin",
	"/filter-builder-convert-dates/:skin",
	"/filter-editor-base/:skin",
	"/filter-editor-events/:skin",
	"/filter-editor-fields/:skin",
	"/filter-editor-dates/:skin",
	"/filter-editor-options/:skin",
	"/filter-bar/:skin",
	"/filter-bar-combined/:skin",
	"/filter-bar-dates/:skin",
];

const skins = ["material", "willow", "willow-dark"];
const links = [];

cases.forEach(w => {
	skins.forEach(s => {
		links.push(w.replace(":skin", s));
	});
});

context("Basic functionality", () => {
	it("widget", () => {
		links.forEach(w => {
			cy.visit(`/index.html#${w}`);
			cy.get("body").click(); // remove focus from input
			cy.shot(w, { area: ".content" });
		});
	});
});
