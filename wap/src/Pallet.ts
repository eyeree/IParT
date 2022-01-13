import {randa} from './Random';

const PALLETS = [
    ["black", "gold", "darkmagenta", "darkseagreen" ],
    ["indigo", "goldenrod", "hotpink",  "mediumpurple"],
    ["aquamarine", "cadetblue", "chocolate", "firebrick"],
    ["darkred", "darkolivegreen", "lightgoldenrodyellow", "lightsteelblue"],
    ["skyblue", "midnightblue", "orangered", "sienna"]
];
export const PALLET = randa(PALLETS);
export const BACKGROUND_COLOR = PALLET[0];
