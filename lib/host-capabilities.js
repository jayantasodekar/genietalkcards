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
exports.HostCapabilities = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var serialization_1 = require("./serialization");
var HostCapabilities = /** @class */ (function (_super) {
    __extends(HostCapabilities, _super);
    function HostCapabilities() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._capabilities = {};
        return _this;
    }
    HostCapabilities.prototype.getSchemaKey = function () {
        return "HostCapabilities";
    };
    HostCapabilities.prototype.internalParse = function (source, context) {
        _super.prototype.internalParse.call(this, source, context);
        if (source) {
            for (var name_1 in source) {
                var jsonVersion = source[name_1];
                if (typeof jsonVersion === "string") {
                    if (jsonVersion == "*") {
                        this.addCapability(name_1, "*");
                    }
                    else {
                        var version = serialization_1.Version.parse(jsonVersion, context);
                        if (version && version.isValid) {
                            this.addCapability(name_1, version);
                        }
                    }
                }
            }
        }
    };
    HostCapabilities.prototype.internalToJSON = function (target, context) {
        _super.prototype.internalToJSON.call(this, target, context);
        for (var key in this._capabilities) {
            target[key] = this._capabilities[key];
        }
    };
    HostCapabilities.prototype.addCapability = function (name, version) {
        this._capabilities[name] = version;
    };
    HostCapabilities.prototype.removeCapability = function (name) {
        delete this._capabilities[name];
    };
    HostCapabilities.prototype.clear = function () {
        this._capabilities = {};
    };
    HostCapabilities.prototype.hasCapability = function (name, version) {
        if (this._capabilities.hasOwnProperty(name)) {
            if (version == "*" || this._capabilities[name] == "*") {
                return true;
            }
            return version.compareTo(this._capabilities[name]) <= 0;
        }
        return false;
    };
    HostCapabilities.prototype.areAllMet = function (hostCapabilities) {
        for (var capabilityName in this._capabilities) {
            if (!hostCapabilities.hasCapability(capabilityName, this._capabilities[capabilityName])) {
                return false;
            }
        }
        return true;
    };
    return HostCapabilities;
}(serialization_1.SerializableObject));
exports.HostCapabilities = HostCapabilities;
//# sourceMappingURL=host-capabilities.js.map