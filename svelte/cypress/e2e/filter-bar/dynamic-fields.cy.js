context("FilterBar basic functionality", () => {
	it("main dynamic view", () => {
		cy.visit(`#/filter-bar-dynamic`);
		cy.wait(1000);

		cy.shot(`filter-bar-dynamic`);
	});

	it("can select dynamic field", () => {
		cy.visit(`#/filter-bar-dynamic`);
		cy.wait(1000);

		cy.wxF("filter-bar-field", 1).find("input").should("exist");
		cy.wxF("filter-bar-field", 0)
			.find(".wx-label")
			.should("have.text", "first_name");
		cy.wxF("filter-bar-field", 0).click();
		cy.get(".wx-dropdown .wx-list > .wx-item").should("have.length", 5);
		cy.shot(`filter-bar-dynamic-fields-list`);

		cy.wxF("list-item", "last_name").click();
		cy.wxF("filter-bar-field", 1).find("input").should("exist");
		cy.wxF("filter-bar-field", 0)
			.find(".wx-label")
			.should("have.text", "last_name");
		cy.shot(`filter-bar-dynamic-field-type-text`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "age").click();
		cy.wxF("filter-bar-field", 1)
			.find("input[type='number']")
			.should("exist");
		cy.wxF("filter-bar-field", 0)
			.find(".wx-label")
			.should("have.text", "age");
		cy.shot(`filter-bar-dynamic-field-type-number`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "country").click();
		cy.wxF("filter-bar-field", 1).find(".wx-richselect").should("exist");
		cy.wxF("filter-bar-field", 0)
			.find(".wx-label")
			.should("have.text", "country");
		cy.shot(`filter-bar-dynamic-field-type-text-select`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "start").click();
		cy.wxF("filter-bar-field", 1).find(".wx-datepicker").should("exist");
		cy.wxF("filter-bar-field", 0)
			.find(".wx-label")
			.should("have.text", "start");
		cy.shot(`filter-bar-dynamic-field-type-date`);
	});

	it("can set values for dynamic field and filter data", () => {
		cy.visit(`#/filter-bar-dynamic`);
		cy.wait(1000);

		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-bar-field-value", 1).should("have.value", "A").type("l");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 2);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "last_name").click();
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.wxF("filter-bar-field-value", 1).should("have.value", "").type("W");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 4);

		cy.get("body").click(); // remove focus from input
		cy.shot(`filter-bar-dynamic-text-value`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "age").click();
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.wxF("filter-bar-field-value", 1).should("have.value", "").type("30");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 5);

		cy.get("body").click(); // remove focus from input
		cy.shot(`filter-bar-dynamic-number-value`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "country").click();
		cy.wxF("filter-bar-field-value", 1).should("have.text", "USA");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 4);
		cy.wxF("filter-bar-field", 1).click();
		cy.wxF("list-item", "Germany").click();
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 2);
		cy.shot(`filter-bar-dynamic-text-select-value`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "start").click();
		cy.wxF("filter-bar-field-value", 1).should("have.value", "01/01/2025");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-bar-field", 1)
			.click()
			.find(".wx-datepicker .wx-calendar button")
			.contains("Today")
			.click();
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 0);
		cy.shot(`filter-bar-dynamic-text-select-value`);
	});

	it("should reset previous field value when selecting new dynamic field", () => {
		cy.visit(`#/filter-bar-dynamic`);
		cy.wait(1000);

		cy.wxF("filter-bar-field-value", 1).should("have.value", "A");
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "last_name").click();
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "first_name").click();
		cy.wxF("filter-bar-field-value", 1).should("have.value", "");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.shot(`filter-bar-dynamic-text-reset-value`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "age").click();
		cy.wxF("filter-bar-field-value", 1).type("30");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "country").click();
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "age").click();
		cy.wxF("filter-bar-field-value", 1).should("have.value", "");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.shot(`filter-bar-dynamic-number-reset-value`);

		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "start").click();
		cy.wxF("filter-bar-field-value", 1).should("have.value", "01/01/2025");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 5);
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "country").click();
		cy.wxF("filter-bar-field", 0).click();
		cy.wxF("list-item", "start").click();
		cy.wxF("filter-bar-field-value", 1).should("have.value", "");
		cy.wait(350);
		cy.wxF("filtered-data-length").should("equal", 7);
		cy.shot(`filter-bar-dynamic-date-reset-value`);
	});
});
