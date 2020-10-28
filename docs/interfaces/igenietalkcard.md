[Genietalk Cards Javascript SDK](../README.md) › [IGenietalkCard](igenietalkcard.md)

# Interface: IGenietalkCard

## Hierarchy

* [ICardElement](icardelement.md)

  ↳ **IGenietalkCard**

## Indexable

* \[ **propName**: *string*\]: any

## Index

### Properties

* [actions](igenietalkcard.md#optional-actions)
* [backgroundImage](igenietalkcard.md#optional-backgroundimage)
* [body](igenietalkcard.md#optional-body)
* [height](igenietalkcard.md#optional-height)
* [horizontalAlignment](igenietalkcard.md#optional-horizontalalignment)
* [id](igenietalkcard.md#optional-id)
* [separator](igenietalkcard.md#optional-separator)
* [spacing](igenietalkcard.md#optional-spacing)
* [speak](igenietalkcard.md#optional-speak)
* [type](igenietalkcard.md#type)
* [version](igenietalkcard.md#optional-version)

## Properties

### `Optional` actions

• **actions**? : *ISubmitAction | IOpenUrlAction | IShowCardAction[]*

___

### `Optional` backgroundImage

• **backgroundImage**? : *IBackgroundImage | string*

___

### `Optional` body

• **body**? : *ITextBlock | IImage | IImageSet | IFactSet | IColumnSet | IContainer[]*

___

### `Optional` height

• **height**? : *"auto" | "stretch"*

*Inherited from [IGenietalkCard](igenietalkcard.md).[height](igenietalkcard.md#optional-height)*

___

### `Optional` horizontalAlignment

• **horizontalAlignment**? : *[HorizontalAlignment](../enums/horizontalalignment.md)*

*Inherited from [IGenietalkCard](igenietalkcard.md).[horizontalAlignment](igenietalkcard.md#optional-horizontalalignment)*

___

### `Optional` id

• **id**? : *undefined | string*

*Inherited from [IGenietalkCard](igenietalkcard.md).[id](igenietalkcard.md#optional-id)*

___

### `Optional` separator

• **separator**? : *undefined | false | true*

*Inherited from [IGenietalkCard](igenietalkcard.md).[separator](igenietalkcard.md#optional-separator)*

___

### `Optional` spacing

• **spacing**? : *[Spacing](../enums/spacing.md)*

*Inherited from [IGenietalkCard](igenietalkcard.md).[spacing](igenietalkcard.md#optional-spacing)*

___

### `Optional` speak

• **speak**? : *undefined | string*

*Overrides [ICardElement](icardelement.md).[speak](icardelement.md#optional-speak)*

___

###  type

• **type**: *"GenietalkCard"*

___

### `Optional` version

• **version**? : *IVersion | string*
