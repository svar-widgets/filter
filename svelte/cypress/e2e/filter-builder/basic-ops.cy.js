context("FilterBuilder basic functionality ", () => {
	it("main empty view", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.shot(`filter-builder-empty`);
	});

	it("main view", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.get(".wx-rule").should("have.length", 4);
		cy.get(".wx-glue").should("have.length", 3);
		cy.shot(`filter-builder-value`);
	});

	it("can add new filter via 'Add filter' button in list mode", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 1);
		cy.shot(`filter-builder-list-added-rule-apply-1`);

		cy.wxF("add-filter-button").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("cancel-button").click();
		cy.get(".wx-rule").should("have.length", 1);

		cy.wxF("add-filter-button").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 2);
		cy.shot(`filter-builder-list-added-rule-apply-2`);
	});

	it("can add new filter via 'Add filter' button in simple mode", () => {
		cy.visit(`#/filter-builder-simple-empty`);
		cy.viewport(1300, 975);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.get(".wx-menu .wx-item").should("have.length", 3);
		cy.shot(`filter-builder-simple-add-button-fields-list`);
		cy.wxF("menu-item", "First Name").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.get("body").click(0, 0);
		cy.get(".wx-rule").should("have.length", 0);
		cy.shot(`filter-builder-simple-not-added-filter-clickoutside`);

		cy.wxF("add-filter-button").click();
		cy.get(".wx-menu .wx-item").should("have.length", 3);
		cy.wxF("menu-item", "First Name").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("cancel-button").click();
		cy.get(".wx-rule").should("have.length", 0);
		cy.shot(`filter-builder-simple-not-added-filter-cancel`);

		cy.wxF("add-filter-button").click();
		cy.get(".wx-menu .wx-item").should("have.length", 3);
		cy.shot(`filter-builder-simple-add-button-fields-list`);
		cy.wxF("menu-item", "First Name").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 1);
		cy.shot(`filter-builder-simple-added-rule-apply-1`);

		cy.wxF("add-filter-button").click();
		cy.get(".wx-menu .wx-item").should("have.length", 2);
		cy.wxF("menu-item", "Start Date").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 2);
		cy.shot(`filter-builder-simple-added-rule-apply-2`);

		cy.wxF("add-filter-button").click();
		cy.get(".wx-menu .wx-item").should("have.length", 1);
		cy.wxF("menu-item", "Age").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 3);
		cy.shot(`filter-builder-simple-added-rule-apply-3`);

		cy.wxF("add-filter-button").should("be.disabled");
	});

	it("can add new filter via menu action", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add filter").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-rule").should("have.length", 5);
		cy.shot(`filter-builder-added-rule-menu`);
	});

	it("can open/close editor for existing filter in list mode", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).dblclick();
		cy.wxF("filter-editor").should("be.visible");
		cy.shot(`filter-builder-list-editor-open-dblclick`);
		cy.wxF("cancel-button").click();
		cy.get(".wx-filter-editor").should("not.exist");
		cy.shot(`filter-builder-list-editor-closed-cancel`);

		cy.wxF("filter-rule", 1).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Edit").click();
		cy.shot(`filter-builder-list-editor-open-menu`);
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.shot(`filter-builder-list-editor-closed-apply`);
	});

	it("can open/close editor for existing filter in simple mode", () => {
		cy.visit(`#/filter-builder-simple-value`);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).dblclick();
		cy.wxF("filter-editor").should("be.visible");
		cy.shot(`filter-builder-editor-open-dblclick`);
		cy.shot(`filter-builder-simple-editor-open-dblclick`);
		cy.get("body").click(0, 0);
		cy.get(".wx-filter-editor").should("not.exist");
		cy.shot(`filter-builder-simple-editor-closed-clickoutside`);

		cy.wxF("filter-rule", 1).dblclick();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("cancel-button").click();
		cy.get(".wx-filter-editor").should("not.exist");
		cy.shot(`filter-builder-simple-editor-closed-cancel`);

		cy.wxF("filter-rule", 2).dblclick();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-filter-editor").should("not.exist");
		cy.shot(`filter-builder-simple-editor-closed-apply`);
	});

	it("can add group via menu action", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.get(".wx-group").should("have.length", 2);
		cy.get(".wx-rule").should("have.length", 4);

		cy.wxF("filter-rule", 0).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add group").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.get(".wx-group").should("have.length", 3);
		cy.get(".wx-rule").should("have.length", 5);
		cy.shot(`filter-builder-added-group`);

		cy.wxF("filter-rule", 3).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add group").click();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("apply-button").click();
		cy.wxF("filter-rule", 4).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add filter").click();
		cy.wxF("apply-button").click();
		cy.get(".wx-group").should("have.length", 4);
		cy.get(".wx-rule").should("have.length", 7);
		cy.shot(`filter-builder-added-group-in-group`);
	});

	it("can change glues", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filtered-data-length").should("equal", 4);
		cy.get(".wx-glue").should("have.length", 3);
		cy.get(".wx-glue.wx-or").should("have.length", 2);

		cy.wxF("filter-glue", 0).click();
		cy.get(".wx-glue").should("have.length", 3);
		cy.get(".wx-glue.wx-and").should("have.length", 3);
		cy.wxF("filtered-data-length").should("equal", 0);
		cy.shot(`filter-builder-glues-and`);

		cy.wxF("filter-glue", 1).click();
		cy.get(".wx-glue").should("have.length", 3);
		cy.get(".wx-glue.wx-or").should("have.length", 2);
		cy.wxF("filtered-data-length").should("equal", 4);
		cy.shot(`filter-builder-glues`);

		cy.wxF("filter-glue", 2).click();
		cy.get(".wx-glue").should("have.length", 3);
		cy.get(".wx-glue.wx-or").should("have.length", 3);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.shot(`filter-builder-glues-or`);
	});

	it("can change glues for different groups", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		// add group in group
		cy.wxF("filter-rule", 2).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add group").click();
		cy.wxF("apply-button").click();
		cy.wxF("filter-rule", 3).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Add filter").click();
		cy.wxF("apply-button").click();
		cy.shot(`filter-builder-groups-in-groups`);

		cy.get(".wx-glue").should("have.length", 5);
		cy.get(".wx-glue.wx-or").should("have.length", 2);

		cy.wxF("filter-glue", 3).click();
		cy.get(".wx-glue").should("have.length", 5);
		cy.get(".wx-glue.wx-or").should("have.length", 3);
		cy.shot(`filter-builder-glues-or-and`);

		cy.wxF("filter-glue", 2).click();
		cy.get(".wx-glue.wx-or").should("have.length", 5);
		cy.shot(`filter-builder-glues-all-or`);

		cy.wxF("filter-glue", 4).click();
		cy.get(".wx-glue.wx-or").should("have.length", 3);

		cy.wxF("filter-glue", 0).click();
		cy.wxF("filter-glue", 3).click();
		cy.get(".wx-glue.wx-and").should("have.length", 5);
		cy.shot(`filter-builder-glues-all-and`);
	});

	it("can delete filter via menu action in list mode", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Delete").click();
		cy.get(".wx-rule").should("have.length", 3);
		cy.get(".wx-glue").should("have.length", 2);
		cy.wxF("filtered-data-length").should("equal", 3);

		cy.wxF("filter-rule", 2).find("i.wx-menu-icon").click();
		cy.wxF("menu-item", "Delete").click();
		cy.get(".wx-rule").should("have.length", 2);
		cy.get(".wx-glue").should("have.length", 1);
		cy.wxF("filtered-data-length").should("equal", 4);
		cy.shot(`filter-builder-deleted-filters`);
	});

	it("can delete all filters in list mode in list mode", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filtered-data-length").should("equal", 4);
		for (let i = 0; i < 4; i++) {
			cy.wxF("filter-rule", 0).find("i.wx-menu-icon").click();
			cy.wxF("menu-item", "Delete").click();
		}
		cy.get(".wx-rule").should("have.length", 0);
		cy.get(".wx-glue").should("have.length", 0);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.shot(`filter-builder-deleted-all-filters`);
	});

	it("can delete filter via menu action in simple mode", () => {
		cy.visit(`#/filter-builder-simple-value`);
		cy.viewport(1300, 975);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).find("i.wxi-delete").click();
		cy.get(".wx-rule").should("have.length", 3);

		cy.wxF("filter-rule", 2).find("i.wxi-delete").click();
		cy.get(".wx-rule").should("have.length", 2);
		cy.shot(`filter-builder-simple-deleted-filters`);
	});

	it("can delete all filters in simple mode", () => {
		cy.visit(`#/filter-builder-simple-value`);
		cy.viewport(1300, 975);
		cy.wait(1000);

		for (let i = 0; i < 4; i++) {
			cy.wxF("filter-rule", 0).find("i.wxi-delete").click();
		}
		cy.get(".wx-rule").should("have.length", 0);
		cy.shot(`filter-builder-simple-deleted-all-filters`);
	});

	it("can delete filter when editor is open in simple mode", () => {
		cy.visit(`#/filter-builder-simple-value`);
		cy.viewport(1300, 975);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).dblclick();
		cy.wxF("filter-editor").should("be.visible");
		cy.wxF("filter-rule", 0).find("i.wxi-delete").click();
		cy.shot(`filter-builder-simple-deleted-filter-opened`);
	});

	it("should have fields selector in list mode", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("field-select").should("be.visible").click();
		cy.get(".wx-dropdown .wx-list > .wx-item").should("have.length", 3);
		cy.shot(`filter-builder-list-fields-selector`);
	});

	it("should not have fields selector in simple mode", () => {
		cy.visit(`#/filter-builder-simple-empty`);
		cy.viewport(1300, 975);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("menu-item", "First Name").click();
		cy.get(".wx-filter-editor > .wx-richselect", { timeout: 0 }).should(
			"not.exist"
		);
		cy.shot(`filter-builder-simple-not-fields-selector`);
	});

	it("can apply filter via 'Apply' button", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filtered-data-length").should("equal", 4);
		cy.wxF("filter-rule", 0).contains("First Name = Alex");

		cy.wxF("filter-rule", 0).dblclick();
		cy.wxF("field-select").click();
		cy.wxF("list-item", "Age").click();
		cy.wxF("filter-select").click();
		cy.wxF("list-item", "greater").click();
		cy.wxF("filter-value").type("30");
		cy.wxF("apply-button").click();
		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-rule", 0).contains("Age > 30");
		cy.shot(`filter-builder-applied-number-filter`);

		cy.wxF("filter-rule", 2).dblclick();
		cy.wxF("field-select").click();
		cy.wxF("list-item", "First Name").click();
		cy.wxF("filter-select").click();
		cy.wxF("list-item", "begins with").click();
		cy.wxF("filter-value").clear().type("a");
		cy.wxF("apply-button").click();
		cy.wxF("filtered-data-length").should("equal", 6);
		cy.wxF("filter-rule", 2).contains("First Name begins with a");
		cy.shot(`filter-builder-applied-text-filter`);

		cy.wxF("filter-rule", 3).dblclick();
		cy.wxF("field-select").click();
		cy.wxF("list-item", "Start Date").click();
		cy.wxF("filter-select").click();
		cy.wxF("list-item", "between").click();
		cy.wxF("filter-value").click();
		cy.get(".wx-filter-editor .wx-cell")
			.eq(1)
			.find(".wx-rangecalendar .wx-calendar button")
			.contains("Today")
			.click();
		cy.get(".wx-filter-editor .wx-cell")
			.eq(1)
			.find(".wx-rangecalendar .wx-calendar button")
			.contains("Done")
			.click();
		cy.wxF("apply-button").click();
		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-rule", 3).contains("Start Date between");
		cy.wxF("filter-rule", 3).find(".wx-value").should("not.be.empty");
		cy.shot(`filter-builder-applied-date-filter`);
	});

	it("should not apply filter via 'Cancel' button", () => {
		cy.visit(`#/filter-builder-value`);
		cy.wait(1000);

		cy.wxF("filter-rule", 0).contains("First Name = Alex");
		cy.wxF("filter-rule", 0).dblclick();
		cy.wxF("field-select").click();
		cy.wxF("list-item", "Age").click();
		cy.wxF("filter-value").type("5");
		cy.wxF("cancel-button").click();
		cy.wxF("filter-rule", 0).contains("First Name = Alex");
		cy.wxF("filtered-data-length").should("equal", 4);
		cy.shot(`filter-builder-not-applied-text-filter`);

		cy.wxF("filter-rule", 2).contains("Age > 40");
		cy.wxF("filter-rule", 2).dblclick();
		cy.wxF("field-select").click();
		cy.wxF("list-item", "First Name").click();
		cy.wxF("filter-value").clear().type("a");
		cy.wxF("cancel-button").click();
		cy.wxF("filter-rule", 2).contains("Age > 40");
		cy.wxF("filtered-data-length").should("equal", 4);
		cy.shot(`filter-builder-not-applied-number-filter`);
	});
});
