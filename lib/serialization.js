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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializableObject = exports.property = exports.SerializableObjectSchema = exports.CustomProperty = exports.SerializableObjectCollectionProperty = exports.SerializableObjectProperty = exports.EnumProperty = exports.ValueSetProperty = exports.PixelSizeProperty = exports.NumProperty = exports.BoolProperty = exports.StringProperty = exports.PropertyDefinition = exports.BaseSerializationContext = exports.isVersionLessOrEqual = exports.Versions = exports.Version = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var shared_1 = require("./shared");
var Utils = require("./utils");
var Enums = require("./enums");
var strings_1 = require("./strings");
var Version = /** @class */ (function () {
    function Version(major, minor, label) {
        if (major === void 0) { major = 1; }
        if (minor === void 0) { minor = 1; }
        this._isValid = true;
        this._major = major;
        this._minor = minor;
        this._label = label;
    }
    Version.parse = function (versionString, context) {
        if (!versionString) {
            return undefined;
        }
        var result = new Version();
        result._versionString = versionString;
        var regEx = /(\d+).(\d+)/gi;
        var matches = regEx.exec(versionString);
        if (matches != null && matches.length == 3) {
            result._major = parseInt(matches[1]);
            result._minor = parseInt(matches[2]);
        }
        else {
            result._isValid = false;
        }
        if (!result._isValid) {
            context.logParseEvent(undefined, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidVersionString(result._versionString));
        }
        return result;
    };
    Version.prototype.toString = function () {
        return !this._isValid ? this._versionString : this._major + "." + this._minor;
    };
    Version.prototype.toJSON = function () {
        return this.toString();
    };
    Version.prototype.compareTo = function (otherVersion) {
        if (!this.isValid || !otherVersion.isValid) {
            throw new Error("Cannot compare invalid version.");
        }
        if (this.major > otherVersion.major) {
            return 1;
        }
        else if (this.major < otherVersion.major) {
            return -1;
        }
        else if (this.minor > otherVersion.minor) {
            return 1;
        }
        else if (this.minor < otherVersion.minor) {
            return -1;
        }
        return 0;
    };
    Object.defineProperty(Version.prototype, "label", {
        get: function () {
            return this._label ? this._label : this.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Version.prototype, "major", {
        get: function () {
            return this._major;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Version.prototype, "minor", {
        get: function () {
            return this._minor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Version.prototype, "isValid", {
        get: function () {
            return this._isValid;
        },
        enumerable: false,
        configurable: true
    });
    return Version;
}());
exports.Version = Version;
var Versions = /** @class */ (function () {
    function Versions() {
    }
    Versions.v1_0 = new Version(1, 0);
    Versions.v1_1 = new Version(1, 1);
    Versions.v1_2 = new Version(1, 2);
    Versions.v1_3 = new Version(1, 3);
    Versions.latest = Versions.v1_3;
    return Versions;
}());
exports.Versions = Versions;
function isVersionLessOrEqual(version, targetVersion) {
    if (version instanceof Version) {
        if (targetVersion instanceof Version) {
            return targetVersion.compareTo(version) >= 0;
        }
        else {
            // Target version is *
            return true;
        }
    }
    else {
        // Version is *
        return true;
    }
}
exports.isVersionLessOrEqual = isVersionLessOrEqual;
var BaseSerializationContext = /** @class */ (function () {
    function BaseSerializationContext(targetVersion) {
        if (targetVersion === void 0) { targetVersion = Versions.latest; }
        this.targetVersion = targetVersion;
        this._validationEvents = [];
    }
    BaseSerializationContext.prototype.serializeValue = function (target, propertyName, propertyValue, defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        if (propertyValue === null || propertyValue === undefined || propertyValue === defaultValue) {
            if (!shared_1.GlobalSettings.enableFullJsonRoundTrip) {
                delete target[propertyName];
            }
        }
        else {
            target[propertyName] = propertyValue;
        }
    };
    BaseSerializationContext.prototype.serializeNumber = function (target, propertyName, propertyValue, defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        if (propertyValue === null || propertyValue === undefined || propertyValue === defaultValue || isNaN(propertyValue)) {
            delete target[propertyName];
        }
        else {
            target[propertyName] = propertyValue;
        }
    };
    BaseSerializationContext.prototype.serializeEnum = function (enumType, target, propertyName, propertyValue, defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        var targetValue = target[propertyName];
        var canDeleteTarget = targetValue == undefined ? true : enumType[targetValue] !== undefined;
        if (propertyValue == defaultValue) {
            if (canDeleteTarget) {
                delete target[propertyName];
            }
        }
        else {
            if (propertyValue == undefined) {
                if (canDeleteTarget) {
                    delete target[propertyName];
                }
            }
            else {
                target[propertyName] = enumType[propertyValue];
            }
        }
    };
    BaseSerializationContext.prototype.serializeArray = function (target, propertyName, propertyValue) {
        var items = [];
        if (propertyValue) {
            for (var _i = 0, propertyValue_1 = propertyValue; _i < propertyValue_1.length; _i++) {
                var item = propertyValue_1[_i];
                var serializedItem = undefined;
                if (item instanceof SerializableObject) {
                    serializedItem = item.toJSON(this);
                }
                else if (item.toJSON) {
                    serializedItem = item.toJSON();
                }
                else {
                    serializedItem = item;
                }
                if (serializedItem !== undefined) {
                    items.push(serializedItem);
                }
            }
        }
        if (items.length == 0) {
            if (target.hasOwnProperty(propertyName) && Array.isArray(target[propertyName])) {
                delete target[propertyName];
            }
        }
        else {
            this.serializeValue(target, propertyName, items);
        }
    };
    BaseSerializationContext.prototype.clearEvents = function () {
        this._validationEvents = [];
    };
    BaseSerializationContext.prototype.logEvent = function (source, phase, event, message) {
        this._validationEvents.push({
            source: source,
            phase: phase,
            event: event,
            message: message
        });
    };
    BaseSerializationContext.prototype.logParseEvent = function (source, event, message) {
        this.logEvent(source, Enums.ValidationPhase.Parse, event, message);
    };
    BaseSerializationContext.prototype.getEventAt = function (index) {
        return this._validationEvents[index];
    };
    Object.defineProperty(BaseSerializationContext.prototype, "eventCount", {
        get: function () {
            return this._validationEvents.length;
        },
        enumerable: false,
        configurable: true
    });
    return BaseSerializationContext;
}());
exports.BaseSerializationContext = BaseSerializationContext;
var SimpleSerializationContext = /** @class */ (function (_super) {
    __extends(SimpleSerializationContext, _super);
    function SimpleSerializationContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SimpleSerializationContext;
}(BaseSerializationContext));
var PropertyDefinition = /** @class */ (function () {
    function PropertyDefinition(targetVersion, name, defaultValue, onGetInitialValue) {
        this.targetVersion = targetVersion;
        this.name = name;
        this.defaultValue = defaultValue;
        this.onGetInitialValue = onGetInitialValue;
        this.isSerializationEnabled = true;
        this.sequentialNumber = PropertyDefinition._sequentialNumber;
        PropertyDefinition._sequentialNumber++;
    }
    PropertyDefinition.prototype.getInternalName = function () {
        return this.name;
    };
    PropertyDefinition.prototype.parse = function (sender, source, context) {
        return source[this.name];
    };
    PropertyDefinition.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, value, this.defaultValue);
    };
    PropertyDefinition._sequentialNumber = 0;
    return PropertyDefinition;
}());
exports.PropertyDefinition = PropertyDefinition;
var StringProperty = /** @class */ (function (_super) {
    __extends(StringProperty, _super);
    function StringProperty(targetVersion, name, treatEmptyAsUndefined, regEx, defaultValue, onGetInitialValue) {
        if (treatEmptyAsUndefined === void 0) { treatEmptyAsUndefined = true; }
        var _this = _super.call(this, targetVersion, name, defaultValue, onGetInitialValue) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.treatEmptyAsUndefined = treatEmptyAsUndefined;
        _this.regEx = regEx;
        _this.defaultValue = defaultValue;
        _this.onGetInitialValue = onGetInitialValue;
        return _this;
    }
    StringProperty.prototype.parse = function (sender, source, context) {
        var parsedValue = Utils.parseString(source[this.name], this.defaultValue);
        var isUndefined = parsedValue === undefined || (parsedValue === "" && this.treatEmptyAsUndefined);
        if (!isUndefined && this.regEx !== undefined) {
            var matches = this.regEx.exec(parsedValue);
            if (!matches) {
                context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(parsedValue, this.name));
                return undefined;
            }
        }
        return parsedValue;
    };
    StringProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, value === "" && this.treatEmptyAsUndefined ? undefined : value, this.defaultValue);
    };
    return StringProperty;
}(PropertyDefinition));
exports.StringProperty = StringProperty;
var BoolProperty = /** @class */ (function (_super) {
    __extends(BoolProperty, _super);
    function BoolProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoolProperty.prototype.parse = function (sender, source, context) {
        return Utils.parseBool(source[this.name], this.defaultValue);
    };
    BoolProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, value, this.defaultValue);
    };
    return BoolProperty;
}(PropertyDefinition));
exports.BoolProperty = BoolProperty;
var NumProperty = /** @class */ (function (_super) {
    __extends(NumProperty, _super);
    function NumProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumProperty.prototype.parse = function (sender, source, context) {
        return Utils.parseNumber(source[this.name], this.defaultValue);
    };
    NumProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeNumber(target, this.name, value, this.defaultValue);
    };
    return NumProperty;
}(PropertyDefinition));
exports.NumProperty = NumProperty;
var PixelSizeProperty = /** @class */ (function (_super) {
    __extends(PixelSizeProperty, _super);
    function PixelSizeProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PixelSizeProperty.prototype.parse = function (sender, source, context) {
        var result = undefined;
        var value = source[this.name];
        if (typeof value === "string") {
            var isValid = false;
            try {
                var size = shared_1.SizeAndUnit.parse(value, true);
                if (size.unit == Enums.SizeUnit.Pixel) {
                    result = size.physicalSize;
                    isValid = true;
                }
            }
            catch (_a) {
                // Do nothing. A parse error is emitted below
            }
            if (!isValid) {
                context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(source[this.name], "minHeight"));
            }
        }
        return result;
    };
    PixelSizeProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeValue(target, this.name, typeof value === "number" && !isNaN(value) ? value + "px" : undefined);
    };
    return PixelSizeProperty;
}(PropertyDefinition));
exports.PixelSizeProperty = PixelSizeProperty;
var ValueSetProperty = /** @class */ (function (_super) {
    __extends(ValueSetProperty, _super);
    function ValueSetProperty(targetVersion, name, values, defaultValue, onGetInitialValue) {
        var _this = _super.call(this, targetVersion, name, defaultValue, onGetInitialValue) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.values = values;
        _this.defaultValue = defaultValue;
        _this.onGetInitialValue = onGetInitialValue;
        return _this;
    }
    ValueSetProperty.prototype.isValidValue = function (value, context) {
        for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
            var versionedValue = _a[_i];
            if (value.toLowerCase() === versionedValue.value.toLowerCase()) {
                var targetVersion = versionedValue.targetVersion ? versionedValue.targetVersion : this.targetVersion;
                return targetVersion.compareTo(context.targetVersion) <= 0;
            }
        }
        return false;
    };
    ValueSetProperty.prototype.parse = function (sender, source, context) {
        var sourceValue = source[this.name];
        if (sourceValue === undefined) {
            return this.defaultValue;
        }
        if (typeof sourceValue === "string") {
            for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
                var versionedValue = _a[_i];
                if (sourceValue.toLowerCase() === versionedValue.value.toLowerCase()) {
                    var targetVersion = versionedValue.targetVersion ? versionedValue.targetVersion : this.targetVersion;
                    if (targetVersion.compareTo(context.targetVersion) <= 0) {
                        return versionedValue.value;
                    }
                    else {
                        context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.propertyValueNotSupported(sourceValue, this.name, targetVersion.toString(), context.targetVersion.toString()));
                        return this.defaultValue;
                    }
                }
            }
        }
        context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(sourceValue, this.name));
        return this.defaultValue;
    };
    ValueSetProperty.prototype.toJSON = function (sender, target, value, context) {
        var valueFound = false;
        for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
            var versionedValue = _a[_i];
            if (versionedValue.value === value) {
                var targetVersion = versionedValue.targetVersion ? versionedValue.targetVersion : this.targetVersion;
                if (targetVersion.compareTo(context.targetVersion) <= 0) {
                    valueFound = true;
                    break;
                }
                else {
                    context.logEvent(sender, Enums.ValidationPhase.ToJSON, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.propertyValueNotSupported(value, this.name, targetVersion.toString(), context.targetVersion.toString()));
                }
            }
        }
        if (valueFound) {
            context.serializeValue(target, this.name, value, this.defaultValue);
        }
    };
    return ValueSetProperty;
}(PropertyDefinition));
exports.ValueSetProperty = ValueSetProperty;
var EnumProperty = /** @class */ (function (_super) {
    __extends(EnumProperty, _super);
    function EnumProperty(targetVersion, name, enumType, defaultValue, values, onGetInitialValue) {
        var _this = _super.call(this, targetVersion, name, defaultValue, onGetInitialValue) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.enumType = enumType;
        _this.defaultValue = defaultValue;
        _this.onGetInitialValue = onGetInitialValue;
        _this._values = [];
        if (!values) {
            for (var key in enumType) {
                var keyAsNumber = parseInt(key, 10);
                if (keyAsNumber >= 0) {
                    _this._values.push({ value: keyAsNumber });
                }
            }
        }
        else {
            _this._values = values;
        }
        return _this;
    }
    EnumProperty.prototype.parse = function (sender, source, context) {
        var sourceValue = source[this.name];
        if (typeof sourceValue !== "string") {
            return this.defaultValue;
        }
        var enumValue = Utils.getEnumValueByName(this.enumType, sourceValue);
        if (enumValue !== undefined) {
            for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
                var versionedValue = _a[_i];
                if (versionedValue.value === enumValue) {
                    var targetVersion = versionedValue.targetVersion ? versionedValue.targetVersion : this.targetVersion;
                    if (targetVersion.compareTo(context.targetVersion) <= 0) {
                        return enumValue;
                    }
                    else {
                        context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.propertyValueNotSupported(sourceValue, this.name, targetVersion.toString(), context.targetVersion.toString()));
                        return this.defaultValue;
                    }
                }
            }
        }
        context.logParseEvent(sender, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(sourceValue, this.name));
        return this.defaultValue;
    };
    EnumProperty.prototype.toJSON = function (sender, target, value, context) {
        if (value !== undefined) {
            var valueFound = false;
            for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
                var versionedValue = _a[_i];
                if (versionedValue.value === value) {
                    var targetVersion = versionedValue.targetVersion ? versionedValue.targetVersion : this.targetVersion;
                    if (targetVersion.compareTo(context.targetVersion) <= 0) {
                        valueFound = true;
                        break;
                    }
                    else {
                        context.logEvent(sender, Enums.ValidationPhase.ToJSON, Enums.ValidationEvent.InvalidPropertyValue, strings_1.Strings.errors.invalidPropertyValue(value, this.name));
                    }
                }
            }
            if (valueFound) {
                context.serializeEnum(this.enumType, target, this.name, value, this.defaultValue);
            }
        }
    };
    Object.defineProperty(EnumProperty.prototype, "values", {
        get: function () {
            return this._values;
        },
        enumerable: false,
        configurable: true
    });
    return EnumProperty;
}(PropertyDefinition));
exports.EnumProperty = EnumProperty;
var SerializableObjectProperty = /** @class */ (function (_super) {
    __extends(SerializableObjectProperty, _super);
    function SerializableObjectProperty(targetVersion, name, objectType, defaultValue) {
        var _this = _super.call(this, targetVersion, name, defaultValue, function (sender) { return new _this.objectType(); }) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.objectType = objectType;
        return _this;
    }
    SerializableObjectProperty.prototype.parse = function (sender, source, context) {
        var sourceValue = source[this.name];
        if (sourceValue === undefined) {
            return this.onGetInitialValue ? this.onGetInitialValue(sender) : this.defaultValue;
        }
        var result = new this.objectType();
        result.parse(sourceValue, context);
        return result;
    };
    SerializableObjectProperty.prototype.toJSON = function (sender, target, value, context) {
        var serializedValue = value !== undefined ? value.toJSON(context) : value;
        if (typeof serializedValue === "object" && Object.keys(serializedValue).length === 0) {
            serializedValue = undefined;
        }
        _super.prototype.toJSON.call(this, sender, target, serializedValue, context);
    };
    return SerializableObjectProperty;
}(PropertyDefinition));
exports.SerializableObjectProperty = SerializableObjectProperty;
var SerializableObjectCollectionProperty = /** @class */ (function (_super) {
    __extends(SerializableObjectCollectionProperty, _super);
    function SerializableObjectCollectionProperty(targetVersion, name, objectType, onItemAdded) {
        var _this = _super.call(this, targetVersion, name, undefined, function (sender) { return []; }) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.objectType = objectType;
        _this.onItemAdded = onItemAdded;
        return _this;
    }
    SerializableObjectCollectionProperty.prototype.parse = function (sender, source, context) {
        var result = [];
        var sourceCollection = source[this.name];
        if (Array.isArray(sourceCollection)) {
            for (var _i = 0, sourceCollection_1 = sourceCollection; _i < sourceCollection_1.length; _i++) {
                var sourceItem = sourceCollection_1[_i];
                var item = new this.objectType();
                item.parse(sourceItem, context);
                result.push(item);
                if (this.onItemAdded) {
                    this.onItemAdded(sender, item);
                }
            }
        }
        return result.length > 0 ? result : (this.onGetInitialValue ? this.onGetInitialValue(sender) : undefined);
    };
    SerializableObjectCollectionProperty.prototype.toJSON = function (sender, target, value, context) {
        context.serializeArray(target, this.name, value);
    };
    return SerializableObjectCollectionProperty;
}(PropertyDefinition));
exports.SerializableObjectCollectionProperty = SerializableObjectCollectionProperty;
var CustomProperty = /** @class */ (function (_super) {
    __extends(CustomProperty, _super);
    function CustomProperty(targetVersion, name, onParse, onToJSON, defaultValue, onGetInitialValue) {
        var _this = _super.call(this, targetVersion, name, defaultValue, onGetInitialValue) || this;
        _this.targetVersion = targetVersion;
        _this.name = name;
        _this.onParse = onParse;
        _this.onToJSON = onToJSON;
        _this.defaultValue = defaultValue;
        _this.onGetInitialValue = onGetInitialValue;
        if (!_this.onParse) {
            throw new Error("CustomPropertyDefinition instances must have an onParse handler.");
        }
        if (!_this.onToJSON) {
            throw new Error("CustomPropertyDefinition instances must have an onToJSON handler.");
        }
        return _this;
    }
    CustomProperty.prototype.parse = function (sender, source, context) {
        return this.onParse(sender, this, source, context);
    };
    CustomProperty.prototype.toJSON = function (sender, target, value, context) {
        this.onToJSON(sender, this, target, value, context);
    };
    return CustomProperty;
}(PropertyDefinition));
exports.CustomProperty = CustomProperty;
var SerializableObjectSchema = /** @class */ (function () {
    function SerializableObjectSchema() {
        this._properties = [];
    }
    SerializableObjectSchema.prototype.indexOf = function (property) {
        for (var i = 0; i < this._properties.length; i++) {
            if (this._properties[i] === property) {
                return i;
            }
        }
        return -1;
    };
    SerializableObjectSchema.prototype.add = function () {
        var properties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            properties[_i] = arguments[_i];
        }
        for (var i = 0; i < properties.length; i++) {
            if (this.indexOf(properties[i]) === -1) {
                this._properties.push(properties[i]);
            }
        }
    };
    SerializableObjectSchema.prototype.remove = function () {
        var properties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            properties[_i] = arguments[_i];
        }
        for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
            var property_1 = properties_1[_a];
            while (true) {
                var index = this.indexOf(property_1);
                if (index >= 0) {
                    this._properties.splice(index, 1);
                }
                else {
                    break;
                }
            }
        }
    };
    SerializableObjectSchema.prototype.getItemAt = function (index) {
        return this._properties[index];
    };
    SerializableObjectSchema.prototype.getCount = function () {
        return this._properties.length;
    };
    return SerializableObjectSchema;
}());
exports.SerializableObjectSchema = SerializableObjectSchema;
// This is a decorator function, used to map SerializableObject descendant class members to
// schema properties
function property(property) {
    return function (target, propertyKey) {
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (!descriptor.get && !descriptor.set) {
            descriptor.get = function () { return this.getValue(property); };
            descriptor.set = function (value) { this.setValue(property, value); };
            Object.defineProperty(target, propertyKey, descriptor);
        }
    };
}
exports.property = property;
var SerializableObject = /** @class */ (function () {
    function SerializableObject() {
        this._propertyBag = {};
        this._rawProperties = {};
        this.maxVersion = Versions.v1_3;
        var s = this.getSchema();
        for (var i = 0; i < s.getCount(); i++) {
            var property_2 = s.getItemAt(i);
            if (property_2.onGetInitialValue) {
                this.setValue(property_2, property_2.onGetInitialValue(this));
            }
        }
    }
    SerializableObject.prototype.getDefaultSerializationContext = function () {
        return new SimpleSerializationContext();
    };
    SerializableObject.prototype.populateSchema = function (schema) {
        var ctor = this.constructor;
        var properties = [];
        for (var propertyName in ctor) {
            try {
                var propertyValue = ctor[propertyName];
                if (propertyValue instanceof PropertyDefinition) {
                    properties.push(propertyValue);
                }
            }
            catch (_a) {
                // If a property happens to have a getter function and
                // it throws an exception, we need to catch it here
            }
        }
        if (properties.length > 0) {
            var sortedProperties = properties.sort(function (p1, p2) {
                if (p1.sequentialNumber > p2.sequentialNumber) {
                    return 1;
                }
                else if (p1.sequentialNumber < p2.sequentialNumber) {
                    return -1;
                }
                return 0;
            });
            schema.add.apply(schema, sortedProperties);
        }
        if (SerializableObject.onRegisterCustomProperties) {
            SerializableObject.onRegisterCustomProperties(this, schema);
        }
    };
    SerializableObject.prototype.getValue = function (property) {
        return this._propertyBag.hasOwnProperty(property.getInternalName()) ? this._propertyBag[property.getInternalName()] : property.defaultValue;
    };
    SerializableObject.prototype.setValue = function (property, value) {
        if (value === undefined || value === null) {
            delete this._propertyBag[property.getInternalName()];
        }
        else {
            this._propertyBag[property.getInternalName()] = value;
        }
    };
    SerializableObject.prototype.internalParse = function (source, context) {
        this._propertyBag = {};
        this._rawProperties = shared_1.GlobalSettings.enableFullJsonRoundTrip ? (source ? source : {}) : {};
        if (source) {
            var s = this.getSchema();
            for (var i = 0; i < s.getCount(); i++) {
                var property_3 = s.getItemAt(i);
                if (property_3.isSerializationEnabled) {
                    var propertyValue = property_3.onGetInitialValue ? property_3.onGetInitialValue(this) : undefined;
                    if (source.hasOwnProperty(property_3.name)) {
                        if (property_3.targetVersion.compareTo(context.targetVersion) <= 0) {
                            propertyValue = property_3.parse(this, source, context);
                        }
                        else {
                            context.logParseEvent(this, Enums.ValidationEvent.UnsupportedProperty, strings_1.Strings.errors.propertyNotSupported(property_3.name, property_3.targetVersion.toString(), context.targetVersion.toString()));
                        }
                    }
                    this.setValue(property_3, propertyValue);
                }
            }
        }
        else {
            this.resetDefaultValues();
        }
    };
    SerializableObject.prototype.internalToJSON = function (target, context) {
        var s = this.getSchema();
        var serializedProperties = [];
        for (var i = 0; i < s.getCount(); i++) {
            var property_4 = s.getItemAt(i);
            // Avoid serializing the same property multiple times. This is necessary
            // because some property definitions map to the same underlying schema
            // property
            if (property_4.isSerializationEnabled && property_4.targetVersion.compareTo(context.targetVersion) <= 0 && serializedProperties.indexOf(property_4.name) === -1) {
                property_4.toJSON(this, target, this.getValue(property_4), context);
                serializedProperties.push(property_4.name);
            }
        }
    };
    SerializableObject.prototype.shouldSerialize = function (context) {
        return true;
    };
    SerializableObject.prototype.parse = function (source, context) {
        this.internalParse(source, context ? context : new SimpleSerializationContext());
    };
    SerializableObject.prototype.toJSON = function (context) {
        var effectiveContext;
        if (context && context instanceof BaseSerializationContext) {
            effectiveContext = context;
        }
        else {
            effectiveContext = this.getDefaultSerializationContext();
            effectiveContext.toJSONOriginalParam = context;
        }
        if (this.shouldSerialize(effectiveContext)) {
            var result = void 0;
            if (shared_1.GlobalSettings.enableFullJsonRoundTrip && this._rawProperties && typeof this._rawProperties === "object") {
                result = this._rawProperties;
            }
            else {
                result = {};
            }
            this.internalToJSON(result, effectiveContext);
            return result;
        }
        else {
            return undefined;
        }
    };
    SerializableObject.prototype.hasDefaultValue = function (property) {
        return this.getValue(property) === property.defaultValue;
    };
    SerializableObject.prototype.hasAllDefaultValues = function () {
        var s = this.getSchema();
        for (var i = 0; i < s.getCount(); i++) {
            var property_5 = s.getItemAt(i);
            if (!this.hasDefaultValue(property_5)) {
                return false;
            }
        }
        return true;
    };
    SerializableObject.prototype.resetDefaultValues = function () {
        var s = this.getSchema();
        for (var i = 0; i < s.getCount(); i++) {
            var property_6 = s.getItemAt(i);
            this.setValue(property_6, property_6.defaultValue);
        }
    };
    SerializableObject.prototype.setCustomProperty = function (name, value) {
        var shouldDeleteProperty = (typeof value === "string" && !value) || value === undefined || value === null;
        if (shouldDeleteProperty) {
            delete this._rawProperties[name];
        }
        else {
            this._rawProperties[name] = value;
        }
    };
    SerializableObject.prototype.getCustomProperty = function (name) {
        return this._rawProperties[name];
    };
    SerializableObject.prototype.getSchema = function () {
        var schema = SerializableObject._schemaCache[this.getSchemaKey()];
        if (!schema) {
            schema = new SerializableObjectSchema();
            this.populateSchema(schema);
            SerializableObject._schemaCache[this.getSchemaKey()] = schema;
        }
        return schema;
    };
    SerializableObject._schemaCache = {};
    return SerializableObject;
}());
exports.SerializableObject = SerializableObject;
//# sourceMappingURL=serialization.js.map