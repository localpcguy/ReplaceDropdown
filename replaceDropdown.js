/****************************************************************
replaceDropdown()	swaps the dropdown for a Select List to use 
					HTML elements that can accept styling.
					
Author:
	Mike Behnke
	Github.com/LocalPCGuy
Version:
	0.2
Params: Select ID
Option defaults:
			divIDtext: "LinkList",
			linkIDtext: "Link",
			linkText: "",
			parent: "", // required for flipTop
			flipTop: false,
			ddClass: "ddlist",
			hideFirst: true
Usage:	$("select").replaceDropdown();
		$("select").replaceDropdown({ ddClass: "dropdownList"});
ToDo:	
	1) Switch to class based selector rather than ID
	2) Store created elements in closure for future manipulation rather than lookup each time
	3) Setup timer variable and option to auto-close after the timer expires
	4) Refactor code for size/performance
	5) Refactor code into better "plugin" boilerplate
*****************************************************************/
(function ($) {

    $.fn.replaceDropdown = function (method) {

        var methods = {
            init: function (options) {
                var self = this;
                // Merge default & user-provided properties
                self.replaceDropdown.settings = $.extend({}, self.replaceDropdown.defaults, options);

                // iterate through all the DOM elements we are attaching the plugin to
                return self.each(function () {

                    var $element = $(this),  // reference to the jQuery version of the current DOM element
						element = this,      // reference to the actual DOM element
						elementID = this.id, // reference to the element ID
						divID = elementID + self.replaceDropdown.settings.divIDtext, // reference to the new div ID
						ddTimer, // timer variable
						$openDiv = $("#" + divID); // cache the reference to the divID jQuery object

                    self.replaceDropdown.settings.linkText = self.replaceDropdown.settings.linkText || $element.find("option").eq(0).text();
                    divID = helpers.buildDropdown($element, element, self);
                    $element.css({ position: "absolute", left: "-99999px" });

                    // Setup Click event for dropdown
                    helpers.initEvents(divID, self);

                });

            }
        };
        // private methods
        var helpers = {
            initEvents: function (divID, self) {
                helpers.setEventsForDropdown(divID, self);
                helpers.assignDropdownLinkEvents(self);
                helpers.closeDropdown(divID);
            },
            buildDropdown: function ($element, element, self) {
                // Replace Dropdown code 
                var i,
					divID = element.id + self.replaceDropdown.settings.divIDtext,
					linkID = element.id + self.replaceDropdown.settings.linkIDtext,
					$prodOptions = $element.find("option");
                var prodList = '<div id="' + divID + '" class="' + self.replaceDropdown.settings.ddClass + '">\n<a href="#" id="' + linkID + '">' + self.replaceDropdown.settings.linkText + '</a>\n<ul>\n';
                for (i = 0; i < $prodOptions.length; i++) {
                    if (self.replaceDropdown.settings.hideFirst && i === 0) {
                        $prodOptions.eq(i).remove();
                        continue;
                    }
                    prodList += '<li><a href="' + $prodOptions.eq(i).text() + '" rel="' + $prodOptions.eq(i).val() + '">' + $prodOptions.eq(i).text() + '</a></li>\n';
                }
                prodList += '</ul>\n</div>\n';

                $element.next("button").remove();
                $element.after(prodList);

                return divID;
            },
            setEventsForDropdown: function (divID, self) {
                var $openDiv = $("#" + divID);
                $openDiv.unbind().click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var theID = $openDiv.attr("id");
                    $("." + self.replaceDropdown.settings.ddClass + ".open:not('#" + theID + "')").each(function () {
                        helpers.closeDropdown(this.id); // close any exisiting open dropdowns
                    });
                    if ($(this).hasClass("open") === false && $(this).hasClass("disabled") === false) {
                        var index = $(this).find("a.selected").parent().index();
                        var topOffset = 25 * index;
                        if (self.replaceDropdown.settings.flipTop) {
                            helpers.flipDropdown(this, self);
                        }
                        var $thisUL = $(this).find("ul");
                        $thisUL.scrollTop(topOffset);
                        $thisUL.css({ "visibility": "visible" });
                        $thisUL.slideDown("fast");
                        $(this).addClass("open");
                        $("body").click(function (e) {
                            $("body").unbind();
                            helpers.closeDropdown(divID);
                        });
                    } else {
                        helpers.closeDropdown(divID);
                        $("body").unbind();
                    }
                });
            },
            assignDropdownLinkEvents: function (self) {
                $("." + self.replaceDropdown.settings.ddClass + " ul li a").bind("click", function (e) {
                    e.preventDefault();
                    var selectID = $(this).parents("." + self.replaceDropdown.settings.ddClass).attr("id").replace(self.replaceDropdown.settings.divIDtext, "");
                    var $select = $("#" + selectID);
                    $select.children("option").attr("selected", "");
                    $select.children("option").eq($(this).parent().index()).attr("selected", "selected");
                    $("." + self.replaceDropdown.settings.ddClass + " ul").slideUp("fast");
                    $(this).parents("." + self.replaceDropdown.settings.ddClass).find("#" + selectID + self.replaceDropdown.settings.linkIDtext).text($(this).text());
                    $select.change();
                });
            },
            closeDropdown: function (divID) {
                var $openDiv = $("#" + divID);
                if ($openDiv.hasClass("open")) {
                    $openDiv.children("ul").css({ "visibility": "hidden" });
                    $openDiv.removeClass("open");
                    $openDiv.find("a").blur();
                }
            },
            flipDropdown: function (item, self) {
                $(item).find("ul").removeClass("showTop");
                var offsetTop = $(item).find("ul").offset().top;
                var tabOffsetTop = $(item).parents(self.replaceDropdown.settings.parent).length ? $(item).parents(self.replaceDropdown.settings.parent).offset().top : 0;
                var ddHeight = $(item).find("ul").height() * 1 + 6;
                var windowHeight = $(window).height() * 1;
                if (((windowHeight - offsetTop) < ddHeight) && ((offsetTop - tabOffsetTop) > ddHeight)) {
                    $(item).find("ul").addClass("showTop");
                }
            }
        };

        // if a method as the given argument exists
        if (methods[method]) {
            // call the respective method
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            // if an object is given as method OR nothing is given as argument
        } else if (typeof method === 'object' || !method) {
            // call the initialization method
            return methods.init.apply(this, arguments);
            // otherwise
        } else {
            // trigger an error
            $.error('Method "' + method + '" does not exist in replaceDropdown plugin!');
        };
    };

    // default options
    $.fn.replaceDropdown.defaults = {
        divIDtext: "LinkList",
        linkIDtext: "Link",
        linkText: "",
        parent: "", // required for flipTop
        flipTop: false,
        ddClass: "ddlist",
        hideFirst: true
    };
    // this will hold the merged default and user-provided options
    $.fn.replaceDropdown.settings = {};
})(jQuery);