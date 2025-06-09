// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add("shot", (...args) => {
	// eslint-disable-next-line cypress/no-unnecessary-waiting
	cy.wait(100);

	const name = args.filter(a => typeof a !== "object").join("-");
	const conf =
		typeof args[args.length - 1] === "object" ? args[args.length - 1] : {};
	const sconf = { ...conf, overwrite: true };

	if (conf.area) cy.get(conf.area).screenshot(name, sconf);
	else cy.screenshot(name, sconf);
});

Cypress.Commands.add("wxF", (type, id) => {
	switch (type) {
		case "add-filter-button":
			return cy.get("button").contains("Add filter");
		case "cancel-button":
			return cy.get("button").contains("Cancel");
		case "apply-button":
			return cy.get("button").contains("Apply");
		case "field-select":
			return cy.get(".wx-filter-editor > .wx-richselect").first();
		case "list-item":
			return cy.get(".wx-dropdown .wx-list > .wx-item").contains(id);
		case "filter-select":
			return cy
				.get(".wx-filter-editor .wx-cell > .wx-richselect")
				.first();
		case "filter-value":
			return cy.get(".wx-filter-editor .wx-cell input").first();
		case "includes-button":
			return cy.get(".wx-filter-editor > button").first();
		case "includes-items":
			return cy.get(".wx-filter-editor .wx-list > .wx-item");
		case "includes-checkbox":
			return cy
				.get(".wx-filter-editor .wx-list > .wx-item")
				.eq(id)
				.find(".wx-checkbox");
		case "option-checkbox":
			return cy.get(`div.wx-item > div > label`).contains(id);
		case "filter-rule":
			return cy.get(".wx-rule").eq(id);
		case "filter-editor":
			return cy.get(".wx-filter-editor");
		case "menu-item":
			return cy.get(".wx-menu .wx-item").contains(id);
		case "filter-glue":
			return cy.get(".wx-glue").eq(id);
		case "filter-bar-field":
			return cy
				.get(
					".wx-filter-bar > .wx-select, .wx-filter-bar > .wx-text, .wx-filter-bar > .wx-date"
				)
				.eq(id);
		case "filter-bar-field-value":
			return cy
				.get(
					".wx-filter-bar > .wx-select .wx-label, .wx-filter-bar > .wx-text input, .wx-filter-bar > .wx-date input"
				)
				.eq(id);
		case "filtered-data-length":
			return cy
				.get(".wx-result")
				.invoke("text")
				.then(text => parseInt(text));
		default:
			throw `not supported arguments for wxQ: ${type}, ${id}`;
	}
});

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
