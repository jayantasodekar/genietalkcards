import * as Enums from "./enums";
export interface IValidationEvent {
    source?: SerializableObject;
    phase: Enums.ValidationPhase;
    event: Enums.ValidationEvent;
    message: string;
}
export declare class Version {
    private _versionString;
    private _major;
    private _minor;
    private _isValid;
    private _label?;
    constructor(major?: number, minor?: number, label?: string);
    static parse(versionString: string, context: BaseSerializationContext): Version | undefined;
    toString(): string;
    toJSON(): any;
    compareTo(otherVersion: Version): number;
    get label(): string;
    get major(): number;
    get minor(): number;
    get isValid(): boolean;
}
export declare type TargetVersion = Version | "*";
export declare class Versions {
    static readonly v1_0: Version;
    static readonly v1_1: Version;
    static readonly v1_2: Version;
    static readonly v1_3: Version;
    static readonly latest: Version;
}
export declare function isVersionLessOrEqual(version: TargetVersion, targetVersion: TargetVersion): boolean;
export declare abstract class BaseSerializationContext {
    targetVersion: Version;
    private _validationEvents;
    toJSONOriginalParam: any;
    serializeValue(target: {
        [key: string]: any;
    }, propertyName: string, propertyValue: any, defaultValue?: any): void;
    serializeNumber(target: {
        [key: string]: any;
    }, propertyName: string, propertyValue: number | undefined, defaultValue?: number | undefined): void;
    serializeEnum(enumType: {
        [s: number]: string;
    }, target: {
        [key: string]: any;
    }, propertyName: string, propertyValue: number | undefined, defaultValue?: number | undefined): void;
    serializeArray(target: {
        [key: string]: any;
    }, propertyName: string, propertyValue: any[] | undefined): void;
    clearEvents(): void;
    logEvent(source: SerializableObject | undefined, phase: Enums.ValidationPhase, event: Enums.ValidationEvent, message: string): void;
    logParseEvent(source: SerializableObject | undefined, event: Enums.ValidationEvent, message: string): void;
    getEventAt(index: number): IValidationEvent;
    constructor(targetVersion?: Version);
    get eventCount(): number;
}
export declare class PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly defaultValue?: any;
    readonly onGetInitialValue?: ((sender: SerializableObject) => any) | undefined;
    private static _sequentialNumber;
    getInternalName(): string;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): any;
    toJSON(sender: SerializableObject, target: PropertyBag, value: any, context: BaseSerializationContext): void;
    readonly sequentialNumber: number;
    isSerializationEnabled: boolean;
    constructor(targetVersion: Version, name: string, defaultValue?: any, onGetInitialValue?: ((sender: SerializableObject) => any) | undefined);
}
export declare class StringProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly treatEmptyAsUndefined: boolean;
    readonly regEx?: RegExp | undefined;
    readonly defaultValue?: string | undefined;
    readonly onGetInitialValue?: ((sender: SerializableObject) => string) | undefined;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): string | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: string | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, treatEmptyAsUndefined?: boolean, regEx?: RegExp | undefined, defaultValue?: string | undefined, onGetInitialValue?: ((sender: SerializableObject) => string) | undefined);
}
export declare class BoolProperty extends PropertyDefinition {
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): boolean | undefined;
    toJSON(sender: SerializableObject, target: object, value: boolean | undefined, context: BaseSerializationContext): void;
}
export declare class NumProperty extends PropertyDefinition {
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): number | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: number | undefined, context: BaseSerializationContext): void;
}
export declare class PixelSizeProperty extends PropertyDefinition {
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): number | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: number | undefined, context: BaseSerializationContext): void;
}
export interface IVersionedValue<TValue> {
    value: TValue;
    targetVersion?: Version;
}
export declare class ValueSetProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly values: IVersionedValue<string>[];
    readonly defaultValue?: string | undefined;
    readonly onGetInitialValue?: ((sender: SerializableObject) => string) | undefined;
    isValidValue(value: string, context: BaseSerializationContext): boolean;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): string | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: string | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, values: IVersionedValue<string>[], defaultValue?: string | undefined, onGetInitialValue?: ((sender: SerializableObject) => string) | undefined);
}
export declare class EnumProperty<TEnum extends {
    [s: number]: string;
}> extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly enumType: TEnum;
    readonly defaultValue?: number | undefined;
    readonly onGetInitialValue?: ((sender: SerializableObject) => number) | undefined;
    private _values;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): number | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: number | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, enumType: TEnum, defaultValue?: number | undefined, values?: IVersionedValue<number>[], onGetInitialValue?: ((sender: SerializableObject) => number) | undefined);
    get values(): IVersionedValue<number>[];
}
export declare type SerializableObjectType = {
    new (): SerializableObject;
};
export declare class SerializableObjectProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly objectType: SerializableObjectType;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): SerializableObject | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: SerializableObject | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, objectType: SerializableObjectType, defaultValue?: SerializableObject);
}
export declare class SerializableObjectCollectionProperty extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly objectType: SerializableObjectType;
    readonly onItemAdded?: ((sender: SerializableObject, item: SerializableObject) => void) | undefined;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): SerializableObject[] | undefined;
    toJSON(sender: SerializableObject, target: PropertyBag, value: SerializableObject[] | undefined, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, objectType: SerializableObjectType, onItemAdded?: ((sender: SerializableObject, item: SerializableObject) => void) | undefined);
}
export declare class CustomProperty<T> extends PropertyDefinition {
    readonly targetVersion: Version;
    readonly name: string;
    readonly onParse: (sender: SerializableObject, property: PropertyDefinition, source: PropertyBag, context: BaseSerializationContext) => T;
    readonly onToJSON: (sender: SerializableObject, property: PropertyDefinition, target: PropertyBag, value: T, context: BaseSerializationContext) => void;
    readonly defaultValue?: T | undefined;
    readonly onGetInitialValue?: ((sender: SerializableObject) => T) | undefined;
    parse(sender: SerializableObject, source: PropertyBag, context: BaseSerializationContext): T;
    toJSON(sender: SerializableObject, target: PropertyBag, value: T, context: BaseSerializationContext): void;
    constructor(targetVersion: Version, name: string, onParse: (sender: SerializableObject, property: PropertyDefinition, source: PropertyBag, context: BaseSerializationContext) => T, onToJSON: (sender: SerializableObject, property: PropertyDefinition, target: PropertyBag, value: T, context: BaseSerializationContext) => void, defaultValue?: T | undefined, onGetInitialValue?: ((sender: SerializableObject) => T) | undefined);
}
export declare class SerializableObjectSchema {
    private _properties;
    indexOf(property: PropertyDefinition): number;
    add(...properties: PropertyDefinition[]): void;
    remove(...properties: PropertyDefinition[]): void;
    getItemAt(index: number): PropertyDefinition;
    getCount(): number;
}
export declare function property(property: PropertyDefinition): (target: any, propertyKey: string) => void;
export declare type PropertyBag = {
    [propertyName: string]: any;
};
export declare abstract class SerializableObject {
    static onRegisterCustomProperties?: (sender: SerializableObject, schema: SerializableObjectSchema) => void;
    private static readonly _schemaCache;
    private _propertyBag;
    private _rawProperties;
    protected abstract getSchemaKey(): string;
    protected getDefaultSerializationContext(): BaseSerializationContext;
    protected populateSchema(schema: SerializableObjectSchema): void;
    protected getValue(property: PropertyDefinition): any;
    protected setValue(property: PropertyDefinition, value: any): void;
    protected internalParse(source: PropertyBag, context: BaseSerializationContext): void;
    protected internalToJSON(target: PropertyBag, context: BaseSerializationContext): void;
    protected shouldSerialize(context: BaseSerializationContext): boolean;
    maxVersion: Version;
    constructor();
    parse(source: PropertyBag, context?: BaseSerializationContext): void;
    toJSON(context?: BaseSerializationContext): PropertyBag | undefined;
    hasDefaultValue(property: PropertyDefinition): boolean;
    hasAllDefaultValues(): boolean;
    resetDefaultValues(): void;
    setCustomProperty(name: string, value: any): void;
    getCustomProperty(name: string): any;
    getSchema(): SerializableObjectSchema;
}
