"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializationContext = exports.GlobalRegistry = exports.GenietalkCard = exports.ContainerWithActions = exports.Carousel = exports.ColumnSet = exports.CarouselItem = exports.Column = exports.Container = exports.BackgroundImage = exports.StylableCardElementContainer = exports.ActionSet = exports.ShowCardAction = exports.HttpAction = exports.HttpHeader = exports.ToggleVisibilityAction = exports.OpenUrlAction = exports.SubmitQueryAction = exports.SubmitAction = exports.Action = exports.TimeInput = exports.TimeProperty = exports.DateInput = exports.NumberInput = exports.ChoiceSetInput = exports.Choice = exports.ToggleInput = exports.TextInput = exports.Input = exports.Media = exports.MediaSource = exports.ImageSet = exports.CardElementContainer = exports.Image = exports.FactSet = exports.Fact = exports.RichTextBlock = exports.TextRun = exports.TextBlock = exports.BaseTextBlock = exports.ActionProperty = exports.CardElement = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var Enums = require("./enums");
var shared_1 = require("./shared");
var Utils = require("./utils");
var host_config_1 = require("./host-config");
var TextFormatters = require("./text-formatters");
var card_object_1 = require("./card-object");
var serialization_1 = require("./serialization");
var registry_1 = require("./registry");
var strings_1 = require("./strings");
var CardElement = /** @class */ (function (_super) {
    __extends(CardElement, _super);
    function CardElement() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._truncatedDueToOverflow = false;
        return _this;
    }
    Object.defineProperty(CardElement.prototype, "lang", {
        get: function () {
            var lang = this.getValue(CardElement.langProperty);
            if (lang) {
                return lang;
            }
            else {
                if (this.parent) {
                    return this.parent.lang;
                }
                else {
                    return undefined;
                }
            }
        },
        set: function (value) {
            this.setValue(CardElement.langProperty, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isVisible", {
        get: function () {
            return this.getValue(CardElement.isVisibleProperty);
        },
        set: function (value) {
            // If the element is going to be hidden, reset any changes that were due
            // to overflow truncation (this ensures that if the element is later
            // un-hidden it has the right content)
            if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation && !value) {
                this.undoOverflowTruncation();
            }
            if (this.isVisible !== value) {
                this.setValue(CardElement.isVisibleProperty, value);
                this.updateRenderedElementVisibility();
                if (this._renderedElement) {
                    raiseElementVisibilityChangedEvent(this);
                }
            }
            if (this._renderedElement) {
                this._renderedElement.setAttribute("aria-expanded", value.toString());
            }
        },
        enumerable: false,
        configurable: true
    });
    CardElement.prototype.internalRenderSeparator = function () {
        var renderedSeparator = Utils.renderSeparation(this.hostConfig, {
            spacing: this.hostConfig.getEffectiveSpacing(this.spacing),
            lineThickness: this.separator ? this.hostConfig.separator.lineThickness : undefined,
            lineColor: this.separator ? this.hostConfig.separator.lineColor : undefined
        }, this.separatorOrientation);
        if (shared_1.GlobalSettings.alwaysBleedSeparators && renderedSeparator && this.separatorOrientation == Enums.Orientation.Horizontal) {
            // Adjust separator's margins if the option to always bleed separators is turned on
            var parentContainer = this.getParentContainer();
            if (parentContainer && parentContainer.getEffectivePadding()) {
                var parentPhysicalPadding = this.hostConfig.paddingDefinitionToSpacingDefinition(parentContainer.getEffectivePadding());
                renderedSeparator.style.marginLeft = "-" + parentPhysicalPadding.left + "px";
                renderedSeparator.style.marginRight = "-" + parentPhysicalPadding.right + "px";
            }
        }
        return renderedSeparator;
    };
    CardElement.prototype.updateRenderedElementVisibility = function () {
        var displayMode = this.isDesignMode() || this.isVisible ? this._defaultRenderedElementDisplayMode : "none";
        if (this._renderedElement) {
            if (displayMode) {
                this._renderedElement.style.display = displayMode;
            }
            else {
                this._renderedElement.style.removeProperty("display");
            }
        }
        if (this._separatorElement) {
            if (this.parent && this.parent.isFirstElement(this)) {
                this._separatorElement.style.display = "none";
            }
            else {
                if (displayMode) {
                    this._separatorElement.style.display = displayMode;
                }
                else {
                    this._separatorElement.style.removeProperty("display");
                }
            }
        }
    };
    CardElement.prototype.hideElementDueToOverflow = function () {
        if (this._renderedElement && this.isVisible) {
            this._renderedElement.style.visibility = "hidden";
            this.isVisible = false;
            raiseElementVisibilityChangedEvent(this, false);
        }
    };
    CardElement.prototype.showElementHiddenDueToOverflow = function () {
        if (this._renderedElement && !this.isVisible) {
            this._renderedElement.style.removeProperty("visibility");
            this.isVisible = true;
            raiseElementVisibilityChangedEvent(this, false);
        }
    };
    // Marked private to emulate internal access
    CardElement.prototype.handleOverflow = function (maxHeight) {
        if (this.isVisible || this.isHiddenDueToOverflow()) {
            var handled = this.truncateOverflow(maxHeight);
            // Even if we were unable to truncate the element to fit this time,
            // it still could have been previously truncated
            this._truncatedDueToOverflow = handled || this._truncatedDueToOverflow;
            if (!handled) {
                this.hideElementDueToOverflow();
            }
            else if (handled && !this.isVisible) {
                this.showElementHiddenDueToOverflow();
            }
        }
    };
    // Marked private to emulate internal access
    CardElement.prototype.resetOverflow = function () {
        var sizeChanged = false;
        if (this._truncatedDueToOverflow) {
            this.undoOverflowTruncation();
            this._truncatedDueToOverflow = false;
            sizeChanged = true;
        }
        if (this.isHiddenDueToOverflow()) {
            this.showElementHiddenDueToOverflow();
        }
        return sizeChanged;
    };
    CardElement.prototype.getDefaultSerializationContext = function () {
        return new SerializationContext();
    };
    CardElement.prototype.createPlaceholderElement = function () {
        var styleDefinition = this.getEffectiveStyleDefinition();
        var foregroundCssColor = Utils.stringToCssColor(styleDefinition.foregroundColors.default.subtle);
        var element = document.createElement("div");
        element.style.border = "1px dashed " + foregroundCssColor;
        element.style.padding = "4px";
        element.style.minHeight = "32px";
        element.style.fontSize = "10px";
        element.style.color = foregroundCssColor;
        element.innerText = "Empty " + this.getJsonTypeName();
        return element;
    };
    CardElement.prototype.adjustRenderedElementSize = function (renderedElement) {
        if (this.height === "auto") {
            renderedElement.style.flex = "0 0 auto";
        }
        else {
            renderedElement.style.flex = "1 1 auto";
        }
    };
    CardElement.prototype.isDisplayed = function () {
        return this._renderedElement !== undefined && this.isVisible && this._renderedElement.offsetHeight > 0;
    };
    CardElement.prototype.overrideInternalRender = function () {
        return this.internalRender();
    };
    CardElement.prototype.applyPadding = function () {
        if (this.separatorElement) {
            if (shared_1.GlobalSettings.alwaysBleedSeparators && this.separatorOrientation == Enums.Orientation.Horizontal && !this.isBleeding()) {
                var padding = new shared_1.PaddingDefinition();
                this.getImmediateSurroundingPadding(padding);
                var physicalPadding = this.hostConfig.paddingDefinitionToSpacingDefinition(padding);
                this.separatorElement.style.marginLeft = "-" + physicalPadding.left + "px";
                this.separatorElement.style.marginRight = "-" + physicalPadding.right + "px";
            }
            else {
                this.separatorElement.style.marginRight = "0";
                this.separatorElement.style.marginLeft = "0";
            }
        }
    };
    /*
     * Called when this element overflows the bottom of the card.
     * maxHeight will be the amount of space still available on the card (0 if
     * the element is fully off the card).
     */
    CardElement.prototype.truncateOverflow = function (maxHeight) {
        // Child implementations should return true if the element handled
        // the truncation request such that its content fits within maxHeight,
        // false if the element should fall back to being hidden
        return false;
    };
    /*
     * This should reverse any changes performed in truncateOverflow().
     */
    CardElement.prototype.undoOverflowTruncation = function () { };
    CardElement.prototype.getDefaultPadding = function () {
        return new shared_1.PaddingDefinition();
    };
    CardElement.prototype.getHasBackground = function () {
        return false;
    };
    CardElement.prototype.getPadding = function () {
        return this._padding;
    };
    CardElement.prototype.setPadding = function (value) {
        this._padding = value;
    };
    CardElement.prototype.shouldSerialize = function (context) {
        return context.elementRegistry.findByName(this.getJsonTypeName()) !== undefined;
    };
    Object.defineProperty(CardElement.prototype, "useDefaultSizing", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "allowCustomPadding", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "separatorOrientation", {
        get: function () {
            return Enums.Orientation.Horizontal;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "defaultStyle", {
        get: function () {
            return Enums.ContainerStyle.Default;
        },
        enumerable: false,
        configurable: true
    });
    CardElement.prototype.parse = function (source, context) {
        _super.prototype.parse.call(this, source, context ? context : new SerializationContext());
    };
    CardElement.prototype.asString = function () {
        return "";
    };
    CardElement.prototype.isBleeding = function () {
        return false;
    };
    CardElement.prototype.getEffectiveStyle = function () {
        if (this.parent) {
            return this.parent.getEffectiveStyle();
        }
        return this.defaultStyle;
    };
    CardElement.prototype.getEffectiveStyleDefinition = function () {
        return this.hostConfig.containerStyles.getStyleByName(this.getEffectiveStyle());
    };
    CardElement.prototype.getForbiddenActionTypes = function () {
        return [];
    };
    CardElement.prototype.getImmediateSurroundingPadding = function (result, processTop, processRight, processBottom, processLeft) {
        if (processTop === void 0) { processTop = true; }
        if (processRight === void 0) { processRight = true; }
        if (processBottom === void 0) { processBottom = true; }
        if (processLeft === void 0) { processLeft = true; }
        if (this.parent) {
            var doProcessTop = processTop && this.parent.isTopElement(this);
            var doProcessRight = processRight && this.parent.isRightMostElement(this);
            var doProcessBottom = processBottom && this.parent.isBottomElement(this);
            var doProcessLeft = processLeft && this.parent.isLeftMostElement(this);
            var effectivePadding = this.parent.getEffectivePadding();
            if (effectivePadding) {
                if (doProcessTop && effectivePadding.top != Enums.Spacing.None) {
                    result.top = effectivePadding.top;
                    doProcessTop = false;
                }
                if (doProcessRight && effectivePadding.right != Enums.Spacing.None) {
                    result.right = effectivePadding.right;
                    doProcessRight = false;
                }
                if (doProcessBottom && effectivePadding.bottom != Enums.Spacing.None) {
                    result.bottom = effectivePadding.bottom;
                    doProcessBottom = false;
                }
                if (doProcessLeft && effectivePadding.left != Enums.Spacing.None) {
                    result.left = effectivePadding.left;
                    doProcessLeft = false;
                }
            }
            if (doProcessTop || doProcessRight || doProcessBottom || doProcessLeft) {
                this.parent.getImmediateSurroundingPadding(result, doProcessTop, doProcessRight, doProcessBottom, doProcessLeft);
            }
        }
    };
    CardElement.prototype.getActionCount = function () {
        return 0;
    };
    CardElement.prototype.getActionAt = function (index) {
        throw new Error(strings_1.Strings.errors.indexOutOfRange(index));
    };
    CardElement.prototype.remove = function () {
        if (this.parent && this.parent instanceof CardElementContainer) {
            return this.parent.removeItem(this);
        }
        return false;
    };
    CardElement.prototype.render = function () {
        this._renderedElement = this.overrideInternalRender();
        this._separatorElement = this.internalRenderSeparator();
        if (this._renderedElement) {
            if (this.id) {
                this._renderedElement.id = this.id;
            }
            if (this.customCssSelector) {
                this._renderedElement.classList.add(this.customCssSelector);
            }
            this._renderedElement.style.boxSizing = "border-box";
            this._defaultRenderedElementDisplayMode = this._renderedElement.style.display ? this._renderedElement.style.display : undefined;
            this.adjustRenderedElementSize(this._renderedElement);
            this.updateLayout(false);
        }
        else if (this.isDesignMode()) {
            this._renderedElement = this.createPlaceholderElement();
        }
        return this._renderedElement;
    };
    CardElement.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        this.updateRenderedElementVisibility();
        this.applyPadding();
    };
    CardElement.prototype.indexOf = function (cardElement) {
        return -1;
    };
    CardElement.prototype.isDesignMode = function () {
        var rootElement = this.getRootElement();
        return rootElement instanceof GenietalkCard && rootElement.designMode;
    };
    CardElement.prototype.isFirstElement = function (element) {
        return true;
    };
    CardElement.prototype.isLastElement = function (element) {
        return true;
    };
    CardElement.prototype.isAtTheVeryLeft = function () {
        return this.parent ? this.parent.isLeftMostElement(this) && this.parent.isAtTheVeryLeft() : true;
    };
    CardElement.prototype.isAtTheVeryRight = function () {
        return this.parent ? this.parent.isRightMostElement(this) && this.parent.isAtTheVeryRight() : true;
    };
    CardElement.prototype.isAtTheVeryTop = function () {
        return this.parent ? this.parent.isFirstElement(this) && this.parent.isAtTheVeryTop() : true;
    };
    CardElement.prototype.isAtTheVeryBottom = function () {
        return this.parent ? this.parent.isLastElement(this) && this.parent.isAtTheVeryBottom() : true;
    };
    CardElement.prototype.isBleedingAtTop = function () {
        return false;
    };
    CardElement.prototype.isBleedingAtBottom = function () {
        return false;
    };
    CardElement.prototype.isLeftMostElement = function (element) {
        return true;
    };
    CardElement.prototype.isRightMostElement = function (element) {
        return true;
    };
    CardElement.prototype.isTopElement = function (element) {
        return this.isFirstElement(element);
    };
    CardElement.prototype.isBottomElement = function (element) {
        return this.isLastElement(element);
    };
    CardElement.prototype.isHiddenDueToOverflow = function () {
        return this._renderedElement !== undefined && this._renderedElement.style.visibility == 'hidden';
    };
    CardElement.prototype.getRootElement = function () {
        return this.getRootObject();
    };
    CardElement.prototype.getParentContainer = function () {
        var currentElement = this.parent;
        while (currentElement) {
            if (currentElement instanceof Container) {
                return currentElement;
            }
            currentElement = currentElement.parent;
        }
        return undefined;
    };
    CardElement.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        return [];
    };
    CardElement.prototype.getResourceInformation = function () {
        return [];
    };
    CardElement.prototype.getElementById = function (id) {
        return this.id === id ? this : undefined;
    };
    CardElement.prototype.getActionById = function (id) {
        return undefined;
    };
    CardElement.prototype.getEffectivePadding = function () {
        var padding = this.getPadding();
        return (padding && this.allowCustomPadding) ? padding : this.getDefaultPadding();
    };
    Object.defineProperty(CardElement.prototype, "hostConfig", {
        get: function () {
            if (this._hostConfig) {
                return this._hostConfig;
            }
            else {
                if (this.parent) {
                    return this.parent.hostConfig;
                }
                else {
                    return host_config_1.defaultHostConfig;
                }
            }
        },
        set: function (value) {
            this._hostConfig = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "index", {
        get: function () {
            if (this.parent) {
                return this.parent.indexOf(this);
            }
            else {
                return 0;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isInteractive", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isStandalone", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isInline", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "hasVisibleSeparator", {
        get: function () {
            if (this.parent && this.separatorElement) {
                return !this.parent.isFirstElement(this) && (this.isVisible || this.isDesignMode());
            }
            else {
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "separatorElement", {
        get: function () {
            return this._separatorElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    CardElement.langProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "lang", true, /^[a-z]{2,3}$/ig);
    CardElement.isVisibleProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "isVisible", true);
    CardElement.separatorProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "separator", false);
    CardElement.heightProperty = new serialization_1.ValueSetProperty(serialization_1.Versions.v1_1, "height", [
        { value: "auto" },
        { value: "stretch" }
    ], "auto");
    CardElement.horizontalAlignmentProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "horizontalAlignment", Enums.HorizontalAlignment, Enums.HorizontalAlignment.Left);
    CardElement.spacingProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "spacing", Enums.Spacing, Enums.Spacing.Default);
    __decorate([
        serialization_1.property(CardElement.horizontalAlignmentProperty)
    ], CardElement.prototype, "horizontalAlignment", void 0);
    __decorate([
        serialization_1.property(CardElement.spacingProperty)
    ], CardElement.prototype, "spacing", void 0);
    __decorate([
        serialization_1.property(CardElement.separatorProperty)
    ], CardElement.prototype, "separator", void 0);
    __decorate([
        serialization_1.property(CardElement.heightProperty)
    ], CardElement.prototype, "height", void 0);
    __decorate([
        serialization_1.property(CardElement.langProperty)
    ], CardElement.prototype, "lang", null);
    __decorate([
        serialization_1.property(CardElement.isVisibleProperty)
    ], CardElement.prototype, "isVisible", null);
    return CardElement;
}(card_object_1.CardObject));
exports.CardElement = CardElement;
var ActionProperty = /** @class */ (function (_super) {
    __extends(ActionProperty, _super);
    function ActionProperty(targetVersion, name, forbiddenActionTypes) {
        if (forbiddenActionTypes === void 0) { forbiddenActionTypes = []; }
        var _this = _super.call(this, targetVersion, name, undefined) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.forbiddenActionTypes = forbiddenActionTypes;
        return _this;
    }
    ActionProperty.prototype.parse = function (sender, source, context) {
        var parent = sender;
        return context.parseAction(parent, source[this.name], this.forbiddenActionTypes, parent.isDesignMode());
    };
    ActionProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, value ? value.toJSON(context) : undefined);
    };
    return ActionProperty;
}(serialization_1.PropertyDefinition));
exports.ActionProperty = ActionProperty;
var BaseTextBlock = /** @class */ (function (_super) {
    __extends(BaseTextBlock, _super);
    function BaseTextBlock(text) {
        var _this = _super.call(this) || this;
        _this.size = Enums.TextSize.Default;
        _this.weight = Enums.TextWeight.Default;
        _this.color = Enums.TextColor.Default;
        _this.isSubtle = false;
        _this.ariaHidden = false;
        if (text) {
            _this.text = text;
        }
        return _this;
    }
    BaseTextBlock.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        // selectAction is declared on BaseTextBlock but is only exposed on TextRun,
        // so the property is removed from the BaseTextBlock schema.
        schema.remove(BaseTextBlock.selectActionProperty);
    };
    Object.defineProperty(BaseTextBlock.prototype, "text", {
        get: function () {
            return this.getValue(BaseTextBlock.textProperty);
        },
        set: function (value) {
            this.setText(value);
        },
        enumerable: false,
        configurable: true
    });
    //#endregion
    BaseTextBlock.prototype.getFontSize = function (fontType) {
        switch (this.size) {
            case Enums.TextSize.Small:
                return fontType.fontSizes.small;
            case Enums.TextSize.Medium:
                return fontType.fontSizes.medium;
            case Enums.TextSize.Large:
                return fontType.fontSizes.large;
            case Enums.TextSize.ExtraLarge:
                return fontType.fontSizes.extraLarge;
            default:
                return fontType.fontSizes.default;
        }
    };
    BaseTextBlock.prototype.getColorDefinition = function (colorSet, color) {
        switch (color) {
            case Enums.TextColor.Accent:
                return colorSet.accent;
            case Enums.TextColor.Dark:
                return colorSet.dark;
            case Enums.TextColor.Light:
                return colorSet.light;
            case Enums.TextColor.Good:
                return colorSet.good;
            case Enums.TextColor.Warning:
                return colorSet.warning;
            case Enums.TextColor.Attention:
                return colorSet.attention;
            default:
                return colorSet.default;
        }
    };
    BaseTextBlock.prototype.setText = function (value) {
        this.setValue(BaseTextBlock.textProperty, value);
    };
    BaseTextBlock.prototype.init = function (textDefinition) {
        this.size = textDefinition.size;
        this.weight = textDefinition.weight;
        this.color = textDefinition.color;
        this.isSubtle = textDefinition.isSubtle;
    };
    BaseTextBlock.prototype.asString = function () {
        return this.text;
    };
    BaseTextBlock.prototype.applyStylesTo = function (targetElement) {
        var fontType = this.hostConfig.getFontTypeDefinition(this.fontType);
        if (fontType.fontFamily) {
            targetElement.style.fontFamily = fontType.fontFamily;
        }
        var fontSize;
        switch (this.size) {
            case Enums.TextSize.Small:
                fontSize = fontType.fontSizes.small;
                break;
            case Enums.TextSize.Medium:
                fontSize = fontType.fontSizes.medium;
                break;
            case Enums.TextSize.Large:
                fontSize = fontType.fontSizes.large;
                break;
            case Enums.TextSize.ExtraLarge:
                fontSize = fontType.fontSizes.extraLarge;
                break;
            default:
                fontSize = fontType.fontSizes.default;
                break;
        }
        targetElement.style.fontSize = fontSize + "px";
        var colorDefinition = this.getColorDefinition(this.getEffectiveStyleDefinition().foregroundColors, this.effectiveColor);
        targetElement.style.color = Utils.stringToCssColor(this.isSubtle ? colorDefinition.subtle : colorDefinition.default);
        var fontWeight;
        switch (this.weight) {
            case Enums.TextWeight.Lighter:
                fontWeight = fontType.fontWeights.lighter;
                break;
            case Enums.TextWeight.Bolder:
                fontWeight = fontType.fontWeights.bolder;
                break;
            default:
                fontWeight = fontType.fontWeights.default;
                break;
        }
        targetElement.style.fontWeight = fontWeight.toString();
        if (this.ariaHidden) {
            targetElement.setAttribute("aria-hidden", "true");
        }
    };
    Object.defineProperty(BaseTextBlock.prototype, "effectiveColor", {
        get: function () {
            return this.color ? this.color : Enums.TextColor.Default;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    BaseTextBlock.textProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "text", true);
    BaseTextBlock.sizeProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "size", Enums.TextSize, Enums.TextSize.Default);
    BaseTextBlock.weightProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "weight", Enums.TextWeight, Enums.TextWeight.Default);
    BaseTextBlock.colorProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "color", Enums.TextColor, Enums.TextColor.Default);
    BaseTextBlock.isSubtleProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "isSubtle", false);
    BaseTextBlock.fontTypeProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_2, "fontType", Enums.FontType);
    BaseTextBlock.selectActionProperty = new ActionProperty(serialization_1.Versions.v1_1, "selectAction", ["Action.ShowCard"]);
    __decorate([
        serialization_1.property(BaseTextBlock.sizeProperty)
    ], BaseTextBlock.prototype, "size", void 0);
    __decorate([
        serialization_1.property(BaseTextBlock.weightProperty)
    ], BaseTextBlock.prototype, "weight", void 0);
    __decorate([
        serialization_1.property(BaseTextBlock.colorProperty)
    ], BaseTextBlock.prototype, "color", void 0);
    __decorate([
        serialization_1.property(BaseTextBlock.fontTypeProperty)
    ], BaseTextBlock.prototype, "fontType", void 0);
    __decorate([
        serialization_1.property(BaseTextBlock.isSubtleProperty)
    ], BaseTextBlock.prototype, "isSubtle", void 0);
    __decorate([
        serialization_1.property(BaseTextBlock.textProperty)
    ], BaseTextBlock.prototype, "text", null);
    __decorate([
        serialization_1.property(BaseTextBlock.selectActionProperty)
    ], BaseTextBlock.prototype, "selectAction", void 0);
    return BaseTextBlock;
}(CardElement));
exports.BaseTextBlock = BaseTextBlock;
var TextBlock = /** @class */ (function (_super) {
    __extends(TextBlock, _super);
    function TextBlock() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wrap = false;
        _this._treatAsPlainText = true;
        _this.useMarkdown = true;
        return _this;
    }
    TextBlock.prototype.restoreOriginalContent = function () {
        if (this.renderedElement !== undefined) {
            if (this.maxLines && this.maxLines > 0) {
                this.renderedElement.style.maxHeight = this._computedLineHeight * this.maxLines + "px";
            }
            this.renderedElement.innerHTML = this._originalInnerHtml;
        }
    };
    TextBlock.prototype.truncateIfSupported = function (maxHeight) {
        if (this.renderedElement !== undefined) {
            // For now, only truncate TextBlocks that contain just a single
            // paragraph -- since the maxLines calculation doesn't take into
            // account Markdown lists
            var children = this.renderedElement.children;
            var isTextOnly = !children.length;
            var truncationSupported = isTextOnly || children.length == 1 && children[0].tagName.toLowerCase() == 'p';
            if (truncationSupported) {
                var element = isTextOnly ? this.renderedElement : children[0];
                Utils.truncate(element, maxHeight, this._computedLineHeight);
                return true;
            }
        }
        return false;
    };
    TextBlock.prototype.setText = function (value) {
        _super.prototype.setText.call(this, value);
        this._processedText = undefined;
    };
    TextBlock.prototype.internalRender = function () {
        var _this = this;
        this._processedText = undefined;
        if (this.text) {
            var preProcessedText = this.preProcessPropertyValue(BaseTextBlock.textProperty);
            var hostConfig = this.hostConfig;
            var element = void 0;
            if (this.forElementId) {
                var labelElement = document.createElement("label");
                labelElement.htmlFor = this.forElementId;
                element = labelElement;
            }
            else {
                element = document.createElement("div");
            }
            element.classList.add(hostConfig.makeCssClassName("ac-textBlock"));
            element.style.overflow = "hidden";
            this.applyStylesTo(element);
            if (this.selectAction) {
                element.onclick = function (e) {
                    e.preventDefault();
                    e.cancelBubble = true;
                    if (_this.selectAction) {
                        _this.selectAction.execute();
                    }
                };
                if (hostConfig.supportsInteractivity) {
                    element.tabIndex = 0;
                    element.setAttribute("role", this.selectAction.getAriaRole());
                    if (this.selectAction.title) {
                        element.setAttribute("aria-label", this.selectAction.title);
                        element.title = this.selectAction.title;
                    }
                    element.classList.add(hostConfig.makeCssClassName("ac-selectable"));
                }
            }
            if (!this._processedText) {
                this._treatAsPlainText = true;
                var formattedText = TextFormatters.formatText(this.lang, preProcessedText);
                if (this.useMarkdown && formattedText) {
                    if (shared_1.GlobalSettings.allowMarkForTextHighlighting) {
                        formattedText = formattedText.replace(/<mark>/g, "===").replace(/<\/mark>/g, "/==/");
                    }
                    var markdownProcessingResult = GenietalkCard.applyMarkdown(formattedText);
                    if (markdownProcessingResult.didProcess && markdownProcessingResult.outputHtml) {
                        this._processedText = markdownProcessingResult.outputHtml;
                        this._treatAsPlainText = false;
                        // Only process <mark> tag if markdown processing was applied because
                        // markdown processing is also responsible for sanitizing the input string
                        if (shared_1.GlobalSettings.allowMarkForTextHighlighting && this._processedText) {
                            var markStyle = "";
                            var effectiveStyle = this.getEffectiveStyleDefinition();
                            if (effectiveStyle.highlightBackgroundColor) {
                                markStyle += "background-color: " + effectiveStyle.highlightBackgroundColor + ";";
                            }
                            if (effectiveStyle.highlightForegroundColor) {
                                markStyle += "color: " + effectiveStyle.highlightForegroundColor + ";";
                            }
                            if (markStyle) {
                                markStyle = 'style="' + markStyle + '"';
                            }
                            this._processedText = this._processedText.replace(/===/g, "<mark " + markStyle + ">").replace(/\/==\//g, "</mark>");
                        }
                    }
                    else {
                        this._processedText = formattedText;
                        this._treatAsPlainText = true;
                    }
                }
                else {
                    this._processedText = formattedText;
                    this._treatAsPlainText = true;
                }
            }
            if (!this._processedText) {
                this._processedText = "";
            }
            if (this._treatAsPlainText) {
                element.innerText = this._processedText;
            }
            else {
                element.innerHTML = this._processedText;
            }
            if (element.firstElementChild instanceof HTMLElement) {
                var firstElementChild = element.firstElementChild;
                firstElementChild.style.marginTop = "5px";
                firstElementChild.style.width = "100%";
                if (!this.wrap) {
                    firstElementChild.style.overflow = "hidden";
                    firstElementChild.style.textOverflow = "ellipsis";
                }
            }
            if (element.lastElementChild instanceof HTMLElement) {
                element.lastElementChild.style.marginBottom = "0px";
            }
            var anchors = element.getElementsByTagName("a");
            for (var i = 0; i < anchors.length; i++) {
                var anchor = anchors[i];
                anchor.classList.add(hostConfig.makeCssClassName("ac-anchor"));
                anchor.target = "_blank";
                anchor.onclick = function (e) {
                    if (raiseAnchorClickedEvent(_this, e.target)) {
                        e.preventDefault();
                        e.cancelBubble = true;
                    }
                };
            }
            if (this.wrap) {
                element.style.wordWrap = "break-word";
                if (this.maxLines && this.maxLines > 0) {
                    element.style.maxHeight = (this._computedLineHeight * this.maxLines) + "px";
                    element.style.overflow = "hidden";
                }
            }
            else {
                element.style.whiteSpace = "nowrap";
                element.style.textOverflow = "ellipsis";
            }
            if (shared_1.GlobalSettings.useAdvancedTextBlockTruncation || shared_1.GlobalSettings.useAdvancedCardBottomTruncation) {
                this._originalInnerHtml = element.innerHTML;
            }
            return element;
        }
        else {
            return undefined;
        }
    };
    TextBlock.prototype.truncateOverflow = function (maxHeight) {
        if (maxHeight >= this._computedLineHeight) {
            return this.truncateIfSupported(maxHeight);
        }
        return false;
    };
    TextBlock.prototype.undoOverflowTruncation = function () {
        this.restoreOriginalContent();
        if (shared_1.GlobalSettings.useAdvancedTextBlockTruncation && this.maxLines) {
            var maxHeight = this._computedLineHeight * this.maxLines;
            this.truncateIfSupported(maxHeight);
        }
    };
    TextBlock.prototype.applyStylesTo = function (targetElement) {
        _super.prototype.applyStylesTo.call(this, targetElement);
        var parentContainer = this.getParentContainer();
        var isRtl = parentContainer ? parentContainer.isRtl() : false;
        switch (this.horizontalAlignment) {
            case Enums.HorizontalAlignment.Center:
                targetElement.style.textAlign = "center";
                break;
            case Enums.HorizontalAlignment.Right:
                targetElement.style.textAlign = isRtl ? "left" : "right";
                break;
            default:
                targetElement.style.textAlign = isRtl ? "right" : "left";
                break;
        }
        var lineHeights = this.hostConfig.lineHeights;
        if (lineHeights) {
            switch (this.size) {
                case Enums.TextSize.Small:
                    this._computedLineHeight = lineHeights.small;
                    break;
                case Enums.TextSize.Medium:
                    this._computedLineHeight = lineHeights.medium;
                    break;
                case Enums.TextSize.Large:
                    this._computedLineHeight = lineHeights.large;
                    break;
                case Enums.TextSize.ExtraLarge:
                    this._computedLineHeight = lineHeights.extraLarge;
                    break;
                default:
                    this._computedLineHeight = lineHeights.default;
                    break;
            }
        }
        else {
            // Looks like 1.33 is the magic number to compute line-height
            // from font size.
            this._computedLineHeight = this.getFontSize(this.hostConfig.getFontTypeDefinition(this.fontType)) * 1.33;
        }
        targetElement.style.lineHeight = this._computedLineHeight + "px";
    };
    TextBlock.prototype.getJsonTypeName = function () {
        return "TextBlock";
    };
    TextBlock.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = false; }
        _super.prototype.updateLayout.call(this, processChildren);
        if (shared_1.GlobalSettings.useAdvancedTextBlockTruncation && this.maxLines && this.isDisplayed()) {
            // Reset the element's innerHTML in case the available room for
            // content has increased
            this.restoreOriginalContent();
            this.truncateIfSupported(this._computedLineHeight * this.maxLines);
        }
    };
    TextBlock.wrapProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "wrap", false);
    TextBlock.maxLinesProperty = new serialization_1.NumProperty(serialization_1.Versions.v1_0, "maxLines");
    __decorate([
        serialization_1.property(TextBlock.wrapProperty)
    ], TextBlock.prototype, "wrap", void 0);
    __decorate([
        serialization_1.property(TextBlock.maxLinesProperty)
    ], TextBlock.prototype, "maxLines", void 0);
    return TextBlock;
}(BaseTextBlock));
exports.TextBlock = TextBlock;
var TextRun = /** @class */ (function (_super) {
    __extends(TextRun, _super);
    function TextRun() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.italic = false;
        _this.strikethrough = false;
        _this.highlight = false;
        _this.underline = false;
        return _this;
    }
    TextRun.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        schema.add(BaseTextBlock.selectActionProperty);
    };
    //#endregion
    TextRun.prototype.internalRender = function () {
        var _this = this;
        if (this.text) {
            var preProcessedText = this.preProcessPropertyValue(BaseTextBlock.textProperty);
            var hostConfig = this.hostConfig;
            var formattedText = TextFormatters.formatText(this.lang, preProcessedText);
            if (!formattedText) {
                formattedText = "";
            }
            var element = document.createElement("span");
            element.classList.add(hostConfig.makeCssClassName("ac-textRun"));
            this.applyStylesTo(element);
            if (this.selectAction && hostConfig.supportsInteractivity) {
                var anchor = document.createElement("a");
                anchor.classList.add(hostConfig.makeCssClassName("ac-anchor"));
                var href = this.selectAction.getHref();
                anchor.href = href ? href : "";
                anchor.target = "_blank";
                anchor.onclick = function (e) {
                    e.preventDefault();
                    e.cancelBubble = true;
                    if (_this.selectAction) {
                        _this.selectAction.execute();
                    }
                };
                if (this.selectAction.title) {
                    anchor.setAttribute("aria-label", this.selectAction.title);
                    anchor.title = this.selectAction.title;
                }
                anchor.innerText = formattedText;
                element.appendChild(anchor);
            }
            else {
                element.innerText = formattedText;
            }
            return element;
        }
        else {
            return undefined;
        }
    };
    TextRun.prototype.applyStylesTo = function (targetElement) {
        _super.prototype.applyStylesTo.call(this, targetElement);
        if (this.italic) {
            targetElement.style.fontStyle = "italic";
        }
        if (this.strikethrough) {
            targetElement.style.textDecoration = "line-through";
        }
        if (this.highlight) {
            var colorDefinition = this.getColorDefinition(this.getEffectiveStyleDefinition().foregroundColors, this.effectiveColor);
            targetElement.style.backgroundColor = Utils.stringToCssColor(this.isSubtle ? colorDefinition.highlightColors.subtle : colorDefinition.highlightColors.default);
        }
        if (this.underline) {
            targetElement.style.textDecoration = "underline";
        }
    };
    TextRun.prototype.getJsonTypeName = function () {
        return "TextRun";
    };
    Object.defineProperty(TextRun.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextRun.prototype, "isInline", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    TextRun.italicProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "italic", false);
    TextRun.strikethroughProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "strikethrough", false);
    TextRun.highlightProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "highlight", false);
    TextRun.underlineProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_3, "underline", false);
    __decorate([
        serialization_1.property(TextRun.italicProperty)
    ], TextRun.prototype, "italic", void 0);
    __decorate([
        serialization_1.property(TextRun.strikethroughProperty)
    ], TextRun.prototype, "strikethrough", void 0);
    __decorate([
        serialization_1.property(TextRun.highlightProperty)
    ], TextRun.prototype, "highlight", void 0);
    __decorate([
        serialization_1.property(TextRun.underlineProperty)
    ], TextRun.prototype, "underline", void 0);
    return TextRun;
}(BaseTextBlock));
exports.TextRun = TextRun;
var RichTextBlock = /** @class */ (function (_super) {
    __extends(RichTextBlock, _super);
    function RichTextBlock() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._inlines = [];
        return _this;
    }
    RichTextBlock.prototype.internalAddInline = function (inline, forceAdd) {
        if (forceAdd === void 0) { forceAdd = false; }
        if (!inline.isInline) {
            throw new Error(strings_1.Strings.errors.elementCannotBeUsedAsInline());
        }
        var doAdd = inline.parent === undefined || forceAdd;
        if (!doAdd && inline.parent != this) {
            throw new Error(strings_1.Strings.errors.inlineAlreadyParented());
        }
        else {
            inline.setParent(this);
            this._inlines.push(inline);
        }
    };
    RichTextBlock.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this._inlines = [];
        if (Array.isArray(source["inlines"])) {
            for (var _i = 0, _a = source["inlines"]; _i < _a.length; _i++) {
                var jsonInline = _a[_i];
                var inline = void 0;
                if (typeof jsonInline === "string") {
                    var textRun = new TextRun();
                    textRun.text = jsonInline;
                    inline = textRun;
                }
                else {
                    // No fallback for inlines in 1.2
                    inline = context.parseElement(this, jsonInline, false);
                }
                if (inline) {
                    this.internalAddInline(inline, true);
                }
            }
        }
    };
    RichTextBlock.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        if (this._inlines.length > 0) {
            var jsonInlines = [];
            for (var _i = 0, _a = this._inlines; _i < _a.length; _i++) {
                var inline = _a[_i];
                jsonInlines.push(inline.toJSON(context));
            }
            context.serializeValue(target, "inlines", jsonInlines);
        }
    };
    RichTextBlock.prototype.internalRender = function () {
        if (this._inlines.length > 0) {
            var element = void 0;
            if (this.forElementId) {
                var labelElement = document.createElement("label");
                labelElement.htmlFor = this.forElementId;
                element = labelElement;
            }
            else {
                element = document.createElement("div");
            }
            element.className = this.hostConfig.makeCssClassName("ac-richTextBlock");
            var parentContainer = this.getParentContainer();
            var isRtl = parentContainer ? parentContainer.isRtl() : false;
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.textAlign = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.textAlign = isRtl ? "left" : "right";
                    break;
                default:
                    element.style.textAlign = isRtl ? "right" : "left";
                    break;
            }
            var renderedInlines = 0;
            for (var _i = 0, _a = this._inlines; _i < _a.length; _i++) {
                var inline = _a[_i];
                var renderedInline = inline.render();
                if (renderedInline) {
                    element.appendChild(renderedInline);
                    renderedInlines++;
                }
            }
            if (renderedInlines > 0) {
                return element;
            }
        }
        return undefined;
    };
    RichTextBlock.prototype.asString = function () {
        var result = "";
        for (var _i = 0, _a = this._inlines; _i < _a.length; _i++) {
            var inline = _a[_i];
            result += inline.asString();
        }
        return result;
    };
    RichTextBlock.prototype.getJsonTypeName = function () {
        return "RichTextBlock";
    };
    RichTextBlock.prototype.getInlineCount = function () {
        return this._inlines.length;
    };
    RichTextBlock.prototype.getInlineAt = function (index) {
        if (index >= 0 && index < this._inlines.length) {
            return this._inlines[index];
        }
        else {
            throw new Error(strings_1.Strings.errors.indexOutOfRange(index));
        }
    };
    RichTextBlock.prototype.addInline = function (inline) {
        if (typeof inline === "string") {
            this.internalAddInline(new TextRun(inline));
        }
        else {
            this.internalAddInline(inline);
        }
    };
    RichTextBlock.prototype.removeInline = function (inline) {
        var index = this._inlines.indexOf(inline);
        if (index >= 0) {
            this._inlines[index].setParent(undefined);
            this._inlines.splice(index, 1);
            return true;
        }
        return false;
    };
    return RichTextBlock;
}(CardElement));
exports.RichTextBlock = RichTextBlock;
var Fact = /** @class */ (function (_super) {
    __extends(Fact, _super);
    function Fact(name, value) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    //#endregion
    Fact.prototype.getSchemaKey = function () {
        return "Fact";
    };
    //#region Schema
    Fact.titleProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "title");
    Fact.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    __decorate([
        serialization_1.property(Fact.titleProperty)
    ], Fact.prototype, "name", void 0);
    __decorate([
        serialization_1.property(Fact.valueProperty)
    ], Fact.prototype, "value", void 0);
    return Fact;
}(serialization_1.SerializableObject));
exports.Fact = Fact;
var FactSet = /** @class */ (function (_super) {
    __extends(FactSet, _super);
    function FactSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FactSet.prototype, "useDefaultSizing", {
        //#endregion
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    FactSet.prototype.internalRender = function () {
        var element = undefined;
        var hostConfig = this.hostConfig;
        if (this.facts.length > 0) {
            element = document.createElement("table");
            element.style.borderWidth = "0px";
            element.style.borderSpacing = "0px";
            element.style.borderStyle = "none";
            element.style.borderCollapse = "collapse";
            element.style.display = "block";
            element.style.overflow = "hidden";
            element.classList.add(hostConfig.makeCssClassName("ac-factset"));
            element.setAttribute("role", "presentation");
            for (var i = 0; i < this.facts.length; i++) {
                var trElement = document.createElement("tr");
                if (i > 0) {
                    trElement.style.marginTop = hostConfig.factSet.spacing + "px";
                }
                // Title column
                var tdElement = document.createElement("td");
                tdElement.style.padding = "0";
                tdElement.classList.add(hostConfig.makeCssClassName("ac-fact-title"));
                if (hostConfig.factSet.title.maxWidth) {
                    tdElement.style.maxWidth = hostConfig.factSet.title.maxWidth + "px";
                }
                tdElement.style.verticalAlign = "top";
                var textBlock = new TextBlock();
                textBlock.setParent(this);
                textBlock.text = (!this.facts[i].name && this.isDesignMode()) ? "Title" : this.facts[i].name;
                textBlock.size = hostConfig.factSet.title.size;
                textBlock.color = hostConfig.factSet.title.color;
                textBlock.isSubtle = hostConfig.factSet.title.isSubtle;
                textBlock.weight = hostConfig.factSet.title.weight;
                textBlock.wrap = hostConfig.factSet.title.wrap;
                textBlock.spacing = Enums.Spacing.None;
                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);
                // Spacer column
                tdElement = document.createElement("td");
                tdElement.style.width = "10px";
                Utils.appendChild(trElement, tdElement);
                // Value column
                tdElement = document.createElement("td");
                tdElement.style.padding = "0";
                tdElement.style.verticalAlign = "top";
                tdElement.classList.add(hostConfig.makeCssClassName("ac-fact-value"));
                textBlock = new TextBlock();
                textBlock.setParent(this);
                textBlock.text = this.facts[i].value;
                textBlock.size = hostConfig.factSet.value.size;
                textBlock.color = hostConfig.factSet.value.color;
                textBlock.isSubtle = hostConfig.factSet.value.isSubtle;
                textBlock.weight = hostConfig.factSet.value.weight;
                textBlock.wrap = hostConfig.factSet.value.wrap;
                textBlock.spacing = Enums.Spacing.None;
                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);
                Utils.appendChild(element, trElement);
            }
        }
        return element;
    };
    FactSet.prototype.getJsonTypeName = function () {
        return "FactSet";
    };
    //#region Schema
    FactSet.factsProperty = new serialization_1.SerializableObjectCollectionProperty(serialization_1.Versions.v1_0, "facts", Fact);
    __decorate([
        serialization_1.property(FactSet.factsProperty)
    ], FactSet.prototype, "facts", void 0);
    return FactSet;
}(CardElement));
exports.FactSet = FactSet;
var ImageDimensionProperty = /** @class */ (function (_super) {
    __extends(ImageDimensionProperty, _super);
    function ImageDimensionProperty(targetVersion, name, internalName, fallbackProperty) {
        var _this = _super.call(this, targetVersion, name) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.internalName = internalName;
        _this.fallbackProperty = fallbackProperty;
        return _this;
    }
    ImageDimensionProperty.prototype.getInternalName = function () {
        return this.internalName;
    };
    ImageDimensionProperty.prototype.parse = function (sender, source, context) {
        var result = undefined;
        var sourceValue = source[this.name];
        if (sourceValue === undefined) {
            return this.defaultValue;
        }
        var isValid = false;
        if (typeof sourceValue === "string") {
            try {
                var size = shared_1.SizeAndUnit.parse(sourceValue, true);
                if (size.unit == Enums.SizeUnit.Pixel) {
                    result = size.physicalSize;
                    isValid = true;
                }
            }
            catch (_a) {
                // Swallow the exception
            }
            // If the source value isn't valid per this property definition,
            // check its validity per the fallback property, if specified
            if (!isValid && this.fallbackProperty) {
                isValid = this.fallbackProperty.isValidValue(sourceValue, context);
            }
        }
        if (!isValid) {
            context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(sourceValue, this.name));
        }
        return result;
    };
    ImageDimensionProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, typeof value === "number" && !isNaN(value) ? value + "px" : undefined);
    };
    return ImageDimensionProperty;
}(serialization_1.PropertyDefinition));
var Image = /** @class */ (function (_super) {
    __extends(Image, _super);
    function Image() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = Enums.Size.Auto;
        _this.style = Enums.ImageStyle.Default;
        return _this;
    }
    Image.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        schema.remove(CardElement.heightProperty);
    };
    //#endregion
    Image.prototype.applySize = function (element) {
        if (this.pixelWidth || this.pixelHeight) {
            if (this.pixelWidth) {
                element.style.width = this.pixelWidth + "px";
            }
            if (this.pixelHeight) {
                element.style.height = this.pixelHeight + "px";
            }
        }
        else {
            if (this.maxHeight) {
                // If the image is constrained in height, we set its height property and
                // auto and stretch are ignored (default to medium). THis is necessary for
                // ImageSet which uses a maximum image height as opposed to the cards width
                // as a constraining dimension
                switch (this.size) {
                    case Enums.Size.Small:
                        element.style.height = this.hostConfig.imageSizes.small + "px";
                        break;
                    case Enums.Size.Large:
                        element.style.height = this.hostConfig.imageSizes.large + "px";
                        break;
                    default:
                        element.style.height = this.hostConfig.imageSizes.medium + "px";
                        break;
                }
                element.style.maxHeight = this.maxHeight + "px";
            }
            else {
                switch (this.size) {
                    case Enums.Size.Stretch:
                        element.style.width = "100%";
                        break;
                    case Enums.Size.Auto:
                        element.style.maxWidth = "100%";
                        break;
                    case Enums.Size.Small:
                        element.style.width = this.hostConfig.imageSizes.small + "px";
                        break;
                    case Enums.Size.Large:
                        element.style.width = this.hostConfig.imageSizes.large + "px";
                        break;
                    case Enums.Size.Medium:
                        element.style.width = this.hostConfig.imageSizes.medium + "px";
                        break;
                }
                element.style.maxHeight = "100%";
            }
        }
    };
    Object.defineProperty(Image.prototype, "useDefaultSizing", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Image.prototype.internalRender = function () {
        var _this = this;
        var element = undefined;
        if (this.url) {
            element = document.createElement("div");
            element.style.display = "flex";
            element.style.alignItems = "flex-start";
            element.onkeypress = function (e) {
                if (_this.selectAction && (e.keyCode == 13 || e.keyCode == 32)) { // enter or space pressed
                    e.preventDefault();
                    e.cancelBubble = true;
                    _this.selectAction.execute();
                }
            };
            element.onclick = function (e) {
                if (_this.selectAction) {
                    e.preventDefault();
                    e.cancelBubble = true;
                    _this.selectAction.execute();
                }
            };
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.justifyContent = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.justifyContent = "flex-end";
                    break;
                default:
                    element.style.justifyContent = "flex-start";
                    break;
            }
            // Cache hostConfig to avoid walking the parent hierarchy multiple times
            var hostConfig = this.hostConfig;
            var imageElement = document.createElement("img");
            imageElement.onload = function (e) {
                raiseImageLoadedEvent(_this);
            };
            imageElement.onerror = function (e) {
                if (_this.renderedElement) {
                    var card = _this.getRootElement();
                    _this.renderedElement.innerHTML = "";
                    if (card && card.designMode) {
                        var errorElement = document.createElement("div");
                        errorElement.style.display = "flex";
                        errorElement.style.alignItems = "center";
                        errorElement.style.justifyContent = "center";
                        errorElement.style.backgroundColor = "#EEEEEE";
                        errorElement.style.color = "black";
                        errorElement.innerText = ":-(";
                        errorElement.style.padding = "10px";
                        _this.applySize(errorElement);
                        _this.renderedElement.appendChild(errorElement);
                    }
                }
                raiseImageLoadedEvent(_this);
            };
            imageElement.style.minWidth = "0";
            imageElement.classList.add(hostConfig.makeCssClassName("ac-image"));
            if (this.selectAction !== undefined && hostConfig.supportsInteractivity) {
                imageElement.tabIndex = 0;
                imageElement.setAttribute("role", this.selectAction.getAriaRole());
                if (this.selectAction.title) {
                    imageElement.setAttribute("aria-label", this.selectAction.title);
                    imageElement.title = this.selectAction.title;
                }
                imageElement.classList.add(hostConfig.makeCssClassName("ac-selectable"));
            }
            this.applySize(imageElement);
            if (this.style === Enums.ImageStyle.Person) {
                imageElement.style.borderRadius = "50%";
                imageElement.style.backgroundPosition = "50% 50%";
                imageElement.style.backgroundRepeat = "no-repeat";
            }
            imageElement.style.backgroundColor = Utils.stringToCssColor(this.backgroundColor);
            imageElement.src = this.preProcessPropertyValue(Image.urlProperty);
            var altTextProperty = this.preProcessPropertyValue(Image.altTextProperty);
            if (altTextProperty) {
                imageElement.alt = altTextProperty;
            }
            element.appendChild(imageElement);
        }
        return element;
    };
    Image.prototype.getJsonTypeName = function () {
        return "Image";
    };
    Image.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result && this.selectAction) {
            result = this.selectAction.getActionById(id);
        }
        return result;
    };
    Image.prototype.getResourceInformation = function () {
        return this.url ? [{ url: this.url, mimeType: "image" }] : [];
    };
    Image.urlProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "url");
    Image.altTextProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "altText");
    Image.backgroundColorProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "backgroundColor");
    Image.styleProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "style", Enums.ImageStyle, Enums.ImageStyle.Default);
    Image.sizeProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "size", Enums.Size, Enums.Size.Auto);
    Image.pixelWidthProperty = new ImageDimensionProperty(serialization_1.Versions.v1_1, "width", "pixelWidth");
    Image.pixelHeightProperty = new ImageDimensionProperty(serialization_1.Versions.v1_1, "height", "pixelHeight", CardElement.heightProperty);
    Image.selectActionProperty = new ActionProperty(serialization_1.Versions.v1_1, "selectAction", ["Action.ShowCard"]);
    __decorate([
        serialization_1.property(Image.urlProperty)
    ], Image.prototype, "url", void 0);
    __decorate([
        serialization_1.property(Image.altTextProperty)
    ], Image.prototype, "altText", void 0);
    __decorate([
        serialization_1.property(Image.backgroundColorProperty)
    ], Image.prototype, "backgroundColor", void 0);
    __decorate([
        serialization_1.property(Image.sizeProperty)
    ], Image.prototype, "size", void 0);
    __decorate([
        serialization_1.property(Image.styleProperty)
    ], Image.prototype, "style", void 0);
    __decorate([
        serialization_1.property(Image.pixelWidthProperty)
    ], Image.prototype, "pixelWidth", void 0);
    __decorate([
        serialization_1.property(Image.pixelHeightProperty)
    ], Image.prototype, "pixelHeight", void 0);
    __decorate([
        serialization_1.property(Image.selectActionProperty)
    ], Image.prototype, "selectAction", void 0);
    return Image;
}(CardElement));
exports.Image = Image;
var CardElementContainer = /** @class */ (function (_super) {
    __extends(CardElementContainer, _super);
    function CardElementContainer() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowVerticalOverflow = false;
        return _this;
    }
    CardElementContainer.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        if (!this.isSelectable) {
            schema.remove(CardElementContainer.selectActionProperty);
        }
    };
    //#endregion
    CardElementContainer.prototype.isElementAllowed = function (element) {
        return this.hostConfig.supportsInteractivity || !element.isInteractive;
    };
    CardElementContainer.prototype.applyPadding = function () {
        _super.prototype.applyPadding.call(this);
        if (!this.renderedElement) {
            return;
        }
        var physicalPadding = new shared_1.SpacingDefinition();
        if (this.getEffectivePadding()) {
            physicalPadding = this.hostConfig.paddingDefinitionToSpacingDefinition(this.getEffectivePadding());
        }
        this.renderedElement.style.paddingTop = physicalPadding.top + "px";
        this.renderedElement.style.paddingRight = physicalPadding.right + "px";
        this.renderedElement.style.paddingBottom = physicalPadding.bottom + "px";
        this.renderedElement.style.paddingLeft = physicalPadding.left + "px";
        this.renderedElement.style.marginRight = "0";
        this.renderedElement.style.marginLeft = "0";
    };
    Object.defineProperty(CardElementContainer.prototype, "isSelectable", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    CardElementContainer.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        for (var i = 0; i < this.getItemCount(); i++) {
            var item = this.getItemAt(i);
            if (!this.hostConfig.supportsInteractivity && item.isInteractive) {
                context.addFailure(this, Enums.ValidationEvent.InteractivityNotAllowed, strings_1.Strings.errors.interactivityNotAllowed());
            }
            if (!this.isElementAllowed(item)) {
                context.addFailure(this, Enums.ValidationEvent.InteractivityNotAllowed, strings_1.Strings.errors.elementTypeNotAllowed(item.getJsonTypeName()));
            }
            item.internalValidateProperties(context);
        }
        if (this._selectAction) {
            this._selectAction.internalValidateProperties(context);
        }
    };
    CardElementContainer.prototype.render = function () {
        var _this = this;
        var element = _super.prototype.render.call(this);
        if (element) {
            var hostConfig = this.hostConfig;
            if (this.allowVerticalOverflow) {
                element.style.overflowX = "hidden";
                element.style.overflowY = "auto";
            }
            if (element && this.isSelectable && this._selectAction && hostConfig.supportsInteractivity) {
                element.classList.add(hostConfig.makeCssClassName("ac-selectable"));
                element.tabIndex = 0;
                element.setAttribute("role", this._selectAction.getAriaRole());
                if (this._selectAction.title) {
                    element.setAttribute("aria-label", this._selectAction.title);
                    element.title = this._selectAction.title;
                }
                element.onclick = function (e) {
                    if (_this._selectAction !== undefined) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        _this._selectAction.execute();
                    }
                };
                element.onkeypress = function (e) {
                    if (_this._selectAction !== undefined && (e.keyCode == 13 || e.keyCode == 32)) {
                        // Enter or space pressed
                        e.preventDefault();
                        e.cancelBubble = true;
                        _this._selectAction.execute();
                    }
                };
            }
        }
        return element;
    };
    CardElementContainer.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        _super.prototype.updateLayout.call(this, processChildren);
        if (processChildren) {
            for (var i = 0; i < this.getItemCount(); i++) {
                this.getItemAt(i).updateLayout();
            }
        }
    };
    CardElementContainer.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        var result = [];
        for (var i = 0; i < this.getItemCount(); i++) {
            result = result.concat(this.getItemAt(i).getAllInputs(processActions));
        }
        return result;
    };
    CardElementContainer.prototype.getResourceInformation = function () {
        var result = [];
        for (var i = 0; i < this.getItemCount(); i++) {
            result = result.concat(this.getItemAt(i).getResourceInformation());
        }
        return result;
    };
    CardElementContainer.prototype.getElementById = function (id) {
        var result = _super.prototype.getElementById.call(this, id);
        if (!result) {
            for (var i = 0; i < this.getItemCount(); i++) {
                result = this.getItemAt(i).getElementById(id);
                if (result) {
                    break;
                }
            }
        }
        return result;
    };
    CardElementContainer.selectActionProperty = new ActionProperty(serialization_1.Versions.v1_1, "selectAction", ["Action.ShowCard"]);
    __decorate([
        serialization_1.property(CardElementContainer.selectActionProperty)
    ], CardElementContainer.prototype, "_selectAction", void 0);
    return CardElementContainer;
}(CardElement));
exports.CardElementContainer = CardElementContainer;
var ImageSet = /** @class */ (function (_super) {
    __extends(ImageSet, _super);
    function ImageSet() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._images = [];
        _this.imageSize = Enums.ImageSize.Medium;
        return _this;
    }
    //#endregion
    ImageSet.prototype.internalRender = function () {
        var element = undefined;
        if (this._images.length > 0) {
            element = document.createElement("div");
            element.style.display = "flex";
            element.style.flexWrap = "wrap";
            for (var _i = 0, _a = this._images; _i < _a.length; _i++) {
                var image = _a[_i];
                switch (this.imageSize) {
                    case Enums.ImageSize.Small:
                        image.size = Enums.Size.Small;
                        break;
                    case Enums.ImageSize.Large:
                        image.size = Enums.Size.Large;
                        break;
                    default:
                        image.size = Enums.Size.Medium;
                        break;
                }
                image.maxHeight = this.hostConfig.imageSet.maxImageHeight;
                var renderedImage = image.render();
                if (renderedImage) {
                    renderedImage.style.display = "inline-flex";
                    renderedImage.style.margin = "0px";
                    renderedImage.style.marginRight = "10px";
                    Utils.appendChild(element, renderedImage);
                }
            }
        }
        return element;
    };
    ImageSet.prototype.getItemCount = function () {
        return this._images.length;
    };
    ImageSet.prototype.getItemAt = function (index) {
        return this._images[index];
    };
    ImageSet.prototype.getFirstVisibleRenderedItem = function () {
        return this._images && this._images.length > 0 ? this._images[0] : undefined;
    };
    ImageSet.prototype.getLastVisibleRenderedItem = function () {
        return this._images && this._images.length > 0 ? this._images[this._images.length - 1] : undefined;
    };
    ImageSet.prototype.removeItem = function (item) {
        if (item instanceof Image) {
            var itemIndex = this._images.indexOf(item);
            if (itemIndex >= 0) {
                this._images.splice(itemIndex, 1);
                item.setParent(undefined);
                this.updateLayout();
                return true;
            }
        }
        return false;
    };
    ImageSet.prototype.getJsonTypeName = function () {
        return "ImageSet";
    };
    ImageSet.prototype.addImage = function (image) {
        if (!image.parent) {
            this._images.push(image);
            image.setParent(this);
        }
        else {
            throw new Error("This image already belongs to another ImageSet");
        }
    };
    ImageSet.prototype.indexOf = function (cardElement) {
        return cardElement instanceof Image ? this._images.indexOf(cardElement) : -1;
    };
    ImageSet.imagesProperty = new serialization_1.SerializableObjectCollectionProperty(serialization_1.Versions.v1_0, "images", Image, function (sender, item) { item.setParent(sender); });
    ImageSet.imageSizeProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "imageSize", Enums.ImageSize, Enums.ImageSize.Medium);
    __decorate([
        serialization_1.property(ImageSet.imagesProperty)
    ], ImageSet.prototype, "_images", void 0);
    __decorate([
        serialization_1.property(ImageSet.imageSizeProperty)
    ], ImageSet.prototype, "imageSize", void 0);
    return ImageSet;
}(CardElementContainer));
exports.ImageSet = ImageSet;
var MediaSource = /** @class */ (function (_super) {
    __extends(MediaSource, _super);
    function MediaSource(url, mimeType) {
        var _this = _super.call(this) || this;
        _this.url = url;
        _this.mimeType = mimeType;
        return _this;
    }
    //#endregion
    MediaSource.prototype.getSchemaKey = function () {
        return "MediaSource";
    };
    MediaSource.prototype.isValid = function () {
        return this.mimeType && this.url ? true : false;
    };
    MediaSource.prototype.render = function () {
        var result = undefined;
        if (this.isValid()) {
            result = document.createElement("source");
            result.src = this.url;
            result.type = this.mimeType;
        }
        return result;
    };
    //#region Schema
    MediaSource.mimeTypeProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "mimeType");
    MediaSource.urlProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "url");
    __decorate([
        serialization_1.property(MediaSource.mimeTypeProperty)
    ], MediaSource.prototype, "mimeType", void 0);
    __decorate([
        serialization_1.property(MediaSource.urlProperty)
    ], MediaSource.prototype, "url", void 0);
    return MediaSource;
}(serialization_1.SerializableObject));
exports.MediaSource = MediaSource;
var Media = /** @class */ (function (_super) {
    __extends(Media, _super);
    function Media() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sources = [];
        return _this;
    }
    Media.prototype.getPosterUrl = function () {
        return this.poster ? this.poster : this.hostConfig.media.defaultPoster;
    };
    Media.prototype.processSources = function () {
        this._selectedSources = [];
        this._selectedMediaType = undefined;
        for (var _i = 0, _a = this.sources; _i < _a.length; _i++) {
            var source = _a[_i];
            var mimeComponents = source.mimeType ? source.mimeType.split('/') : [];
            if (mimeComponents.length == 2) {
                if (!this._selectedMediaType) {
                    var index = Media.supportedMediaTypes.indexOf(mimeComponents[0]);
                    if (index >= 0) {
                        this._selectedMediaType = Media.supportedMediaTypes[index];
                    }
                }
                if (mimeComponents[0] == this._selectedMediaType) {
                    this._selectedSources.push(source);
                }
            }
        }
    };
    Media.prototype.handlePlayButtonInvoke = function (event) {
        if (this.hostConfig.media.allowInlinePlayback) {
            event.preventDefault();
            event.cancelBubble = true;
            if (this.renderedElement) {
                var mediaPlayerElement = this.renderMediaPlayer();
                this.renderedElement.innerHTML = "";
                this.renderedElement.appendChild(mediaPlayerElement);
                mediaPlayerElement.play();
            }
        }
        else {
            if (Media.onPlay) {
                event.preventDefault();
                event.cancelBubble = true;
                Media.onPlay(this);
            }
        }
    };
    Media.prototype.renderPoster = function () {
        var _this = this;
        var playButtonArrowWidth = 12;
        var playButtonArrowHeight = 15;
        var posterRootElement = document.createElement("div");
        posterRootElement.className = this.hostConfig.makeCssClassName("ac-media-poster");
        posterRootElement.setAttribute("role", "contentinfo");
        posterRootElement.setAttribute("aria-label", this.altText ? this.altText : "Media content");
        posterRootElement.style.position = "relative";
        posterRootElement.style.alignItems = "center";
        posterRootElement.style.display = "flex";
        var posterUrl = this.getPosterUrl();
        if (posterUrl) {
            var posterImageElement_1 = document.createElement("img");
            posterImageElement_1.style.width = "100%";
            posterImageElement_1.style.height = "100%";
            posterImageElement_1.setAttribute("role", "presentation");
            posterImageElement_1.onerror = function (e) {
                if (posterImageElement_1.parentNode) {
                    posterImageElement_1.parentNode.removeChild(posterImageElement_1);
                }
                posterRootElement.classList.add("empty");
                posterRootElement.style.minHeight = "150px";
            };
            posterImageElement_1.src = posterUrl;
            posterRootElement.appendChild(posterImageElement_1);
        }
        else {
            posterRootElement.classList.add("empty");
            posterRootElement.style.minHeight = "150px";
        }
        if (this.hostConfig.supportsInteractivity && this._selectedSources.length > 0) {
            var playButtonOuterElement = document.createElement("div");
            playButtonOuterElement.tabIndex = 0;
            playButtonOuterElement.setAttribute("role", "button");
            playButtonOuterElement.setAttribute("aria-label", "Play media");
            playButtonOuterElement.className = this.hostConfig.makeCssClassName("ac-media-playButton");
            playButtonOuterElement.style.display = "flex";
            playButtonOuterElement.style.alignItems = "center";
            playButtonOuterElement.style.justifyContent = "center";
            playButtonOuterElement.onclick = function (e) {
                _this.handlePlayButtonInvoke(e);
            };
            playButtonOuterElement.onkeypress = function (e) {
                if (e.keyCode == 13 || e.keyCode == 32) { // space or enter
                    _this.handlePlayButtonInvoke(e);
                }
            };
            var playButtonInnerElement = document.createElement("div");
            playButtonInnerElement.className = this.hostConfig.makeCssClassName("ac-media-playButton-arrow");
            playButtonInnerElement.style.width = playButtonArrowWidth + "px";
            playButtonInnerElement.style.height = playButtonArrowHeight + "px";
            playButtonInnerElement.style.borderTopWidth = (playButtonArrowHeight / 2) + "px";
            playButtonInnerElement.style.borderBottomWidth = (playButtonArrowHeight / 2) + "px";
            playButtonInnerElement.style.borderLeftWidth = playButtonArrowWidth + "px";
            playButtonInnerElement.style.borderRightWidth = "0";
            playButtonInnerElement.style.borderStyle = "solid";
            playButtonInnerElement.style.borderTopColor = "transparent";
            playButtonInnerElement.style.borderRightColor = "transparent";
            playButtonInnerElement.style.borderBottomColor = "transparent";
            playButtonInnerElement.style.transform = "translate(" + (playButtonArrowWidth / 10) + "px,0px)";
            playButtonOuterElement.appendChild(playButtonInnerElement);
            var playButtonContainer = document.createElement("div");
            playButtonContainer.style.position = "absolute";
            playButtonContainer.style.left = "0";
            playButtonContainer.style.top = "0";
            playButtonContainer.style.width = "100%";
            playButtonContainer.style.height = "100%";
            playButtonContainer.style.display = "flex";
            playButtonContainer.style.justifyContent = "center";
            playButtonContainer.style.alignItems = "center";
            playButtonContainer.appendChild(playButtonOuterElement);
            posterRootElement.appendChild(playButtonContainer);
        }
        return posterRootElement;
    };
    Media.prototype.renderMediaPlayer = function () {
        var mediaElement;
        if (this._selectedMediaType == "video") {
            var videoPlayer = document.createElement("video");
            var posterUrl = this.getPosterUrl();
            if (posterUrl) {
                videoPlayer.poster = posterUrl;
            }
            mediaElement = videoPlayer;
        }
        else {
            mediaElement = document.createElement("audio");
        }
        mediaElement.setAttribute("webkit-playsinline", "");
        mediaElement.setAttribute("playsinline", "");
        mediaElement.autoplay = true;
        mediaElement.controls = true;
        if (Utils.isMobileOS()) {
            mediaElement.muted = true;
        }
        mediaElement.preload = "none";
        mediaElement.style.width = "100%";
        for (var _i = 0, _a = this.sources; _i < _a.length; _i++) {
            var source = _a[_i];
            var renderedSource = source.render();
            Utils.appendChild(mediaElement, renderedSource);
        }
        return mediaElement;
    };
    Media.prototype.internalRender = function () {
        var element = document.createElement("div");
        element.className = this.hostConfig.makeCssClassName("ac-media");
        this.processSources();
        element.appendChild(this.renderPoster());
        return element;
    };
    Media.prototype.getJsonTypeName = function () {
        return "Media";
    };
    Media.prototype.getResourceInformation = function () {
        var result = [];
        var posterUrl = this.getPosterUrl();
        if (posterUrl) {
            result.push({ url: posterUrl, mimeType: "image" });
        }
        for (var _i = 0, _a = this.sources; _i < _a.length; _i++) {
            var mediaSource = _a[_i];
            if (mediaSource.isValid()) {
                result.push({
                    url: mediaSource.url,
                    mimeType: mediaSource.mimeType
                });
            }
        }
        return result;
    };
    Object.defineProperty(Media.prototype, "selectedMediaType", {
        get: function () {
            return this._selectedMediaType;
        },
        enumerable: false,
        configurable: true
    });
    Media.sourcesProperty = new serialization_1.SerializableObjectCollectionProperty(serialization_1.Versions.v1_1, "sources", MediaSource);
    Media.posterProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "poster");
    Media.altTextProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "altText");
    //#endregion
    Media.supportedMediaTypes = ["audio", "video"];
    __decorate([
        serialization_1.property(Media.sourcesProperty)
    ], Media.prototype, "sources", void 0);
    __decorate([
        serialization_1.property(Media.posterProperty)
    ], Media.prototype, "poster", void 0);
    __decorate([
        serialization_1.property(Media.altTextProperty)
    ], Media.prototype, "altText", void 0);
    return Media;
}(CardElement));
exports.Media = Media;
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Input.prototype.getAllLabelIds = function () {
        var labelIds = [];
        if (this._renderedLabelElement) {
            labelIds.push(this._renderedLabelElement.id);
        }
        if (this._renderedErrorMessageElement) {
            labelIds.push(this._renderedErrorMessageElement.id);
        }
        return labelIds;
    };
    Input.prototype.updateInputControlAriaLabelledBy = function () {
        if (this._renderedInputControlElement) {
            var labelIds = this.getAllLabelIds();
            if (this._renderedLabelElement) {
                labelIds.push(this._renderedLabelElement.id);
            }
            if (this._renderedErrorMessageElement) {
                labelIds.push(this._renderedErrorMessageElement.id);
            }
            if (labelIds.length > 0) {
                this._renderedInputControlElement.setAttribute("aria-labelledby", labelIds.join(" "));
            }
            else {
                this._renderedInputControlElement.removeAttribute("aria-labelledby");
            }
        }
    };
    Object.defineProperty(Input.prototype, "isNullable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Input.prototype, "renderedInputControlElement", {
        get: function () {
            return this._renderedInputControlElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Input.prototype, "inputControlContainerElement", {
        get: function () {
            return this._inputControlContainerElement;
        },
        enumerable: false,
        configurable: true
    });
    Input.prototype.overrideInternalRender = function () {
        var hostConfig = this.hostConfig;
        this._outerContainerElement = document.createElement("div");
        this._outerContainerElement.style.display = "flex";
        this._outerContainerElement.style.flexDirection = "column";
        var renderedInputControlId = Utils.generateUniqueId();
        if (this.label) {
            var labelRichTextBlock = new RichTextBlock();
            labelRichTextBlock.setParent(this);
            labelRichTextBlock.forElementId = renderedInputControlId;
            var labelInline = new TextRun(this.label);
            labelRichTextBlock.addInline(labelInline);
            if (this.isRequired) {
                labelInline.init(hostConfig.inputs.label.requiredInputs);
                var isRequiredCueInline = new TextRun(hostConfig.inputs.label.requiredInputs.suffix);
                isRequiredCueInline.color = hostConfig.inputs.label.requiredInputs.suffixColor;
                isRequiredCueInline.ariaHidden = true;
                labelRichTextBlock.addInline(isRequiredCueInline);
            }
            else {
                labelInline.init(hostConfig.inputs.label.optionalInputs);
            }
            this._renderedLabelElement = labelRichTextBlock.render();
            if (this._renderedLabelElement) {
                this._renderedLabelElement.id = Utils.generateUniqueId();
                this._renderedLabelElement.style.marginBottom = hostConfig.getEffectiveSpacing(hostConfig.inputs.label.inputSpacing) + "px";
                this._outerContainerElement.appendChild(this._renderedLabelElement);
            }
        }
        this._inputControlContainerElement = document.createElement("div");
        this._inputControlContainerElement.className = hostConfig.makeCssClassName("ac-input-container");
        this._inputControlContainerElement.style.display = "flex";
        this._renderedInputControlElement = this.internalRender();
        if (this._renderedInputControlElement) {
            this._renderedInputControlElement.id = renderedInputControlId;
            this._renderedInputControlElement.style.minWidth = "0px";
            if (this.isNullable && this.isRequired) {
                this._renderedInputControlElement.setAttribute("aria-required", "true");
                this._renderedInputControlElement.classList.add(hostConfig.makeCssClassName("ac-input-required"));
            }
            this._inputControlContainerElement.appendChild(this._renderedInputControlElement);
            this._outerContainerElement.appendChild(this._inputControlContainerElement);
            this.updateInputControlAriaLabelledBy();
            return this._outerContainerElement;
        }
        return undefined;
    };
    Input.prototype.valueChanged = function () {
        if (this.isValid()) {
            this.resetValidationFailureCue();
        }
        if (this.onValueChanged) {
            this.onValueChanged(this);
        }
        raiseInputValueChangedEvent(this);
    };
    Input.prototype.resetValidationFailureCue = function () {
        if (this.renderedInputControlElement) {
            this.renderedInputControlElement.classList.remove(this.hostConfig.makeCssClassName("ac-input-validation-failed"));
            this.updateInputControlAriaLabelledBy();
            if (this._renderedErrorMessageElement) {
                this._outerContainerElement.removeChild(this._renderedErrorMessageElement);
                this._renderedErrorMessageElement = undefined;
            }
        }
    };
    Input.prototype.showValidationErrorMessage = function () {
        if (this.renderedElement && this.errorMessage && shared_1.GlobalSettings.displayInputValidationErrors) {
            var errorMessageTextBlock = new TextBlock();
            errorMessageTextBlock.setParent(this);
            errorMessageTextBlock.text = this.errorMessage;
            errorMessageTextBlock.wrap = true;
            errorMessageTextBlock.init(this.hostConfig.inputs.errorMessage);
            this._renderedErrorMessageElement = errorMessageTextBlock.render();
            if (this._renderedErrorMessageElement) {
                this._renderedErrorMessageElement.id = Utils.generateUniqueId();
                this._outerContainerElement.appendChild(this._renderedErrorMessageElement);
                this.updateInputControlAriaLabelledBy();
            }
        }
    };
    Input.prototype.focus = function () {
        if (this._renderedInputControlElement) {
            this._renderedInputControlElement.focus();
        }
    };
    Input.prototype.isValid = function () {
        return true;
    };
    Input.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (!this.id) {
            context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.inputsMustHaveUniqueId());
        }
        if (this.isRequired) {
            if (!this.label) {
                context.addFailure(this, Enums.ValidationEvent.RequiredInputsShouldHaveLabel, "Required inputs should have a label");
            }
            if (!this.errorMessage) {
                context.addFailure(this, Enums.ValidationEvent.RequiredInputsShouldHaveErrorMessage, "Required inputs should have an error message");
            }
        }
    };
    Input.prototype.validateValue = function () {
        this.resetValidationFailureCue();
        var result = this.isRequired ? this.isSet() && this.isValid() : this.isValid();
        if (!result && this.renderedInputControlElement) {
            this.renderedInputControlElement.classList.add(this.hostConfig.makeCssClassName("ac-input-validation-failed"));
            this.showValidationErrorMessage();
        }
        return result;
    };
    Input.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        return [this];
    };
    Object.defineProperty(Input.prototype, "isInteractive", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    Input.labelProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_3, "label", true);
    Input.isRequiredProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_3, "isRequired", false);
    Input.errorMessageProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_3, "errorMessage", true);
    __decorate([
        serialization_1.property(Input.labelProperty)
    ], Input.prototype, "label", void 0);
    __decorate([
        serialization_1.property(Input.isRequiredProperty)
    ], Input.prototype, "isRequired", void 0);
    __decorate([
        serialization_1.property(Input.errorMessageProperty)
    ], Input.prototype, "errorMessage", void 0);
    return Input;
}(CardElement));
exports.Input = Input;
var TextInput = /** @class */ (function (_super) {
    __extends(TextInput, _super);
    function TextInput() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isMultiline = false;
        _this.style = Enums.InputTextStyle.Text;
        return _this;
    }
    //#endregion
    TextInput.prototype.setupInput = function (input) {
        var _this = this;
        input.style.flex = "1 1 auto";
        input.tabIndex = 0;
        if (this.placeholder) {
            input.placeholder = this.placeholder;
            input.setAttribute("aria-label", this.placeholder);
        }
        if (this.defaultValue) {
            input.value = this.defaultValue;
        }
        if (this.maxLength && this.maxLength > 0) {
            input.maxLength = this.maxLength;
        }
        input.oninput = function () { _this.valueChanged(); };
        input.onkeypress = function (e) {
            // Ctrl+Enter pressed
            if (e.ctrlKey && e.code === "Enter" && _this.inlineAction) {
                _this.inlineAction.execute();
            }
        };
    };
    TextInput.prototype.internalRender = function () {
        var result;
        if (this.isMultiline) {
            result = document.createElement("textarea");
            result.className = this.hostConfig.makeCssClassName("ac-input", "ac-textInput", "ac-multiline");
        }
        else {
            result = document.createElement("input");
            result.className = this.hostConfig.makeCssClassName("ac-input", "ac-textInput");
            result.type = Enums.InputTextStyle[this.style].toLowerCase();
        }
        this.setupInput(result);
        return result;
    };
    TextInput.prototype.overrideInternalRender = function () {
        var _this = this;
        var renderedInputControl = _super.prototype.overrideInternalRender.call(this);
        if (this.inlineAction) {
            var button_1 = document.createElement("button");
            button_1.className = this.hostConfig.makeCssClassName("ac-inlineActionButton");
            button_1.onclick = function (e) {
                e.preventDefault();
                e.cancelBubble = true;
                if (_this.inlineAction) {
                    _this.inlineAction.execute();
                }
            };
            if (this.inlineAction.iconUrl) {
                button_1.classList.add("iconOnly");
                var icon_1 = document.createElement("img");
                icon_1.style.height = "100%";
                icon_1.setAttribute("role", "presentation");
                // The below trick is necessary as a workaround in Chrome where the icon is initially displayed
                // at its native size then resized to 100% of the button's height. This cfreates an unpleasant
                // flicker. On top of that, Chrome's flex implementation fails to prperly re-layout the button
                // after the image has loaded and been gicven its final size. The below trick also fixes that.
                icon_1.style.display = "none";
                icon_1.onload = function () {
                    icon_1.style.removeProperty("display");
                };
                icon_1.onerror = function () {
                    button_1.removeChild(icon_1);
                    button_1.classList.remove("iconOnly");
                    button_1.classList.add("textOnly");
                    button_1.textContent = _this.inlineAction && _this.inlineAction.title ? _this.inlineAction.title : strings_1.Strings.defaults.inlineActionTitle();
                };
                icon_1.src = this.inlineAction.iconUrl;
                button_1.appendChild(icon_1);
                button_1.title = this.inlineAction.title ? this.inlineAction.title : strings_1.Strings.defaults.inlineActionTitle();
            }
            else {
                button_1.classList.add("textOnly");
                button_1.textContent = this.inlineAction.title ? this.inlineAction.title : strings_1.Strings.defaults.inlineActionTitle();
            }
            button_1.style.marginLeft = "8px";
            this.inputControlContainerElement.appendChild(button_1);
        }
        return renderedInputControl;
    };
    TextInput.prototype.getJsonTypeName = function () {
        return "Input.Text";
    };
    TextInput.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result && this.inlineAction) {
            result = this.inlineAction.getActionById(id);
        }
        return result;
    };
    TextInput.prototype.isSet = function () {
        return this.value ? true : false;
    };
    TextInput.prototype.isValid = function () {
        if (!this.value) {
            return true;
        }
        if (this.regex) {
            return new RegExp(this.regex, "g").test(this.value);
        }
        return true;
    };
    Object.defineProperty(TextInput.prototype, "value", {
        get: function () {
            if (this.renderedInputControlElement) {
                if (this.isMultiline) {
                    return this.renderedInputControlElement.value;
                }
                else {
                    return this.renderedInputControlElement.value;
                }
            }
            else {
                return undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    TextInput.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    TextInput.maxLengthProperty = new serialization_1.NumProperty(serialization_1.Versions.v1_0, "maxLength");
    TextInput.isMultilineProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "isMultiline", false);
    TextInput.placeholderProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "placeholder");
    TextInput.styleProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_0, "style", Enums.InputTextStyle, Enums.InputTextStyle.Text);
    TextInput.inlineActionProperty = new ActionProperty(serialization_1.Versions.v1_0, "inlineAction", ["Action.ShowCard"]);
    TextInput.regexProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_3, "regex", true);
    __decorate([
        serialization_1.property(TextInput.valueProperty)
    ], TextInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(TextInput.maxLengthProperty)
    ], TextInput.prototype, "maxLength", void 0);
    __decorate([
        serialization_1.property(TextInput.isMultilineProperty)
    ], TextInput.prototype, "isMultiline", void 0);
    __decorate([
        serialization_1.property(TextInput.placeholderProperty)
    ], TextInput.prototype, "placeholder", void 0);
    __decorate([
        serialization_1.property(TextInput.styleProperty)
    ], TextInput.prototype, "style", void 0);
    __decorate([
        serialization_1.property(TextInput.inlineActionProperty)
    ], TextInput.prototype, "inlineAction", void 0);
    __decorate([
        serialization_1.property(TextInput.regexProperty)
    ], TextInput.prototype, "regex", void 0);
    return TextInput;
}(Input));
exports.TextInput = TextInput;
var ToggleInput = /** @class */ (function (_super) {
    __extends(ToggleInput, _super);
    function ToggleInput() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.valueOn = "true";
        _this.valueOff = "false";
        _this.wrap = false;
        return _this;
    }
    ToggleInput.prototype.updateInputControlAriaLabelledBy = function () {
        if (this._checkboxInputElement) {
            var joinedLabelIds = this.getAllLabelIds().join(" ");
            if (this._checkboxInputLabelElement && this._checkboxInputLabelElement.id) {
                joinedLabelIds += " " + this._checkboxInputLabelElement.id;
            }
            if (joinedLabelIds) {
                this._checkboxInputElement.setAttribute("aria-labelledby", joinedLabelIds);
            }
            else {
                this._checkboxInputElement.removeAttribute("aria-labelledby");
            }
        }
    };
    ToggleInput.prototype.internalRender = function () {
        var _this = this;
        var element = document.createElement("div");
        element.className = this.hostConfig.makeCssClassName("ac-input", "ac-toggleInput");
        element.style.width = "100%";
        element.style.display = "flex";
        element.style.alignItems = "center";
        this._checkboxInputElement = document.createElement("input");
        this._checkboxInputElement.id = Utils.generateUniqueId();
        this._checkboxInputElement.type = "checkbox";
        this._checkboxInputElement.style.display = "inline-block";
        this._checkboxInputElement.style.verticalAlign = "middle";
        this._checkboxInputElement.style.margin = "0";
        this._checkboxInputElement.style.flex = "0 0 auto";
        if (this.title) {
            this._checkboxInputElement.setAttribute("aria-label", this.title);
        }
        if (this.isRequired) {
            this._checkboxInputElement.setAttribute("aria-required", "true");
        }
        this._checkboxInputElement.tabIndex = 0;
        if (this.defaultValue == this.valueOn) {
            this._checkboxInputElement.checked = true;
        }
        this._checkboxInputElement.onchange = function () { _this.valueChanged(); };
        Utils.appendChild(element, this._checkboxInputElement);
        if (this.title || this.isDesignMode()) {
            var label = new TextBlock();
            label.setParent(this);
            label.forElementId = this._checkboxInputElement.id;
            label.hostConfig = this.hostConfig;
            label.text = !this.title ? this.getJsonTypeName() : this.title;
            label.useMarkdown = shared_1.GlobalSettings.useMarkdownInRadioButtonAndCheckbox;
            label.wrap = this.wrap;
            this._checkboxInputLabelElement = label.render();
            if (this._checkboxInputLabelElement) {
                this._checkboxInputLabelElement.id = Utils.generateUniqueId();
                this._checkboxInputLabelElement.style.display = "inline-block";
                this._checkboxInputLabelElement.style.flex = "1 1 auto";
                this._checkboxInputLabelElement.style.marginLeft = "6px";
                this._checkboxInputLabelElement.style.verticalAlign = "middle";
                var spacerElement = document.createElement("div");
                spacerElement.style.width = "6px";
                Utils.appendChild(element, spacerElement);
                Utils.appendChild(element, this._checkboxInputLabelElement);
            }
        }
        return element;
    };
    Object.defineProperty(ToggleInput.prototype, "isNullable", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    ToggleInput.prototype.getJsonTypeName = function () {
        return "Input.Toggle";
    };
    ToggleInput.prototype.focus = function () {
        if (this._checkboxInputElement) {
            this._checkboxInputElement.focus();
        }
    };
    ToggleInput.prototype.isSet = function () {
        if (this.isRequired) {
            return this.value === this.valueOn;
        }
        return this.value ? true : false;
    };
    Object.defineProperty(ToggleInput.prototype, "value", {
        get: function () {
            if (this._checkboxInputElement) {
                return this._checkboxInputElement.checked ? this.valueOn : this.valueOff;
            }
            else {
                return undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    ToggleInput.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    ToggleInput.titleProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "title");
    ToggleInput.valueOnProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "valueOn", true, undefined, "true", function (sender) { return "true"; });
    ToggleInput.valueOffProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "valueOff", true, undefined, "false", function (sender) { return "false"; });
    ToggleInput.wrapProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "wrap", false);
    __decorate([
        serialization_1.property(ToggleInput.valueProperty)
    ], ToggleInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(ToggleInput.titleProperty)
    ], ToggleInput.prototype, "title", void 0);
    __decorate([
        serialization_1.property(ToggleInput.valueOnProperty)
    ], ToggleInput.prototype, "valueOn", void 0);
    __decorate([
        serialization_1.property(ToggleInput.valueOffProperty)
    ], ToggleInput.prototype, "valueOff", void 0);
    __decorate([
        serialization_1.property(ToggleInput.wrapProperty)
    ], ToggleInput.prototype, "wrap", void 0);
    return ToggleInput;
}(Input));
exports.ToggleInput = ToggleInput;
var Choice = /** @class */ (function (_super) {
    __extends(Choice, _super);
    function Choice(title, value) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.value = value;
        return _this;
    }
    //#endregion
    Choice.prototype.getSchemaKey = function () {
        return "Choice";
    };
    //#region Schema
    Choice.titleProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "title");
    Choice.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    __decorate([
        serialization_1.property(Choice.titleProperty)
    ], Choice.prototype, "title", void 0);
    __decorate([
        serialization_1.property(Choice.valueProperty)
    ], Choice.prototype, "value", void 0);
    return Choice;
}(serialization_1.SerializableObject));
exports.Choice = Choice;
var ChoiceSetInput = /** @class */ (function (_super) {
    __extends(ChoiceSetInput, _super);
    function ChoiceSetInput() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isMultiSelect = false;
        _this.wrap = false;
        _this.choices = [];
        return _this;
    }
    Object.defineProperty(ChoiceSetInput.prototype, "isCompact", {
        get: function () {
            return this.style !== "expanded";
        },
        set: function (value) {
            this.style = value ? undefined : "expanded";
        },
        enumerable: false,
        configurable: true
    });
    ChoiceSetInput.getUniqueCategoryName = function () {
        var uniqueCategoryName = "__ac-category" + ChoiceSetInput.uniqueCategoryCounter;
        ChoiceSetInput.uniqueCategoryCounter++;
        return uniqueCategoryName;
    };
    ChoiceSetInput.prototype.renderCompoundInput = function (cssClassName, type, defaultValues) {
        var _this = this;
        var element = document.createElement("div");
        element.className = this.hostConfig.makeCssClassName("ac-input", cssClassName);
        element.style.width = "100%";
        this._toggleInputs = [];
        this._labels = [];
        for (var _i = 0, _a = this.choices; _i < _a.length; _i++) {
            var choice = _a[_i];
            var input = document.createElement("input");
            input.id = Utils.generateUniqueId();
            input.type = type;
            input.style.margin = "0";
            input.style.display = "inline-block";
            input.style.verticalAlign = "middle";
            input.style.flex = "0 0 auto";
            input.name = this.id ? this.id : this._uniqueCategoryName;
            if (this.isRequired) {
                input.setAttribute("aria-required", "true");
            }
            if (choice.value) {
                input.value = choice.value;
            }
            if (choice.title) {
                input.setAttribute("aria-label", choice.title);
            }
            if (defaultValues && choice.value) {
                if (defaultValues.indexOf(choice.value) >= 0) {
                    input.checked = true;
                }
            }
            input.onchange = function () { _this.valueChanged(); };
            this._toggleInputs.push(input);
            var compoundInput = document.createElement("div");
            compoundInput.style.display = "flex";
            compoundInput.style.alignItems = "center";
            Utils.appendChild(compoundInput, input);
            var label = new TextBlock();
            label.setParent(this);
            label.forElementId = input.id;
            label.hostConfig = this.hostConfig;
            label.text = choice.title ? choice.title : "Choice " + this._toggleInputs.length;
            label.useMarkdown = shared_1.GlobalSettings.useMarkdownInRadioButtonAndCheckbox;
            label.wrap = this.wrap;
            var labelElement = label.render();
            this._labels.push(labelElement);
            if (labelElement) {
                labelElement.id = Utils.generateUniqueId();
                labelElement.style.display = "inline-block";
                labelElement.style.flex = "1 1 auto";
                labelElement.style.marginLeft = "6px";
                labelElement.style.verticalAlign = "middle";
                var spacerElement = document.createElement("div");
                spacerElement.style.width = "6px";
                Utils.appendChild(compoundInput, spacerElement);
                Utils.appendChild(compoundInput, labelElement);
            }
            Utils.appendChild(element, compoundInput);
        }
        return element;
    };
    ChoiceSetInput.prototype.updateInputControlAriaLabelledBy = function () {
        if (this.isMultiSelect || this.style === "expanded") {
            var labelIds = this.getAllLabelIds();
            for (var i = 0; i < this._toggleInputs.length; i++) {
                var joinedLabelIds = labelIds.join(" ");
                var label = this._labels[i];
                if (label && label.id) {
                    joinedLabelIds += " " + label.id;
                }
                if (joinedLabelIds) {
                    this._toggleInputs[i].setAttribute("aria-labelledby", joinedLabelIds);
                }
                else {
                    this._toggleInputs[i].removeAttribute("aria-labelledby");
                }
            }
        }
        else {
            _super.prototype.updateInputControlAriaLabelledBy.call(this);
        }
    };
    // Make sure `aria-current` is applied to the currently-selected item
    ChoiceSetInput.prototype.internalApplyAriaCurrent = function () {
        var options = this._selectElement.options;
        if (options) {
            for (var i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    options[i].setAttribute("aria-current", "true");
                }
                else {
                    options[i].removeAttribute("aria-current");
                }
            }
        }
    };
    ChoiceSetInput.prototype.internalRender = function () {
        var _this = this;
        this._uniqueCategoryName = ChoiceSetInput.getUniqueCategoryName();
        if (this.isMultiSelect) {
            // Render as a list of toggle inputs
            return this.renderCompoundInput("ac-choiceSetInput-multiSelect", "checkbox", this.defaultValue ? this.defaultValue.split(this.hostConfig.choiceSetInputValueSeparator) : undefined);
        }
        else {
            if (this.style === "expanded") {
                // Render as a series of radio buttons
                return this.renderCompoundInput("ac-choiceSetInput-expanded", "radio", this.defaultValue ? [this.defaultValue] : undefined);
            }
            else {
                // Render as a combo box
                this._selectElement = document.createElement("select");
                this._selectElement.className = this.hostConfig.makeCssClassName("ac-input", "ac-multichoiceInput", "ac-choiceSetInput-compact");
                this._selectElement.style.width = "100%";
                var option = document.createElement("option");
                option.selected = true;
                option.disabled = true;
                option.hidden = true;
                option.value = "";
                if (this.placeholder) {
                    option.text = this.placeholder;
                }
                Utils.appendChild(this._selectElement, option);
                for (var _i = 0, _a = this.choices; _i < _a.length; _i++) {
                    var choice = _a[_i];
                    var option_1 = document.createElement("option");
                    option_1.value = choice.value;
                    option_1.text = choice.title;
                    option_1.setAttribute("aria-label", choice.title);
                    if (choice.value == this.defaultValue) {
                        option_1.selected = true;
                    }
                    Utils.appendChild(this._selectElement, option_1);
                }
                this._selectElement.onchange = function () {
                    _this.internalApplyAriaCurrent();
                    _this.valueChanged();
                };
                this.internalApplyAriaCurrent();
                return this._selectElement;
            }
        }
    };
    ChoiceSetInput.prototype.getJsonTypeName = function () {
        return "Input.ChoiceSet";
    };
    ChoiceSetInput.prototype.focus = function () {
        if (this.isMultiSelect || this.style === "expanded") {
            if (this._toggleInputs.length > 0) {
                this._toggleInputs[0].focus();
            }
        }
        else {
            _super.prototype.focus.call(this);
        }
    };
    ChoiceSetInput.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (this.choices.length == 0) {
            context.addFailure(this, Enums.ValidationEvent.CollectionCantBeEmpty, strings_1.Strings.errors.choiceSetMustHaveAtLeastOneChoice());
        }
        for (var _i = 0, _a = this.choices; _i < _a.length; _i++) {
            var choice = _a[_i];
            if (!choice.title || !choice.value) {
                context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.choiceSetChoicesMustHaveTitleAndValue());
            }
        }
    };
    ChoiceSetInput.prototype.isSet = function () {
        return this.value ? true : false;
    };
    Object.defineProperty(ChoiceSetInput.prototype, "value", {
        get: function () {
            if (!this.isMultiSelect) {
                if (this.isCompact) {
                    if (this._selectElement) {
                        return this._selectElement.selectedIndex > 0 ? this._selectElement.value : undefined;
                    }
                    return undefined;
                }
                else {
                    if (!this._toggleInputs || this._toggleInputs.length == 0) {
                        return undefined;
                    }
                    for (var _i = 0, _a = this._toggleInputs; _i < _a.length; _i++) {
                        var toggleInput = _a[_i];
                        if (toggleInput.checked) {
                            return toggleInput.value;
                        }
                    }
                    return undefined;
                }
            }
            else {
                if (!this._toggleInputs || this._toggleInputs.length == 0) {
                    return undefined;
                }
                var result = "";
                for (var _b = 0, _c = this._toggleInputs; _b < _c.length; _b++) {
                    var toggleInput = _c[_b];
                    if (toggleInput.checked) {
                        if (result != "") {
                            result += this.hostConfig.choiceSetInputValueSeparator;
                        }
                        result += toggleInput.value;
                    }
                }
                return result ? result : undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    ChoiceSetInput.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    ChoiceSetInput.choicesProperty = new serialization_1.SerializableObjectCollectionProperty(serialization_1.Versions.v1_0, "choices", Choice);
    ChoiceSetInput.styleProperty = new serialization_1.ValueSetProperty(serialization_1.Versions.v1_0, "style", [
        { value: "compact" },
        { value: "expanded" }
    ], "compact");
    ChoiceSetInput.isMultiSelectProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "isMultiSelect", false);
    ChoiceSetInput.placeholderProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "placeholder");
    ChoiceSetInput.wrapProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "wrap", false);
    //#endregion
    ChoiceSetInput.uniqueCategoryCounter = 0;
    __decorate([
        serialization_1.property(ChoiceSetInput.valueProperty)
    ], ChoiceSetInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(ChoiceSetInput.styleProperty)
    ], ChoiceSetInput.prototype, "style", void 0);
    __decorate([
        serialization_1.property(ChoiceSetInput.isMultiSelectProperty)
    ], ChoiceSetInput.prototype, "isMultiSelect", void 0);
    __decorate([
        serialization_1.property(ChoiceSetInput.placeholderProperty)
    ], ChoiceSetInput.prototype, "placeholder", void 0);
    __decorate([
        serialization_1.property(ChoiceSetInput.wrapProperty)
    ], ChoiceSetInput.prototype, "wrap", void 0);
    __decorate([
        serialization_1.property(ChoiceSetInput.choicesProperty)
    ], ChoiceSetInput.prototype, "choices", void 0);
    return ChoiceSetInput;
}(Input));
exports.ChoiceSetInput = ChoiceSetInput;
var NumberInput = /** @class */ (function (_super) {
    __extends(NumberInput, _super);
    function NumberInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberInput.prototype.internalRender = function () {
        var _this = this;
        this._numberInputElement = document.createElement("input");
        this._numberInputElement.setAttribute("type", "number");
        if (this.min) {
            this._numberInputElement.setAttribute("min", this.min.toString());
        }
        if (this.max) {
            this._numberInputElement.setAttribute("max", this.max.toString());
        }
        this._numberInputElement.className = this.hostConfig.makeCssClassName("ac-input", "ac-numberInput");
        this._numberInputElement.style.width = "100%";
        this._numberInputElement.tabIndex = 0;
        if (this.defaultValue !== undefined) {
            this._numberInputElement.valueAsNumber = this.defaultValue;
        }
        if (this.placeholder) {
            this._numberInputElement.placeholder = this.placeholder;
            this._numberInputElement.setAttribute("aria-label", this.placeholder);
        }
        this._numberInputElement.oninput = function () { _this.valueChanged(); };
        return this._numberInputElement;
    };
    NumberInput.prototype.getJsonTypeName = function () {
        return "Input.Number";
    };
    NumberInput.prototype.isSet = function () {
        return this.value !== undefined && !isNaN(this.value);
    };
    NumberInput.prototype.isValid = function () {
        if (!this.value) {
            return !this.isRequired;
        }
        var result = true;
        if (this.min !== undefined) {
            result = result && (this.value >= this.min);
        }
        if (this.max !== undefined) {
            result = result && (this.value <= this.max);
        }
        return result;
    };
    Object.defineProperty(NumberInput.prototype, "value", {
        get: function () {
            return this._numberInputElement ? this._numberInputElement.valueAsNumber : undefined;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    NumberInput.valueProperty = new serialization_1.NumProperty(serialization_1.Versions.v1_0, "value");
    NumberInput.placeholderProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "placeholder");
    NumberInput.minProperty = new serialization_1.NumProperty(serialization_1.Versions.v1_0, "min");
    NumberInput.maxProperty = new serialization_1.NumProperty(serialization_1.Versions.v1_0, "max");
    __decorate([
        serialization_1.property(NumberInput.valueProperty)
    ], NumberInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(NumberInput.minProperty)
    ], NumberInput.prototype, "min", void 0);
    __decorate([
        serialization_1.property(NumberInput.maxProperty)
    ], NumberInput.prototype, "max", void 0);
    __decorate([
        serialization_1.property(NumberInput.placeholderProperty)
    ], NumberInput.prototype, "placeholder", void 0);
    return NumberInput;
}(Input));
exports.NumberInput = NumberInput;
var DateInput = /** @class */ (function (_super) {
    __extends(DateInput, _super);
    function DateInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateInput.prototype.internalRender = function () {
        var _this = this;
        this._dateInputElement = document.createElement("input");
        this._dateInputElement.setAttribute("type", "date");
        if (this.min) {
            this._dateInputElement.setAttribute("min", this.min);
        }
        if (this.max) {
            this._dateInputElement.setAttribute("max", this.max);
        }
        if (this.placeholder) {
            this._dateInputElement.placeholder = this.placeholder;
            this._dateInputElement.setAttribute("aria-label", this.placeholder);
        }
        this._dateInputElement.className = this.hostConfig.makeCssClassName("ac-input", "ac-dateInput");
        this._dateInputElement.style.width = "100%";
        this._dateInputElement.oninput = function () { _this.valueChanged(); };
        if (this.defaultValue) {
            this._dateInputElement.value = this.defaultValue;
        }
        return this._dateInputElement;
    };
    DateInput.prototype.getJsonTypeName = function () {
        return "Input.Date";
    };
    DateInput.prototype.isSet = function () {
        return this.value ? true : false;
    };
    DateInput.prototype.isValid = function () {
        if (!this.value) {
            return !this.isRequired;
        }
        var valueAsDate = new Date(this.value);
        var result = true;
        if (this.min) {
            var minDate = new Date(this.min);
            result = result && (valueAsDate >= minDate);
        }
        if (this.max) {
            var maxDate = new Date(this.max);
            result = result && (valueAsDate <= maxDate);
        }
        return result;
    };
    Object.defineProperty(DateInput.prototype, "value", {
        get: function () {
            return this._dateInputElement ? this._dateInputElement.value : undefined;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    DateInput.valueProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "value");
    DateInput.placeholderProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "placeholder");
    DateInput.minProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "min");
    DateInput.maxProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "max");
    __decorate([
        serialization_1.property(DateInput.valueProperty)
    ], DateInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(DateInput.minProperty)
    ], DateInput.prototype, "min", void 0);
    __decorate([
        serialization_1.property(DateInput.maxProperty)
    ], DateInput.prototype, "max", void 0);
    __decorate([
        serialization_1.property(DateInput.placeholderProperty)
    ], DateInput.prototype, "placeholder", void 0);
    return DateInput;
}(Input));
exports.DateInput = DateInput;
var TimeProperty = /** @class */ (function (_super) {
    __extends(TimeProperty, _super);
    function TimeProperty(targetVersion, name) {
        var _this = _super.call(this, targetVersion, name, function (sender, property, source, context) {
            var value = source[property.name];
            if (typeof value === "string" && value && /^[0-9]{2}:[0-9]{2}$/.test(value)) {
                return value;
            }
            return undefined;
        }, function (sender, property, target, value, context) {
            context.serializeValue(target, property.name, value);
        }) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        return _this;
    }
    return TimeProperty;
}(serialization_1.CustomProperty));
exports.TimeProperty = TimeProperty;
var TimeInput = /** @class */ (function (_super) {
    __extends(TimeInput, _super);
    function TimeInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeInput.convertTimeStringToDate = function (timeString) {
        return new Date("1973-09-04T" + timeString + ":00Z");
    };
    TimeInput.prototype.internalRender = function () {
        var _this = this;
        this._timeInputElement = document.createElement("input");
        this._timeInputElement.setAttribute("type", "time");
        this._timeInputElement.setAttribute("min", this.min);
        this._timeInputElement.setAttribute("max", this.max);
        this._timeInputElement.className = this.hostConfig.makeCssClassName("ac-input", "ac-timeInput");
        this._timeInputElement.style.width = "100%";
        this._timeInputElement.oninput = function () { _this.valueChanged(); };
        if (this.placeholder) {
            this._timeInputElement.placeholder = this.placeholder;
            this._timeInputElement.setAttribute("aria-label", this.placeholder);
        }
        if (this.defaultValue) {
            this._timeInputElement.value = this.defaultValue;
        }
        return this._timeInputElement;
    };
    TimeInput.prototype.getJsonTypeName = function () {
        return "Input.Time";
    };
    TimeInput.prototype.isSet = function () {
        return this.value ? true : false;
    };
    TimeInput.prototype.isValid = function () {
        if (!this.value) {
            return !this.isRequired;
        }
        var valueAsDate = TimeInput.convertTimeStringToDate(this.value);
        var result = true;
        if (this.min) {
            var minDate = TimeInput.convertTimeStringToDate(this.min);
            result = result && (valueAsDate >= minDate);
        }
        if (this.max) {
            var maxDate = TimeInput.convertTimeStringToDate(this.max);
            result = result && (valueAsDate <= maxDate);
        }
        return result;
    };
    Object.defineProperty(TimeInput.prototype, "value", {
        get: function () {
            return this._timeInputElement ? this._timeInputElement.value : undefined;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    TimeInput.valueProperty = new TimeProperty(serialization_1.Versions.v1_0, "value");
    TimeInput.placeholderProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "placeholder");
    TimeInput.minProperty = new TimeProperty(serialization_1.Versions.v1_0, "min");
    TimeInput.maxProperty = new TimeProperty(serialization_1.Versions.v1_0, "max");
    __decorate([
        serialization_1.property(TimeInput.valueProperty)
    ], TimeInput.prototype, "defaultValue", void 0);
    __decorate([
        serialization_1.property(TimeInput.minProperty)
    ], TimeInput.prototype, "min", void 0);
    __decorate([
        serialization_1.property(TimeInput.maxProperty)
    ], TimeInput.prototype, "max", void 0);
    __decorate([
        serialization_1.property(TimeInput.placeholderProperty)
    ], TimeInput.prototype, "placeholder", void 0);
    return TimeInput;
}(Input));
exports.TimeInput = TimeInput;
var ActionButton = /** @class */ (function () {
    function ActionButton(action, parentContainerStyle) {
        this._state = 0 /* Normal */;
        this.action = action;
        this._parentContainerStyle = parentContainerStyle;
    }
    ActionButton.prototype.updateCssStyle = function () {
        var _a, _b;
        if (this.action.parent && this.action.renderedElement) {
            var hostConfig = this.action.parent.hostConfig;
            this.action.renderedElement.className = hostConfig.makeCssClassName("ac-pushButton");
            if (this._parentContainerStyle) {
                this.action.renderedElement.classList.add("style-" + this._parentContainerStyle);
            }
            this.action.updateActionButtonCssStyle(this.action.renderedElement, this._state);
            this.action.renderedElement.classList.remove(hostConfig.makeCssClassName("expanded"));
            this.action.renderedElement.classList.remove(hostConfig.makeCssClassName("subdued"));
            switch (this._state) {
                case 1 /* Expanded */:
                    this.action.renderedElement.classList.add(hostConfig.makeCssClassName("expanded"));
                    break;
                case 2 /* Subdued */:
                    this.action.renderedElement.classList.add(hostConfig.makeCssClassName("subdued"));
                    break;
            }
            if (this.action.style) {
                if (this.action.style === Enums.ActionStyle.Positive) {
                    (_a = this.action.renderedElement.classList).add.apply(_a, hostConfig.makeCssClassNames("primary", "style-positive"));
                }
                else {
                    (_b = this.action.renderedElement.classList).add.apply(_b, hostConfig.makeCssClassNames("style-" + this.action.style.toLowerCase()));
                }
            }
        }
    };
    ActionButton.prototype.render = function () {
        var _this = this;
        this.action.render();
        if (this.action.renderedElement) {
            this.action.renderedElement.onclick = function (e) {
                e.preventDefault();
                e.cancelBubble = true;
                _this.click();
            };
            this.updateCssStyle();
        }
    };
    ActionButton.prototype.click = function () {
        if (this.onClick !== undefined) {
            this.onClick(this);
        }
    };
    Object.defineProperty(ActionButton.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (value) {
            this._state = value;
            this.updateCssStyle();
        },
        enumerable: false,
        configurable: true
    });
    return ActionButton;
}());
var Action = /** @class */ (function (_super) {
    __extends(Action, _super);
    function Action() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.style = Enums.ActionStyle.Default;
        return _this;
    }
    Action.prototype.getDefaultSerializationContext = function () {
        return new SerializationContext();
    };
    Action.prototype.addCssClasses = function (element) {
        // Do nothing in base implementation
    };
    Action.prototype.internalGetReferencedInputs = function () {
        return {};
    };
    Action.prototype.internalPrepareForExecution = function (inputs) {
        // Do nothing in base implementation
    };
    Action.prototype.internalValidateInputs = function (referencedInputs) {
        var result = [];
        if (!this.ignoreInputValidation && referencedInputs) {
            for (var _i = 0, _a = Object.keys(referencedInputs); _i < _a.length; _i++) {
                var key = _a[_i];
                var input = referencedInputs[key];
                if (!input.validateValue()) {
                    result.push(input);
                }
            }
        }
        return result;
    };
    Action.prototype.shouldSerialize = function (context) {
        return context.actionRegistry.findByName(this.getJsonTypeName()) !== undefined;
    };
    Action.prototype.raiseExecuteActionEvent = function () {
        if (this.onExecute) {
            this.onExecute(this);
        }
        raiseExecuteActionEvent(this);
    };
    Action.prototype.getHref = function () {
        return "";
    };
    Action.prototype.getAriaRole = function () {
        return "button";
    };
    Action.prototype.updateActionButtonCssStyle = function (actionButtonElement, buttonState) {
        if (buttonState === void 0) { buttonState = 0 /* Normal */; }
        // Do nothing in base implementation
    };
    Action.prototype.parse = function (source, context) {
        return _super.prototype.parse.call(this, source, context ? context : new SerializationContext());
    };
    Action.prototype.render = function (baseCssClass) {
        if (baseCssClass === void 0) { baseCssClass = "ac-pushButton"; }
        // Cache hostConfig for perf
        var hostConfig = this.hostConfig;
        var buttonElement = document.createElement("button");
        this.addCssClasses(buttonElement);
        if (this.title) {
            buttonElement.setAttribute("aria-label", this.title);
        }
        buttonElement.type = "button";
        buttonElement.style.display = "flex";
        buttonElement.style.alignItems = "center";
        buttonElement.style.justifyContent = "center";
        buttonElement.setAttribute("role", this.getAriaRole());
        var titleElement = document.createElement("div");
        titleElement.style.overflow = "hidden";
        titleElement.style.textOverflow = "ellipsis";
        if (!(hostConfig.actions.iconPlacement == Enums.ActionIconPlacement.AboveTitle || hostConfig.actions.allowTitleToWrap)) {
            titleElement.style.whiteSpace = "nowrap";
        }
        if (this.title) {
            titleElement.innerText = this.title;
        }
        if (!this.iconUrl) {
            buttonElement.classList.add("noIcon");
            buttonElement.appendChild(titleElement);
        }
        else {
            var iconElement = document.createElement("img");
            iconElement.src = this.iconUrl;
            iconElement.style.width = hostConfig.actions.iconSize + "px";
            iconElement.style.height = hostConfig.actions.iconSize + "px";
            iconElement.style.flex = "0 0 auto";
            if (hostConfig.actions.iconPlacement == Enums.ActionIconPlacement.AboveTitle) {
                buttonElement.classList.add("iconAbove");
                buttonElement.style.flexDirection = "column";
                if (this.title) {
                    iconElement.style.marginBottom = "6px";
                }
            }
            else {
                buttonElement.classList.add("iconLeft");
                iconElement.style.maxHeight = "100%";
                if (this.title) {
                    iconElement.style.marginRight = "6px";
                }
            }
            buttonElement.appendChild(iconElement);
            buttonElement.appendChild(titleElement);
        }
        this._renderedElement = buttonElement;
    };
    Action.prototype.execute = function () {
        if (this._actionCollection) {
            this._actionCollection.actionExecuted(this);
        }
        this.raiseExecuteActionEvent();
    };
    Action.prototype.prepareForExecution = function () {
        var referencedInputs = this.getReferencedInputs();
        var invalidInputs = this.internalValidateInputs(referencedInputs);
        if (invalidInputs.length > 0) {
            invalidInputs[0].focus();
            return false;
        }
        this.internalPrepareForExecution(referencedInputs);
        return true;
    };
    ;
    Action.prototype.remove = function () {
        if (this._actionCollection) {
            return this._actionCollection.removeAction(this);
        }
        return false;
    };
    Action.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        return [];
    };
    Action.prototype.getResourceInformation = function () {
        return this.iconUrl ? [{ url: this.iconUrl, mimeType: "image" }] : [];
    };
    Action.prototype.getActionById = function (id) {
        return this.id === id ? this : undefined;
    };
    Action.prototype.getReferencedInputs = function () {
        return this.internalGetReferencedInputs();
    };
    /**
     * Validates the inputs associated with this action.
     *
     * @returns A list of inputs that failed validation, or an empty array if no input failed validation.
     */
    Action.prototype.validateInputs = function () {
        return this.internalValidateInputs(this.getReferencedInputs());
    };
    Object.defineProperty(Action.prototype, "isPrimary", {
        get: function () {
            return this.style == Enums.ActionStyle.Positive;
        },
        set: function (value) {
            if (value) {
                this.style = Enums.ActionStyle.Positive;
            }
            else {
                if (this.style == Enums.ActionStyle.Positive) {
                    this.style = Enums.ActionStyle.Default;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "ignoreInputValidation", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "hostConfig", {
        get: function () {
            return this.parent ? this.parent.hostConfig : host_config_1.defaultHostConfig;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    Action.titleProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "title");
    Action.iconUrlProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_1, "iconUrl");
    Action.styleProperty = new serialization_1.ValueSetProperty(serialization_1.Versions.v1_2, "style", [
        { value: Enums.ActionStyle.Default },
        { value: Enums.ActionStyle.Positive },
        { value: Enums.ActionStyle.Destructive }
    ], Enums.ActionStyle.Default);
    // TODO: Revise this when finalizing input validation
    Action.ignoreInputValidationProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_3, "ignoreInputValidation", false);
    __decorate([
        serialization_1.property(Action.titleProperty)
    ], Action.prototype, "title", void 0);
    __decorate([
        serialization_1.property(Action.iconUrlProperty)
    ], Action.prototype, "iconUrl", void 0);
    __decorate([
        serialization_1.property(Action.styleProperty)
    ], Action.prototype, "style", void 0);
    return Action;
}(card_object_1.CardObject));
exports.Action = Action;
var SubmitAction = /** @class */ (function (_super) {
    __extends(SubmitAction, _super);
    function SubmitAction() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._ignoreInputValidation = false;
        _this._isPrepared = false;
        return _this;
    }
    SubmitAction.prototype.internalGetReferencedInputs = function () {
        var result = {};
        var current = this.parent;
        var inputs = [];
        while (current) {
            inputs = inputs.concat(current.getAllInputs(false));
            current = current.parent;
        }
        for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
            var input = inputs_1[_i];
            if (input.id) {
                result[input.id] = input;
            }
        }
        return result;
    };
    SubmitAction.prototype.internalPrepareForExecution = function (inputs) {
        if (this._originalData) {
            this._processedData = JSON.parse(JSON.stringify(this._originalData));
        }
        else {
            this._processedData = {};
        }
        if (this._processedData && inputs) {
            for (var _i = 0, _a = Object.keys(inputs); _i < _a.length; _i++) {
                var key = _a[_i];
                var input = inputs[key];
                if (input.id) {
                    this._processedData[input.id] = input.value;
                }
            }
        }
        this._isPrepared = true;
    };
    SubmitAction.prototype.getJsonTypeName = function () {
        return SubmitAction.JsonTypeName;
    };
    Object.defineProperty(SubmitAction.prototype, "ignoreInputValidation", {
        get: function () {
            return this._ignoreInputValidation;
        },
        set: function (value) {
            this._ignoreInputValidation = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubmitAction.prototype, "data", {
        get: function () {
            return this._isPrepared ? this._processedData : this._originalData;
        },
        set: function (value) {
            this._originalData = value;
            this._isPrepared = false;
        },
        enumerable: false,
        configurable: true
    });
    SubmitAction.dataProperty = new serialization_1.PropertyDefinition(serialization_1.Versions.v1_0, "data");
    //#endregion
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    SubmitAction.JsonTypeName = "Action.Submit";
    __decorate([
        serialization_1.property(SubmitAction.dataProperty)
    ], SubmitAction.prototype, "_originalData", void 0);
    __decorate([
        serialization_1.property(Action.ignoreInputValidationProperty)
    ], SubmitAction.prototype, "_ignoreInputValidation", void 0);
    return SubmitAction;
}(Action));
exports.SubmitAction = SubmitAction;
var SubmitQueryAction = /** @class */ (function (_super) {
    __extends(SubmitQueryAction, _super);
    function SubmitQueryAction() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._ignoreInputValidation = false;
        _this._isPrepared = false;
        return _this;
    }
    SubmitQueryAction.prototype.internalGetReferencedInputs = function () {
        var result = {};
        var current = this.parent;
        var inputs = [];
        while (current) {
            inputs = inputs.concat(current.getAllInputs(false));
            current = current.parent;
        }
        for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
            var input = inputs_2[_i];
            if (input.id) {
                result[input.id] = input;
            }
        }
        return result;
    };
    SubmitQueryAction.prototype.internalPrepareForExecution = function (inputs) {
        if (this._originalData) {
            this._processedData = JSON.parse(JSON.stringify(this._originalData));
        }
        else {
            this._processedData = {};
        }
        if (this._processedData && inputs) {
            for (var _i = 0, _a = Object.keys(inputs); _i < _a.length; _i++) {
                var key = _a[_i];
                var input = inputs[key];
                if (input.id) {
                    this._processedData[input.id] = input.value;
                }
            }
        }
        this._isPrepared = true;
    };
    SubmitQueryAction.prototype.getJsonTypeName = function () {
        return SubmitQueryAction.JsonTypeName;
    };
    Object.defineProperty(SubmitQueryAction.prototype, "ignoreInputValidation", {
        get: function () {
            return this._ignoreInputValidation;
        },
        set: function (value) {
            this._ignoreInputValidation = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubmitQueryAction.prototype, "query", {
        get: function () {
            return this._isPrepared ? this._processedData : this._originalData;
        },
        set: function (value) {
            this._originalData = value;
            this._isPrepared = false;
        },
        enumerable: false,
        configurable: true
    });
    SubmitQueryAction.dataProperty = new serialization_1.PropertyDefinition(serialization_1.Versions.v1_0, "query");
    //#endregion
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    SubmitQueryAction.JsonTypeName = "Action.SubmitQuery";
    __decorate([
        serialization_1.property(SubmitQueryAction.dataProperty)
    ], SubmitQueryAction.prototype, "_originalData", void 0);
    __decorate([
        serialization_1.property(Action.ignoreInputValidationProperty)
    ], SubmitQueryAction.prototype, "_ignoreInputValidation", void 0);
    return SubmitQueryAction;
}(Action));
exports.SubmitQueryAction = SubmitQueryAction;
var OpenUrlAction = /** @class */ (function (_super) {
    __extends(OpenUrlAction, _super);
    function OpenUrlAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenUrlAction.prototype.getJsonTypeName = function () {
        return OpenUrlAction.JsonTypeName;
    };
    OpenUrlAction.prototype.getAriaRole = function () {
        return "link";
    };
    OpenUrlAction.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (!this.url) {
            context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.propertyMustBeSet("url"));
        }
    };
    OpenUrlAction.prototype.getHref = function () {
        return this.url;
    };
    //#region Schema
    OpenUrlAction.urlProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "url");
    //#endregion
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    OpenUrlAction.JsonTypeName = "Action.OpenUrl";
    __decorate([
        serialization_1.property(OpenUrlAction.urlProperty)
    ], OpenUrlAction.prototype, "url", void 0);
    return OpenUrlAction;
}(Action));
exports.OpenUrlAction = OpenUrlAction;
var ToggleVisibilityAction = /** @class */ (function (_super) {
    __extends(ToggleVisibilityAction, _super);
    function ToggleVisibilityAction() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.targetElements = {};
        return _this;
    }
    ToggleVisibilityAction.prototype.updateAriaControlsAttribute = function () {
        // apply aria labels to make it clear which elements this action will toggle
        if (this.targetElements) {
            var elementIds = Object.keys(this.targetElements);
            if (this._renderedElement) {
                if (elementIds.length > 0) {
                    this._renderedElement.setAttribute("aria-controls", elementIds.join(" "));
                }
                else {
                    this._renderedElement.removeAttribute("aria-controls");
                }
            }
        }
    };
    ToggleVisibilityAction.prototype.getJsonTypeName = function () {
        return ToggleVisibilityAction.JsonTypeName;
    };
    ToggleVisibilityAction.prototype.render = function (baseCssClass) {
        if (baseCssClass === void 0) { baseCssClass = "ac-pushButton"; }
        _super.prototype.render.call(this, baseCssClass);
        this.updateAriaControlsAttribute();
    };
    ToggleVisibilityAction.prototype.execute = function () {
        if (this.parent) {
            for (var _i = 0, _a = Object.keys(this.targetElements); _i < _a.length; _i++) {
                var elementId = _a[_i];
                var targetElement = this.parent.getRootElement().getElementById(elementId);
                if (targetElement) {
                    if (typeof this.targetElements[elementId] === "boolean") {
                        targetElement.isVisible = this.targetElements[elementId];
                    }
                    else {
                        targetElement.isVisible = !targetElement.isVisible;
                    }
                }
            }
        }
    };
    ToggleVisibilityAction.prototype.addTargetElement = function (elementId, isVisible) {
        if (isVisible === void 0) { isVisible = undefined; }
        this.targetElements[elementId] = isVisible;
        this.updateAriaControlsAttribute();
    };
    ToggleVisibilityAction.prototype.removeTargetElement = function (elementId) {
        delete this.targetElements[elementId];
        this.updateAriaControlsAttribute();
    };
    ToggleVisibilityAction.targetElementsProperty = new serialization_1.CustomProperty(serialization_1.Versions.v1_2, "targetElements", function (sender, property, source, context) {
        var result = {};
        if (Array.isArray(source[property.name])) {
            for (var _i = 0, _a = source[property.name]; _i < _a.length; _i++) {
                var item = _a[_i];
                if (typeof item === "string") {
                    result[item] = undefined;
                }
                else if (typeof item === "object") {
                    var elementId = item["elementId"];
                    if (typeof elementId === "string") {
                        result[elementId] = Utils.parseBool(item["isVisible"]);
                    }
                }
            }
        }
        return result;
    }, function (sender, property, target, value, context) {
        var targetElements = [];
        for (var _i = 0, _a = Object.keys(value); _i < _a.length; _i++) {
            var id = _a[_i];
            if (typeof value[id] === "boolean") {
                targetElements.push({
                    elementId: id,
                    isVisible: value[id]
                });
            }
            else {
                targetElements.push(id);
            }
        }
        context.serializeArray(target, property.name, targetElements);
    }, {}, function (sender) { return {}; });
    //#endregion
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    ToggleVisibilityAction.JsonTypeName = "Action.ToggleVisibility";
    __decorate([
        serialization_1.property(ToggleVisibilityAction.targetElementsProperty)
    ], ToggleVisibilityAction.prototype, "targetElements", void 0);
    return ToggleVisibilityAction;
}(Action));
exports.ToggleVisibilityAction = ToggleVisibilityAction;
var StringWithSubstitutionProperty = /** @class */ (function (_super) {
    __extends(StringWithSubstitutionProperty, _super);
    function StringWithSubstitutionProperty(targetVersion, name) {
        var _this = _super.call(this, targetVersion, name, undefined, function () { return new shared_1.StringWithSubstitutions(); }) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        return _this;
    }
    StringWithSubstitutionProperty.prototype.parse = function (sender, source, context) {
        var result = new shared_1.StringWithSubstitutions();
        result.set(Utils.parseString(source[this.name]));
        return result;
    };
    StringWithSubstitutionProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, value.getOriginal());
    };
    return StringWithSubstitutionProperty;
}(serialization_1.PropertyDefinition));
var HttpHeader = /** @class */ (function (_super) {
    __extends(HttpHeader, _super);
    //#endregion
    function HttpHeader(name, value) {
        if (name === void 0) { name = ""; }
        if (value === void 0) { value = ""; }
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    HttpHeader.prototype.getSchemaKey = function () {
        return "HttpHeader";
    };
    HttpHeader.prototype.getReferencedInputs = function (inputs, referencedInputs) {
        this._value.getReferencedInputs(inputs, referencedInputs);
    };
    HttpHeader.prototype.prepareForExecution = function (inputs) {
        this._value.substituteInputValues(inputs, shared_1.ContentTypes.applicationXWwwFormUrlencoded);
    };
    Object.defineProperty(HttpHeader.prototype, "value", {
        get: function () {
            return this._value.get();
        },
        set: function (newValue) {
            this._value.set(newValue);
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    HttpHeader.nameProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "name");
    HttpHeader.valueProperty = new StringWithSubstitutionProperty(serialization_1.Versions.v1_0, "value");
    __decorate([
        serialization_1.property(HttpHeader.nameProperty)
    ], HttpHeader.prototype, "name", void 0);
    __decorate([
        serialization_1.property(HttpHeader.valueProperty)
    ], HttpHeader.prototype, "_value", void 0);
    return HttpHeader;
}(serialization_1.SerializableObject));
exports.HttpHeader = HttpHeader;
var HttpAction = /** @class */ (function (_super) {
    __extends(HttpAction, _super);
    function HttpAction() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._ignoreInputValidation = false;
        return _this;
    }
    HttpAction.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        schema.add(Action.ignoreInputValidationProperty);
    };
    HttpAction.prototype.internalGetReferencedInputs = function () {
        var allInputs = this.parent ? this.parent.getRootElement().getAllInputs() : [];
        var result = {};
        this._url.getReferencedInputs(allInputs, result);
        for (var _i = 0, _a = this.headers; _i < _a.length; _i++) {
            var header = _a[_i];
            header.getReferencedInputs(allInputs, result);
        }
        this._body.getReferencedInputs(allInputs, result);
        return result;
    };
    HttpAction.prototype.internalPrepareForExecution = function (inputs) {
        if (inputs) {
            this._url.substituteInputValues(inputs, shared_1.ContentTypes.applicationXWwwFormUrlencoded);
            var contentType = shared_1.ContentTypes.applicationJson;
            for (var _i = 0, _a = this.headers; _i < _a.length; _i++) {
                var header = _a[_i];
                header.prepareForExecution(inputs);
                if (header.name && header.name.toLowerCase() == "content-type") {
                    contentType = header.value;
                }
            }
            this._body.substituteInputValues(inputs, contentType);
        }
    };
    ;
    HttpAction.prototype.getJsonTypeName = function () {
        return HttpAction.JsonTypeName;
    };
    HttpAction.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (!this.url) {
            context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.propertyMustBeSet("url"));
        }
        if (this.headers.length > 0) {
            for (var _i = 0, _a = this.headers; _i < _a.length; _i++) {
                var header = _a[_i];
                if (!header.name) {
                    context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.actionHttpHeadersMustHaveNameAndValue());
                }
            }
        }
    };
    Object.defineProperty(HttpAction.prototype, "ignoreInputValidation", {
        get: function () {
            return this._ignoreInputValidation;
        },
        set: function (value) {
            this._ignoreInputValidation = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpAction.prototype, "url", {
        get: function () {
            return this._url.get();
        },
        set: function (value) {
            this._url.set(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpAction.prototype, "body", {
        get: function () {
            return this._body.get();
        },
        set: function (value) {
            this._body.set(value);
        },
        enumerable: false,
        configurable: true
    });
    HttpAction.urlProperty = new StringWithSubstitutionProperty(serialization_1.Versions.v1_0, "url");
    HttpAction.bodyProperty = new StringWithSubstitutionProperty(serialization_1.Versions.v1_0, "body");
    HttpAction.methodProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "method");
    HttpAction.headersProperty = new serialization_1.SerializableObjectCollectionProperty(serialization_1.Versions.v1_0, "headers", HttpHeader);
    //#endregion
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    HttpAction.JsonTypeName = "Action.Http";
    __decorate([
        serialization_1.property(HttpAction.urlProperty)
    ], HttpAction.prototype, "_url", void 0);
    __decorate([
        serialization_1.property(HttpAction.bodyProperty)
    ], HttpAction.prototype, "_body", void 0);
    __decorate([
        serialization_1.property(HttpAction.methodProperty)
    ], HttpAction.prototype, "method", void 0);
    __decorate([
        serialization_1.property(HttpAction.headersProperty)
    ], HttpAction.prototype, "headers", void 0);
    __decorate([
        serialization_1.property(Action.ignoreInputValidationProperty)
    ], HttpAction.prototype, "_ignoreInputValidation", void 0);
    return HttpAction;
}(Action));
exports.HttpAction = HttpAction;
var ShowCardAction = /** @class */ (function (_super) {
    __extends(ShowCardAction, _super);
    function ShowCardAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.card = new InlineGenietalkCard();
        return _this;
    }
    ShowCardAction.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        var jsonCard = source["card"];
        if (jsonCard) {
            this.card.parse(jsonCard, context);
        }
        else {
            context.logParseEvent(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.showCardMustHaveCard());
        }
    };
    ShowCardAction.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        if (this.card) {
            context.serializeValue(target, "card", this.card.toJSON(context));
        }
    };
    ShowCardAction.prototype.addCssClasses = function (element) {
        _super.prototype.addCssClasses.call(this, element);
        if (this.parent) {
            element.classList.add(this.parent.hostConfig.makeCssClassName("expandable"));
        }
    };
    ShowCardAction.prototype.raiseExecuteActionEvent = function () {
        if (this.hostConfig.actions.showCard.actionMode === Enums.ShowCardActionMode.Popup) {
            // Only raise the event in Popup mode.
            _super.prototype.raiseExecuteActionEvent.call(this);
        }
    };
    ShowCardAction.prototype.getJsonTypeName = function () {
        return ShowCardAction.JsonTypeName;
    };
    ShowCardAction.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        this.card.internalValidateProperties(context);
    };
    ShowCardAction.prototype.updateActionButtonCssStyle = function (actionButtonElement, buttonState) {
        if (buttonState === void 0) { buttonState = 0 /* Normal */; }
        _super.prototype.updateActionButtonCssStyle.call(this, actionButtonElement);
        if (this.parent) {
            actionButtonElement.classList.add(this.parent.hostConfig.makeCssClassName("expandable"));
            actionButtonElement.setAttribute("aria-expanded", (buttonState === 1 /* Expanded */).toString());
        }
    };
    ShowCardAction.prototype.setParent = function (value) {
        _super.prototype.setParent.call(this, value);
        this.card.setParent(value);
    };
    ShowCardAction.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        return this.card.getAllInputs(processActions);
    };
    ShowCardAction.prototype.getResourceInformation = function () {
        return _super.prototype.getResourceInformation.call(this).concat(this.card.getResourceInformation());
    };
    ShowCardAction.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result) {
            result = this.card.getActionById(id);
        }
        return result;
    };
    // Note the "weird" way this field is declared is to work around a breaking
    // change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    ShowCardAction.JsonTypeName = "Action.ShowCard";
    return ShowCardAction;
}(Action));
exports.ShowCardAction = ShowCardAction;
var ActionCollection = /** @class */ (function () {
    function ActionCollection(owner) {
        this._renderedActionCount = 0;
        this.items = [];
        this.buttons = [];
        this._owner = owner;
    }
    ActionCollection.prototype.isActionAllowed = function (action) {
        var forbiddenTypes = this._owner.getForbiddenActionTypes();
        if (forbiddenTypes) {
            for (var _i = 0, forbiddenTypes_1 = forbiddenTypes; _i < forbiddenTypes_1.length; _i++) {
                var forbiddenType = forbiddenTypes_1[_i];
                if (action.constructor === forbiddenType) {
                    return false;
                }
            }
        }
        return true;
    };
    ActionCollection.prototype.refreshContainer = function () {
        this._actionCardContainer.innerHTML = "";
        if (!this._actionCard) {
            this._actionCardContainer.style.marginTop = "0px";
            return;
        }
        this._actionCardContainer.style.marginTop = this._renderedActionCount > 0 ? this._owner.hostConfig.actions.showCard.inlineTopMargin + "px" : "0px";
        var padding = this._owner.getEffectivePadding();
        this._owner.getImmediateSurroundingPadding(padding);
        var physicalPadding = this._owner.hostConfig.paddingDefinitionToSpacingDefinition(padding);
        if (this._actionCard) {
            this._actionCard.style.paddingLeft = physicalPadding.left + "px";
            this._actionCard.style.paddingRight = physicalPadding.right + "px";
            this._actionCard.style.marginLeft = "-" + physicalPadding.left + "px";
            this._actionCard.style.marginRight = "-" + physicalPadding.right + "px";
            if (physicalPadding.bottom != 0 && !this._owner.isDesignMode()) {
                this._actionCard.style.paddingBottom = physicalPadding.bottom + "px";
                this._actionCard.style.marginBottom = "-" + physicalPadding.bottom + "px";
            }
            Utils.appendChild(this._actionCardContainer, this._actionCard);
        }
    };
    ActionCollection.prototype.layoutChanged = function () {
        this._owner.getRootElement().updateLayout();
    };
    ActionCollection.prototype.showActionCard = function (action, suppressStyle, raiseEvent) {
        if (suppressStyle === void 0) { suppressStyle = false; }
        if (raiseEvent === void 0) { raiseEvent = true; }
        action.card.suppressStyle = suppressStyle;
        // Always re-render a ShowCard action in design mode; reuse already rendered ShowCard (if available) otherwise
        var renderedCard = action.card.renderedElement && !this._owner.isDesignMode() ? action.card.renderedElement : action.card.render();
        this._actionCard = renderedCard;
        this._expandedAction = action;
        this.refreshContainer();
        if (raiseEvent) {
            this.layoutChanged();
            raiseInlineCardExpandedEvent(action, true);
        }
    };
    ActionCollection.prototype.collapseExpandedAction = function () {
        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
            var button = _a[_i];
            button.state = 0 /* Normal */;
        }
        var previouslyExpandedAction = this._expandedAction;
        this._expandedAction = undefined;
        this._actionCard = undefined;
        this.refreshContainer();
        if (previouslyExpandedAction) {
            this.layoutChanged();
            raiseInlineCardExpandedEvent(previouslyExpandedAction, false);
        }
    };
    ActionCollection.prototype.expandShowCardAction = function (action, raiseEvent) {
        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
            var button = _a[_i];
            if (button.action !== action) {
                button.state = 2 /* Subdued */;
            }
            else {
                button.state = 1 /* Expanded */;
            }
        }
        this.showActionCard(action, !(this._owner.isAtTheVeryLeft() && this._owner.isAtTheVeryRight()), raiseEvent);
    };
    ActionCollection.prototype.getParentContainer = function () {
        if (this._owner instanceof Container) {
            return this._owner;
        }
        else {
            return this._owner.getParentContainer();
        }
    };
    ActionCollection.prototype.findActionButton = function (action) {
        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
            var actionButton = _a[_i];
            if (actionButton.action == action) {
                return actionButton;
            }
        }
        return undefined;
    };
    ActionCollection.prototype.actionExecuted = function (action) {
        if (!(action instanceof ShowCardAction)) {
            this.collapseExpandedAction();
        }
        else {
            if (action === this._expandedAction) {
                this.collapseExpandedAction();
            }
            else {
                this.expandShowCardAction(action, true);
            }
        }
    };
    ActionCollection.prototype.parse = function (source, context) {
        this.clear();
        if (Array.isArray(source)) {
            for (var _i = 0, source_1 = source; _i < source_1.length; _i++) {
                var jsonAction = source_1[_i];
                var action = context.parseAction(this._owner, jsonAction, [], !this._owner.isDesignMode());
                if (action) {
                    this.addAction(action);
                }
            }
        }
    };
    ActionCollection.prototype.toJSON = function (target, propertyName, context) {
        context.serializeArray(target, propertyName, this.items);
    };
    ActionCollection.prototype.getActionById = function (id) {
        var result = undefined;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            result = item.getActionById(id);
            if (result) {
                break;
            }
        }
        return result;
    };
    ActionCollection.prototype.validateProperties = function (context) {
        if (this._owner.hostConfig.actions.maxActions && this.items.length > this._owner.hostConfig.actions.maxActions) {
            context.addFailure(this._owner, Enums.ValidationEvent.TooManyActions, strings_1.Strings.errors.tooManyActions(this._owner.hostConfig.actions.maxActions));
        }
        if (this.items.length > 0 && !this._owner.hostConfig.supportsInteractivity) {
            context.addFailure(this._owner, Enums.ValidationEvent.InteractivityNotAllowed, strings_1.Strings.errors.interactivityNotAllowed());
        }
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!this.isActionAllowed(item)) {
                context.addFailure(this._owner, Enums.ValidationEvent.ActionTypeNotAllowed, strings_1.Strings.errors.actionTypeNotAllowed(item.getJsonTypeName()));
            }
            item.internalValidateProperties(context);
        }
    };
    ActionCollection.prototype.render = function (orientation, isDesignMode) {
        // Cache hostConfig for better perf
        var hostConfig = this._owner.hostConfig;
        if (!hostConfig.supportsInteractivity) {
            return undefined;
        }
        var element = document.createElement("div");
        var maxActions = hostConfig.actions.maxActions ? Math.min(hostConfig.actions.maxActions, this.items.length) : this.items.length;
        this._actionCardContainer = document.createElement("div");
        this._renderedActionCount = 0;
        if (hostConfig.actions.preExpandSingleShowCardAction && maxActions == 1 && this.items[0] instanceof ShowCardAction && this.isActionAllowed(this.items[0])) {
            this.showActionCard(this.items[0], true);
            this._renderedActionCount = 1;
        }
        else {
            var buttonStrip = document.createElement("div");
            buttonStrip.className = hostConfig.makeCssClassName("ac-actionSet");
            buttonStrip.style.display = "flex";
            buttonStrip.setAttribute("role", "menubar");
            if (orientation == Enums.Orientation.Horizontal) {
                buttonStrip.style.flexDirection = "row";
                if (this._owner.horizontalAlignment && hostConfig.actions.actionAlignment != Enums.ActionAlignment.Stretch) {
                    switch (this._owner.horizontalAlignment) {
                        case Enums.HorizontalAlignment.Center:
                            buttonStrip.style.justifyContent = "center";
                            break;
                        case Enums.HorizontalAlignment.Right:
                            buttonStrip.style.justifyContent = "flex-end";
                            break;
                        default:
                            buttonStrip.style.justifyContent = "flex-start";
                            break;
                    }
                }
                else {
                    switch (hostConfig.actions.actionAlignment) {
                        case Enums.ActionAlignment.Center:
                            buttonStrip.style.justifyContent = "center";
                            break;
                        case Enums.ActionAlignment.Right:
                            buttonStrip.style.justifyContent = "flex-end";
                            break;
                        default:
                            buttonStrip.style.justifyContent = "flex-start";
                            break;
                    }
                }
            }
            else {
                buttonStrip.style.flexDirection = "column";
                if (this._owner.horizontalAlignment && hostConfig.actions.actionAlignment != Enums.ActionAlignment.Stretch) {
                    switch (this._owner.horizontalAlignment) {
                        case Enums.HorizontalAlignment.Center:
                            buttonStrip.style.alignItems = "center";
                            break;
                        case Enums.HorizontalAlignment.Right:
                            buttonStrip.style.alignItems = "flex-end";
                            break;
                        default:
                            buttonStrip.style.alignItems = "flex-start";
                            break;
                    }
                }
                else {
                    switch (hostConfig.actions.actionAlignment) {
                        case Enums.ActionAlignment.Center:
                            buttonStrip.style.alignItems = "center";
                            break;
                        case Enums.ActionAlignment.Right:
                            buttonStrip.style.alignItems = "flex-end";
                            break;
                        case Enums.ActionAlignment.Stretch:
                            buttonStrip.style.alignItems = "stretch";
                            break;
                        default:
                            buttonStrip.style.alignItems = "flex-start";
                            break;
                    }
                }
            }
            var parentContainer = this.getParentContainer();
            if (parentContainer) {
                var parentContainerStyle = parentContainer.getEffectiveStyle();
                var allowedActions = this.items.filter(this.isActionAllowed.bind(this));
                for (var i = 0; i < allowedActions.length; i++) {
                    var actionButton = this.findActionButton(allowedActions[i]);
                    if (!actionButton) {
                        actionButton = new ActionButton(allowedActions[i], parentContainerStyle);
                        actionButton.onClick = function (ab) { ab.action.execute(); };
                        this.buttons.push(actionButton);
                    }
                    actionButton.render();
                    if (actionButton.action.renderedElement) {
                        actionButton.action.renderedElement.setAttribute("aria-posinset", (i + 1).toString());
                        actionButton.action.renderedElement.setAttribute("aria-setsize", allowedActions.length.toString());
                        actionButton.action.renderedElement.setAttribute("role", "menuitem");
                        if (hostConfig.actions.actionsOrientation == Enums.Orientation.Horizontal && hostConfig.actions.actionAlignment == Enums.ActionAlignment.Stretch) {
                            actionButton.action.renderedElement.style.flex = "0 1 100%";
                        }
                        else {
                            actionButton.action.renderedElement.style.flex = "0 1 auto";
                        }
                        buttonStrip.appendChild(actionButton.action.renderedElement);
                        this._renderedActionCount++;
                        if (this._renderedActionCount >= hostConfig.actions.maxActions || i == this.items.length - 1) {
                            break;
                        }
                        else if (hostConfig.actions.buttonSpacing > 0) {
                            var spacer = document.createElement("div");
                            if (orientation === Enums.Orientation.Horizontal) {
                                spacer.style.flex = "0 0 auto";
                                spacer.style.width = hostConfig.actions.buttonSpacing + "px";
                            }
                            else {
                                spacer.style.height = hostConfig.actions.buttonSpacing + "px";
                            }
                            Utils.appendChild(buttonStrip, spacer);
                        }
                    }
                }
            }
            var buttonStripContainer = document.createElement("div");
            buttonStripContainer.style.overflow = "hidden";
            buttonStripContainer.appendChild(buttonStrip);
            Utils.appendChild(element, buttonStripContainer);
        }
        Utils.appendChild(element, this._actionCardContainer);
        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
            var button = _a[_i];
            if (button.state == 1 /* Expanded */) {
                this.expandShowCardAction(button.action, false);
                break;
            }
        }
        return this._renderedActionCount > 0 ? element : undefined;
    };
    ActionCollection.prototype.addAction = function (action) {
        if (!action) {
            throw new Error("The action parameter cannot be null.");
        }
        if ((!action.parent || action.parent === this._owner) && this.items.indexOf(action) < 0) {
            this.items.push(action);
            if (!action.parent) {
                action.setParent(this._owner);
            }
            action["_actionCollection"] = this;
        }
        else {
            throw new Error(strings_1.Strings.errors.actionAlreadyParented());
        }
    };
    ActionCollection.prototype.removeAction = function (action) {
        if (this.expandedAction && this._expandedAction == action) {
            this.collapseExpandedAction();
        }
        var actionIndex = this.items.indexOf(action);
        if (actionIndex >= 0) {
            this.items.splice(actionIndex, 1);
            action.setParent(undefined);
            action["_actionCollection"] = undefined;
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].action == action) {
                    this.buttons.splice(i, 1);
                    break;
                }
            }
            return true;
        }
        return false;
    };
    ActionCollection.prototype.clear = function () {
        this.items = [];
        this.buttons = [];
        this._expandedAction = undefined;
        this._renderedActionCount = 0;
    };
    ActionCollection.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        var result = [];
        if (processActions) {
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var action = _a[_i];
                result = result.concat(action.getAllInputs());
            }
        }
        return result;
    };
    ActionCollection.prototype.getResourceInformation = function () {
        var result = [];
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var action = _a[_i];
            result = result.concat(action.getResourceInformation());
        }
        return result;
    };
    Object.defineProperty(ActionCollection.prototype, "renderedActionCount", {
        get: function () {
            return this._renderedActionCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActionCollection.prototype, "expandedAction", {
        get: function () {
            return this._expandedAction;
        },
        enumerable: false,
        configurable: true
    });
    return ActionCollection;
}());
var ActionSet = /** @class */ (function (_super) {
    __extends(ActionSet, _super);
    function ActionSet() {
        var _this = _super.call(this) || this;
        _this._actionCollection = new ActionCollection(_this);
        return _this;
    }
    ActionSet.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this._actionCollection.parse(source["actions"], context);
    };
    ActionSet.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        this._actionCollection.toJSON(target, "actions", context);
    };
    ActionSet.prototype.internalRender = function () {
        return this._actionCollection.render(this.orientation !== undefined ? this.orientation : this.hostConfig.actions.actionsOrientation, this.isDesignMode());
    };
    ActionSet.prototype.isBleedingAtBottom = function () {
        if (this._actionCollection.renderedActionCount == 0) {
            return _super.prototype.isBleedingAtBottom.call(this);
        }
        else {
            if (this._actionCollection.items.length == 1) {
                return this._actionCollection.expandedAction !== undefined && !this.hostConfig.actions.preExpandSingleShowCardAction;
            }
            else {
                return this._actionCollection.expandedAction !== undefined;
            }
        }
    };
    ActionSet.prototype.getJsonTypeName = function () {
        return "ActionSet";
    };
    ActionSet.prototype.getActionCount = function () {
        return this._actionCollection.items.length;
    };
    ActionSet.prototype.getActionAt = function (index) {
        if (index >= 0 && index < this.getActionCount()) {
            return this._actionCollection.items[index];
        }
        else {
            return _super.prototype.getActionAt.call(this, index);
        }
    };
    ActionSet.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        this._actionCollection.validateProperties(context);
    };
    ActionSet.prototype.addAction = function (action) {
        this._actionCollection.addAction(action);
    };
    ActionSet.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        return processActions ? this._actionCollection.getAllInputs() : [];
    };
    ActionSet.prototype.getResourceInformation = function () {
        return this._actionCollection.getResourceInformation();
    };
    Object.defineProperty(ActionSet.prototype, "isInteractive", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    ActionSet.orientationProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_1, "orientation", Enums.Orientation);
    __decorate([
        serialization_1.property(ActionSet.orientationProperty)
    ], ActionSet.prototype, "orientation", void 0);
    return ActionSet;
}(CardElement));
exports.ActionSet = ActionSet;
var StylableCardElementContainer = /** @class */ (function (_super) {
    __extends(StylableCardElementContainer, _super);
    function StylableCardElementContainer() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._bleed = false;
        return _this;
    }
    Object.defineProperty(StylableCardElementContainer.prototype, "style", {
        get: function () {
            if (this.allowCustomStyle) {
                var style = this.getValue(StylableCardElementContainer.styleProperty);
                if (style && this.hostConfig.containerStyles.getStyleByName(style)) {
                    return style;
                }
            }
            return undefined;
        },
        set: function (value) {
            this.setValue(StylableCardElementContainer.styleProperty, value);
        },
        enumerable: false,
        configurable: true
    });
    //#endregion
    StylableCardElementContainer.prototype.adjustRenderedElementSize = function (renderedElement) {
        _super.prototype.adjustRenderedElementSize.call(this, renderedElement);
        if (this.minPixelHeight) {
            renderedElement.style.minHeight = this.minPixelHeight + "px";
        }
    };
    StylableCardElementContainer.prototype.applyBackground = function () {
        if (this.renderedElement) {
            var styleDefinition = this.hostConfig.containerStyles.getStyleByName(this.style, this.hostConfig.containerStyles.getStyleByName(this.defaultStyle));
            if (styleDefinition.backgroundColor) {
                var bgColor = Utils.stringToCssColor(styleDefinition.backgroundColor);
                this.renderedElement.style.backgroundColor = bgColor;
                this.renderedElement.style.border = "1px solid " + bgColor;
            }
        }
    };
    StylableCardElementContainer.prototype.applyPadding = function () {
        _super.prototype.applyPadding.call(this);
        if (!this.renderedElement) {
            return;
        }
        var physicalPadding = new shared_1.SpacingDefinition();
        if (this.getEffectivePadding()) {
            physicalPadding = this.hostConfig.paddingDefinitionToSpacingDefinition(this.getEffectivePadding());
        }
        this.renderedElement.style.paddingTop = physicalPadding.top + "px";
        this.renderedElement.style.paddingRight = physicalPadding.right + "px";
        this.renderedElement.style.paddingBottom = physicalPadding.bottom + "px";
        this.renderedElement.style.paddingLeft = physicalPadding.left + "px";
        if (this.isBleeding()) {
            // Bleed into the first parent that does have padding
            var padding = new shared_1.PaddingDefinition();
            this.getImmediateSurroundingPadding(padding);
            var surroundingPadding = this.hostConfig.paddingDefinitionToSpacingDefinition(padding);
            console.log('surroundingPadding', surroundingPadding);
            this.renderedElement.style.marginRight = "-" + surroundingPadding.right + "px";
            this.renderedElement.style.marginLeft = "-" + surroundingPadding.left + "px";
            if (!this.isDesignMode()) {
                this.renderedElement.style.marginTop = "-" + surroundingPadding.top + "px";
                this.renderedElement.style.marginBottom = "-" + surroundingPadding.bottom + "px";
            }
            if (this.separatorElement && this.separatorOrientation == Enums.Orientation.Horizontal) {
                this.separatorElement.style.marginLeft = "-" + surroundingPadding.left + "px";
                this.separatorElement.style.marginRight = "-" + surroundingPadding.right + "px";
            }
        }
        else {
            this.renderedElement.style.marginRight = "0";
            this.renderedElement.style.marginLeft = "0";
            this.renderedElement.style.marginTop = "0";
            this.renderedElement.style.marginBottom = "0";
            if (this.separatorElement) {
                this.separatorElement.style.marginRight = "0";
                this.separatorElement.style.marginLeft = "0";
            }
        }
    };
    StylableCardElementContainer.prototype.getHasBackground = function () {
        var currentElement = this.parent;
        while (currentElement) {
            var currentElementHasBackgroundImage = currentElement instanceof Container ? currentElement.backgroundImage.isValid() : false;
            if (currentElement instanceof StylableCardElementContainer) {
                if (this.hasExplicitStyle && (currentElement.getEffectiveStyle() != this.getEffectiveStyle() || currentElementHasBackgroundImage)) {
                    return true;
                }
            }
            currentElement = currentElement.parent;
        }
        return false;
    };
    StylableCardElementContainer.prototype.getDefaultPadding = function () {
        return this.getHasBackground() ?
            new shared_1.PaddingDefinition(Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding) : _super.prototype.getDefaultPadding.call(this);
    };
    StylableCardElementContainer.prototype.getHasExpandedAction = function () {
        return false;
    };
    StylableCardElementContainer.prototype.getBleed = function () {
        return this._bleed;
    };
    StylableCardElementContainer.prototype.setBleed = function (value) {
        this._bleed = value;
    };
    Object.defineProperty(StylableCardElementContainer.prototype, "renderedActionCount", {
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StylableCardElementContainer.prototype, "hasExplicitStyle", {
        get: function () {
            return this.getValue(StylableCardElementContainer.styleProperty) !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StylableCardElementContainer.prototype, "allowCustomStyle", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    StylableCardElementContainer.prototype.isBleeding = function () {
        return (this.getHasBackground() || this.hostConfig.alwaysAllowBleed) && this.getBleed();
    };
    StylableCardElementContainer.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        var explicitStyle = this.getValue(StylableCardElementContainer.styleProperty);
        if (explicitStyle !== undefined) {
            var styleDefinition = this.hostConfig.containerStyles.getStyleByName(explicitStyle);
            if (!styleDefinition) {
                context.addFailure(this, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(explicitStyle, "style"));
            }
        }
    };
    StylableCardElementContainer.prototype.render = function () {
        var renderedElement = _super.prototype.render.call(this);
        if (renderedElement && this.getHasBackground()) {
            this.applyBackground();
        }
        return renderedElement;
    };
    StylableCardElementContainer.prototype.getEffectiveStyle = function () {
        var effectiveStyle = this.style;
        return effectiveStyle ? effectiveStyle : _super.prototype.getEffectiveStyle.call(this);
    };
    StylableCardElementContainer.styleProperty = new serialization_1.ValueSetProperty(serialization_1.Versions.v1_0, "style", [
        { value: Enums.ContainerStyle.Default },
        { value: Enums.ContainerStyle.Emphasis },
        { targetVersion: serialization_1.Versions.v1_2, value: Enums.ContainerStyle.Accent },
        { targetVersion: serialization_1.Versions.v1_2, value: Enums.ContainerStyle.Good },
        { targetVersion: serialization_1.Versions.v1_2, value: Enums.ContainerStyle.Attention },
        { targetVersion: serialization_1.Versions.v1_2, value: Enums.ContainerStyle.Warning }
    ]);
    StylableCardElementContainer.bleedProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_2, "bleed", false);
    StylableCardElementContainer.minHeightProperty = new serialization_1.PixelSizeProperty(serialization_1.Versions.v1_2, "minHeight");
    __decorate([
        serialization_1.property(StylableCardElementContainer.styleProperty)
    ], StylableCardElementContainer.prototype, "style", null);
    __decorate([
        serialization_1.property(StylableCardElementContainer.bleedProperty)
    ], StylableCardElementContainer.prototype, "_bleed", void 0);
    __decorate([
        serialization_1.property(StylableCardElementContainer.minHeightProperty)
    ], StylableCardElementContainer.prototype, "minPixelHeight", void 0);
    return StylableCardElementContainer;
}(CardElementContainer));
exports.StylableCardElementContainer = StylableCardElementContainer;
var BackgroundImage = /** @class */ (function (_super) {
    __extends(BackgroundImage, _super);
    function BackgroundImage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    //#endregion
    BackgroundImage.prototype.getSchemaKey = function () {
        return "BackgroundImage";
    };
    BackgroundImage.prototype.internalParse = function (source, context) {
        if (typeof source === "string") {
            this.resetDefaultValues();
            this.url = source;
        }
        else {
            return _super.prototype.internalParse.call(this, source, context);
        }
    };
    BackgroundImage.prototype.apply = function (element) {
        if (this.url && element.renderedElement) {
            element.renderedElement.style.backgroundImage = "url('" + element.preProcessPropertyValue(BackgroundImage.urlProperty, this.url) + "')";
            switch (this.fillMode) {
                case Enums.FillMode.Repeat:
                    element.renderedElement.style.backgroundRepeat = "repeat";
                    break;
                case Enums.FillMode.RepeatHorizontally:
                    element.renderedElement.style.backgroundRepeat = "repeat-x";
                    break;
                case Enums.FillMode.RepeatVertically:
                    element.renderedElement.style.backgroundRepeat = "repeat-y";
                    break;
                case Enums.FillMode.Cover:
                default:
                    element.renderedElement.style.backgroundRepeat = "no-repeat";
                    element.renderedElement.style.backgroundSize = "cover";
                    break;
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.renderedElement.style.backgroundPositionX = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.renderedElement.style.backgroundPositionX = "right";
                    break;
            }
            switch (this.verticalAlignment) {
                case Enums.VerticalAlignment.Center:
                    element.renderedElement.style.backgroundPositionY = "center";
                    break;
                case Enums.VerticalAlignment.Bottom:
                    element.renderedElement.style.backgroundPositionY = "bottom";
                    break;
            }
        }
    };
    BackgroundImage.prototype.isValid = function () {
        return this.url ? true : false;
    };
    //#region Schema
    BackgroundImage.urlProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "url");
    BackgroundImage.fillModeProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_2, "fillMode", Enums.FillMode, Enums.FillMode.Cover);
    BackgroundImage.horizontalAlignmentProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_2, "horizontalAlignment", Enums.HorizontalAlignment, Enums.HorizontalAlignment.Left);
    BackgroundImage.verticalAlignmentProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_2, "verticalAlignment", Enums.VerticalAlignment, Enums.VerticalAlignment.Top);
    __decorate([
        serialization_1.property(BackgroundImage.urlProperty)
    ], BackgroundImage.prototype, "url", void 0);
    __decorate([
        serialization_1.property(BackgroundImage.fillModeProperty)
    ], BackgroundImage.prototype, "fillMode", void 0);
    __decorate([
        serialization_1.property(BackgroundImage.horizontalAlignmentProperty)
    ], BackgroundImage.prototype, "horizontalAlignment", void 0);
    __decorate([
        serialization_1.property(BackgroundImage.verticalAlignmentProperty)
    ], BackgroundImage.prototype, "verticalAlignment", void 0);
    return BackgroundImage;
}(serialization_1.SerializableObject));
exports.BackgroundImage = BackgroundImage;
var Container = /** @class */ (function (_super) {
    __extends(Container, _super);
    function Container() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.verticalContentAlignment = Enums.VerticalAlignment.Top;
        //#endregion
        _this._items = [];
        _this._renderedItems = [];
        return _this;
    }
    Object.defineProperty(Container.prototype, "backgroundImage", {
        get: function () {
            return this.getValue(Container.backgroundImageProperty);
        },
        enumerable: false,
        configurable: true
    });
    Container.prototype.insertItemAt = function (item, index, forceInsert) {
        if (!item.parent || forceInsert) {
            if (item.isStandalone) {
                if (index < 0 || index >= this._items.length) {
                    this._items.push(item);
                }
                else {
                    this._items.splice(index, 0, item);
                }
                item.setParent(this);
            }
            else {
                throw new Error(strings_1.Strings.errors.elementTypeNotStandalone(item.getJsonTypeName()));
            }
        }
        else {
            throw new Error(strings_1.Strings.errors.elementAlreadyParented());
        }
    };
    Container.prototype.supportsExcplitiHeight = function () {
        return true;
    };
    Container.prototype.getItemsCollectionPropertyName = function () {
        return "items";
    };
    Container.prototype.applyBackground = function () {
        if (this.backgroundImage.isValid() && this.renderedElement) {
            this.backgroundImage.apply(this);
        }
        _super.prototype.applyBackground.call(this);
    };
    Container.prototype.internalRender = function () {
        this._renderedItems = [];
        // Cache hostConfig to avoid walking the parent hierarchy several times
        var hostConfig = this.hostConfig;
        var element = document.createElement("div");
        if (this.rtl !== undefined && this.rtl) {
            element.dir = "rtl";
        }
        element.classList.add(hostConfig.makeCssClassName("ac-container"));
        element.style.display = "flex";
        element.style.flexDirection = "column";
        if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation) {
            // Forces the container to be at least as tall as its content.
            //
            // Fixes a quirk in Chrome where, for nested flex elements, the
            // inner element's height would never exceed the outer element's
            // height. This caused overflow truncation to break -- containers
            // would always be measured as not overflowing, since their heights
            // were constrained by their parents as opposed to truly reflecting
            // the height of their content.
            //
            // See the "Browser Rendering Notes" section of this answer:
            // https://stackoverflow.com/questions/36247140/why-doesnt-flex-item-shrink-past-content-size
            element.style.minHeight = '-webkit-min-content';
        }
        switch (this.verticalContentAlignment) {
            case Enums.VerticalAlignment.Center:
                element.style.justifyContent = "center";
                break;
            case Enums.VerticalAlignment.Bottom:
                element.style.justifyContent = "flex-end";
                break;
            default:
                element.style.justifyContent = "flex-start";
                break;
        }
        if (this._items.length > 0) {
            for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                var item = _a[_i];
                var renderedItem = this.isElementAllowed(item) ? item.render() : undefined;
                if (renderedItem) {
                    if (this._renderedItems.length > 0 && item.separatorElement) {
                        item.separatorElement.style.flex = "0 0 auto";
                        Utils.appendChild(element, item.separatorElement);
                    }
                    Utils.appendChild(element, renderedItem);
                    this._renderedItems.push(item);
                }
            }
        }
        else {
            if (this.isDesignMode()) {
                var placeholderElement = this.createPlaceholderElement();
                placeholderElement.style.width = "100%";
                placeholderElement.style.height = "100%";
                element.appendChild(placeholderElement);
            }
        }
        return element;
    };
    Container.prototype.truncateOverflow = function (maxHeight) {
        if (this.renderedElement) {
            // Add 1 to account for rounding differences between browsers
            var boundary_1 = this.renderedElement.offsetTop + maxHeight + 1;
            var handleElement_1 = function (cardElement) {
                var elt = cardElement.renderedElement;
                if (elt) {
                    switch (Utils.getFitStatus(elt, boundary_1)) {
                        case Enums.ContainerFitStatus.FullyInContainer:
                            var sizeChanged = cardElement['resetOverflow']();
                            // If the element's size changed after resetting content,
                            // we have to check if it still fits fully in the card
                            if (sizeChanged) {
                                handleElement_1(cardElement);
                            }
                            break;
                        case Enums.ContainerFitStatus.Overflowing:
                            var maxHeight_1 = boundary_1 - elt.offsetTop;
                            cardElement['handleOverflow'](maxHeight_1);
                            break;
                        case Enums.ContainerFitStatus.FullyOutOfContainer:
                            cardElement['handleOverflow'](0);
                            break;
                    }
                }
            };
            for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                var item = _a[_i];
                handleElement_1(item);
            }
            return true;
        }
        return false;
    };
    Container.prototype.undoOverflowTruncation = function () {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            item['resetOverflow']();
        }
    };
    Container.prototype.getHasBackground = function () {
        return this.backgroundImage.isValid() || _super.prototype.getHasBackground.call(this);
    };
    Container.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this.clear();
        this.setShouldFallback(false);
        var jsonItems = source[this.getItemsCollectionPropertyName()];
        if (Array.isArray(jsonItems)) {
            for (var _i = 0, jsonItems_1 = jsonItems; _i < jsonItems_1.length; _i++) {
                var item = jsonItems_1[_i];
                var element = context.parseElement(this, item, !this.isDesignMode());
                if (element) {
                    this.insertItemAt(element, -1, true);
                }
            }
        }
    };
    Container.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        context.serializeArray(target, this.getItemsCollectionPropertyName(), this._items);
    };
    Object.defineProperty(Container.prototype, "isSelectable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Container.prototype.getItemCount = function () {
        return this._items.length;
    };
    Container.prototype.getItemAt = function (index) {
        return this._items[index];
    };
    Container.prototype.getFirstVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedItems && this._renderedItems.length > 0) {
            for (var _i = 0, _a = this._renderedItems; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.isVisible) {
                    return item;
                }
            }
            ;
        }
        return undefined;
    };
    Container.prototype.getLastVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedItems && this._renderedItems.length > 0) {
            for (var i = this._renderedItems.length - 1; i >= 0; i--) {
                if (this._renderedItems[i].isVisible) {
                    return this._renderedItems[i];
                }
            }
        }
        return undefined;
    };
    Container.prototype.getJsonTypeName = function () {
        return "Container";
    };
    Container.prototype.isFirstElement = function (element) {
        var designMode = this.isDesignMode();
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.isVisible || designMode) {
                return item == element;
            }
        }
        return false;
    };
    Container.prototype.isLastElement = function (element) {
        var designMode = this.isDesignMode();
        for (var i = this._items.length - 1; i >= 0; i--) {
            if (this._items[i].isVisible || designMode) {
                return this._items[i] == element;
            }
        }
        return false;
    };
    Container.prototype.isRtl = function () {
        if (this.rtl !== undefined) {
            return this.rtl;
        }
        else {
            var parentContainer = this.getParentContainer();
            return parentContainer ? parentContainer.isRtl() : false;
        }
    };
    Container.prototype.isBleedingAtTop = function () {
        var firstRenderedItem = this.getFirstVisibleRenderedItem();
        return this.isBleeding() || (firstRenderedItem ? firstRenderedItem.isBleedingAtTop() : false);
    };
    Container.prototype.isBleedingAtBottom = function () {
        var lastRenderedItem = this.getLastVisibleRenderedItem();
        return this.isBleeding() || (lastRenderedItem ? lastRenderedItem.isBleedingAtBottom() && lastRenderedItem.getEffectiveStyle() == this.getEffectiveStyle() : false);
    };
    Container.prototype.indexOf = function (cardElement) {
        return this._items.indexOf(cardElement);
    };
    Container.prototype.addItem = function (item) {
        this.insertItemAt(item, -1, false);
    };
    Container.prototype.insertItemBefore = function (item, insertBefore) {
        this.insertItemAt(item, this._items.indexOf(insertBefore), false);
    };
    Container.prototype.insertItemAfter = function (item, insertAfter) {
        this.insertItemAt(item, this._items.indexOf(insertAfter) + 1, false);
    };
    Container.prototype.removeItem = function (item) {
        var itemIndex = this._items.indexOf(item);
        if (itemIndex >= 0) {
            this._items.splice(itemIndex, 1);
            item.setParent(undefined);
            this.updateLayout();
            return true;
        }
        return false;
    };
    Container.prototype.clear = function () {
        this._items = [];
        this._renderedItems = [];
    };
    Container.prototype.getResourceInformation = function () {
        var result = _super.prototype.getResourceInformation.call(this);
        if (this.backgroundImage.isValid()) {
            result.push({
                url: this.backgroundImage.url,
                mimeType: "image"
            });
        }
        return result;
    };
    Container.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result) {
            if (this.selectAction) {
                result = this.selectAction.getActionById(id);
            }
            if (!result) {
                for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    result = item.getActionById(id);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    };
    Object.defineProperty(Container.prototype, "padding", {
        get: function () {
            return this.getPadding();
        },
        set: function (value) {
            this.setPadding(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "bleed", {
        get: function () {
            return this.getBleed();
        },
        set: function (value) {
            this.setBleed(value);
        },
        enumerable: false,
        configurable: true
    });
    Container.backgroundImageProperty = new serialization_1.SerializableObjectProperty(serialization_1.Versions.v1_0, "backgroundImage", BackgroundImage);
    Container.verticalContentAlignmentProperty = new serialization_1.EnumProperty(serialization_1.Versions.v1_1, "verticalContentAlignment", Enums.VerticalAlignment, Enums.VerticalAlignment.Top);
    Container.rtlProperty = new serialization_1.BoolProperty(serialization_1.Versions.v1_0, "rtl");
    __decorate([
        serialization_1.property(Container.backgroundImageProperty)
    ], Container.prototype, "backgroundImage", null);
    __decorate([
        serialization_1.property(Container.verticalContentAlignmentProperty)
    ], Container.prototype, "verticalContentAlignment", void 0);
    __decorate([
        serialization_1.property(Container.rtlProperty)
    ], Container.prototype, "rtl", void 0);
    return Container;
}(StylableCardElementContainer));
exports.Container = Container;
var Column = /** @class */ (function (_super) {
    __extends(Column, _super);
    function Column(width) {
        if (width === void 0) { width = "stretch"; }
        var _this = _super.call(this) || this;
        _this.width = "stretch";
        //#endregion
        _this._computedWeight = 0;
        _this.width = width;
        return _this;
    }
    Column.prototype.adjustRenderedElementSize = function (renderedElement) {
        var minDesignTimeColumnHeight = 20;
        if (this.isDesignMode()) {
            renderedElement.style.minWidth = "20px";
            renderedElement.style.minHeight = (!this.minPixelHeight ? minDesignTimeColumnHeight : Math.max(this.minPixelHeight, minDesignTimeColumnHeight)) + "px";
        }
        else {
            renderedElement.style.minWidth = "0";
            if (this.minPixelHeight) {
                renderedElement.style.minHeight = this.minPixelHeight + "px";
            }
        }
        if (this.width === "auto") {
            renderedElement.style.flex = "0 1 auto";
        }
        else if (this.width === "stretch") {
            renderedElement.style.flex = "1 1 50px";
        }
        else if (this.width instanceof shared_1.SizeAndUnit) {
            if (this.width.unit == Enums.SizeUnit.Pixel) {
                renderedElement.style.flex = "0 0 auto";
                renderedElement.style.width = this.width.physicalSize + "px";
            }
            else {
                renderedElement.style.flex = "1 1 " + (this._computedWeight > 0 ? this._computedWeight : this.width.physicalSize) + "%";
            }
        }
    };
    Column.prototype.shouldSerialize = function (context) {
        return true;
    };
    Object.defineProperty(Column.prototype, "separatorOrientation", {
        get: function () {
            return Enums.Orientation.Vertical;
        },
        enumerable: false,
        configurable: true
    });
    Column.prototype.getJsonTypeName = function () {
        return "Column";
    };
    Object.defineProperty(Column.prototype, "hasVisibleSeparator", {
        get: function () {
            if (this.parent && this.parent instanceof ColumnSet) {
                return this.separatorElement !== undefined && !this.parent.isLeftMostElement(this);
            }
            else {
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    Column.widthProperty = new serialization_1.CustomProperty(serialization_1.Versions.v1_0, "width", function (sender, property, source, context) {
        var result = property.defaultValue;
        var value = source[property.name];
        var invalidWidth = false;
        if (typeof value === "number" && !isNaN(value)) {
            result = new shared_1.SizeAndUnit(value, Enums.SizeUnit.Weight);
        }
        else if (value === "auto" || value === "stretch") {
            result = value;
        }
        else if (typeof value === "string") {
            try {
                result = shared_1.SizeAndUnit.parse(value);
                if (result.unit === Enums.SizeUnit.Pixel && property.targetVersion.compareTo(context.targetVersion) > 0) {
                    invalidWidth = true;
                }
            }
            catch (e) {
                invalidWidth = true;
            }
        }
        else {
            invalidWidth = true;
        }
        if (invalidWidth) {
            context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidColumnWidth(value));
            result = "auto";
        }
        return result;
    }, function (sender, property, target, value, context) {
        if (value instanceof shared_1.SizeAndUnit) {
            if (value.unit === Enums.SizeUnit.Pixel) {
                context.serializeValue(target, "width", value.physicalSize + "px");
            }
            else {
                context.serializeNumber(target, "width", value.physicalSize);
            }
        }
        else {
            context.serializeValue(target, "width", value);
        }
    }, "stretch");
    __decorate([
        serialization_1.property(Column.widthProperty)
    ], Column.prototype, "width", void 0);
    return Column;
}(Container));
exports.Column = Column;
var CarouselItem = /** @class */ (function (_super) {
    __extends(CarouselItem, _super);
    function CarouselItem(width) {
        if (width === void 0) { width = "stretch"; }
        var _this = _super.call(this) || this;
        _this.width = "stretch";
        //#endregion
        _this._computedWeight = 0;
        _this.width = width;
        return _this;
    }
    CarouselItem.prototype.adjustRenderedElementSize = function (renderedElement) {
        var minDesignTimeColumnHeight = 20;
        if (this.isDesignMode()) {
            renderedElement.style.minWidth = "20px";
            renderedElement.style.minHeight = (!this.minPixelHeight ? minDesignTimeColumnHeight : Math.max(this.minPixelHeight, minDesignTimeColumnHeight)) + "px";
        }
        else {
            renderedElement.style.minWidth = "100%";
            if (this.minPixelHeight) {
                renderedElement.style.minHeight = this.minPixelHeight + "px";
            }
        }
        if (this.width === "auto") {
            renderedElement.style.flex = "0 1 auto";
        }
        else if (this.width === "stretch") {
            renderedElement.style.flex = "1 1 50px";
        }
        else if (this.width instanceof shared_1.SizeAndUnit) {
            if (this.width.unit == Enums.SizeUnit.Pixel) {
                renderedElement.style.flex = "0 0 auto";
                renderedElement.style.width = this.width.physicalSize + "px";
            }
            else {
                renderedElement.style.flex = "1 1 " + (this._computedWeight > 0 ? this._computedWeight : this.width.physicalSize) + "%";
            }
        }
    };
    CarouselItem.prototype.shouldSerialize = function (context) {
        return true;
    };
    Object.defineProperty(CarouselItem.prototype, "separatorOrientation", {
        get: function () {
            return Enums.Orientation.Vertical;
        },
        enumerable: false,
        configurable: true
    });
    CarouselItem.prototype.getJsonTypeName = function () {
        return "CarouselItem";
    };
    Object.defineProperty(CarouselItem.prototype, "hasVisibleSeparator", {
        get: function () {
            if (this.parent && this.parent instanceof Carousel) {
                return this.separatorElement !== undefined && !this.parent.isLeftMostElement(this);
            }
            else {
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CarouselItem.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    //#region Schema
    CarouselItem.widthProperty = new serialization_1.CustomProperty(serialization_1.Versions.v1_0, "width", function (sender, property, source, context) {
        var result = property.defaultValue;
        var value = source[property.name];
        var invalidWidth = false;
        if (typeof value === "number" && !isNaN(value)) {
            result = new shared_1.SizeAndUnit(value, Enums.SizeUnit.Weight);
        }
        else if (value === "auto" || value === "stretch") {
            result = value;
        }
        else if (typeof value === "string") {
            try {
                result = shared_1.SizeAndUnit.parse(value);
                if (result.unit === Enums.SizeUnit.Pixel && property.targetVersion.compareTo(context.targetVersion) > 0) {
                    invalidWidth = true;
                }
            }
            catch (e) {
                invalidWidth = true;
            }
        }
        else {
            invalidWidth = true;
        }
        if (invalidWidth) {
            context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidCarouselItemWidth(value));
            result = "auto";
        }
        return result;
    }, function (sender, property, target, value, context) {
        if (value instanceof shared_1.SizeAndUnit) {
            if (value.unit === Enums.SizeUnit.Pixel) {
                context.serializeValue(target, "width", value.physicalSize + "px");
            }
            else {
                context.serializeNumber(target, "width", value.physicalSize);
            }
        }
        else {
            context.serializeValue(target, "width", value);
        }
    }, "stretch");
    __decorate([
        serialization_1.property(Column.widthProperty)
    ], CarouselItem.prototype, "width", void 0);
    return CarouselItem;
}(Container));
exports.CarouselItem = CarouselItem;
var ColumnSet = /** @class */ (function (_super) {
    __extends(ColumnSet, _super);
    function ColumnSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._columns = [];
        return _this;
    }
    ColumnSet.prototype.createColumnInstance = function (source, context) {
        return context.parseCardObject(this, source, [], // Forbidden types not supported for elements for now
        !this.isDesignMode(), function (typeName) {
            return !typeName || typeName === "Column" ? new Column() : undefined;
        }, function (typeName, errorType) {
            context.logParseEvent(undefined, Enums.ValidationEvent.ElementTypeNotAllowed, strings_1.Strings.errors.elementTypeNotAllowed(typeName));
        });
    };
    ColumnSet.prototype.internalRender = function () {
        this._renderedColumns = [];
        if (this._columns.length > 0) {
            // Cache hostConfig to avoid walking the parent hierarchy several times
            var hostConfig = this.hostConfig;
            var element = document.createElement("div");
            element.className = hostConfig.makeCssClassName("ac-columnSet");
            element.style.display = "flex";
            if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation) {
                // See comment in Container.internalRender()
                element.style.minHeight = '-webkit-min-content';
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.justifyContent = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.justifyContent = "flex-end";
                    break;
                default:
                    element.style.justifyContent = "flex-start";
                    break;
            }
            var totalWeight = 0;
            for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
                var column = _a[_i];
                if (column.width instanceof shared_1.SizeAndUnit && (column.width.unit == Enums.SizeUnit.Weight)) {
                    totalWeight += column.width.physicalSize;
                }
            }
            for (var _b = 0, _c = this._columns; _b < _c.length; _b++) {
                var column = _c[_b];
                if (column.width instanceof shared_1.SizeAndUnit && column.width.unit == Enums.SizeUnit.Weight && totalWeight > 0) {
                    var computedWeight = 100 / totalWeight * column.width.physicalSize;
                    // Best way to emulate "internal" access I know of
                    column["_computedWeight"] = computedWeight;
                }
                var renderedColumn = column.render();
                if (renderedColumn) {
                    if (this._renderedColumns.length > 0 && column.separatorElement) {
                        column.separatorElement.style.flex = "0 0 auto";
                        Utils.appendChild(element, column.separatorElement);
                    }
                    Utils.appendChild(element, renderedColumn);
                    this._renderedColumns.push(column);
                }
            }
            return this._renderedColumns.length > 0 ? element : undefined;
        }
        else {
            return undefined;
        }
    };
    ColumnSet.prototype.truncateOverflow = function (maxHeight) {
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            column['handleOverflow'](maxHeight);
        }
        return true;
    };
    ColumnSet.prototype.undoOverflowTruncation = function () {
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            column['resetOverflow']();
        }
    };
    Object.defineProperty(ColumnSet.prototype, "isSelectable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    ColumnSet.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this._columns = [];
        this._renderedColumns = [];
        var jsonColumns = source["columns"];
        if (Array.isArray(jsonColumns)) {
            for (var _i = 0, jsonColumns_1 = jsonColumns; _i < jsonColumns_1.length; _i++) {
                var item = jsonColumns_1[_i];
                var column = this.createColumnInstance(item, context);
                if (column) {
                    this._columns.push(column);
                }
            }
        }
    };
    ColumnSet.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        context.serializeArray(target, "columns", this._columns);
    };
    ColumnSet.prototype.isFirstElement = function (element) {
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            if (column.isVisible) {
                return column == element;
            }
        }
        return false;
    };
    ColumnSet.prototype.isBleedingAtTop = function () {
        if (this.isBleeding()) {
            return true;
        }
        if (this._renderedColumns && this._renderedColumns.length > 0) {
            for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
                var column = _a[_i];
                if (column.isBleedingAtTop()) {
                    return true;
                }
            }
        }
        return false;
    };
    ColumnSet.prototype.isBleedingAtBottom = function () {
        if (this.isBleeding()) {
            return true;
        }
        if (this._renderedColumns && this._renderedColumns.length > 0) {
            for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
                var column = _a[_i];
                if (column.isBleedingAtBottom()) {
                    return true;
                }
            }
        }
        return false;
    };
    ColumnSet.prototype.getItemCount = function () {
        return this._columns.length;
    };
    ColumnSet.prototype.getFirstVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedColumns && this._renderedColumns.length > 0) {
            return this._renderedColumns[0];
        }
        else {
            return undefined;
        }
    };
    ColumnSet.prototype.getLastVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedColumns && this._renderedColumns.length > 0) {
            return this._renderedColumns[this._renderedColumns.length - 1];
        }
        else {
            return undefined;
        }
    };
    ColumnSet.prototype.getColumnAt = function (index) {
        return this._columns[index];
    };
    ColumnSet.prototype.getItemAt = function (index) {
        return this.getColumnAt(index);
    };
    ColumnSet.prototype.getJsonTypeName = function () {
        return "ColumnSet";
    };
    ColumnSet.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        var weightedColumns = 0;
        var stretchedColumns = 0;
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            if (typeof column.width === "number") {
                weightedColumns++;
            }
            else if (column.width === "stretch") {
                stretchedColumns++;
            }
        }
        if (weightedColumns > 0 && stretchedColumns > 0) {
            context.addFailure(this, Enums.ValidationEvent.Hint, strings_1.Strings.hints.dontUseWeightedAndStrecthedColumnsInSameSet());
        }
    };
    ColumnSet.prototype.addColumn = function (column) {
        if (!column.parent) {
            this._columns.push(column);
            column.setParent(this);
        }
        else {
            throw new Error(strings_1.Strings.errors.columnAlreadyBelongsToAnotherSet());
        }
    };
    ColumnSet.prototype.removeItem = function (item) {
        if (item instanceof Column) {
            var itemIndex = this._columns.indexOf(item);
            if (itemIndex >= 0) {
                this._columns.splice(itemIndex, 1);
                item.setParent(undefined);
                this.updateLayout();
                return true;
            }
        }
        return false;
    };
    ColumnSet.prototype.indexOf = function (cardElement) {
        return cardElement instanceof Column ? this._columns.indexOf(cardElement) : -1;
    };
    ColumnSet.prototype.isLeftMostElement = function (element) {
        return this._columns.indexOf(element) == 0;
    };
    ColumnSet.prototype.isRightMostElement = function (element) {
        return this._columns.indexOf(element) == this._columns.length - 1;
    };
    ColumnSet.prototype.isTopElement = function (element) {
        return this._columns.indexOf(element) >= 0;
    };
    ColumnSet.prototype.isBottomElement = function (element) {
        return this._columns.indexOf(element) >= 0;
    };
    ColumnSet.prototype.getActionById = function (id) {
        var result = undefined;
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            result = column.getActionById(id);
            if (result) {
                break;
            }
        }
        return result;
    };
    Object.defineProperty(ColumnSet.prototype, "bleed", {
        get: function () {
            return this.getBleed();
        },
        set: function (value) {
            this.setBleed(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnSet.prototype, "padding", {
        get: function () {
            return this.getPadding();
        },
        set: function (value) {
            this.setPadding(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ColumnSet.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
        },
        enumerable: false,
        configurable: true
    });
    return ColumnSet;
}(StylableCardElementContainer));
exports.ColumnSet = ColumnSet;
var Carousel = /** @class */ (function (_super) {
    __extends(Carousel, _super);
    function Carousel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._carouselitems = [];
        return _this;
    }
    Carousel.prototype.createCarouselItemInstance = function (source, context) {
        return context.parseCardObject(this, source, [], // Forbidden types not supported for elements for now
        !this.isDesignMode(), function (typeName) {
            return !typeName || typeName === "CarouselItem" ? new CarouselItem() : undefined;
        }, function (typeName, errorType) {
            context.logParseEvent(undefined, Enums.ValidationEvent.ElementTypeNotAllowed, strings_1.Strings.errors.elementTypeNotAllowed(typeName));
        });
    };
    Carousel.prototype.internalRender = function () {
        this._renderedCarouselItems = [];
        if (this._carouselitems.length > 0) {
            // Cache hostConfig to avoid walking the parent hierarchy several times
            var hostConfig = this.hostConfig;
            var element_1 = document.createElement("div");
            var elementwraper = document.createElement("div");
            elementwraper.className = hostConfig.makeCssClassName("ac-carousel-wrapper");
            elementwraper.style.display = "flex";
            elementwraper.style.alignItems = "center";
            //elementwraper.style.overflow="hidden"; 
            elementwraper.style.position = "relative";
            element_1.className = hostConfig.makeCssClassName("ac-carousel");
            element_1.style.display = "flex";
            element_1.style.overflow = "hidden";
            element_1.style.position = "relative";
            element_1.style.alignItems = "center";
            var prevcont = document.createElement("div");
            prevcont.className = hostConfig.makeCssClassName("arrowswraper prevcont");
            prevcont.style.width = "15px";
            prevcont.style.marginTop = '0.5%';
            var prev = document.createElement("div");
            prev.style.width = "12px";
            prev.style.height = "12px";
            prev.style.borderColor = "#000";
            prev.style.marginTop = "0px";
            prev.style.borderBottom = "3px solid";
            prev.style.borderLeft = "3px solid";
            prev.style.transform = "rotate(45deg)";
            prev.style.marginLeft = "0px";
            prev.style.position = "relative";
            prev.style.top = "50%";
            prev.className = hostConfig.makeCssClassName("arrows prev");
            prevcont.addEventListener("mousedown", function () {
                if (element_1) {
                    var x = element_1.scrollLeft;
                    element_1.scrollLeft = x - element_1.offsetWidth - 8;
                    //console.log(this.parentElement);
                }
            });
            var nextcont = document.createElement("div");
            nextcont.className = hostConfig.makeCssClassName("arrowswraper nextcont");
            // nextcont.style.position= "fixed";
            nextcont.style.width = "15px";
            nextcont.style.marginTop = '0.5%';
            nextcont.style.marginLeft = '11%';
            var next = document.createElement("div");
            next.style.width = "12px";
            next.style.height = "12px";
            next.style.borderColor = "#000";
            next.style.marginTop = "0px";
            next.style.borderBottom = "3px solid";
            next.style.borderLeft = "3px solid";
            next.style.transform = "rotate(-135deg)";
            next.style.marginLeft = "0px";
            next.style.position = "relative";
            next.style.top = "50%";
            nextcont.addEventListener("mousedown", function () {
                if (element_1) {
                    var x = element_1.scrollLeft;
                    element_1.scrollLeft = x + element_1.offsetWidth + 8;
                    //console.log(this.parentElement);
                }
            });
            next.className = hostConfig.makeCssClassName("arrows next");
            prevcont.appendChild(prev);
            nextcont.appendChild(next);
            if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation) {
                // See comment in Container.internalRender()
                elementwraper.style.minHeight = '-webkit-min-content';
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    elementwraper.style.justifyContent = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    elementwraper.style.justifyContent = "flex-end";
                    break;
                default:
                    elementwraper.style.justifyContent = "flex-start";
                    break;
            }
            var totalWeight = 0;
            for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
                var carouselitem = _a[_i];
                if (carouselitem.width instanceof shared_1.SizeAndUnit && (carouselitem.width.unit == Enums.SizeUnit.Weight)) {
                    totalWeight += carouselitem.width.physicalSize;
                }
            }
            for (var _b = 0, _c = this._carouselitems; _b < _c.length; _b++) {
                var carouselitem = _c[_b];
                if (carouselitem.width instanceof shared_1.SizeAndUnit && carouselitem.width.unit == Enums.SizeUnit.Weight && totalWeight > 0) {
                    var computedWeight = 100 / totalWeight * carouselitem.width.physicalSize;
                    // Best way to emulate "internal" access I know of
                    carouselitem["_computedWeight"] = computedWeight;
                }
                var renderedCarouselItem = carouselitem.render();
                if (renderedCarouselItem) {
                    if (this._renderedCarouselItems.length > 0 && carouselitem.separatorElement) {
                        carouselitem.separatorElement.style.flex = "0 0 auto";
                        Utils.appendChild(element_1, carouselitem.separatorElement);
                    }
                    Utils.appendChild(element_1, renderedCarouselItem);
                    this._renderedCarouselItems.push(carouselitem);
                }
            }
            Utils.appendChild(elementwraper, prevcont);
            Utils.appendChild(elementwraper, element_1);
            Utils.appendChild(elementwraper, nextcont);
            return this._renderedCarouselItems.length > 0 ? elementwraper : undefined;
        }
        else {
            return undefined;
        }
    };
    Carousel.prototype.truncateOverflow = function (maxHeight) {
        for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
            var carouselitem = _a[_i];
            carouselitem['handleOverflow'](maxHeight);
        }
        return true;
    };
    Carousel.prototype.undoOverflowTruncation = function () {
        for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
            var carouselitem = _a[_i];
            carouselitem['resetOverflow']();
        }
    };
    Object.defineProperty(Carousel.prototype, "isSelectable", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Carousel.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this._carouselitems = [];
        this._renderedCarouselItems = [];
        var jsonCarouselItems = source["carouselitems"];
        if (Array.isArray(jsonCarouselItems)) {
            for (var _i = 0, jsonCarouselItems_1 = jsonCarouselItems; _i < jsonCarouselItems_1.length; _i++) {
                var item = jsonCarouselItems_1[_i];
                var carouselitem = this.createCarouselItemInstance(item, context);
                if (carouselitem) {
                    this._carouselitems.push(carouselitem);
                }
            }
        }
    };
    Carousel.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        context.serializeArray(target, "carouselitems", this._carouselitems);
    };
    Carousel.prototype.isFirstElement = function (element) {
        for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
            var carouselitem = _a[_i];
            if (carouselitem.isVisible) {
                return carouselitem == element;
            }
        }
        return false;
    };
    Carousel.prototype.isBleedingAtTop = function () {
        if (this.isBleeding()) {
            return true;
        }
        if (this._renderedCarouselItems && this._renderedCarouselItems.length > 0) {
            for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
                var carouselitem = _a[_i];
                if (carouselitem.isBleedingAtTop()) {
                    return true;
                }
            }
        }
        return false;
    };
    Carousel.prototype.isBleedingAtBottom = function () {
        if (this.isBleeding()) {
            return true;
        }
        if (this._renderedCarouselItems && this._renderedCarouselItems.length > 0) {
            for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
                var carouselitem = _a[_i];
                if (carouselitem.isBleedingAtBottom()) {
                    return true;
                }
            }
        }
        return false;
    };
    Carousel.prototype.getItemCount = function () {
        return this._carouselitems.length;
    };
    Carousel.prototype.getFirstVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedCarouselItems && this._renderedCarouselItems.length > 0) {
            return this._renderedCarouselItems[0];
        }
        else {
            return undefined;
        }
    };
    Carousel.prototype.getLastVisibleRenderedItem = function () {
        if (this.renderedElement && this._renderedCarouselItems && this._renderedCarouselItems.length > 0) {
            return this._renderedCarouselItems[this._renderedCarouselItems.length - 1];
        }
        else {
            return undefined;
        }
    };
    Carousel.prototype.getCarouselItemAt = function (index) {
        return this._carouselitems[index];
    };
    Carousel.prototype.getItemAt = function (index) {
        return this.getCarouselItemAt(index);
    };
    Carousel.prototype.getJsonTypeName = function () {
        return "Carousel";
    };
    Carousel.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        var weightedCarouselItems = 0;
        var stretchedCarouselItems = 0;
        for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
            var carouselitem = _a[_i];
            if (typeof carouselitem.width === "number") {
                weightedCarouselItems++;
            }
            else if (carouselitem.width === "stretch") {
                stretchedCarouselItems++;
            }
        }
        if (weightedCarouselItems > 0 && stretchedCarouselItems > 0) {
            context.addFailure(this, Enums.ValidationEvent.Hint, strings_1.Strings.hints.dontUseWeightedAndStrecthedCarouselItemsInSameSet());
        }
    };
    Carousel.prototype.addCarouselItem = function (carouselitem) {
        if (!carouselitem.parent) {
            this._carouselitems.push(carouselitem);
            carouselitem.setParent(this);
        }
        else {
            throw new Error(strings_1.Strings.errors.carouselItemAlreadyBelongsToAnotherSet());
        }
    };
    Carousel.prototype.removeItem = function (item) {
        if (item instanceof CarouselItem) {
            var itemIndex = this._carouselitems.indexOf(item);
            if (itemIndex >= 0) {
                this._carouselitems.splice(itemIndex, 1);
                item.setParent(undefined);
                this.updateLayout();
                return true;
            }
        }
        return false;
    };
    Carousel.prototype.indexOf = function (cardElement) {
        return cardElement instanceof CarouselItem ? this._carouselitems.indexOf(cardElement) : -1;
    };
    Carousel.prototype.isLeftMostElement = function (element) {
        return this._carouselitems.indexOf(element) == 0;
    };
    Carousel.prototype.isRightMostElement = function (element) {
        return this._carouselitems.indexOf(element) == this._carouselitems.length - 1;
    };
    Carousel.prototype.isTopElement = function (element) {
        return this._carouselitems.indexOf(element) >= 0;
    };
    Carousel.prototype.isBottomElement = function (element) {
        return this._carouselitems.indexOf(element) >= 0;
    };
    Carousel.prototype.getActionById = function (id) {
        var result = undefined;
        for (var _i = 0, _a = this._carouselitems; _i < _a.length; _i++) {
            var carouselitem = _a[_i];
            result = carouselitem.getActionById(id);
            if (result) {
                break;
            }
        }
        return result;
    };
    Object.defineProperty(Carousel.prototype, "bleed", {
        get: function () {
            return this.getBleed();
        },
        set: function (value) {
            this.setBleed(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Carousel.prototype, "padding", {
        get: function () {
            return this.getPadding();
        },
        set: function (value) {
            this.setPadding(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Carousel.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
        },
        enumerable: false,
        configurable: true
    });
    return Carousel;
}(StylableCardElementContainer));
exports.Carousel = Carousel;
//export type CarouselWidth = SizeAndUnit | "auto" | "stretch";
// export class Carousel extends Container {
//     //#region Schema
//     static readonly widthProperty = new CustomProperty<CarouselWidth>(
//         Versions.v1_0,
//         "width",
//         (sender: SerializableObject, property: PropertyDefinition, source: PropertyBag, context: BaseSerializationContext) => {
//             let result: CarouselWidth = property.defaultValue;
//             let value = source[property.name];
//             let invalidWidth = false;
//             if (typeof value === "number" && !isNaN(value)) {
//                 result = new SizeAndUnit(value, Enums.SizeUnit.Weight);
//             }
//             else if (value === "auto" || value === "stretch") {
//                 result = value;
//             }
//             else if (typeof value === "string") {
//                 try {
//                     result = SizeAndUnit.parse(value);
//                     if (result.unit === Enums.SizeUnit.Pixel && property.targetVersion.compareTo(context.targetVersion) > 0) {
//                         invalidWidth = true;
//                     }
//                 }
//                 catch (e) {
//                     invalidWidth = true;
//                 }
//             }
//             else {
//                 invalidWidth = true;
//             }
//             if (invalidWidth) {
//                 context.logParseEvent(
//                     sender,
//                     Enums.ValidationEvent.InvalidPropertyValue,
//                     Strings.errors.invalidCarouselWidth(value));
//                 result = "auto";
//             }
//             return result;
//         },
//         (sender: SerializableObject, property: PropertyDefinition, target: PropertyBag, value: CarouselWidth, context: BaseSerializationContext) => {
//             if (value instanceof SizeAndUnit) {
//                 if (value.unit === Enums.SizeUnit.Pixel) {
//                     context.serializeValue(target, "width", value.physicalSize + "px");
//                 }
//                 else {
//                     context.serializeNumber(target, "width", value.physicalSize);
//                 }
//             }
//             else {
//                 context.serializeValue(target, "width", value);
//             }
//         },
//         "stretch");
//     @property(Carousel.widthProperty)
//     width: CarouselWidth = "stretch";
//     //#endregion
//     private _computedWeight: number = 0;
//     protected adjustRenderedElementSize(renderedElement: HTMLElement) {
//         const minDesignTimeCarouselHeight = 20;
//         if (this.isDesignMode()) {
//             renderedElement.style.minWidth = "20px";
//             renderedElement.style.minHeight = (!this.minPixelHeight ? minDesignTimeCarouselHeight : Math.max(this.minPixelHeight, minDesignTimeCarouselHeight)) + "px";
//         }
//         else {
//             renderedElement.style.minWidth = "0";
//             if (this.minPixelHeight) {
//                 renderedElement.style.minHeight = this.minPixelHeight + "px";
//             }
//         }
//         if (this.width === "auto") {
//             renderedElement.style.flex = "0 1 auto";
//         }
//         else if (this.width === "stretch") {
//             renderedElement.style.flex = "1 1 50px";
//         }
//         else if (this.width instanceof SizeAndUnit) {
//             if (this.width.unit == Enums.SizeUnit.Pixel) {
//                 renderedElement.style.flex = "0 0 auto";
//                 renderedElement.style.width = this.width.physicalSize + "px";
//             }
//             else {
//                 renderedElement.style.flex = "1 1 " + (this._computedWeight > 0 ? this._computedWeight : this.width.physicalSize) + "%";
//             }
//         }
//     }
//     protected shouldSerialize(context: SerializationContext): boolean {
//         return true;
//     }
//     protected get separatorOrientation(): Enums.Orientation {
//         return Enums.Orientation.Vertical;
//     }
//     constructor(width: CarouselWidth = "stretch") {
//         super();
//         this.width = width;
//     }
//     getJsonTypeName(): string {
//         return "Carousel";
//     }
//     get hasVisibleSeparator(): boolean {
//         if (this.parent && this.parent instanceof ColumnSet) {
//             return this.separatorElement !== undefined && !this.parent.isLeftMostElement(this);
//         }
//         else {
//             return false;
//         }
//     }
//     get isStandalone(): boolean {
//         return false;
//     }
// }
function raiseImageLoadedEvent(image) {
    var card = image.getRootElement();
    var onImageLoadedHandler = (card && card.onImageLoaded) ? card.onImageLoaded : GenietalkCard.onImageLoaded;
    if (onImageLoadedHandler) {
        onImageLoadedHandler(image);
    }
}
function raiseAnchorClickedEvent(element, anchor) {
    var card = element.getRootElement();
    var onAnchorClickedHandler = (card && card.onAnchorClicked) ? card.onAnchorClicked : GenietalkCard.onAnchorClicked;
    return onAnchorClickedHandler !== undefined ? onAnchorClickedHandler(element, anchor) : false;
}
function raiseExecuteActionEvent(action) {
    var card = action.parent ? action.parent.getRootElement() : undefined;
    var onExecuteActionHandler = (card && card.onExecuteAction) ? card.onExecuteAction : GenietalkCard.onExecuteAction;
    if (action.prepareForExecution() && onExecuteActionHandler) {
        onExecuteActionHandler(action);
    }
}
function raiseInlineCardExpandedEvent(action, isExpanded) {
    var card = action.parent ? action.parent.getRootElement() : undefined;
    var onInlineCardExpandedHandler = (card && card.onInlineCardExpanded) ? card.onInlineCardExpanded : GenietalkCard.onInlineCardExpanded;
    if (onInlineCardExpandedHandler) {
        onInlineCardExpandedHandler(action, isExpanded);
    }
}
function raiseInputValueChangedEvent(input) {
    var card = input.getRootElement();
    var onInputValueChangedHandler = (card && card.onInputValueChanged) ? card.onInputValueChanged : GenietalkCard.onInputValueChanged;
    if (onInputValueChangedHandler) {
        onInputValueChangedHandler(input);
    }
}
function raiseElementVisibilityChangedEvent(element, shouldUpdateLayout) {
    if (shouldUpdateLayout === void 0) { shouldUpdateLayout = true; }
    var rootElement = element.getRootElement();
    if (shouldUpdateLayout) {
        rootElement.updateLayout();
    }
    var card = rootElement;
    var onElementVisibilityChangedHandler = (card && card.onElementVisibilityChanged) ? card.onElementVisibilityChanged : GenietalkCard.onElementVisibilityChanged;
    if (onElementVisibilityChangedHandler !== undefined) {
        onElementVisibilityChangedHandler(element);
    }
}
var ContainerWithActions = /** @class */ (function (_super) {
    __extends(ContainerWithActions, _super);
    function ContainerWithActions() {
        var _this = _super.call(this) || this;
        _this._actionCollection = new ActionCollection(_this);
        return _this;
    }
    ContainerWithActions.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        this._actionCollection.parse(source["actions"], context);
    };
    ContainerWithActions.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        this._actionCollection.toJSON(target, "actions", context);
    };
    ContainerWithActions.prototype.internalRender = function () {
        var element = _super.prototype.internalRender.call(this);
        if (element) {
            var renderedActions = this._actionCollection.render(this.hostConfig.actions.actionsOrientation, false);
            if (renderedActions) {
                Utils.appendChild(element, Utils.renderSeparation(this.hostConfig, {
                    spacing: this.hostConfig.getEffectiveSpacing(this.hostConfig.actions.spacing)
                }, Enums.Orientation.Horizontal));
                Utils.appendChild(element, renderedActions);
            }
            if (this.renderIfEmpty) {
                return element;
            }
            else {
                return element.children.length > 0 ? element : undefined;
            }
        }
        else {
            return undefined;
        }
    };
    ContainerWithActions.prototype.getHasExpandedAction = function () {
        if (this.renderedActionCount == 0) {
            return false;
        }
        else if (this.renderedActionCount == 1) {
            return this._actionCollection.expandedAction !== undefined && !this.hostConfig.actions.preExpandSingleShowCardAction;
        }
        else {
            return this._actionCollection.expandedAction !== undefined;
        }
    };
    Object.defineProperty(ContainerWithActions.prototype, "renderedActionCount", {
        get: function () {
            return this._actionCollection.renderedActionCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContainerWithActions.prototype, "renderIfEmpty", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    ContainerWithActions.prototype.getActionCount = function () {
        return this._actionCollection.items.length;
    };
    ContainerWithActions.prototype.getActionAt = function (index) {
        if (index >= 0 && index < this.getActionCount()) {
            return this._actionCollection.items[index];
        }
        else {
            return _super.prototype.getActionAt.call(this, index);
        }
    };
    ContainerWithActions.prototype.getActionById = function (id) {
        var result = this._actionCollection.getActionById(id);
        return result ? result : _super.prototype.getActionById.call(this, id);
    };
    ContainerWithActions.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (this._actionCollection) {
            this._actionCollection.validateProperties(context);
        }
    };
    ContainerWithActions.prototype.isLastElement = function (element) {
        return _super.prototype.isLastElement.call(this, element) && this._actionCollection.items.length == 0;
    };
    ContainerWithActions.prototype.addAction = function (action) {
        this._actionCollection.addAction(action);
    };
    ContainerWithActions.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this._actionCollection.clear();
    };
    ContainerWithActions.prototype.getAllInputs = function (processActions) {
        if (processActions === void 0) { processActions = true; }
        var result = _super.prototype.getAllInputs.call(this, processActions);
        if (processActions) {
            result = result.concat(this._actionCollection.getAllInputs(processActions));
        }
        return result;
    };
    ContainerWithActions.prototype.getResourceInformation = function () {
        return _super.prototype.getResourceInformation.call(this).concat(this._actionCollection.getResourceInformation());
    };
    ContainerWithActions.prototype.isBleedingAtBottom = function () {
        if (this._actionCollection.renderedActionCount == 0) {
            return _super.prototype.isBleedingAtBottom.call(this);
        }
        else {
            if (this._actionCollection.items.length == 1) {
                return this._actionCollection.expandedAction !== undefined && !this.hostConfig.actions.preExpandSingleShowCardAction;
            }
            else {
                return this._actionCollection.expandedAction !== undefined;
            }
        }
    };
    Object.defineProperty(ContainerWithActions.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    return ContainerWithActions;
}(Container));
exports.ContainerWithActions = ContainerWithActions;
// @dynamic
var GenietalkCard = /** @class */ (function (_super) {
    __extends(GenietalkCard, _super);
    function GenietalkCard() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.designMode = false;
        return _this;
    }
    Object.defineProperty(GenietalkCard, "processMarkdown", {
        get: function () {
            throw new Error(strings_1.Strings.errors.processMarkdownEventRemoved());
        },
        set: function (value) {
            throw new Error(strings_1.Strings.errors.processMarkdownEventRemoved());
        },
        enumerable: false,
        configurable: true
    });
    GenietalkCard.applyMarkdown = function (text) {
        var result = {
            didProcess: false
        };
        if (GenietalkCard.onProcessMarkdown) {
            GenietalkCard.onProcessMarkdown(text, result);
        }
        else if (window.markdownit) {
            // Check for markdownit
            var markdownIt = window.markdownit;
            result.outputHtml = markdownIt().render(text);
            result.didProcess = true;
        }
        else {
            console.warn(strings_1.Strings.errors.markdownProcessingNotEnabled);
        }
        return result;
    };
    GenietalkCard.prototype.isVersionSupported = function () {
        if (this.bypassVersionCheck) {
            return true;
        }
        else {
            var unsupportedVersion = !this.version ||
                !this.version.isValid ||
                (this.maxVersion.major < this.version.major) ||
                (this.maxVersion.major == this.version.major && this.maxVersion.minor < this.version.minor);
            return !unsupportedVersion;
        }
    };
    GenietalkCard.prototype.getDefaultSerializationContext = function () {
        return new SerializationContext(this.version);
    };
    GenietalkCard.prototype.getItemsCollectionPropertyName = function () {
        return "body";
    };
    GenietalkCard.prototype.internalParse = function (source, context) {
        this._fallbackCard = undefined;
        var fallbackElement = context.parseElement(undefined, source["fallback"], !this.isDesignMode());
        if (fallbackElement) {
            this._fallbackCard = new GenietalkCard();
            this._fallbackCard.addItem(fallbackElement);
        }
        _super.prototype.internalParse.call(this, source, context);
    };
    GenietalkCard.prototype.internalToJSON = function (target, context) {
        this.setValue(GenietalkCard.versionProperty, context.targetVersion);
        _super.prototype.internalToJSON.call(this, target, context);
    };
    GenietalkCard.prototype.internalRender = function () {
        var renderedElement = _super.prototype.internalRender.call(this);
        if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation && renderedElement) {
            // Unlike containers, the root card element should be allowed to
            // be shorter than its content (otherwise the overflow truncation
            // logic would never get triggered)
            renderedElement.style.removeProperty("minHeight");
        }
        return renderedElement;
    };
    GenietalkCard.prototype.getHasBackground = function () {
        return true;
    };
    GenietalkCard.prototype.getDefaultPadding = function () {
        return new shared_1.PaddingDefinition(Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding);
    };
    GenietalkCard.prototype.shouldSerialize = function (context) {
        return true;
    };
    Object.defineProperty(GenietalkCard.prototype, "renderIfEmpty", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GenietalkCard.prototype, "bypassVersionCheck", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GenietalkCard.prototype, "allowCustomStyle", {
        get: function () {
            return this.hostConfig.genietalkCard && this.hostConfig.genietalkCard.allowCustomStyle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GenietalkCard.prototype, "hasBackground", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    GenietalkCard.prototype.getJsonTypeName = function () {
        return "GenietalkCard";
    };
    GenietalkCard.prototype.internalValidateProperties = function (context) {
        _super.prototype.internalValidateProperties.call(this, context);
        if (this.getValue(CardElement.typeNameProperty) !== "GenietalkCard" && this.getValue(CardElement.typeNameProperty) !== "AdaptiveCard") {
            context.addFailure(this, Enums.ValidationEvent.MissingCardType, strings_1.Strings.errors.invalidCardType());
        }
        if (!this.bypassVersionCheck && !this.version) {
            context.addFailure(this, Enums.ValidationEvent.PropertyCantBeNull, strings_1.Strings.errors.propertyMustBeSet("version"));
        }
        else if (!this.isVersionSupported()) {
            context.addFailure(this, Enums.ValidationEvent.UnsupportedCardVersion, strings_1.Strings.errors.unsupportedCardVersion(this.version.toString(), this.maxVersion.toString()));
        }
    };
    GenietalkCard.prototype.render = function (target) {
        var renderedCard;
        if (this.shouldFallback() && this._fallbackCard) {
            this._fallbackCard.hostConfig = this.hostConfig;
            renderedCard = this._fallbackCard.render();
        }
        else {
            renderedCard = _super.prototype.render.call(this);
            if (renderedCard) {
                renderedCard.classList.add(this.hostConfig.makeCssClassName("ac-genietalkCard"));
                // Having a tabIndex on the root container for a card can mess up accessibility in some scenarios.
                // However, we've shipped this behavior before, and so can't just turn it off in a point release. For
                // now, to unblock accessibility scenarios for our customers, we've got an option to turn it off. In a
                // future release, we should strongly consider flipping the default such that we *don't* emit a tabIndex
                // by default.
                if (shared_1.GlobalSettings.setTabIndexAtCardRoot) {
                    renderedCard.tabIndex = 0;
                }
                if (this.speak) {
                    renderedCard.setAttribute("aria-label", this.speak);
                }
            }
        }
        if (target) {
            Utils.appendChild(target, renderedCard);
            this.updateLayout();
        }
        return renderedCard;
    };
    GenietalkCard.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        _super.prototype.updateLayout.call(this, processChildren);
        if (shared_1.GlobalSettings.useAdvancedCardBottomTruncation && this.isDisplayed()) {
            var padding = this.hostConfig.getEffectiveSpacing(Enums.Spacing.Default);
            this['handleOverflow'](this.renderedElement.offsetHeight - padding);
        }
    };
    GenietalkCard.prototype.shouldFallback = function () {
        return _super.prototype.shouldFallback.call(this) || !this.isVersionSupported();
    };
    Object.defineProperty(GenietalkCard.prototype, "hasVisibleSeparator", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    GenietalkCard.schemaUrl = "http://genietalkcards.io/schemas/genietalk-card.json";
    //#region Schema
    GenietalkCard.$schemaProperty = new serialization_1.CustomProperty(serialization_1.Versions.v1_0, "$schema", function (sender, property, source, context) {
        return GenietalkCard.schemaUrl;
    }, function (sender, property, target, value, context) {
        context.serializeValue(target, property.name, GenietalkCard.schemaUrl);
    });
    GenietalkCard.versionProperty = new serialization_1.CustomProperty(serialization_1.Versions.v1_0, "version", function (sender, property, source, context) {
        var version = serialization_1.Version.parse(source[property.name], context);
        if (version === undefined) {
            version = serialization_1.Versions.latest;
            context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidCardVersion(version.toString()));
        }
        return version;
    }, function (sender, property, target, value, context) {
        if (value !== undefined) {
            context.serializeValue(target, property.name, value.toString());
        }
    }, serialization_1.Versions.v1_0);
    GenietalkCard.fallbackTextProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "fallbackText");
    GenietalkCard.speakProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "speak");
    __decorate([
        serialization_1.property(GenietalkCard.versionProperty)
    ], GenietalkCard.prototype, "version", void 0);
    __decorate([
        serialization_1.property(GenietalkCard.fallbackTextProperty)
    ], GenietalkCard.prototype, "fallbackText", void 0);
    __decorate([
        serialization_1.property(GenietalkCard.speakProperty)
    ], GenietalkCard.prototype, "speak", void 0);
    return GenietalkCard;
}(ContainerWithActions));
exports.GenietalkCard = GenietalkCard;
var InlineGenietalkCard = /** @class */ (function (_super) {
    __extends(InlineGenietalkCard, _super);
    function InlineGenietalkCard() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.suppressStyle = false;
        return _this;
    }
    InlineGenietalkCard.prototype.getSchemaKey = function () {
        return "InlineGenietalkCard";
    };
    InlineGenietalkCard.prototype.populateSchema = function (schema) {
        _super.prototype.populateSchema.call(this, schema);
        schema.remove(GenietalkCard.$schemaProperty, GenietalkCard.versionProperty);
    };
    //#endregion
    InlineGenietalkCard.prototype.getDefaultPadding = function () {
        return new shared_1.PaddingDefinition(this.suppressStyle ? Enums.Spacing.None : Enums.Spacing.Padding, Enums.Spacing.Padding, this.suppressStyle ? Enums.Spacing.None : Enums.Spacing.Padding, Enums.Spacing.Padding);
    };
    Object.defineProperty(InlineGenietalkCard.prototype, "bypassVersionCheck", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InlineGenietalkCard.prototype, "defaultStyle", {
        get: function () {
            if (this.suppressStyle) {
                return Enums.ContainerStyle.Default;
            }
            else {
                return this.hostConfig.actions.showCard.style ? this.hostConfig.actions.showCard.style : Enums.ContainerStyle.Emphasis;
            }
        },
        enumerable: false,
        configurable: true
    });
    InlineGenietalkCard.prototype.render = function (target) {
        var renderedCard = _super.prototype.render.call(this, target);
        if (renderedCard) {
            renderedCard.setAttribute("aria-live", "polite");
            renderedCard.removeAttribute("tabindex");
        }
        return renderedCard;
    };
    return InlineGenietalkCard;
}(GenietalkCard));
var GlobalRegistry = /** @class */ (function () {
    function GlobalRegistry() {
    }
    GlobalRegistry.populateWithDefaultElements = function (registry) {
        registry.clear();
        registry.register("Container", Container);
        registry.register("TextBlock", TextBlock);
        registry.register("Carousel", Carousel);
        registry.register("RichTextBlock", RichTextBlock, serialization_1.Versions.v1_2);
        registry.register("TextRun", TextRun, serialization_1.Versions.v1_2);
        registry.register("Image", Image);
        registry.register("ImageSet", ImageSet);
        registry.register("Media", Media, serialization_1.Versions.v1_1);
        registry.register("FactSet", FactSet);
        registry.register("ColumnSet", ColumnSet);
        registry.register("ActionSet", ActionSet, serialization_1.Versions.v1_2);
        registry.register("Input.Text", TextInput);
        registry.register("Input.Date", DateInput);
        registry.register("Input.Time", TimeInput);
        registry.register("Input.Number", NumberInput);
        registry.register("Input.ChoiceSet", ChoiceSetInput);
        registry.register("Input.Toggle", ToggleInput);
    };
    GlobalRegistry.populateWithDefaultActions = function (registry) {
        registry.clear();
        registry.register(OpenUrlAction.JsonTypeName, OpenUrlAction);
        registry.register(SubmitAction.JsonTypeName, SubmitAction);
        registry.register(SubmitQueryAction.JsonTypeName, SubmitQueryAction);
        registry.register(ShowCardAction.JsonTypeName, ShowCardAction);
        registry.register(ToggleVisibilityAction.JsonTypeName, ToggleVisibilityAction, serialization_1.Versions.v1_2);
    };
    GlobalRegistry.reset = function () {
        GlobalRegistry.populateWithDefaultElements(GlobalRegistry.elements);
        GlobalRegistry.populateWithDefaultActions(GlobalRegistry.actions);
    };
    GlobalRegistry.elements = new registry_1.CardObjectRegistry();
    GlobalRegistry.actions = new registry_1.CardObjectRegistry();
    return GlobalRegistry;
}());
exports.GlobalRegistry = GlobalRegistry;
GlobalRegistry.reset();
var SerializationContext = /** @class */ (function (_super) {
    __extends(SerializationContext, _super);
    function SerializationContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SerializationContext.prototype.internalParseCardObject = function (parent, source, forbiddenTypeNames, allowFallback, createInstanceCallback, logParseEvent) {
        var result = undefined;
        if (source && typeof source === "object") {
            var typeName = Utils.parseString(source["type"]);
            if (typeName) {
                if (forbiddenTypeNames.indexOf(typeName) >= 0) {
                    logParseEvent(typeName, 1 /* ForbiddenType */);
                }
                else {
                    var tryToFallback = false;
                    result = createInstanceCallback(typeName);
                    if (!result) {
                        tryToFallback = shared_1.GlobalSettings.enableFallback && allowFallback;
                        logParseEvent(typeName, 0 /* UnknownType */);
                    }
                    else {
                        result.setParent(parent);
                        result.parse(source, this);
                        tryToFallback = shared_1.GlobalSettings.enableFallback && allowFallback && result.shouldFallback();
                    }
                    if (tryToFallback) {
                        var fallback = source["fallback"];
                        if (!fallback && parent) {
                            parent.setShouldFallback(true);
                        }
                        if (typeof fallback === "string" && fallback.toLowerCase() === "drop") {
                            result = undefined;
                        }
                        else if (typeof fallback === "object") {
                            result = this.internalParseCardObject(parent, fallback, forbiddenTypeNames, true, createInstanceCallback, logParseEvent);
                        }
                    }
                }
            }
        }
        return result;
    };
    SerializationContext.prototype.cardObjectParsed = function (o, source) {
        if (o instanceof Action && this.onParseAction) {
            this.onParseAction(o, source, this);
        }
        else if (o instanceof CardElement && this.onParseElement) {
            this.onParseElement(o, source, this);
        }
    };
    SerializationContext.prototype.parseCardObject = function (parent, source, forbiddenTypeNames, allowFallback, createInstanceCallback, logParseEvent) {
        var result = this.internalParseCardObject(parent, source, forbiddenTypeNames, allowFallback, createInstanceCallback, logParseEvent);
        if (result !== undefined) {
            this.cardObjectParsed(result, source);
        }
        return result;
    };
    SerializationContext.prototype.parseElement = function (parent, source, allowFallback) {
        var _this = this;
        return this.parseCardObject(parent, source, [], // Forbidden types not supported for elements for now
        allowFallback, function (typeName) {
            return _this.elementRegistry.createInstance(typeName, _this.targetVersion);
        }, function (typeName, errorType) {
            if (errorType === 0 /* UnknownType */) {
                _this.logParseEvent(undefined, Enums.ValidationEvent.UnknownElementType, strings_1.Strings.errors.unknownElementType(typeName));
            }
            else {
                _this.logParseEvent(undefined, Enums.ValidationEvent.ElementTypeNotAllowed, strings_1.Strings.errors.elementTypeNotAllowed(typeName));
            }
        });
    };
    SerializationContext.prototype.parseAction = function (parent, source, forbiddenActionTypes, allowFallback) {
        var _this = this;
        return this.parseCardObject(parent, source, forbiddenActionTypes, allowFallback, function (typeName) {
            return _this.actionRegistry.createInstance(typeName, _this.targetVersion);
        }, function (typeName, errorType) {
            if (errorType == 0 /* UnknownType */) {
                _this.logParseEvent(undefined, Enums.ValidationEvent.UnknownActionType, strings_1.Strings.errors.unknownActionType(typeName));
            }
            else {
                _this.logParseEvent(undefined, Enums.ValidationEvent.ActionTypeNotAllowed, strings_1.Strings.errors.actionTypeNotAllowed(typeName));
            }
        });
    };
    Object.defineProperty(SerializationContext.prototype, "elementRegistry", {
        get: function () {
            return this._elementRegistry ? this._elementRegistry : GlobalRegistry.elements;
        },
        enumerable: false,
        configurable: true
    });
    // Not using a property setter here because the setter should accept "undefined"
    // whereas the getter should never return undefined.
    SerializationContext.prototype.setElementRegistry = function (value) {
        this._elementRegistry = value;
    };
    Object.defineProperty(SerializationContext.prototype, "actionRegistry", {
        get: function () {
            return this._actionRegistry ? this._actionRegistry : GlobalRegistry.actions;
        },
        enumerable: false,
        configurable: true
    });
    // Not using a property setter here because the setter should accept "undefined"
    // whereas the getter should never return undefined.
    SerializationContext.prototype.setActionRegistry = function (value) {
        this._actionRegistry = value;
    };
    return SerializationContext;
}(serialization_1.BaseSerializationContext));
exports.SerializationContext = SerializationContext;
//# sourceMappingURL=card-elements.js.map