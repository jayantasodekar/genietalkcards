export declare class Strings {
    static readonly errors: {
        unknownElementType: (typeName: string) => string;
        unknownActionType: (typeName: string) => string;
        elementTypeNotAllowed: (typeName: string) => string;
        actionTypeNotAllowed: (typeName: string) => string;
        invalidPropertyValue: (value: any, propertyName: string) => string;
        showCardMustHaveCard: () => string;
        invalidColumnWidth: (invalidWidth: string) => string;
        invalidCarouselItemWidth: (invalidWidth: string) => string;
        invalidCardVersion: (defaultingToVersion: string) => string;
        invalidVersionString: (versionString: string) => string;
        propertyValueNotSupported: (value: any, propertyName: string, supportedInVersion: string, versionUsed: string) => string;
        propertyNotSupported: (propertyName: string, supportedInVersion: string, versionUsed: string) => string;
        indexOutOfRange: (index: number) => string;
        elementCannotBeUsedAsInline: () => string;
        inlineAlreadyParented: () => string;
        interactivityNotAllowed: () => string;
        inputsMustHaveUniqueId: () => string;
        choiceSetMustHaveAtLeastOneChoice: () => string;
        choiceSetChoicesMustHaveTitleAndValue: () => string;
        propertyMustBeSet: (propertyName: string) => string;
        actionHttpHeadersMustHaveNameAndValue: () => string;
        tooManyActions: (maximumActions: number) => string;
        columnAlreadyBelongsToAnotherSet: () => string;
        carouselItemAlreadyBelongsToAnotherSet: () => string;
        invalidCardType: () => string;
        unsupportedCardVersion: (version: string, maxSupportedVersion: string) => string;
        duplicateId: (id: string) => string;
        markdownProcessingNotEnabled: () => string;
        processMarkdownEventRemoved: () => string;
        elementAlreadyParented: () => string;
        actionAlreadyParented: () => string;
        elementTypeNotStandalone: (typeName: string) => string;
    };
    static readonly hints: {
        dontUseWeightedAndStrecthedColumnsInSameSet: () => string;
        dontUseWeightedAndStrecthedCarouselItemsInSameSet: () => string;
    };
    static readonly defaults: {
        inlineActionTitle: () => string;
    };
}
