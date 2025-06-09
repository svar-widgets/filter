context("FilterBuilder editor functionality", () => {
	it("can select different field types", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("field-select")
			.find(".wx-label")
			.should("have.text", "First Name");
		cy.wxF("filter-select").find(".wx-label").should("not.be.empty");
		cy.wxF("includes-items")
			.should("have.length", 6)
			.each($item => {
				cy.wrap($item)
					.find("input[type='checkbox']")
					.should("be.checked");
			});
		cy.shot(`filter-builder-field-type-text`);

		cy.wxF("field-select").click();
		cy.get(".wx-dropdown .wx-list > .wx-item").should("have.length", 3);
		cy.shot(`filter-builder-fields-list`);

		cy.wxF("list-item", "Age").click();
		cy.wxF("filter-select").find(".wx-label").should("not.be.empty");
		cy.wxF("filter-value").should("have.attr", "type", "number");
		cy.wxF("includes-items")
			.should("have.length", 7)
			.each($item => {
				cy.wrap($item)
					.find("input[type='checkbox']")
					.should("be.checked");
			});
		cy.shot(`filter-builder-field-type-number`);

		cy.wxF("field-select").click();
		cy.wxF("list-item", "Start Date").click();
		cy.wxF("filter-select").find(".wx-label").should("not.be.empty");
		cy.wxF("includes-items")
			.should("have.length", 7)
			.each($item => {
				cy.wrap($item)
					.find("input[type='checkbox']")
					.should("be.checked");
			});
		cy.get(".wx-filter-editor .wx-cell")
			.eq(1)
			.find(".wx-datepicker")
			.should("exist")
			.click();
		cy.get(".wx-dropdown .wx-calendar").should("exist");
		cy.shot(`filter-builder-field-type-date`);
	});

	it("can select/unselect all includes via 'Unselect/Select all' button", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("includes-items")
			.should("have.length", 6)
			.each($item => {
				cy.wrap($item)
					.find("input[type='checkbox']")
					.should("be.checked");
			});
		cy.wxF("includes-button").contains("Unselect all");
		cy.shot(`filter-builder-selected-all-includes`);

		cy.wxF("includes-button").click();
		cy.wxF("includes-items")
			.should("have.length", 6)
			.each($item => {
				cy.wrap($item)
					.find("input[type='checkbox']")
					.should("not.be.checked");
			});
		cy.wxF("includes-button").contains("Select all");
		cy.shot(`filter-builder-unselected-all-includes`);
	});

	it("can select/unselect some includes", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("includes-checkbox", 0).click();
		cy.wxF("includes-checkbox", 0)
			.find("input[type='checkbox']")
			.should("not.be.checked");
		cy.wxF("includes-button").contains("Select all");
		cy.shot(`filter-builder-unselected-some-includes`);

		cy.wxF("includes-checkbox", 0).click();
		cy.wxF("includes-checkbox", 0)
			.find("input[type='checkbox']")
			.should("be.checked");
		cy.wxF("includes-button").contains("Unselect all");

		cy.wxF("field-select").click();
		cy.wxF("list-item", "Age").click();
		cy.wxF("includes-button").contains("Unselect all"); // tests actual text is " Unselect all" -??
		cy.wxF("includes-checkbox", 2).click();
		cy.wxF("includes-checkbox", 1).click();
		cy.wxF("includes-items")
			.should("have.length", 7)
			.find("input[type='checkbox']:checked")
			.should("have.length", 5);
		cy.wxF("includes-button").contains("Select all");
		cy.shot(`filter-builder-unselected-some-includes-age`);
	});

	it("can select different filter types", () => {
		cy.visit(`#/filter-builder-empty`);
		cy.wait(1000);

		cy.wxF("add-filter-button").click();
		cy.wxF("filter-select")
			.find(".wx-label")
			.should("have.text", "contains");
		cy.wxF("filter-value").type("a");
		cy.wxF("includes-items").should("have.length", 4);
		cy.shot(`filter-builder-text-field-filter-contains`);

		cy.wxF("filter-select").click();
		cy.wxF("list-item", "begins with").click();
		cy.wxF("filter-value").should("have.value", "a");
		cy.wxF("includes-items").should("have.length", 2);
		cy.shot(`filter-builder-text-field-filter-begins-with`);

		cy.wxF("filter-select").click();
		cy.wxF("list-item", "ends with").click();
		cy.wxF("filter-value").should("have.value", "a");
		cy.wxF("includes-items").should("have.length", 1);
		cy.shot(`filter-builder-text-field-filter-ends-with`);

		cy.wxF("field-select").click();
		cy.wxF("list-item", "Age").click();
		cy.wxF("filter-select")
			.find(".wx-label")
			.should("have.text", "ends with");
		cy.wxF("filter-value").should("be.empty");
		cy.wxF("includes-items").should("have.length", 7);
		cy.wxF("filter-value").type("5");
		cy.wxF("includes-items").should("have.length", 2);
		cy.shot(`filter-builder-number-field-filter-ends-with`);

		cy.wxF("filter-select").click();
		cy.wxF("list-item", "greater").click();
		cy.wxF("filter-value").clear().type("30");
		cy.wxF("includes-items").should("have.length", 5);
		cy.shot(`filter-builder-number-field-filter-greater`);

		cy.wxF("field-select").click();
		cy.wxF("list-item", "Start Date").click();
		cy.wxF("filter-select")
			.find(".wx-label")
			.should("have.text", "greater");
		cy.wxF("filter-value").should("be.empty");
		cy.wxF("includes-items").should("have.length", 7);
		cy.wxF("filter-value").click();
		cy.get(".wx-filter-editor .wx-cell")
			.eq(1)
			.find(".wx-datepicker .wx-calendar button")
			.contains("Today")
			.click();
		cy.wxF("includes-items").should("have.length", 0);
		cy.shot(`filter-builder-date-field-filter-greater`);
	});
});
