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
exports.CardObject = exports.ValidationResults = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var Enums = require("./enums");
var strings_1 = require("./strings");
var shared_1 = require("./shared");
var host_capabilities_1 = require("./host-capabilities");
var serialization_1 = require("./serialization");
var ValidationResults = /** @class */ (function () {
    function ValidationResults() {
        this.allIds = {};
        this.validationEvents = [];
    }
    ValidationResults.prototype.addFailure = function (cardObject, event, message) {
        this.validationEvents.push({
            phase: Enums.ValidationPhase.Validation,
            source: cardObject,
            event: event,
            message: message
        });
    };
    return ValidationResults;
}());
exports.ValidationResults = ValidationResults;
var CardObject = /** @class */ (function (_super) {
    __extends(CardObject, _super);
    function CardObject() {
        //#region Schema
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //#endregion
        _this._shouldFallback = false;
        return _this;
    }
    CardObject.prototype.getSchemaKey = function () {
        return this.getJsonTypeName();
    };
    Object.defineProperty(CardObject.prototype, "requires", {
        get: function () {
            return this.getValue(CardObject.requiresProperty);
        },
        enumerable: false,
        configurable: true
    });
    CardObject.prototype.preProcessPropertyValue = function (property, propertyValue) {
        var value = propertyValue === undefined ? this.getValue(property) : propertyValue;
        if (shared_1.GlobalSettings.allowPreProcessingPropertyValues) {
            var currentObject = this;
            while (currentObject && !currentObject.onPreProcessPropertyValue) {
                currentObject = currentObject.parent;
            }
            if (currentObject && currentObject.onPreProcessPropertyValue) {
                return currentObject.onPreProcessPropertyValue(this, property, value);
            }
        }
        return value;
    };
    CardObject.prototype.setParent = function (value) {
        this._parent = value;
    };
    CardObject.prototype.setShouldFallback = function (value) {
        this._shouldFallback = value;
    };
    CardObject.prototype.shouldFallback = function () {
        return this._shouldFallback || !this.requires.areAllMet(this.hostConfig.hostCapabilities);
    };
    CardObject.prototype.getRootObject = function () {
        var rootObject = this;
        while (rootObject.parent) {
            rootObject = rootObject.parent;
        }
        return rootObject;
    };
    CardObject.prototype.internalValidateProperties = function (context) {
        if (this.id) {
            if (context.allIds.hasOwnProperty(this.id)) {
                if (context.allIds[this.id] == 1) {
                    context.addFailure(this, Enums.ValidationEvent.DuplicateId, strings_1.Strings.errors.duplicateId(this.id));
                }
                context.allIds[this.id] += 1;
            }
            else {
                context.allIds[this.id] = 1;
            }
        }
    };
    CardObject.prototype.validateProperties = function () {
        var result = new ValidationResults();
        this.internalValidateProperties(result);
        return result;
    };
    Object.defineProperty(CardObject.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CardObject.prototype, "renderedElement", {
        get: function () {
            return this._renderedElement;
        },
        enumerable: false,
        configurable: true
    });
    CardObject.typeNameProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "type", undefined, undefined, undefined, function (sender) {
        return sender.getJsonTypeName();
    });
    CardObject.idProperty = new serialization_1.StringProperty(serialization_1.Versions.v1_0, "id");
    CardObject.requiresProperty = new serialization_1.SerializableObjectProperty(serialization_1.Versions.v1_2, "requires", host_capabilities_1.HostCapabilities, new host_capabilities_1.HostCapabilities());
    __decorate([
        serialization_1.property(CardObject.idProperty)
    ], CardObject.prototype, "id", void 0);
    __decorate([
        serialization_1.property(CardObject.requiresProperty)
    ], CardObject.prototype, "requires", null);
    return CardObject;
}(serialization_1.SerializableObject));
exports.CardObject = CardObject;
//# sourceMappingURL=card-object.js.map