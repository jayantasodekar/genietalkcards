# Genietalk Cards

Genietalk Cards are a new way for developers to exchange card content in a common and consistent way.

![genietalk-cards](http://genietalkcards.io/content/overview.jpg)

## Expressive cards, open framework, multiple platforms

Break outside the box of templated cards. Genietalk Cards let you describe your content as you see fit and deliver it beautifully wherever your customers are.

The simple open card format enables an ecosystem of shared tooling, seamless integration between producers and consumers, and native cross-platform performance on any device.

## Get Started

Check out the [full documentation](https://docs.microsoft.com/en-us/genietalk-cards/display/libraries/htmlclient) for more

## FYI: New policy on versioning

In previous releases of this SDK (`1.x`), the package version would match an official [Genietalk Card Schema](https://genietalkcards.io/explorer/) version; the library would be able to parse and render cards expressed in the latest Genietalk Card schema version and all previous versions, but it would only ever serialize to the latest version of the Genietalk Card schema. With the `2.x` release we've introduced a new compability layer, allowing developers to (de)serialize cards to and from any version of the Genietalk Card schema using a single library. The below table summarizes this new versioning capability:

| SDK Version | Can parse from schema versions | Can serialize to schema versions |
| --- | --- | --- |
| `2.4` | `1.0` ... `1.3` | `1.0` ... `1.3` |
| `2.0`...`2.3` | `1.0` ... `1.2` | `1.0` ... `1.2` |
| `1.2` | `1.0` ... `1.2` | `1.2` |
| `1.1` | `1.0` ... `1.1` | `1.1` | 
| `1.0` | `1.0` | `1.0` |


## Breaking changes

Please be aware of the following **breaking changes** in particular versions.

| In version | Change description |
|---|---|
| **2.0** | `ColumnSet.getCount()` has been **REMOVED**. Use `ColumnSet.getItemCount()` instead. |
|| The `isNullOrEmpty(value: string): boolean` function has been **REMOVED**. Use `if (!stringValue)` instead. |
|| The library is now compiled with the `noImplicitAny` flag. As a result, anything that can be undefined/not set now has the `undefined` value. All uses of `null` have been removed. |
|| The following global setting statics have been moved from the GenietalkCard class to the new GlobalSettings class: `useAdvancedTextBlockTruncation`, `useAdvancedCardBottomTruncation`, `useMarkdownInRadioButtonAndCheckbox`, `allowMarkForTextHighlighting`, `alwaysBleedSeparators`, `enableFullJsonRoundTrip`, `useBuiltInInputValidation`, `displayInputValidationErrors` |
|| `CardElement.getForbiddenElementTypes()` has been **REMOVED** |
|| The signature of **CardElement.getForbiddenActionTypes()** has changed to `getForbiddenActionTypes(): CardObjectType<Action>[]` with **CardObjectType** defined as `type CardObjectType<T extends CardObject> = { new(): T }` |
|| The `GenietalkCard.onParseError` event has been **REMOVED**. Parse errors are now collected into the `SerializationContext.errors` property. ||
|| The `GenietalkCard.onParseElement` and `GenietalkCard.onParseAction` events (both static and instance versions) have been **REMOVED**. Use `SerializationContext.onParseElement` and `SerializationContext.onParseAction` instead. |
|| The `createActionInstance` and `createElementInstance` global functions have been **REMOVED** and replaced with the `parseAction` and `parseElement` methods of the `SerializationContext` class. |
|| A new base class, `SerializableObject`, has been introduced. It implements core serialization and deserialization behaviors and pretty much all objects handled by the library (including `Action` and `CardElement` extend it. |
|| **Serialization** and **deserialization** are now done using a "schema" model, where each property of a serializable object is defined as a `PropertyDefinition` instance. Class members that expose those properties are identified via the use of the `@property` decorator. The PropertyDefinition model makes it possible to associate version information with pretty much eveything, which allows the library to (de)serialize to/from any version of the Genietalk Card schema. |
|| The signature of the `CardObject.parse` method has changed to `parse(source: any, context?: SerializationContext)`. The context object includes a `targetVersion` property, which tells the API which version of the Genietalk Card schema to honor when deserializing the source object. |
|| A new protected `internalParse` method has been introduced on **SerializableObject**. When implementing custom actions or elements, have your class override `internalParse` rather than `parse`. |
|| `SerializableObject.toJSON` now accepts a **targetVersion** parameter. When a targetVersion value is specified, the object is serialized to that particular version of the Genietalk Card schema. If no targetVersion is specified, the object is serialized to the latest version of the Genietalk Card schema supported by the library. |
|| A new protected `internalToJSON` method has been introduced on **SerializableObject**. When implementing custom actions or elements, have your class override `internalToJSON` rather than `toJSON`. |
|| `GenietalkCard.elementTypeRegistry` and `GenietalkCard.actionTypeRegistry` have been **REMOVED**. They are replaced with `GlobalRegistry.elements` and `GlobalRegistry.actions`. |
|| The `TypeRegistry<T>`, `ElementTypeRegistry` and `ActionTypeRegistry` classes have been **REMOVED**, replaced with the single `CardObjectRegistry<T>` class. |
|| The global `setProperty`, `setNumberProperty`, `setEnumProperty` and `setArrayProperty` functions have been **REMOVED**. They are replaced by `SerializationContext` instance methods `serializeValue`, `serializeNumber`, `serializeEnum` and `serializeArray`. |
|| The global `getStringValue`, `getNumberValue`, `getBoolValue` and `getEnumValue` functions have been renamed into `parseString`, `parseNumber`, `parseBool` and `parseEnum`. |
|| The global `parseHostConfigEnum` function is no longer exported. |
|| The `ValidationError` enum has been renamed into `ValidationEvent`. |
|| The `IValidationError` interface has been renamed into `IValidationLogEntry`. It has a new required `phase` field of type `ValidationPhase` and its `error` field has been renamed into `event`. |
| **1.2** | The default `value` of an Input.Time **no longer accepts seconds**. 08:25:32 will now be treated as an invalid value and ignored; it should be replaced with 08:25. This behavior is consistent with other Genietalk Card renderers.|
|| The `ICardObject` interface has been **REMOVED**, replaced with the `CardObject` class that both `CardElement` and `Action` extend. This change should have little to no impact on any application.|
|| The `CardElement.validate()` and `Action.validate()` methods have been **REMOVED**, replaced with `CardObject.validateProperties()` and `CardObject.internalValidateProperties(context: ValidationContext)`. Custom elements and actions now must override `internalValidateProperties` and add validation failures as appropriate to the `context` object passed as a parameter using its `addFailure` method. Be sure to always call `super.internalValidateProperties(context)` in your override.|
| **1.1** | Due to a security concern, the `processMarkdown` event handler has been **REMOVED**. Setting it will throw an exception that will halt your code. Please change your code to set the `onProcessMarkdown(text, result)` event handler instead (see example below.) |
| **1.0** | The standalone `renderCard()` helper function was removed as it was redundant with the class methods. Please use `genietalkCard.render()` as described below. |
| **2.4.0** | When a card element is rendered, its `id` property is used as the `id` of the resulting HTML element. |

## Install

### Node

```console
npm install genietalkcards --save
```

### CDN

The unpkg.com CDN makes it easy to load the script in an  browser. 

The latest release will keep you up to date with features and fixes, but may have breaking changes over time. For maximum stability you should use a specific version.

* `genietalkcards.js` - non-minified, useful for dev
* `genietalkcards.min.js` - minified version, best for production

```html
<!-- Option 1: always load the latest release -->
<script src="https://unpkg.com/genietalkcards/dist/genietalkcards.min.js"></script>

<!-- Option 2: load a specific version (e.g, 1.1.1) -->
<script src="https://unpkg.com/genietalkcards@1.1.1/dist/genietalkcards.min.js"></script>
```

## Usage

### Import the module

```js
// Import the module:
import * as GenietalkCards from "genietalkcards";

// OR require it:
var GenietalkCards = require("genietalkcards");

// OR if you loaded via CDN, the global "GenietalkCards" variable
// is already defined and can be used directly
```

### Render a card

```js
// Author a card
// In practice you'll probably get this from a service
// see http://genietalkcards.io/samples/ for inspiration
var card = {
    "type": "GenietalkCard",
    "version": "1.0",
    "body": [
        {
            "type": "Image",
            "url": "https://genietalkcards.io/content/genietalk-card-50.png"
        },
        {
            "type": "TextBlock",
            "text": "Hello **Genietalk Cards!**"
        }
    ],
    "actions": [
        {
            "type": "Action.OpenUrl",
            "title": "Learn more",
            "url": "https://genietalkcards.io"
        },
        {
            "type": "Action.OpenUrl",
            "title": "GitHub",
            "url": "https://github.com/Microsoft/GenietalkCards"
        }
    ]
};

// Create an GenietalkCard instance
var genietalkCard = new GenietalkCards.GenietalkCard();

// Set its hostConfig property unless you want to use the default Host Config
// Host Config defines the style and behavior of a card
genietalkCard.hostConfig = new GenietalkCards.HostConfig({
    fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
    // More host config options
});

// Set the genietalk card's event handlers. onExecuteAction is invoked
// whenever an action is clicked in the card
genietalkCard.onExecuteAction = function(action) { alert("Ow!"); }

// Parse the card payload
genietalkCard.parse(card);

// Render the card to an HTML element:
var renderedCard = genietalkCard.render();

// And finally insert it somewhere in your page:
document.body.appendChild(renderedCard);
```

## Supporting Markdown

Markdown is a [standard feature of Genietalk Cards](https://docs.microsoft.com/en-us/genietalk-cards/authoring-cards/text-features), but to give users flexibility we don't bundle a particular implementation with the library.

#### Option 1: Markdown-It

The easiest way to get markdown support is by adding [markdown-it](https://github.com/markdown-it/markdown-it) to your document.

```html
<script type="text/javascript" src="https://unpkg.com/markdown-it/dist/markdown-it.min.js"></script>
```

#### Option 2: Any other 3rd party library

If you want to use another library or handle markdown yourself, use the `GenietalkCards.onProcessMarkdown` event.

**IMPORTANT SECURITY NOTE: When you process Markdown (yourself or using a library) you are responsible for making sure the output HTML is safe.**

For example, you must remove `<script>` or other HTML elements that could be injected onto the page.

* Failure to do so will make your application susceptible to script injection attacks. 
* Most Markdown libraries, such as `Markdown-It`, offer HTML sanitation.

```js
GenietalkCards.onProcessMarkdown = function(text, result) {
	result.outputHtml = <your Markdown processing logic>;
	result.didProcess = true;
}
```

Make sure to set `result.didProcess` to `true`, otherwise the library will consider the input text as not processed and will be treated as plain text.

## Webpack

If you don't want genietalkcards in your bundle, make sure the script is loaded and add the following the your `webpack.config.json`

```js
module.exports = {
  ...
  externals: [
    { genietalkcards: { var: "GenietalkCards" } }
  ]
};
```

## Learn more at https://genietalkcards.io
* [Documentation](https://genietalkcards.io/documentation/)
* [Schema Explorer](https://genietalkcards.io/explorer/)
* [Sample Cards](https://genietalkcards.io/samples/)
* [Interactive Designer](https://genietalkcards.io/designer/)
