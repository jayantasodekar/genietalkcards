import * as Enums from "./enums";
export declare class GlobalSettings {
    static useAdvancedTextBlockTruncation: boolean;
    static useAdvancedCardBottomTruncation: boolean;
    static useMarkdownInRadioButtonAndCheckbox: boolean;
    static allowMarkForTextHighlighting: boolean;
    static alwaysBleedSeparators: boolean;
    static enableFullJsonRoundTrip: boolean;
    static displayInputValidationErrors: boolean;
    static allowPreProcessingPropertyValues: boolean;
    static setTabIndexAtCardRoot: boolean;
    static enableFallback: boolean;
}
export declare const ContentTypes: {
    applicationJson: string;
    applicationXWwwFormUrlencoded: string;
};
export interface ISeparationDefinition {
    spacing: number;
    lineThickness?: number;
    lineColor?: string;
}
export interface IInput {
    id?: string;
    value?: string;
    validateValue(): boolean;
}
export declare type Dictionary<T> = {
    [key: string]: T;
};
export declare class StringWithSubstitutions {
    private _isProcessed;
    private _original?;
    private _processed?;
    getReferencedInputs(inputs: IInput[], referencedInputs: Dictionary<IInput>): void;
    substituteInputValues(inputs: Dictionary<IInput>, contentType: string): void;
    getOriginal(): string | undefined;
    get(): string | undefined;
    set(value: string | undefined): void;
}
export declare class SpacingDefinition {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(top?: number, right?: number, bottom?: number, left?: number);
}
export declare class PaddingDefinition {
    top: Enums.Spacing;
    right: Enums.Spacing;
    bottom: Enums.Spacing;
    left: Enums.Spacing;
    constructor(top?: Enums.Spacing, right?: Enums.Spacing, bottom?: Enums.Spacing, left?: Enums.Spacing);
}
export declare class SizeAndUnit {
    physicalSize: number;
    unit: Enums.SizeUnit;
    static parse(input: string, requireUnitSpecifier?: boolean): SizeAndUnit;
    constructor(physicalSize: number, unit: Enums.SizeUnit);
}
export interface IResourceInformation {
    url: string;
    mimeType: string;
}
/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
export declare class UUID {
    private static lut;
    static generate(): string;
    static initialize(): void;
}
