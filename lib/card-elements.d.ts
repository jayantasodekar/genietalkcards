import * as Enums from "./enums";
import { PaddingDefinition, SizeAndUnit, Dictionary, StringWithSubstitutions, IInput, IResourceInformation } from "./shared";
import { HostConfig, BaseTextDefinition, FontTypeDefinition, ColorSetDefinition, TextColorDefinition, ContainerStyleDefinition } from "./host-config";
import { CardObject, ValidationResults } from "./card-object";
import { Version, BaseSerializationContext, SerializableObject, SerializableObjectSchema, StringProperty, BoolProperty, ValueSetProperty, EnumProperty, SerializableObjectCollectionProperty, SerializableObjectProperty, PixelSizeProperty, NumProperty, PropertyBag, CustomProperty, PropertyDefinition } from "./serialization";
import { CardObjectRegistry } from "./registry";
export declare type CardElementHeight = "auto" | "stretch";
export declare abstract class CardElement extends CardObject {
    static readonly langProperty: StringProperty;
    static readonly isVisibleProperty: BoolProperty;
    static readonly separatorProperty: BoolProperty;
    static readonly heightProperty: ValueSetProperty;
    static readonly horizontalAlignmentProperty: EnumProperty<typeof Enums.HorizontalAlignment>;
    static readonly spacingProperty: EnumProperty<typeof Enums.Spacing>;
    horizontalAlignment: Enums.HorizontalAlignment;
    spacing: Enums.Spacing;
    separator: boolean;
    height: CardElementHeight;
    get lang(): string | undefined;
    set lang(value: string | undefined);
    get isVisible(): boolean;
    set isVisible(value: boolean);
    private _hostConfig?;
    private _separatorElement?;
    private _truncatedDueToOverflow;
    private _defaultRenderedElementDisplayMode?;
    private _padding?;
    private internalRenderSeparator;
    private updateRenderedElementVisibility;
    private hideElementDueToOverflow;
    private showElementHiddenDueToOverflow;
    private handleOverflow;
    private resetOverflow;
    protected getDefaultSerializationContext(): BaseSerializationContext;
    protected createPlaceholderElement(): HTMLElement;
    protected adjustRenderedElementSize(renderedElement: HTMLElement): void;
    protected isDisplayed(): boolean;
    protected abstract internalRender(): HTMLElement | undefined;
    protected overrideInternalRender(): HTMLElement | undefined;
    protected applyPadding(): void;
    protected truncateOverflow(maxHeight: number): boolean;
    protected undoOverflowTruncation(): void;
    protected getDefaultPadding(): PaddingDefinition;
    protected getHasBackground(): boolean;
    protected getPadding(): PaddingDefinition | undefined;
    protected setPadding(value: PaddingDefinition | undefined): void;
    protected shouldSerialize(context: SerializationContext): boolean;
    protected get useDefaultSizing(): boolean;
    protected get allowCustomPadding(): boolean;
    protected get separatorOrientation(): Enums.Orientation;
    protected get defaultStyle(): string;
    customCssSelector?: string;
    parse(source: any, context?: SerializationContext): void;
    asString(): string | undefined;
    isBleeding(): boolean;
    getEffectiveStyle(): string;
    getEffectiveStyleDefinition(): ContainerStyleDefinition;
    getForbiddenActionTypes(): ActionType[];
    getImmediateSurroundingPadding(result: PaddingDefinition, processTop?: boolean, processRight?: boolean, processBottom?: boolean, processLeft?: boolean): void;
    getActionCount(): number;
    getActionAt(index: number): Action | undefined;
    remove(): boolean;
    render(): HTMLElement | undefined;
    updateLayout(processChildren?: boolean): void;
    indexOf(cardElement: CardElement): number;
    isDesignMode(): boolean;
    isFirstElement(element: CardElement): boolean;
    isLastElement(element: CardElement): boolean;
    isAtTheVeryLeft(): boolean;
    isAtTheVeryRight(): boolean;
    isAtTheVeryTop(): boolean;
    isAtTheVeryBottom(): boolean;
    isBleedingAtTop(): boolean;
    isBleedingAtBottom(): boolean;
    isLeftMostElement(element: CardElement): boolean;
    isRightMostElement(element: CardElement): boolean;
    isTopElement(element: CardElement): boolean;
    isBottomElement(element: CardElement): boolean;
    isHiddenDueToOverflow(): boolean;
    getRootElement(): CardElement;
    getParentContainer(): Container | undefined;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    getElementById(id: string): CardElement | undefined;
    getActionById(id: string): Action | undefined;
    getEffectivePadding(): PaddingDefinition;
    get hostConfig(): HostConfig;
    set hostConfig(value: HostConfig);
    get index(): number;
    get isInteractive(): boolean;
    get isStandalone(): boolean;
    get isInline(): boolean;
    get hasVisibleSeparator(): boolean;
    get separatorElement(): HTMLElement | undefined;
    get parent(): CardElement | undefined;
}
export declare class ActionProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly forbiddenActionTypes: string[];
    parse(sender: SerializableObject, source: PropertyBag, context: SerializationContext): Action | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: Action | undefined, context: SerializationContext): void;
    constructor(targetVersion: Version, name: string, forbiddenActionTypes?: string[]);
}
export declare abstract class BaseTextBlock extends CardElement {
    static readonly textProperty: StringProperty;
    static readonly sizeProperty: EnumProperty<typeof Enums.TextSize>;
    static readonly weightProperty: EnumProperty<typeof Enums.TextWeight>;
    static readonly colorProperty: EnumProperty<typeof Enums.TextColor>;
    static readonly isSubtleProperty: BoolProperty;
    static readonly fontTypeProperty: EnumProperty<typeof Enums.FontType>;
    static readonly selectActionProperty: ActionProperty;
    protected populateSchema(schema: SerializableObjectSchema): void;
    size: Enums.TextSize;
    weight: Enums.TextWeight;
    color: Enums.TextColor;
    fontType?: Enums.FontType;
    isSubtle: boolean;
    get text(): string | undefined;
    set text(value: string | undefined);
    selectAction?: Action;
    protected getFontSize(fontType: FontTypeDefinition): number;
    protected getColorDefinition(colorSet: ColorSetDefinition, color: Enums.TextColor): TextColorDefinition;
    protected setText(value: string | undefined): void;
    ariaHidden: boolean;
    constructor(text?: string);
    init(textDefinition: BaseTextDefinition): void;
    asString(): string | undefined;
    applyStylesTo(targetElement: HTMLElement): void;
    get effectiveColor(): Enums.TextColor;
}
export declare class TextBlock extends BaseTextBlock {
    static readonly wrapProperty: BoolProperty;
    static readonly maxLinesProperty: NumProperty;
    wrap: boolean;
    maxLines?: number;
    private _computedLineHeight;
    private _originalInnerHtml;
    private _processedText?;
    private _treatAsPlainText;
    private restoreOriginalContent;
    private truncateIfSupported;
    protected setText(value: string): void;
    protected internalRender(): HTMLElement | undefined;
    protected truncateOverflow(maxHeight: number): boolean;
    protected undoOverflowTruncation(): void;
    useMarkdown: boolean;
    forElementId?: string;
    applyStylesTo(targetElement: HTMLElement): void;
    getJsonTypeName(): string;
    updateLayout(processChildren?: boolean): void;
}
export declare class TextRun extends BaseTextBlock {
    static readonly italicProperty: BoolProperty;
    static readonly strikethroughProperty: BoolProperty;
    static readonly highlightProperty: BoolProperty;
    static readonly underlineProperty: BoolProperty;
    protected populateSchema(schema: SerializableObjectSchema): void;
    italic: boolean;
    strikethrough: boolean;
    highlight: boolean;
    underline: boolean;
    protected internalRender(): HTMLElement | undefined;
    applyStylesTo(targetElement: HTMLElement): void;
    getJsonTypeName(): string;
    get isStandalone(): boolean;
    get isInline(): boolean;
}
export declare class RichTextBlock extends CardElement {
    private _inlines;
    private internalAddInline;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected internalRender(): HTMLElement | undefined;
    forElementId?: string;
    asString(): string | undefined;
    getJsonTypeName(): string;
    getInlineCount(): number;
    getInlineAt(index: number): CardElement;
    addInline(inline: CardElement | string): void;
    removeInline(inline: CardElement): boolean;
}
export declare class Fact extends SerializableObject {
    static readonly titleProperty: StringProperty;
    static readonly valueProperty: StringProperty;
    name?: string;
    value?: string;
    protected getSchemaKey(): string;
    constructor(name?: string, value?: string);
}
export declare class FactSet extends CardElement {
    static readonly factsProperty: SerializableObjectCollectionProperty;
    facts: Fact[];
    protected get useDefaultSizing(): boolean;
    protected internalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
}
declare class ImageDimensionProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly internalName: string;
    readonly fallbackProperty?: ValueSetProperty | undefined;
    getInternalName(): string;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): number | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: number | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, internalName: string, fallbackProperty?: ValueSetProperty | undefined);
}
export declare class Image extends CardElement {
    static readonly urlProperty: StringProperty;
    static readonly altTextProperty: StringProperty;
    static readonly backgroundColorProperty: StringProperty;
    static readonly styleProperty: EnumProperty<typeof Enums.ImageStyle>;
    static readonly sizeProperty: EnumProperty<typeof Enums.Size>;
    static readonly pixelWidthProperty: ImageDimensionProperty;
    static readonly pixelHeightProperty: ImageDimensionProperty;
    static readonly selectActionProperty: ActionProperty;
    protected populateSchema(schema: SerializableObjectSchema): void;
    url?: string;
    altText?: string;
    backgroundColor?: string;
    size: Enums.Size;
    style: Enums.ImageStyle;
    pixelWidth?: number;
    pixelHeight?: number;
    selectAction?: Action;
    private applySize;
    protected get useDefaultSizing(): boolean;
    protected internalRender(): HTMLElement | undefined;
    maxHeight?: number;
    getJsonTypeName(): string;
    getActionById(id: string): Action | undefined;
    getResourceInformation(): IResourceInformation[];
}
export declare abstract class CardElementContainer extends CardElement {
    static readonly selectActionProperty: ActionProperty;
    protected populateSchema(schema: SerializableObjectSchema): void;
    protected _selectAction?: Action;
    protected isElementAllowed(element: CardElement): boolean;
    protected applyPadding(): void;
    protected get isSelectable(): boolean;
    abstract getItemCount(): number;
    abstract getItemAt(index: number): CardElement;
    abstract getFirstVisibleRenderedItem(): CardElement | undefined;
    abstract getLastVisibleRenderedItem(): CardElement | undefined;
    abstract removeItem(item: CardElement): boolean;
    allowVerticalOverflow: boolean;
    internalValidateProperties(context: ValidationResults): void;
    render(): HTMLElement | undefined;
    updateLayout(processChildren?: boolean): void;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    getElementById(id: string): CardElement | undefined;
}
export declare class ImageSet extends CardElementContainer {
    static readonly imagesProperty: SerializableObjectCollectionProperty;
    static readonly imageSizeProperty: EnumProperty<typeof Enums.ImageSize>;
    private _images;
    imageSize: Enums.ImageSize;
    protected internalRender(): HTMLElement | undefined;
    getItemCount(): number;
    getItemAt(index: number): CardElement;
    getFirstVisibleRenderedItem(): CardElement | undefined;
    getLastVisibleRenderedItem(): CardElement | undefined;
    removeItem(item: CardElement): boolean;
    getJsonTypeName(): string;
    addImage(image: Image): void;
    indexOf(cardElement: CardElement): number;
}
export declare class MediaSource extends SerializableObject {
    static readonly mimeTypeProperty: StringProperty;
    static readonly urlProperty: StringProperty;
    mimeType?: string;
    url?: string;
    protected getSchemaKey(): string;
    constructor(url?: string, mimeType?: string);
    isValid(): boolean;
    render(): HTMLElement | undefined;
}
export declare class Media extends CardElement {
    static readonly sourcesProperty: SerializableObjectCollectionProperty;
    static readonly posterProperty: StringProperty;
    static readonly altTextProperty: StringProperty;
    sources: MediaSource[];
    poster?: string;
    altText?: string;
    static readonly supportedMediaTypes: string[];
    private _selectedMediaType?;
    private _selectedSources;
    private getPosterUrl;
    private processSources;
    private handlePlayButtonInvoke;
    private renderPoster;
    private renderMediaPlayer;
    protected internalRender(): HTMLElement | undefined;
    static onPlay?: (sender: Media) => void;
    getJsonTypeName(): string;
    getResourceInformation(): IResourceInformation[];
    get selectedMediaType(): string | undefined;
}
export declare abstract class Input extends CardElement implements IInput {
    static readonly labelProperty: StringProperty;
    static readonly isRequiredProperty: BoolProperty;
    static readonly errorMessageProperty: StringProperty;
    label?: string;
    isRequired: boolean;
    errorMessage?: string;
    private _outerContainerElement;
    private _inputControlContainerElement;
    private _renderedErrorMessageElement?;
    private _renderedLabelElement?;
    private _renderedInputControlElement?;
    protected getAllLabelIds(): string[];
    protected updateInputControlAriaLabelledBy(): void;
    protected get isNullable(): boolean;
    protected get renderedInputControlElement(): HTMLElement | undefined;
    protected get inputControlContainerElement(): HTMLElement;
    protected overrideInternalRender(): HTMLElement | undefined;
    protected valueChanged(): void;
    protected resetValidationFailureCue(): void;
    protected showValidationErrorMessage(): void;
    onValueChanged: (sender: Input) => void;
    abstract isSet(): boolean;
    focus(): void;
    isValid(): boolean;
    internalValidateProperties(context: ValidationResults): void;
    validateValue(): boolean;
    getAllInputs(processActions?: boolean): Input[];
    abstract get value(): any;
    get isInteractive(): boolean;
}
export declare class TextInput extends Input {
    static readonly valueProperty: StringProperty;
    static readonly maxLengthProperty: NumProperty;
    static readonly isMultilineProperty: BoolProperty;
    static readonly placeholderProperty: StringProperty;
    static readonly styleProperty: EnumProperty<typeof Enums.InputTextStyle>;
    static readonly inlineActionProperty: ActionProperty;
    static readonly regexProperty: StringProperty;
    defaultValue?: string;
    maxLength?: number;
    isMultiline: boolean;
    placeholder?: string;
    style: Enums.InputTextStyle;
    inlineAction?: Action;
    regex?: string;
    private setupInput;
    protected internalRender(): HTMLElement | undefined;
    protected overrideInternalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
    getActionById(id: string): Action | undefined;
    isSet(): boolean;
    isValid(): boolean;
    get value(): string | undefined;
}
export declare class ToggleInput extends Input {
    static readonly valueProperty: StringProperty;
    static readonly titleProperty: StringProperty;
    static readonly valueOnProperty: StringProperty;
    static readonly valueOffProperty: StringProperty;
    static readonly wrapProperty: BoolProperty;
    defaultValue?: string;
    title?: string;
    valueOn: string;
    valueOff: string;
    wrap: boolean;
    private _checkboxInputElement;
    private _checkboxInputLabelElement;
    protected updateInputControlAriaLabelledBy(): void;
    protected internalRender(): HTMLElement | undefined;
    protected get isNullable(): boolean;
    getJsonTypeName(): string;
    focus(): void;
    isSet(): boolean;
    get value(): string | undefined;
}
export declare class Choice extends SerializableObject {
    static readonly titleProperty: StringProperty;
    static readonly valueProperty: StringProperty;
    title?: string;
    value?: string;
    protected getSchemaKey(): string;
    constructor(title?: string, value?: string);
}
export declare class ChoiceSetInput extends Input {
    static readonly valueProperty: StringProperty;
    static readonly choicesProperty: SerializableObjectCollectionProperty;
    static readonly styleProperty: ValueSetProperty;
    static readonly isMultiSelectProperty: BoolProperty;
    static readonly placeholderProperty: StringProperty;
    static readonly wrapProperty: BoolProperty;
    defaultValue?: string;
    style?: "compact" | "expanded";
    get isCompact(): boolean;
    set isCompact(value: boolean);
    isMultiSelect: boolean;
    placeholder?: string;
    wrap: boolean;
    choices: Choice[];
    private static uniqueCategoryCounter;
    private static getUniqueCategoryName;
    private _uniqueCategoryName;
    private _selectElement;
    private _toggleInputs;
    private _labels;
    private renderCompoundInput;
    protected updateInputControlAriaLabelledBy(): void;
    protected internalApplyAriaCurrent(): void;
    protected internalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
    focus(): void;
    internalValidateProperties(context: ValidationResults): void;
    isSet(): boolean;
    get value(): string | undefined;
}
export declare class NumberInput extends Input {
    static readonly valueProperty: NumProperty;
    static readonly placeholderProperty: StringProperty;
    static readonly minProperty: NumProperty;
    static readonly maxProperty: NumProperty;
    defaultValue?: number;
    min?: number;
    max?: number;
    placeholder?: string;
    private _numberInputElement;
    protected internalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
    isSet(): boolean;
    isValid(): boolean;
    get value(): number | undefined;
}
export declare class DateInput extends Input {
    static readonly valueProperty: StringProperty;
    static readonly placeholderProperty: StringProperty;
    static readonly minProperty: StringProperty;
    static readonly maxProperty: StringProperty;
    defaultValue?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    private _dateInputElement;
    protected internalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
    isSet(): boolean;
    isValid(): boolean;
    get value(): string | undefined;
}
export declare class TimeProperty extends CustomProperty<string | undefined> {
    readonly targetVersion: Version;
    readonly name: string;
    constructor(targetVersion: Version, name: string);
}
export declare class TimeInput extends Input {
    private static convertTimeStringToDate;
    static readonly valueProperty: TimeProperty;
    static readonly placeholderProperty: StringProperty;
    static readonly minProperty: TimeProperty;
    static readonly maxProperty: TimeProperty;
    defaultValue?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    private _timeInputElement;
    protected internalRender(): HTMLElement | undefined;
    getJsonTypeName(): string;
    isSet(): boolean;
    isValid(): boolean;
    get value(): string | undefined;
}
declare const enum ActionButtonState {
    Normal = 0,
    Expanded = 1,
    Subdued = 2
}
export declare type ActionType = {
    new (): Action;
};
export declare abstract class Action extends CardObject {
    static readonly titleProperty: StringProperty;
    static readonly iconUrlProperty: StringProperty;
    static readonly styleProperty: ValueSetProperty;
    static readonly ignoreInputValidationProperty: BoolProperty;
    title?: string;
    iconUrl?: string;
    style: string;
    private _actionCollection?;
    protected getDefaultSerializationContext(): BaseSerializationContext;
    protected addCssClasses(element: HTMLElement): void;
    protected internalGetReferencedInputs(): Dictionary<Input>;
    protected internalPrepareForExecution(inputs: Dictionary<Input> | undefined): void;
    protected internalValidateInputs(referencedInputs: Dictionary<Input> | undefined): Input[];
    protected shouldSerialize(context: SerializationContext): boolean;
    protected raiseExecuteActionEvent(): void;
    onExecute: (sender: Action) => void;
    getHref(): string | undefined;
    getAriaRole(): string;
    updateActionButtonCssStyle(actionButtonElement: HTMLElement, buttonState?: ActionButtonState): void;
    parse(source: any, context?: SerializationContext): void;
    render(baseCssClass?: string): void;
    execute(): void;
    prepareForExecution(): boolean;
    remove(): boolean;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    getActionById(id: string): Action | undefined;
    getReferencedInputs(): Dictionary<Input> | undefined;
    /**
     * Validates the inputs associated with this action.
     *
     * @returns A list of inputs that failed validation, or an empty array if no input failed validation.
     */
    validateInputs(): Input[];
    get isPrimary(): boolean;
    set isPrimary(value: boolean);
    get ignoreInputValidation(): boolean;
    get hostConfig(): HostConfig;
    get parent(): CardElement | undefined;
}
export declare class SubmitAction extends Action {
    static readonly dataProperty: PropertyDefinition;
    private _originalData?;
    private _ignoreInputValidation;
    static readonly JsonTypeName: "Action.Submit";
    private _isPrepared;
    private _processedData?;
    protected internalGetReferencedInputs(): Dictionary<Input>;
    protected internalPrepareForExecution(inputs: Dictionary<Input> | undefined): void;
    getJsonTypeName(): string;
    get ignoreInputValidation(): boolean;
    set ignoreInputValidation(value: boolean);
    get data(): object | undefined;
    set data(value: object | undefined);
}
export declare class SubmitQueryAction extends Action {
    static readonly dataProperty: PropertyDefinition;
    private _originalData?;
    private _ignoreInputValidation;
    static readonly JsonTypeName: "Action.SubmitQuery";
    private _isPrepared;
    private _processedData?;
    protected internalGetReferencedInputs(): Dictionary<Input>;
    protected internalPrepareForExecution(inputs: Dictionary<Input> | undefined): void;
    getJsonTypeName(): string;
    get ignoreInputValidation(): boolean;
    set ignoreInputValidation(value: boolean);
    get query(): object | undefined;
    set query(value: object | undefined);
}
export declare class OpenUrlAction extends Action {
    static readonly urlProperty: StringProperty;
    url?: string;
    static readonly JsonTypeName: "Action.OpenUrl";
    getJsonTypeName(): string;
    getAriaRole(): string;
    internalValidateProperties(context: ValidationResults): void;
    getHref(): string | undefined;
}
export declare class ToggleVisibilityAction extends Action {
    static readonly targetElementsProperty: CustomProperty<PropertyBag>;
    targetElements: {
        [key: string]: any;
    };
    static readonly JsonTypeName: "Action.ToggleVisibility";
    private updateAriaControlsAttribute;
    getJsonTypeName(): string;
    render(baseCssClass?: string): void;
    execute(): void;
    addTargetElement(elementId: string, isVisible?: boolean | undefined): void;
    removeTargetElement(elementId: string): void;
}
declare class StringWithSubstitutionProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): StringWithSubstitutions;
    toJSON(sender: SerializableObject, target: PropertyBag, value: StringWithSubstitutions, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string);
}
export declare class HttpHeader extends SerializableObject {
    static readonly nameProperty: StringProperty;
    static readonly valueProperty: StringWithSubstitutionProperty;
    protected getSchemaKey(): string;
    name: string;
    private _value;
    constructor(name?: string, value?: string);
    getReferencedInputs(inputs: Input[], referencedInputs: Dictionary<Input>): void;
    prepareForExecution(inputs: Dictionary<Input>): void;
    get value(): string | undefined;
    set value(newValue: string | undefined);
}
export declare class HttpAction extends Action {
    static readonly urlProperty: StringWithSubstitutionProperty;
    static readonly bodyProperty: StringWithSubstitutionProperty;
    static readonly methodProperty: StringProperty;
    static readonly headersProperty: SerializableObjectCollectionProperty;
    protected populateSchema(schema: SerializableObjectSchema): void;
    private _url;
    private _body;
    method?: string;
    headers: HttpHeader[];
    private _ignoreInputValidation;
    static readonly JsonTypeName: "Action.Http";
    protected internalGetReferencedInputs(): Dictionary<Input>;
    protected internalPrepareForExecution(inputs: Dictionary<Input> | undefined): void;
    getJsonTypeName(): string;
    internalValidateProperties(context: ValidationResults): void;
    get ignoreInputValidation(): boolean;
    set ignoreInputValidation(value: boolean);
    get url(): string | undefined;
    set url(value: string | undefined);
    get body(): string | undefined;
    set body(value: string | undefined);
}
export declare class ShowCardAction extends Action {
    static readonly JsonTypeName: "Action.ShowCard";
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected addCssClasses(element: HTMLElement): void;
    protected raiseExecuteActionEvent(): void;
    readonly card: GenietalkCard;
    getJsonTypeName(): string;
    internalValidateProperties(context: ValidationResults): void;
    updateActionButtonCssStyle(actionButtonElement: HTMLElement, buttonState?: ActionButtonState): void;
    setParent(value: CardElement): void;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    getActionById(id: string): Action | undefined;
}
export declare class ActionSet extends CardElement {
    static readonly orientationProperty: EnumProperty<typeof Enums.Orientation>;
    orientation?: Enums.Orientation;
    private _actionCollection;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected internalRender(): HTMLElement | undefined;
    constructor();
    isBleedingAtBottom(): boolean;
    getJsonTypeName(): string;
    getActionCount(): number;
    getActionAt(index: number): Action | undefined;
    internalValidateProperties(context: ValidationResults): void;
    addAction(action: Action): void;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    get isInteractive(): boolean;
}
export declare abstract class StylableCardElementContainer extends CardElementContainer {
    static readonly styleProperty: ValueSetProperty;
    static readonly bleedProperty: BoolProperty;
    static readonly minHeightProperty: PixelSizeProperty;
    get style(): string | undefined;
    set style(value: string | undefined);
    private _bleed;
    minPixelHeight?: number;
    protected adjustRenderedElementSize(renderedElement: HTMLElement): void;
    protected applyBackground(): void;
    protected applyPadding(): void;
    protected getHasBackground(): boolean;
    protected getDefaultPadding(): PaddingDefinition;
    protected getHasExpandedAction(): boolean;
    protected getBleed(): boolean;
    protected setBleed(value: boolean): void;
    protected get renderedActionCount(): number;
    protected get hasExplicitStyle(): boolean;
    protected get allowCustomStyle(): boolean;
    isBleeding(): boolean;
    internalValidateProperties(context: ValidationResults): void;
    render(): HTMLElement | undefined;
    getEffectiveStyle(): string;
}
export declare class BackgroundImage extends SerializableObject {
    static readonly urlProperty: StringProperty;
    static readonly fillModeProperty: EnumProperty<typeof Enums.FillMode>;
    static readonly horizontalAlignmentProperty: EnumProperty<typeof Enums.HorizontalAlignment>;
    static readonly verticalAlignmentProperty: EnumProperty<typeof Enums.VerticalAlignment>;
    url?: string;
    fillMode: Enums.FillMode;
    horizontalAlignment: Enums.HorizontalAlignment;
    verticalAlignment: Enums.VerticalAlignment;
    protected getSchemaKey(): string;
    protected internalParse(source: any, context: BaseSerializationContext): void;
    apply(element: CardElement): void;
    isValid(): boolean;
}
export declare class Container extends StylableCardElementContainer {
    static readonly backgroundImageProperty: SerializableObjectProperty;
    static readonly verticalContentAlignmentProperty: EnumProperty<typeof Enums.VerticalAlignment>;
    static readonly rtlProperty: BoolProperty;
    get backgroundImage(): BackgroundImage;
    verticalContentAlignment: Enums.VerticalAlignment;
    rtl?: boolean;
    private _items;
    private _renderedItems;
    private insertItemAt;
    protected supportsExcplitiHeight(): boolean;
    protected getItemsCollectionPropertyName(): string;
    protected applyBackground(): void;
    protected internalRender(): HTMLElement | undefined;
    protected truncateOverflow(maxHeight: number): boolean;
    protected undoOverflowTruncation(): void;
    protected getHasBackground(): boolean;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected get isSelectable(): boolean;
    getItemCount(): number;
    getItemAt(index: number): CardElement;
    getFirstVisibleRenderedItem(): CardElement | undefined;
    getLastVisibleRenderedItem(): CardElement | undefined;
    getJsonTypeName(): string;
    isFirstElement(element: CardElement): boolean;
    isLastElement(element: CardElement): boolean;
    isRtl(): boolean;
    isBleedingAtTop(): boolean;
    isBleedingAtBottom(): boolean;
    indexOf(cardElement: CardElement): number;
    addItem(item: CardElement): void;
    insertItemBefore(item: CardElement, insertBefore: CardElement): void;
    insertItemAfter(item: CardElement, insertAfter: CardElement): void;
    removeItem(item: CardElement): boolean;
    clear(): void;
    getResourceInformation(): IResourceInformation[];
    getActionById(id: string): Action | undefined;
    get padding(): PaddingDefinition | undefined;
    set padding(value: PaddingDefinition | undefined);
    get selectAction(): Action | undefined;
    set selectAction(value: Action | undefined);
    get bleed(): boolean;
    set bleed(value: boolean);
}
export declare type ColumnWidth = SizeAndUnit | "auto" | "stretch";
export declare class Column extends Container {
    static readonly widthProperty: CustomProperty<ColumnWidth>;
    width: ColumnWidth;
    private _computedWeight;
    protected adjustRenderedElementSize(renderedElement: HTMLElement): void;
    protected shouldSerialize(context: SerializationContext): boolean;
    protected get separatorOrientation(): Enums.Orientation;
    constructor(width?: ColumnWidth);
    getJsonTypeName(): string;
    get hasVisibleSeparator(): boolean;
    get isStandalone(): boolean;
}
export declare type CarouselItemWidth = SizeAndUnit | "auto" | "stretch";
export declare class CarouselItem extends Container {
    static readonly widthProperty: CustomProperty<ColumnWidth>;
    width: CarouselItemWidth;
    private _computedWeight;
    protected adjustRenderedElementSize(renderedElement: HTMLElement): void;
    protected shouldSerialize(context: SerializationContext): boolean;
    protected get separatorOrientation(): Enums.Orientation;
    constructor(width?: CarouselItemWidth);
    getJsonTypeName(): string;
    get hasVisibleSeparator(): boolean;
    get isStandalone(): boolean;
}
export declare class ColumnSet extends StylableCardElementContainer {
    private _columns;
    private _renderedColumns;
    private createColumnInstance;
    protected internalRender(): HTMLElement | undefined;
    protected truncateOverflow(maxHeight: number): boolean;
    protected undoOverflowTruncation(): void;
    protected get isSelectable(): boolean;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    isFirstElement(element: CardElement): boolean;
    isBleedingAtTop(): boolean;
    isBleedingAtBottom(): boolean;
    getItemCount(): number;
    getFirstVisibleRenderedItem(): CardElement | undefined;
    getLastVisibleRenderedItem(): CardElement | undefined;
    getColumnAt(index: number): Column;
    getItemAt(index: number): CardElement;
    getJsonTypeName(): string;
    internalValidateProperties(context: ValidationResults): void;
    addColumn(column: Column): void;
    removeItem(item: CardElement): boolean;
    indexOf(cardElement: CardElement): number;
    isLeftMostElement(element: CardElement): boolean;
    isRightMostElement(element: CardElement): boolean;
    isTopElement(element: CardElement): boolean;
    isBottomElement(element: CardElement): boolean;
    getActionById(id: string): Action | undefined;
    get bleed(): boolean;
    set bleed(value: boolean);
    get padding(): PaddingDefinition | undefined;
    set padding(value: PaddingDefinition | undefined);
    get selectAction(): Action | undefined;
    set selectAction(value: Action | undefined);
}
export declare class Carousel extends StylableCardElementContainer {
    private _carouselitems;
    private _renderedCarouselItems;
    private createCarouselItemInstance;
    protected internalRender(): HTMLElement | undefined;
    protected truncateOverflow(maxHeight: number): boolean;
    protected undoOverflowTruncation(): void;
    protected get isSelectable(): boolean;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    isFirstElement(element: CardElement): boolean;
    isBleedingAtTop(): boolean;
    isBleedingAtBottom(): boolean;
    getItemCount(): number;
    getFirstVisibleRenderedItem(): CardElement | undefined;
    getLastVisibleRenderedItem(): CardElement | undefined;
    getCarouselItemAt(index: number): CarouselItem;
    getItemAt(index: number): CardElement;
    getJsonTypeName(): string;
    internalValidateProperties(context: ValidationResults): void;
    addCarouselItem(carouselitem: CarouselItem): void;
    removeItem(item: CardElement): boolean;
    indexOf(cardElement: CardElement): number;
    isLeftMostElement(element: CardElement): boolean;
    isRightMostElement(element: CardElement): boolean;
    isTopElement(element: CardElement): boolean;
    isBottomElement(element: CardElement): boolean;
    getActionById(id: string): Action | undefined;
    get bleed(): boolean;
    set bleed(value: boolean);
    get padding(): PaddingDefinition | undefined;
    set padding(value: PaddingDefinition | undefined);
    get selectAction(): Action | undefined;
    set selectAction(value: Action | undefined);
}
export declare abstract class ContainerWithActions extends Container {
    private _actionCollection;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected internalRender(): HTMLElement | undefined;
    protected getHasExpandedAction(): boolean;
    protected get renderedActionCount(): number;
    protected get renderIfEmpty(): boolean;
    constructor();
    getActionCount(): number;
    getActionAt(index: number): Action | undefined;
    getActionById(id: string): Action | undefined;
    internalValidateProperties(context: ValidationResults): void;
    isLastElement(element: CardElement): boolean;
    addAction(action: Action): void;
    clear(): void;
    getAllInputs(processActions?: boolean): Input[];
    getResourceInformation(): IResourceInformation[];
    isBleedingAtBottom(): boolean;
    get isStandalone(): boolean;
}
export interface IMarkdownProcessingResult {
    didProcess: boolean;
    outputHtml?: any;
}
export declare class GenietalkCard extends ContainerWithActions {
    static readonly schemaUrl = "http://genietalkcards.io/schemas/genietalk-card.json";
    protected static readonly $schemaProperty: CustomProperty<string>;
    static readonly versionProperty: CustomProperty<Version | undefined>;
    static readonly fallbackTextProperty: StringProperty;
    static readonly speakProperty: StringProperty;
    version: Version;
    fallbackText?: string;
    speak?: string;
    static onAnchorClicked?: (element: CardElement, anchor: HTMLAnchorElement) => boolean;
    static onExecuteAction?: (action: Action) => void;
    static onElementVisibilityChanged?: (element: CardElement) => void;
    static onImageLoaded?: (image: Image) => void;
    static onInlineCardExpanded?: (action: ShowCardAction, isExpanded: boolean) => void;
    static onInputValueChanged?: (input: Input) => void;
    static onProcessMarkdown?: (text: string, result: IMarkdownProcessingResult) => void;
    static get processMarkdown(): (text: string) => string;
    static set processMarkdown(value: (text: string) => string);
    static applyMarkdown(text: string): IMarkdownProcessingResult;
    private _fallbackCard?;
    private isVersionSupported;
    protected getDefaultSerializationContext(): BaseSerializationContext;
    protected getItemsCollectionPropertyName(): string;
    protected internalParse(source: any, context: SerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: SerializationContext): void;
    protected internalRender(): HTMLElement | undefined;
    protected getHasBackground(): boolean;
    protected getDefaultPadding(): PaddingDefinition;
    protected shouldSerialize(context: SerializationContext): boolean;
    protected get renderIfEmpty(): boolean;
    protected get bypassVersionCheck(): boolean;
    protected get allowCustomStyle(): boolean;
    protected get hasBackground(): boolean;
    onAnchorClicked?: (element: CardElement, anchor: HTMLAnchorElement) => boolean;
    onExecuteAction?: (action: Action) => void;
    onElementVisibilityChanged?: (element: CardElement) => void;
    onImageLoaded?: (image: Image) => void;
    onInlineCardExpanded?: (action: ShowCardAction, isExpanded: boolean) => void;
    onInputValueChanged?: (input: Input) => void;
    designMode: boolean;
    getJsonTypeName(): string;
    internalValidateProperties(context: ValidationResults): void;
    render(target?: HTMLElement): HTMLElement | undefined;
    updateLayout(processChildren?: boolean): void;
    shouldFallback(): boolean;
    get hasVisibleSeparator(): boolean;
}
export declare class GlobalRegistry {
    static populateWithDefaultElements(registry: CardObjectRegistry<CardElement>): void;
    static populateWithDefaultActions(registry: CardObjectRegistry<Action>): void;
    static readonly elements: CardObjectRegistry<CardElement>;
    static readonly actions: CardObjectRegistry<Action>;
    static reset(): void;
}
declare const enum TypeErrorType {
    UnknownType = 0,
    ForbiddenType = 1
}
export declare class SerializationContext extends BaseSerializationContext {
    private _elementRegistry?;
    private _actionRegistry?;
    private internalParseCardObject;
    protected cardObjectParsed(o: SerializableObject, source: any): void;
    onParseAction?: (action: Action, source: any, context: SerializationContext) => void;
    onParseElement?: (element: CardElement, source: any, context: SerializationContext) => void;
    parseCardObject<T extends CardObject>(parent: CardElement | undefined, source: any, forbiddenTypeNames: string[], allowFallback: boolean, createInstanceCallback: (typeName: string) => T | undefined, logParseEvent: (typeName: string, errorType: TypeErrorType) => void): T | undefined;
    parseElement(parent: CardElement | undefined, source: any, allowFallback: boolean): CardElement | undefined;
    parseAction(parent: CardElement, source: any, forbiddenActionTypes: string[], allowFallback: boolean): Action | undefined;
    get elementRegistry(): CardObjectRegistry<CardElement>;
    setElementRegistry(value: CardObjectRegistry<CardElement> | undefined): void;
    get actionRegistry(): CardObjectRegistry<Action>;
    setActionRegistry(value: CardObjectRegistry<Action> | undefined): void;
}
export {};
