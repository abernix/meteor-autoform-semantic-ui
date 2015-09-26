/* jshint esnext: true */

AutoForm.addInputType("select-deluxe", {
  template: "afSelectDeluxe",
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
    //can fix issues with some browsers selecting the firstOption instead of the selected option
    context.atts.autocomplete = "off";

    // build items list
    context.items = [];

    var itemAtts = function itemAtts(opt) {
      var atts = { class: 'item', 'data-value': opt.value };
      if ( context.atts.textOnlyWhenSelected ) {
        atts['data-text'] = opt.label;
      }
      return atts;
    };

    // Add all defined options
    _.each(context.selectOptions, function(opt) {
      if (opt.optgroup) {
        var subItems = _.map(opt.options, function(subOpt) {
          return _.extend(subOpt, {
            name: context.name,
            itemAtts: itemAtts(subOpt),
            atts: context.atts
          });
        });
        context.items.push({
          optgroup: opt.optgroup,
          items: subItems
        });
      } else {
        context.items.push(_.extend(opt, {
          name: context.name,
          itemAtts: itemAtts(opt),
          atts: context.atts
        }));
      }
    });

    return context;
  }
});

var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

var supportedItemUpgrades = {
  'div': 'DIV',
  'span': 'SPAN',
  'icon': 'I',
  'image': 'IMG'
};

Template.afSelectDeluxe_semanticUI.helpers({
  inputAttsAdjust: function inputAttsAdjust() {
    var atts = _.clone(this.atts);

    delete atts.firstOption;
    delete atts.search;

    _.each(supportedItemUpgrades, function (options, type) {
      delete atts["with" + capitalizeFirstLetter(type)];
    });

    var currentData = Template.currentData();
    if ( currentData ) atts.value = currentData.value;

    return atts;
  },
  dropdownAtts: function () {
    var atts = {
      class: 'ui selection dropdown'
    };

    // Add semantic-ui class
    if ( this.atts.search ) {
      atts = AutoForm.Utility.addClass(atts, "search");
    }

    if ( typeof this.atts.disabled !== "undefined" ) {
      atts = AutoForm.Utility.addClass(atts, "disabled");
    }

    return atts;
  },
  firstOption: function () {
    return typeof this.atts.firstOption === "string" ? this.atts.firstOption : "(Select One)";
  },
  itemElementUpgrades: function () {
    var upgradeHtml = "";
    _.each(supportedItemUpgrades, function (tag, type) {
      if ( this[type] ) {
        var elemContent, elemAttrs = { 'class': this[type] };
        if ( type === "image" && this[type + "Src"] ) {
          elemAttrs.src = this[type + "Src"];
        } else if ( this[type + "Content"] ) {
          elemContent = this[type + "Content"];
        }

        upgradeHtml += HTML.toHTML(HTML[tag](HTML.Attrs(elemAttrs), elemContent));
      }
    }, this);
    return Spacebars.SafeString(upgradeHtml);
  }
});

Template.afSelectDeluxe_semanticUI.events({
  "click .ui.clear.button": function(event) {
    $(event.target).closest(".ui.dropdown").dropdown("clear").dropdown("hide");
  }
});

Template.afSelectDeluxe_semanticUI.onRendered(function() {
  $(this.firstNode).dropdown();

  this.autorun(function () {
    var dataContext = Template.currentData();
    $(this.firstNode()).dropdown('set selected', dataContext.value);
  });
});
