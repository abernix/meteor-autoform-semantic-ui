AutoForm.addInputType("select", {
	template: "afSelect",
	valueOut() {
		return this.val();
	},
	valueConverters: {
    stringArray:  AutoForm.valueConverters.stringToStringArray,
    number:       AutoForm.valueConverters.stringToNumber,
    numberArray:  AutoForm.valueConverters.stringToNumberArray,
    boolean:      AutoForm.valueConverters.stringToBoolean,
    booleanArray: AutoForm.valueConverters.stringToBooleanArray,
    date:         AutoForm.valueConverters.stringToDate,
    dateArray:    AutoForm.valueConverters.stringToDateArray
	},
	contextAdjust(context) {
		// can fix issues with some browsers selecting the firstOption instead of the selected option
		context.atts.autocomplete = "off";

		// delete eventual option used in other templates
		delete context.atts.firstOption;

		let itemAtts = _.omit(context.atts, "placeholder");

		// build items list
		context.items = [];

		let buildItem = item => ({
			name:         context.name,
			label:        item.label,
			icon:         item.icon || false,
			description:  item.description || false,
			value:        item.value,
			htmlAtts:     _.extend(
				{ class: "item" },
				_.omit(item, "label", "value", "icon", "circularLabel", "description", "itemGroup", "category", "items")
			),
			// _id must be included because it is a special property that
			// #each uses to track unique list items when adding and removing them
			// See https://github.com/meteor/meteor/issues/2174
			//
			// The toString() is necessary because otherwise Spacebars evaluates
			// any string to 1 if the other values are numbers, and then considers
			// that a duplicate.
			// See https://github.com/aldeed/meteor-autoform/issues/656
			_id:          item.value.toString(),
			selected:     (item.value === context.value),
			atts:         itemAtts
		});

		// Add all defined options
		_.each(context.selectOptions, item => {
			if (item.itemGroup) {
				let subItems = _.map(item.items, buildItem);

				context.items.push({
					itemGroup: item.itemGroup,
					items:     subItems
				});
			} else if (item.category) {
				let subItems = _.map(item.items, buildItem);

				context.items.push({
					category: item.category,
					items:    subItems
				});
			} else {
				context.items.push(buildItem(item));
			}
		});

		return context;
	}
});

Template.afSelect_semanticUI.helpers({
	divAtts() {
		let atts = { class: "ui dropdown" };

		// Add custom classes or default
		if (_.isString(this.atts.classNames)) {
			atts = AutoForm.Utility.addClass(atts, this.atts.classNames);
		} else {
			atts = AutoForm.Utility.addClass(atts, "fluid selection");
		}

		// Add search class, also add selection for proper design
		if (this.atts.search || this.atts.fullTextSearch) {
			atts = AutoForm.Utility.addClass(atts, "search selection");
		}

		// Add multiple class
		if (this.atts.multiple) {
			atts = AutoForm.Utility.addClass(atts, "multiple");
		}

		return atts;
	},
	inputAtts() {
		return _.pick(this.atts, "name", "id", "required", "data-schema-key", "autocomplete", "value");
	},
	placeholder() {
		return this.atts.placeholder || "(Select One)";
	},
	required() {
		return this.atts.required === "";
	}
});

Template.afSelect_semanticUI.events({
	"click .ui.clear.button"(event) {
		$(event.target).closest(".ui.dropdown").dropdown("clear").dropdown("hide");
	}
});

Template.afSelect_semanticUI.onRendered(function() {
  this.$(this.firstNode).dropdown({
		fullTextSearch:         this.data.atts.fullTextSearch || false,
		allowAdditions:         this.data.atts.allowAdditions || false,
		maxSelections:          this.data.atts.maxSelections || false,
    allowCategorySelection: this.data.atts.allowCategorySelection || false,
		useLabels:              this.data.atts.useLabels === false ? false : true
	});
});

Template.afSelectRecursive.helpers({
	itemHtmlAtts() {
		let atts = _.clone(this.htmlAtts);

		// Add selected class
		if (this.selected) {
			atts = AutoForm.Utility.addClass(atts, "active selected");
		}

		return atts;
	}
});
