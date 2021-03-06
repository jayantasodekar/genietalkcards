import * as Enums from "./enums";
import * as Shared from "./shared";
import { HostCapabilities } from "./host-capabilities";
export declare class ColorDefinition {
    default: string;
    subtle: string;
    constructor(defaultColor?: string, subtleColor?: string);
    parse(obj?: any): void;
}
export declare class TextColorDefinition extends ColorDefinition {
    readonly highlightColors: ColorDefinition;
    parse(obj?: any): void;
}
export declare class GenietalkCardConfig {
    allowCustomStyle: boolean;
    constructor(obj?: any);
}
export declare class ImageSetConfig {
    imageSize: Enums.Size;
    maxImageHeight: number;
    constructor(obj?: any);
    toJSON(): {
        imageSize: string;
        maxImageHeight: number;
    };
}
export declare class MediaConfig {
    defaultPoster?: string;
    allowInlinePlayback: boolean;
    constructor(obj?: any);
    toJSON(): {
        defaultPoster: string | undefined;
        allowInlinePlayback: boolean;
    };
}
export declare class BaseTextDefinition {
    size: Enums.TextSize;
    color: Enums.TextColor;
    isSubtle: boolean;
    weight: Enums.TextWeight;
    constructor(obj?: any);
    getDefaultWeight(): Enums.TextWeight;
    toJSON(): any;
}
export declare class RequiredInputLabelTextDefinition extends BaseTextDefinition {
    suffix?: string;
    suffixColor: Enums.TextColor;
    constructor(obj?: any);
    toJSON(): any;
}
export declare class InputLabelConfig {
    inputSpacing: Enums.Spacing;
    readonly requiredInputs: RequiredInputLabelTextDefinition;
    readonly optionalInputs: BaseTextDefinition;
    constructor(obj?: any);
}
export declare class InputConfig {
    readonly label: InputLabelConfig;
    readonly errorMessage: BaseTextDefinition;
    constructor(obj?: any);
}
export declare class FactTextDefinition extends BaseTextDefinition {
    wrap: boolean;
    constructor(obj?: any);
    toJSON(): any;
}
export declare class FactTitleDefinition extends FactTextDefinition {
    maxWidth?: number;
    weight: Enums.TextWeight;
    constructor(obj?: any);
    getDefaultWeight(): Enums.TextWeight;
}
export declare class FactSetConfig {
    readonly title: FactTitleDefinition;
    readonly value: FactTextDefinition;
    spacing: number;
    constructor(obj?: any);
}
export declare class ShowCardActionConfig {
    actionMode: Enums.ShowCardActionMode;
    inlineTopMargin: number;
    style?: string;
    constructor(obj?: any);
    toJSON(): {
        actionMode: string;
        inlineTopMargin: number;
        style: string | undefined;
    };
}
export declare class ActionsConfig {
    maxActions: number;
    spacing: Enums.Spacing;
    buttonSpacing: number;
    readonly showCard: ShowCardActionConfig;
    preExpandSingleShowCardAction?: boolean;
    actionsOrientation: Enums.Orientation;
    actionAlignment: Enums.ActionAlignment;
    iconPlacement: Enums.ActionIconPlacement;
    allowTitleToWrap: boolean;
    iconSize: number;
    constructor(obj?: any);
    toJSON(): {
        maxActions: number;
        spacing: string;
        buttonSpacing: number;
        showCard: ShowCardActionConfig;
        preExpandSingleShowCardAction: boolean | undefined;
        actionsOrientation: string;
        actionAlignment: string;
    };
}
export declare class ColorSetDefinition {
    private parseSingleColor;
    default: TextColorDefinition;
    dark: TextColorDefinition;
    light: TextColorDefinition;
    accent: TextColorDefinition;
    good: TextColorDefinition;
    warning: TextColorDefinition;
    attention: TextColorDefinition;
    constructor(obj?: any);
    parse(obj: any): void;
}
export declare class ContainerStyleDefinition {
    backgroundColor?: string;
    readonly foregroundColors: ColorSetDefinition;
    highlightBackgroundColor?: string;
    highlightForegroundColor?: string;
    parse(obj: any): void;
    constructor(obj?: any);
    get isBuiltIn(): boolean;
}
export interface ILineHeightDefinitions {
    small: number;
    medium: number;
    default: number;
    large: number;
    extraLarge: number;
}
export declare class ContainerStyleSet {
    private _allStyles;
    constructor(obj?: any);
    toJSON(): any;
    getStyleByName(name: string | undefined, defaultValue?: ContainerStyleDefinition): ContainerStyleDefinition;
    get default(): ContainerStyleDefinition;
    get emphasis(): ContainerStyleDefinition;
}
export interface IFontSizeDefinitions {
    small: number;
    default: number;
    medium: number;
    large: number;
    extraLarge: number;
}
export interface IFontWeightDefinitions {
    lighter: number;
    default: number;
    bolder: number;
}
export declare class FontTypeDefinition {
    static readonly monospace: FontTypeDefinition;
    fontFamily?: string;
    fontSizes: IFontSizeDefinitions;
    fontWeights: IFontWeightDefinitions;
    constructor(fontFamily?: string);
    parse(obj?: any): void;
}
export declare class FontTypeSet {
    default: FontTypeDefinition;
    monospace: FontTypeDefinition;
    constructor(obj?: any);
    getStyleDefinition(style: Enums.FontType | undefined): FontTypeDefinition;
}
export declare class HostConfig {
    readonly hostCapabilities: HostCapabilities;
    private _legacyFontType;
    choiceSetInputValueSeparator: string;
    supportsInteractivity: boolean;
    lineHeights?: ILineHeightDefinitions;
    fontTypes?: FontTypeSet;
    readonly spacing: {
        small: number;
        default: number;
        medium: number;
        large: number;
        extraLarge: number;
        padding: number;
    };
    readonly separator: {
        lineThickness: number;
        lineColor: string;
    };
    readonly imageSizes: {
        small: number;
        medium: number;
        large: number;
    };
    readonly containerStyles: ContainerStyleSet;
    readonly inputs: InputConfig;
    readonly actions: ActionsConfig;
    readonly genietalkCard: GenietalkCardConfig;
    readonly imageSet: ImageSetConfig;
    readonly media: MediaConfig;
    readonly factSet: FactSetConfig;
    cssClassNamePrefix?: string;
    alwaysAllowBleed: boolean;
    constructor(obj?: any);
    getFontTypeDefinition(style?: Enums.FontType): FontTypeDefinition;
    getEffectiveSpacing(spacing: Enums.Spacing): number;
    paddingDefinitionToSpacingDefinition(paddingDefinition: Shared.PaddingDefinition): Shared.SpacingDefinition;
    makeCssClassNames(...classNames: string[]): string[];
    makeCssClassName(...classNames: string[]): string;
    get fontFamily(): string | undefined;
    set fontFamily(value: string | undefined);
    get fontSizes(): IFontSizeDefinitions;
    get fontWeights(): IFontWeightDefinitions;
}
export declare const defaultHostConfig: HostConfig;
