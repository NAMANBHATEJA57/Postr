/**
 * Stamp SVG Registry for postr
 * Real SVG files loaded via @svgr/webpack.
 */

import EgyptStamp from "./Egypt.svg";
import EnglandStamp from "./England.svg";
import IndiaStamp from "./India.svg";
import ItalyStamp from "./Italy.svg";
import JapanStamp from "./Japan.svg";

export const STAMPS = {
    egypt: EgyptStamp,
    england: EnglandStamp,
    india: IndiaStamp,
    italy: ItalyStamp,
    japan: JapanStamp,
} as const;

export type StampId = keyof typeof STAMPS;
