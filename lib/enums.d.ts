export declare class ActionStyle {
    static readonly Default: "default";
    static readonly Positive: "positive";
    static readonly Destructive: "destructive";
}
export declare enum Size {
    Auto = 0,
    Stretch = 1,
    Small = 2,
    Medium = 3,
    Large = 4
}
export declare enum ImageSize {
    Small = 0,
    Medium = 1,
    Large = 2
}
export declare enum SizeUnit {
    Weight = 0,
    Pixel = 1
}
export declare enum TextSize {
    Small = 0,
    Default = 1,
    Medium = 2,
    Large = 3,
    ExtraLarge = 4
}
export declare enum TextWeight {
    Lighter = 0,
    Default = 1,
    Bolder = 2
}
export declare enum FontType {
    Default = 0,
    Monospace = 1
}
export declare enum Spacing {
    None = 0,
    Small = 1,
    Default = 2,
    Medium = 3,
    Large = 4,
    ExtraLarge = 5,
    Padding = 6
}
export declare enum TextColor {
    Default = 0,
    Dark = 1,
    Light = 2,
    Accent = 3,
    Good = 4,
    Warning = 5,
    Attention = 6
}
export declare enum HorizontalAlignment {
    Left = 0,
    Center = 1,
    Right = 2
}
export declare enum VerticalAlignment {
    Top = 0,
    Center = 1,
    Bottom = 2
}
export declare enum ActionAlignment {
    Left = 0,
    Center = 1,
    Right = 2,
    Stretch = 3
}
export declare enum ImageStyle {
    Default = 0,
    Person = 1
}
export declare enum ShowCardActionMode {
    Inline = 0,
    Popup = 1
}
export declare enum Orientation {
    Horizontal = 0,
    Vertical = 1
}
export declare enum FillMode {
    Cover = 0,
    RepeatHorizontally = 1,
    RepeatVertically = 2,
    Repeat = 3
}
export declare enum ActionIconPlacement {
    LeftOfTitle = 0,
    AboveTitle = 1
}
export declare enum InputTextStyle {
    Text = 0,
    Tel = 1,
    Url = 2,
    Email = 3
}
export declare class ContainerStyle {
    static readonly Default: "default";
    static readonly Emphasis: "emphasis";
    static readonly Accent: "accent";
    static readonly Good: "good";
    static readonly Attention: "attention";
    static readonly Warning: "warning";
}
export declare enum ValidationPhase {
    Parse = 0,
    ToJSON = 1,
    Validation = 2
}
export declare enum ValidationEvent {
    Hint = 0,
    ActionTypeNotAllowed = 1,
    CollectionCantBeEmpty = 2,
    Deprecated = 3,
    ElementTypeNotAllowed = 4,
    InteractivityNotAllowed = 5,
    InvalidPropertyValue = 6,
    MissingCardType = 7,
    PropertyCantBeNull = 8,
    TooManyActions = 9,
    UnknownActionType = 10,
    UnknownElementType = 11,
    UnsupportedCardVersion = 12,
    DuplicateId = 13,
    UnsupportedProperty = 14,
    RequiredInputsShouldHaveLabel = 15,
    RequiredInputsShouldHaveErrorMessage = 16,
    Other = 17
}
export declare enum ContainerFitStatus {
    FullyInContainer = 0,
    Overflowing = 1,
    FullyOutOfContainer = 2
}
