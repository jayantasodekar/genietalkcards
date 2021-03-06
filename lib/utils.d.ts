import * as Enums from "./enums";
import * as Shared from "./shared";
import { HostConfig } from "./host-config";
export declare function isMobileOS(): boolean;
/**
 * Generate a UUID prepended with "__ac-"
 */
export declare function generateUniqueId(): string;
export declare function appendChild(node: Node, child: Node | undefined): void;
export declare function parseString(obj: any, defaultValue?: string): string | undefined;
export declare function parseNumber(obj: any, defaultValue?: number): number | undefined;
export declare function parseBool(value: any, defaultValue?: boolean): boolean | undefined;
export declare function getEnumValueByName(enumType: {
    [s: number]: string;
}, name: string): number | undefined;
export declare function parseEnum(enumType: {
    [s: number]: string;
}, name: string, defaultValue?: number): number | undefined;
export declare function renderSeparation(hostConfig: HostConfig, separationDefinition: Shared.ISeparationDefinition, orientation: Enums.Orientation): HTMLElement | undefined;
export declare function stringToCssColor(color: string | undefined): string | undefined;
export declare function truncate(element: HTMLElement, maxHeight: number, lineHeight?: number): void;
export declare function getFitStatus(element: HTMLElement, containerEnd: number): Enums.ContainerFitStatus;
