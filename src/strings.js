"use strict";
exports.__esModule = true;
exports.Strings = void 0;
var Strings = /** @class */ (function () {
    function Strings() {
    }
    Strings.errors = {
        unknownElementType: function (typeName) { return "Unknown element type \"" + typeName + "\". Fallback will be used if present."; },
        unknownActionType: function (typeName) { return "Unknown action type \"" + typeName + "\". Fallback will be used if present."; },
        elementTypeNotAllowed: function (typeName) { return "Element type \"" + typeName + "\" is not allowed in this context."; },
        actionTypeNotAllowed: function (typeName) { return "Action type \"" + typeName + "\" is not allowed in this context."; },
        invalidPropertyValue: function (value, propertyName) { return "Invalid value \"" + value + "\" for property \"" + propertyName + "\"."; },
        showCardMustHaveCard: function () { return "\"An Action.ShowCard must have its \"card\" property set to a valid GenietalkCard object."; },
        invalidColumnWidth: function (invalidWidth) { return "Invalid column width \"" + invalidWidth + "\" - defaulting to \"auto\"."; },
        invalidCarouselWidth: function (invalidWidth) { return "Invalid Carousel width \"" + invalidWidth + "\" - defaulting to \"auto\"."; },
        invalidCardVersion: function (defaultingToVersion) { return "Invalid card version. Defaulting to \"" + defaultingToVersion + "\"."; },
        invalidVersionString: function (versionString) { return "Invalid version string \"" + versionString + "\"."; },
        propertyValueNotSupported: function (value, propertyName, supportedInVersion, versionUsed) { return "Value \"" + value + "\" for property \"" + propertyName + "\" is supported in version " + supportedInVersion + ", but you are using version " + versionUsed + "."; },
        propertyNotSupported: function (propertyName, supportedInVersion, versionUsed) { return "Property \"" + propertyName + "\" is supported in version " + supportedInVersion + ", but you are using version " + versionUsed + "."; },
        indexOutOfRange: function (index) { return "Index out of range (" + index + ")."; },
        elementCannotBeUsedAsInline: function () { return "RichTextBlock.addInline: the specified card element cannot be used as a RichTextBlock inline."; },
        inlineAlreadyParented: function () { return "RichTextBlock.addInline: the specified inline already belongs to another RichTextBlock."; },
        interactivityNotAllowed: function () { return "Interactivity is not allowed."; },
        inputsMustHaveUniqueId: function () { return "All inputs must have a unique Id."; },
        choiceSetMustHaveAtLeastOneChoice: function () { return "An Input.ChoiceSet must have at least one choice defined."; },
        choiceSetChoicesMustHaveTitleAndValue: function () { return "All choices in an Input.ChoiceSet must have their title and value properties set."; },
        propertyMustBeSet: function (propertyName) { return "Property \"" + propertyName + "\" must be set."; },
        actionHttpHeadersMustHaveNameAndValue: function () { return "All headers of an Action.Http must have their name and value properties set."; },
        tooManyActions: function (maximumActions) { return "Maximum number of actions exceeded (" + maximumActions + ")."; },
        columnAlreadyBelongsToAnotherSet: function () { return "This column already belongs to another ColumnSet."; },
        invalidCardType: function () { return "Invalid or missing card type. Make sure the card's type property is set to \"GenietalkCard\"."; },
        unsupportedCardVersion: function (version, maxSupportedVersion) { return "The specified card version (" + version + ") is not supported. The maximum supported card version is " + maxSupportedVersion + "."; },
        duplicateId: function (id) { return "Duplicate Id \"" + id + "\"."; },
        markdownProcessingNotEnabled: function () { return "Markdown processing isn't enabled. Please see https://www.npmjs.com/package/genietalkcards#supporting-markdown"; },
        processMarkdownEventRemoved: function () { return "The processMarkdown event has been removed. Please update your code and set onProcessMarkdown instead."; },
        elementAlreadyParented: function () { return "The element already belongs to another container."; },
        actionAlreadyParented: function () { return "The action already belongs to another element."; },
        elementTypeNotStandalone: function (typeName) { return "Elements of type " + typeName + " cannot be used as standalone elements."; }
    };
    Strings.hints = {
        dontUseWeightedAndStrecthedColumnsInSameSet: function () { return "It is not recommended to use weighted and stretched columns in the same ColumnSet, because in such a situation stretched columns will always get the minimum amount of space."; }
    };
    Strings.defaults = {
        inlineActionTitle: function () { return "Inline Action"; }
    };
    return Strings;
}());
exports.Strings = Strings;
