"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerFitStatus = exports.ValidationEvent = exports.ValidationPhase = exports.ContainerStyle = exports.InputTextStyle = exports.ActionIconPlacement = exports.FillMode = exports.Orientation = exports.ShowCardActionMode = exports.ImageStyle = exports.ActionAlignment = exports.VerticalAlignment = exports.HorizontalAlignment = exports.TextColor = exports.Spacing = exports.FontType = exports.TextWeight = exports.TextSize = exports.SizeUnit = exports.ImageSize = exports.Size = exports.ActionStyle = void 0;
// Note the "weird" way these readonly fields are declared is to work around
// a breaking change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
// and adopt this syntax for all other static readonly fields.
var ActionStyle = /** @class */ (function () {
    function ActionStyle() {
    }
    ActionStyle.Default = "default";
    ActionStyle.Positive = "positive";
    ActionStyle.Destructive = "destructive";
    return ActionStyle;
}());
exports.ActionStyle = ActionStyle;
var Size;
(function (Size) {
    Size[Size["Auto"] = 0] = "Auto";
    Size[Size["Stretch"] = 1] = "Stretch";
    Size[Size["Small"] = 2] = "Small";
    Size[Size["Medium"] = 3] = "Medium";
    Size[Size["Large"] = 4] = "Large";
})(Size = exports.Size || (exports.Size = {}));
var ImageSize;
(function (ImageSize) {
    ImageSize[ImageSize["Small"] = 0] = "Small";
    ImageSize[ImageSize["Medium"] = 1] = "Medium";
    ImageSize[ImageSize["Large"] = 2] = "Large";
})(ImageSize = exports.ImageSize || (exports.ImageSize = {}));
var SizeUnit;
(function (SizeUnit) {
    SizeUnit[SizeUnit["Weight"] = 0] = "Weight";
    SizeUnit[SizeUnit["Pixel"] = 1] = "Pixel";
})(SizeUnit = exports.SizeUnit || (exports.SizeUnit = {}));
var TextSize;
(function (TextSize) {
    TextSize[TextSize["Small"] = 0] = "Small";
    TextSize[TextSize["Default"] = 1] = "Default";
    TextSize[TextSize["Medium"] = 2] = "Medium";
    TextSize[TextSize["Large"] = 3] = "Large";
    TextSize[TextSize["ExtraLarge"] = 4] = "ExtraLarge";
})(TextSize = exports.TextSize || (exports.TextSize = {}));
var TextWeight;
(function (TextWeight) {
    TextWeight[TextWeight["Lighter"] = 0] = "Lighter";
    TextWeight[TextWeight["Default"] = 1] = "Default";
    TextWeight[TextWeight["Bolder"] = 2] = "Bolder";
})(TextWeight = exports.TextWeight || (exports.TextWeight = {}));
var FontType;
(function (FontType) {
    FontType[FontType["Default"] = 0] = "Default";
    FontType[FontType["Monospace"] = 1] = "Monospace";
})(FontType = exports.FontType || (exports.FontType = {}));
var Spacing;
(function (Spacing) {
    Spacing[Spacing["None"] = 0] = "None";
    Spacing[Spacing["Small"] = 1] = "Small";
    Spacing[Spacing["Default"] = 2] = "Default";
    Spacing[Spacing["Medium"] = 3] = "Medium";
    Spacing[Spacing["Large"] = 4] = "Large";
    Spacing[Spacing["ExtraLarge"] = 5] = "ExtraLarge";
    Spacing[Spacing["Padding"] = 6] = "Padding";
})(Spacing = exports.Spacing || (exports.Spacing = {}));
var TextColor;
(function (TextColor) {
    TextColor[TextColor["Default"] = 0] = "Default";
    TextColor[TextColor["Dark"] = 1] = "Dark";
    TextColor[TextColor["Light"] = 2] = "Light";
    TextColor[TextColor["Accent"] = 3] = "Accent";
    TextColor[TextColor["Good"] = 4] = "Good";
    TextColor[TextColor["Warning"] = 5] = "Warning";
    TextColor[TextColor["Attention"] = 6] = "Attention";
})(TextColor = exports.TextColor || (exports.TextColor = {}));
var HorizontalAlignment;
(function (HorizontalAlignment) {
    HorizontalAlignment[HorizontalAlignment["Left"] = 0] = "Left";
    HorizontalAlignment[HorizontalAlignment["Center"] = 1] = "Center";
    HorizontalAlignment[HorizontalAlignment["Right"] = 2] = "Right";
})(HorizontalAlignment = exports.HorizontalAlignment || (exports.HorizontalAlignment = {}));
var VerticalAlignment;
(function (VerticalAlignment) {
    VerticalAlignment[VerticalAlignment["Top"] = 0] = "Top";
    VerticalAlignment[VerticalAlignment["Center"] = 1] = "Center";
    VerticalAlignment[VerticalAlignment["Bottom"] = 2] = "Bottom";
})(VerticalAlignment = exports.VerticalAlignment || (exports.VerticalAlignment = {}));
var ActionAlignment;
(function (ActionAlignment) {
    ActionAlignment[ActionAlignment["Left"] = 0] = "Left";
    ActionAlignment[ActionAlignment["Center"] = 1] = "Center";
    ActionAlignment[ActionAlignment["Right"] = 2] = "Right";
    ActionAlignment[ActionAlignment["Stretch"] = 3] = "Stretch";
})(ActionAlignment = exports.ActionAlignment || (exports.ActionAlignment = {}));
var ImageStyle;
(function (ImageStyle) {
    ImageStyle[ImageStyle["Default"] = 0] = "Default";
    ImageStyle[ImageStyle["Person"] = 1] = "Person";
})(ImageStyle = exports.ImageStyle || (exports.ImageStyle = {}));
var ShowCardActionMode;
(function (ShowCardActionMode) {
    ShowCardActionMode[ShowCardActionMode["Inline"] = 0] = "Inline";
    ShowCardActionMode[ShowCardActionMode["Popup"] = 1] = "Popup";
})(ShowCardActionMode = exports.ShowCardActionMode || (exports.ShowCardActionMode = {}));
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
    Orientation[Orientation["Vertical"] = 1] = "Vertical";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
var FillMode;
(function (FillMode) {
    FillMode[FillMode["Cover"] = 0] = "Cover";
    FillMode[FillMode["RepeatHorizontally"] = 1] = "RepeatHorizontally";
    FillMode[FillMode["RepeatVertically"] = 2] = "RepeatVertically";
    FillMode[FillMode["Repeat"] = 3] = "Repeat";
})(FillMode = exports.FillMode || (exports.FillMode = {}));
var ActionIconPlacement;
(function (ActionIconPlacement) {
    ActionIconPlacement[ActionIconPlacement["LeftOfTitle"] = 0] = "LeftOfTitle";
    ActionIconPlacement[ActionIconPlacement["AboveTitle"] = 1] = "AboveTitle";
})(ActionIconPlacement = exports.ActionIconPlacement || (exports.ActionIconPlacement = {}));
var InputTextStyle;
(function (InputTextStyle) {
    InputTextStyle[InputTextStyle["Text"] = 0] = "Text";
    InputTextStyle[InputTextStyle["Tel"] = 1] = "Tel";
    InputTextStyle[InputTextStyle["Url"] = 2] = "Url";
    InputTextStyle[InputTextStyle["Email"] = 3] = "Email";
})(InputTextStyle = exports.InputTextStyle || (exports.InputTextStyle = {}));
/*
    This should really be a string enum, e.g.

        export enum ContainerStyle {
            Default = "default",
            Emphasis = "emphasis"
        }

    However, some hosts do not use a version of TypeScript
    recent enough to understand string enums. This is
    a compatible construct that does not require using
    a more recent version of TypeScript.

    Also note the "weird" way these readonly fields are declared is to work around
    a breaking change introduced in TS 3.1 wrt d.ts generation. DO NOT CHANGE
    and adopt this syntax for all other static readonly fields.
*/
var ContainerStyle = /** @class */ (function () {
    function ContainerStyle() {
    }
    ContainerStyle.Default = "default";
    ContainerStyle.Emphasis = "emphasis";
    ContainerStyle.Accent = "accent";
    ContainerStyle.Good = "good";
    ContainerStyle.Attention = "attention";
    ContainerStyle.Warning = "warning";
    return ContainerStyle;
}());
exports.ContainerStyle = ContainerStyle;
var ValidationPhase;
(function (ValidationPhase) {
    ValidationPhase[ValidationPhase["Parse"] = 0] = "Parse";
    ValidationPhase[ValidationPhase["ToJSON"] = 1] = "ToJSON";
    ValidationPhase[ValidationPhase["Validation"] = 2] = "Validation";
})(ValidationPhase = exports.ValidationPhase || (exports.ValidationPhase = {}));
var ValidationEvent;
(function (ValidationEvent) {
    ValidationEvent[ValidationEvent["Hint"] = 0] = "Hint";
    ValidationEvent[ValidationEvent["ActionTypeNotAllowed"] = 1] = "ActionTypeNotAllowed";
    ValidationEvent[ValidationEvent["CollectionCantBeEmpty"] = 2] = "CollectionCantBeEmpty";
    ValidationEvent[ValidationEvent["Deprecated"] = 3] = "Deprecated";
    ValidationEvent[ValidationEvent["ElementTypeNotAllowed"] = 4] = "ElementTypeNotAllowed";
    ValidationEvent[ValidationEvent["InteractivityNotAllowed"] = 5] = "InteractivityNotAllowed";
    ValidationEvent[ValidationEvent["InvalidPropertyValue"] = 6] = "InvalidPropertyValue";
    ValidationEvent[ValidationEvent["MissingCardType"] = 7] = "MissingCardType";
    ValidationEvent[ValidationEvent["PropertyCantBeNull"] = 8] = "PropertyCantBeNull";
    ValidationEvent[ValidationEvent["TooManyActions"] = 9] = "TooManyActions";
    ValidationEvent[ValidationEvent["UnknownActionType"] = 10] = "UnknownActionType";
    ValidationEvent[ValidationEvent["UnknownElementType"] = 11] = "UnknownElementType";
    ValidationEvent[ValidationEvent["UnsupportedCardVersion"] = 12] = "UnsupportedCardVersion";
    ValidationEvent[ValidationEvent["DuplicateId"] = 13] = "DuplicateId";
    ValidationEvent[ValidationEvent["UnsupportedProperty"] = 14] = "UnsupportedProperty";
    ValidationEvent[ValidationEvent["RequiredInputsShouldHaveLabel"] = 15] = "RequiredInputsShouldHaveLabel";
    ValidationEvent[ValidationEvent["RequiredInputsShouldHaveErrorMessage"] = 16] = "RequiredInputsShouldHaveErrorMessage";
    ValidationEvent[ValidationEvent["Other"] = 17] = "Other";
})(ValidationEvent = exports.ValidationEvent || (exports.ValidationEvent = {}));
var ContainerFitStatus;
(function (ContainerFitStatus) {
    ContainerFitStatus[ContainerFitStatus["FullyInContainer"] = 0] = "FullyInContainer";
    ContainerFitStatus[ContainerFitStatus["Overflowing"] = 1] = "Overflowing";
    ContainerFitStatus[ContainerFitStatus["FullyOutOfContainer"] = 2] = "FullyOutOfContainer";
})(ContainerFitStatus = exports.ContainerFitStatus || (exports.ContainerFitStatus = {}));
//# sourceMappingURL=enums.js.map