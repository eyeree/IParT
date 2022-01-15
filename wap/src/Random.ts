import { tokenId } from './TokenId';

export const rand1 = mulberry32(tokenId);
export const randf = (min:number, max:number) => (rand1() * (max - min)) + min;
export const randfs = (min:number, max:number) => randf(min, max) * Math.sign(rand1() - 0.5);
export const randi = (min:number, max:number) => Math.floor(randf(min, max));
export const randb = () => rand1() < 0.5;
export const randa = <T>(a:T[], min=0):T => a[randi(min, a.length)];

// from https://stackoverflow.com/a/47593316
function mulberry32(a:number) {
    return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export type NumericEnum = {[key:string|number]:string|number}

export type EnumWeights<TEnum extends NumericEnum> = {[Property in keyof TEnum]?:number};

export const rande = <TEnum extends NumericEnum>(e:TEnum, weights:EnumWeights<TEnum> = {}):TEnum[keyof TEnum] => randa(
    Object
       .values(e)
       .filter(value => (typeof(value) == "number"))
       .flatMap(value => new Array(weights[value] ?? 1).fill(value))
);