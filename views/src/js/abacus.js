/*
 * @(#)abacus.js
 *
 * Copyright 2015 - 2018  David A. Bagley, bagleyd AT verizon.net
 *
 * All rights reserved.
 *
 * Permission to use, copy, modify, and distribute this software and
 * its documentation for any purpose and without fee is hereby granted,
 * provided that the above copyright notice appear in all copies and
 * that both that copyright notice and this permission notice appear in
 * supporting documentation, and that the name of the author not be
 * used in advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 *
 * This program is distributed in the hope that it will be "useful",
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

/* global Audio */

// http://www.sillycycle.com/abacus.html
// Got started with this great page...
// http://diveintohtml5.info/examples/canvas-halma.html

"use strict";

var MIN_RAILS = 1;
var MIN_DEMO_RAILS = 3;
var DEFAULT_RAILS = 13;
var DEFAULT_TOP_SPACES = 2;
var DEFAULT_BOTTOM_SPACES = 2;
var DEFAULT_TOP_NUMBER = 2;
var DEFAULT_BOTTOM_NUMBER = 5;
var DEFAULT_TOP_FACTOR = 5;
var DEFAULT_BOTTOM_FACTOR = 1;
var DEFAULT_TOP_ORIENT = true;
var DEFAULT_BOTTOM_ORIENT = false;
var DEFAULT_SIGN = false;
var DEFAULT_DECIMAL_POSITION = 2;
var MIN_BASE = 2; // Base 1 is rediculous :)
var MAX_BASE = 36; // 10 numbers + 26 letters (ASCII)
var DEFAULT_BASE = 10;
var ROMANFRACTIONBASE = 12;
var ALTROMANFRACTIONBASE = 8;
var DEFAULT_SUBDECKS = 3;
var DEFAULT_SUBBEADS = 4;
var DEFAULT_SHIFT_PERCENT = 2;
var DEFAULT_SHIFT_ANOMALY = 2;
var DEFAULT_GROUP_SIZE = 3;
var SUBDECK_SPACES = 1;
var SUBBASE_EIGHTHS = 8;
var SUBBASE_TWELFTHS = 12;
var MAX_MUSEUMS = 3;
var COLOR_MIDDLE = 1;
var COLOR_FIRST = 2;
var COLOR_HALF = 4;
var BRIGHT_FACTOR = 0.8;
var DARK_FACTOR = 0.75;
var BOTTOM = 0;
var TOP = 1;
var LEE = 3;
var NUMBER_SLICES = 5;

// Math

/*
Roman Numerals

For letters past M...

Here we have lower case to represent the letters with bars on top.
Pardon the non-standard notation (case historically was ignored).
Think of it as room to add the line by hand... :)
_
V = v,
_
X = x, etc
It has been suggested to put more bars on top for bigger numbers
but there is no recorded usage of a larger Roman numeral in
Roman times.

In HTML this by using combining diacritical marks: x-bar = x&#772;

An older notation for Roman numerals was represented thus:
( = C, I) = D, (I) = M, I)) = v, ((I)) = x, I))) = l, (((I))) = c,
 _
|X| = m (here for simplicity of display, just displayed as |x| ).

Fractions
12 ounces (uncia) in a as
S = 1/2 ounce
) = 1/4 ounce
Z = 1/12 ounce
*/

/* Fractions of twelfths had these names 0/12 - 12/12 */
var twelfthStrings = ["", "uncia", "sextans", "quadrans",
    "triens", "quincunx", "semis", "septunx",
    "bes", "dodrans", "dextans", "deunix", "as"];
var twelfthGlyphs = ["", "-", "=", "=-", "==", "=-=",
    "S", "S-", "S=", "S=-", "S==", "S=-=", "|"];

var HALF_UNCIA = "semuncia"; /* E, (actually a Greek letter sigma) */
var ONEANDAHALF_UNCIA = "sescuncia"; /* E- */
var halftwelfthStrings = [HALF_UNCIA, ONEANDAHALF_UNCIA];
var halftwelfthGlyphs = ["E", "E-"];

/* Fractions of Uncia had these names, took shortest variant */
var TWELFTH_UNCIA = "semisextula"; /* z (actually,
    a "Z" with a "-" through the middle) AKA dimidia sextula,
    dimidio sextula */
var SIXTH_UNCIA = "sextula"; /* Z */
var QUARTER_UNCIA = "sicilicus"; /* Q (actually a
    backwards C but confusing with ancient Roman numerals) */
var THIRD_UNCIA = "duella"; /* u (actually a Greek
    letter mu), AKA binae sextulae */
var FIVETWELFTHS_UNCIA = "sicilicus sextula"; /* not
    sure if this is best representation */
var EIGHTH_UNCIA = "drachma";
var THREEEIGHTHS_UNCIA = "sicilicus drachma"; /* not
    sure if this is best representation */
/* Combining fractions (not sure how this was done in practice
   but this seems reasonable). Combine with the representation
   for HALF_UNCIA or ONEANDAHALF_UNCIA as required. */
var subtwelfthStrings = ["", TWELFTH_UNCIA, SIXTH_UNCIA,
    QUARTER_UNCIA, THIRD_UNCIA, FIVETWELFTHS_UNCIA];
var subeighthStrings = ["", EIGHTH_UNCIA, QUARTER_UNCIA,
    THREEEIGHTHS_UNCIA];
var subtwelfthGlyphs = ["", "z", "Z", "Q", "u", "QZ"];
var subeighthGlyphs = ["", "t", "Q", "Qt"];
var images;

function romanFraction(number, base, subnumber, subbase, latin) {
    var gotFraction = false;
    var halfBase = subbase >> 1;
    var fraction = number;
    var subfraction = subnumber;
    var buf = "";

    fraction %= base;
    if (fraction === 1 && subfraction >= halfBase) {
        subfraction -= halfBase;
        if (latin) {
            buf += halftwelfthStrings[1];
            gotFraction = true;
        } else {
            buf += halftwelfthGlyphs[1];
        }
    } else if (fraction > 0) {
        if (latin) {
            buf += twelfthStrings[fraction * Math.floor(ROMANFRACTIONBASE / base)];
            gotFraction = true;
        } else {
            buf += twelfthGlyphs[fraction * Math.floor(ROMANFRACTIONBASE / base)];
        }
    }
    if (subfraction >= halfBase) {
        subfraction -= halfBase;
        if (latin) {
            if (gotFraction)
                buf += " ";
            buf += halftwelfthStrings[0];
            gotFraction = true;
        } else {
            buf += halftwelfthGlyphs[0];
        }
    }
    if (subfraction !== 0) {
        if (latin) {
            if (gotFraction)
                buf += " ";
            if (subbase === ALTROMANFRACTIONBASE)
                buf += subeighthStrings[subfraction];
            else
                buf += subtwelfthStrings[subfraction];
        } else {
            if (subbase === ALTROMANFRACTIONBASE)
                buf += subeighthGlyphs[subfraction];
            else
                buf += subtwelfthGlyphs[subfraction];
        }
    }
    return buf;
}

function numberWithCommas(x, n) {
    var parts = x.toString().split(".");
    var replace = "\\B(?=(\\d{" + n.toString() + "})+(?!\\d))";
    var re = new RegExp(replace, "g");
    parts[0] = parts[0].replace(re, ",");
    return parts.join(".");
}

// find integer root
function rootInt(i, n) {
    var j = 0, k;
    var absI = (i >= 0) ? i : -i;
    var prod;

    if (n < 0 || i === 0 || (n % 2 === 0 && i < 0))
        return 0;
    if (n === 1)
        return i;
    absI = (i >= 0) ? i : -i;
    do {
        prod = 1;
        j++;
        for (k = 0; k < n; k++)
            prod *= j;
    } while (prod <= absI);
    return (i === absI) ? (j - 1) : (1 - j);
}

// this tries to find the optimal value for factor of top deck
function convertBaseToBottom(base) {
    for (var j = rootInt(base, 2); j > 1; j--) {
         if (base % j === 0) {
             return Math.floor(base / j);
         }
    }
    return base;
}

// regex solutions I saw on web all fail on 1.0
function trimmer(num) {
    if (num.indexOf(".") === -1 || num.indexOf("e-") !== -1) {
        return num;
    }
    for (var i = num.length - 1; i >= 0; i--) {
        if (num.charAt(i) === ".") {
            if (i === 0) {
                return "0";
            } else {
                return num.substring(0, i);
            }
        } else if (num.charAt(i) !== "0") {
             return num.substring(0, i + 1);
        }
    }
    return num;
}

// fixed for different bases
function fixed(num, decimals) {
    var decimalPoint = num.indexOf(".");
    if (decimalPoint === -1 || num.indexOf("e-") !== -1) {
        return num;
    }
    if (num.length - 1 > decimalPoint + decimals + 1)
        return num.substring(0, decimalPoint + decimals + 1);
    return num;
}

var timer;
var delta = 0; // mutex
var animation = true;
//var animation = false;
var fullScreen = false;

var bump, move, drip;
if (typeof Audio !== undefined) {
    // bump = new Audio("bump.wav");
    // move = new Audio("move.wav");
    // drip = new Audio("drip.wav");
}

function Bead(deck, rail, cell, index) {
    this.deck = deck;
    this.rail = rail;
    this.cell = cell;
    this.index = index;
}

function Coord(x, y) {
    this.x = x;
    this.y = y;
}

function parse6DigitColor(input) {
    var m = String(input).match(/^#([0-9a-f]{6})$/i)[1];
    if (m) {
        return ((parseInt(m.substr(0, 2), 16) << 16) +
            (parseInt(m.substr(2, 2), 16) << 8) +
            parseInt(m.substr(4, 2), 16));
    }
}

function darker(color) {
    var intColor = parse6DigitColor(color);
    var red = (Math.floor((0xff0000 & intColor) * DARK_FACTOR)) >> 16;
    red = (red < 16) ? "0" + red.toString(16) : red.toString(16);
    var green = (Math.floor((0x00ff00 & intColor) * DARK_FACTOR)) >> 8;
    green = (green < 16) ? "0" + green.toString(16) : green.toString(16);
    var blue = Math.floor((0x0000ff & intColor) * DARK_FACTOR);
    blue = (blue < 16) ? "0" + blue.toString(16) : blue.toString(16);
    return "#" + red + green + blue;
}

function brighter(color) {
    var intColor = parse6DigitColor(color);
    var red = (Math.floor((0xff0000 & intColor) / BRIGHT_FACTOR)) >> 16;
    if (red > 0xff)
        red = 0xff;
    red = (red < 16) ? "0" + red.toString(16) : red.toString(16);
    var green = (Math.floor((0x00ff00 & intColor) / BRIGHT_FACTOR)) >> 8;
    if (green > 0xff)
        green = 0xff;
    green = (green < 16) ? "0" + green.toString(16) : green.toString(16);
    var blue = Math.floor((0x0000ff & intColor) / BRIGHT_FACTOR);
    if (blue > 0xff)
        blue = 0xff;
    blue = (blue < 16) ? "0" + blue.toString(16) : blue.toString(16);
    return "#" + red + green + blue;
}

function newPos(dir, inc) {
    return (((dir > 0) ? 1 : -1) * inc);
}

function drawMovement(that, dir, spaces) {
    // beware of this and that: Edward Gory
    if (that.pressedBead === null) {
        delta = 0;
        return;
    }
    that.drawStep(dir, spaces);
    delta++;
    if (delta >= that.slices) {
        clearTimeout(timer);
        delta = 0;
        if (that.sound) {
            // bump.play();
        }
        that.drawAbacus();
        that.pressedBead = null;
    }
}

//var resumeAbacus = false;
/*if (typeof resumeAbacus !== "function") {
    saveAbacusState = function() {
        return false;
    }
    resumeAbacus = function() {
}*/

var abaci = [];

function init(abaci, number) {
 for (var i = 0; i < number; i++) {
  abaci[i] = {
initSpaceAbacus : function() {
    this.decks = 2;
    this.deck = new Array(this.decks);
    for (var level = 0; level < this.decks; level++)
        this.deck[level] = {};
    // beads are only circles, FIXME
    this.beadColor = new Array(4);
    this.beadColor[0] = new Array(4);
    this.beadColor[1] = new Array(4);
    this.beadColor[2] = new Array(4);
    this.beadColor[3] = new Array(4);
    this.railColor = new Array(2);
    this.railColor[0] = new Array(3);
    this.railColor[1] = new Array(3);
    this.display = {};
},

setFormat : function(display, format) {
    this.frameColor = (this.frameColor === undefined) ?
        "#8b7e66" : this.frameColor; // tan, wheat4
    this.background = (this.background === undefined) ?
        "#aeb2c3" : this.background; // steel blue
    this.border = (this.border === undefined) ?
        "#404040" : this.border; // gray25
    this.beadColor[0][1] = (this.beadColor[0][1] === undefined) ?
        "#8b0000" : this.beadColor[0][1]; // dark red
    this.beadColor[1][1] = (this.beadColor[1][1] === undefined) ?
        "#8b7355" : this.beadColor[1][1]; // brown burlywood4
    this.beadColor[2][1] = (this.beadColor[2][1] === undefined) ?
        "#afafff" : this.beadColor[2][1]; // silver, LightSteelBlue1
    this.beadColor[3][1] = (this.beadColor[3][1] === undefined) ?
        "#7fff7f" : this.beadColor[3][1]; // green bill
    for (var color = 0; color < 4; color++) {
        this.beadColor[color][0] = brighter(this.beadColor[color][1]);
        this.beadColor[color][2] = darker(this.beadColor[color][1]);
        this.beadColor[color][3] = darker(this.beadColor[color][2]);
    }
    this.railColor[0][1] = (this.railColor[0][1] === undefined) ?
        "#ffd700" : this.railColor[0][1]; // gold
    this.railColor[1][1] = (this.railColor[1][1] === undefined) ?
        "#cbd5ff" : this.railColor[1][1]; // silver, LightSteelBlue1
    for (var color = 0; color < 2; color++) {
        this.railColor[color][0] = brighter(this.railColor[color][1]);
        this.railColor[color][2] = darker(this.railColor[color][1]);
    }
    this.rails = (this.rails === undefined) ?
        DEFAULT_RAILS : parseInt(this.rails);
    this.base = (this.base === undefined) ?
        DEFAULT_BASE : parseInt(this.base);
    this.display.base = (display.base === undefined) ?
        this.base : parseInt(display.base);
    this.decimalPosition = (this.decimalPosition === undefined) ?
        DEFAULT_DECIMAL_POSITION : parseInt(this.decimalPosition);
    this.sign = (this.sign === undefined) ?
        false : !(parseInt(this.sign) === 0);
    this.ancientRoman = (this.ancientRoman === undefined) ?
        false : !(parseInt(this.ancientRoman) === 0);
    this.modernRoman = (this.modernRoman === undefined) ?
        false : !(parseInt(this.modernRoman) === 0);
    this.latin = (this.latin === undefined) ?
        false : !(parseInt(this.latin) === 0);
    this.museum = (this.museum === undefined) ?
        "uk" : this.museum.toLowerCase(); // it|uk|fr
    this.currency = (this.currency === undefined) ?
        "" : this.currency.toLowerCase(); // us|jp|kr
    this.group = (this.group === undefined) ?
        false : !(parseInt(this.group) === 0);
    this.groupSize = (this.groupSize === undefined) ?
        DEFAULT_GROUP_SIZE : parseInt(this.groupSize);
    this.decimalComma = (this.decimalComma === undefined) ?
        false : !(parseInt(this.decimalComma) === 0);
    this.anomaly = (this.anomaly === undefined) ? 0 : parseInt(this.anomaly);
    this.anomalySq = (this.anomalySq === undefined) ?
        0 : parseInt(this.anomalySq);
    this.shiftAnomaly = (this.shiftAnomaly === undefined) ?
        DEFAULT_SHIFT_ANOMALY : parseInt(this.shiftAnomaly);
    this.shiftAnomalySq = (this.shiftAnomalySq === undefined) ?
        4 : parseInt(this.shiftAnomalySq);
    this.deck[BOTTOM].factor = (this.deck[BOTTOM].factor === undefined) ?
        1 : parseInt(this.deck[BOTTOM].factor);
    this.deck[BOTTOM].pieces = (this.deck[BOTTOM].pieces === undefined) ?
        0 : parseInt(this.deck[BOTTOM].pieces);
    this.deck[BOTTOM].pieces = (this.deck[BOTTOM].pieces <= 1) ?
        0 : this.deck[BOTTOM].pieces;
    this.deck[TOP].pieces = (this.deck[TOP].pieces === undefined) ?
        0 : parseInt(this.deck[TOP].pieces);
    this.deck[TOP].pieces = (this.deck[TOP].pieces <= 1) ?
        0 : this.deck[TOP].pieces;
    this.deck[BOTTOM].piecePercents =
        (this.deck[BOTTOM].piecePercents === undefined) ?
        0 : parseInt(this.deck[BOTTOM].piecePercents);
    this.deck[BOTTOM].piecePercents =
        (this.deck[BOTTOM].piecePercents <= 1) ?
        0 : this.deck[BOTTOM].piecePercents;
    this.deck[TOP].piecePercents = (this.deck[TOP].piecePercents === undefined) ?
        0 : parseInt(this.deck[TOP].piecePercents);
    this.deck[TOP].piecePercents = (this.deck[TOP].piecePercents <= 1) ?
        0 : this.deck[TOP].piecePercents;
    this.shiftPercent = (this.shiftPercent === undefined) ?
        2 : parseInt(this.shiftPercent);
    this.subdecks = (this.subdecks === undefined) ?
        0 : parseInt(this.subdecks);
    this.subbeads = (this.subbeads === undefined) ?
        DEFAULT_SUBBEADS : parseInt(this.subbeads);
    this.subbase = (this.subbase === undefined) ?
        SUBBASE_TWELFTHS : parseInt(this.subbase);
    if (format === "cn" || format === "zh" || format === "chinese") {
        // "chinese" default
        this.deck[TOP].factor = convertBaseToBottom(this.base);
        this.deck[BOTTOM].beads = this.deck[TOP].factor;
        this.deck[TOP].beads = Math.floor(this.base / this.deck[TOP].factor);
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        //this.deck[TOP].pieces = 0;
        //this.deck[BOTTOM].pieces = 0;
        //this.deck[TOP].piecePercents = 0;
        //this.deck[BOTTOM].piecePercents = 0;
        this.vertical = (this.vertical === undefined) ?
            false : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = false;
        this.medieval = false;
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            DEFAULT_TOP_SPACES : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            DEFAULT_BOTTOM_SPACES : parseInt(this.deck[BOTTOM].spaces);
        this.railIndex = 0;
        this.colorScheme = 0;
    } else if (format === "ja" || format === "jp" || format === "japanese") {
        this.deck[TOP].factor = convertBaseToBottom(this.base);
        this.deck[BOTTOM].beads = this.deck[TOP].factor - 1;
        this.deck[TOP].beads = Math.floor(this.base / this.deck[TOP].factor) - 1;
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        this.vertical = (this.vertical === undefined) ?
            false : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = true;
        this.medieval = false;
        this.colorScheme = 0;
        this.railIndex = 0;
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            (DEFAULT_TOP_SPACES - 1) : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            (DEFAULT_BOTTOM_SPACES - 1) : parseInt(this.deck[BOTTOM].spaces);
    } else if (format === "ko" || format === "kr" || format === "korean") {
        this.deck[TOP].factor = convertBaseToBottom(this.base);
        this.deck[BOTTOM].beads = this.deck[TOP].factor;
        this.deck[TOP].beads = Math.floor(this.base / this.deck[TOP].factor) - 1;
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        //this.deck[TOP].pieces = 0;
        //this.deck[BOTTOM].pieces = 0;
        //this.deck[BOTTOM].piecePercents = 0;
        this.vertical = (this.vertical === undefined) ?
            false : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = true;
        this.medieval = false;
        this.colorScheme = 0;
        this.railIndex = 0;
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            (DEFAULT_TOP_SPACES - 1) : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            (DEFAULT_BOTTOM_SPACES - 1) : parseInt(this.deck[BOTTOM].spaces);
    } else if (format === "ru" || format === "russian") {
        this.deck[TOP].factor = this.base;
        this.deck[BOTTOM].beads = this.base;
        this.deck[TOP].beads = 0;
        this.deck[BOTTOM].orient = !DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        //this.deck[TOP].pieces = 0;
        //this.deck[BOTTOM].pieces = 4;
        //this.deck[BOTTOM].piecePercents = 0;
        //this.deck[BOTTOM].piecePercents = 4;
        this.vertical = (this.vertical === undefined) ?
            true : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = false;
        this.medieval = false;
        this.railIndex = 1;
        this.colorScheme = COLOR_MIDDLE | COLOR_FIRST;
        this.deck[TOP].spaces = 0;
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            (DEFAULT_BOTTOM_SPACES + 3) : parseInt(this.deck[BOTTOM].spaces);
    } else if (format === "dk" || format === "danish") {
        this.deck[TOP].factor = this.base;
        this.deck[BOTTOM].beads = this.base;
        this.deck[TOP].beads = 0;
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        //this.deck[TOP].pieces = 0;
        //this.deck[BOTTOM].pieces = 0;
        //this.deck[BOTTOM].piecePercents = 0;
        this.vertical = (this.vertical === undefined) ?
            true : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = false;
        this.medieval = false;
        this.railIndex = 1;
        this.colorScheme = COLOR_HALF;
        this.deck[TOP].spaces = 0;
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            (DEFAULT_BOTTOM_SPACES + 6) : parseInt(this.deck[BOTTOM].spaces);
    } else if (format === "ro" || format === "it" || format === "roman") {
        this.deck[TOP].factor = convertBaseToBottom(this.base);
        this.deck[BOTTOM].beads = this.deck[TOP].factor - 1;
        this.deck[TOP].beads = Math.floor(this.base / this.deck[TOP].factor) - 1;
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = DEFAULT_TOP_ORIENT;
        //this.deck[TOP].pieces = 2;
        //this.deck[BOTTOM].pieces = 6;
        //this.deck[BOTTOM].piecePercents = 0;
        this.vertical = (this.vertical === undefined) ?
            false : !(parseInt(this.vertical) === 0);
        this.slot = true;
        this.diamond = false;
        this.medieval = false;
        this.colorScheme = 0;
        this.railIndex = 0;
        this.deck[TOP].spaces = DEFAULT_TOP_SPACES + 1;
        this.deck[BOTTOM].spaces = DEFAULT_BOTTOM_SPACES + 1;
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            (DEFAULT_TOP_SPACES + 1) : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            (DEFAULT_BOTTOM_SPACES + 1) : parseInt(this.deck[BOTTOM].spaces);
    } else if (format === "me" || format === "medieval") {
        this.deck[TOP].factor = convertBaseToBottom(this.base);
        this.deck[BOTTOM].beads = this.deck[TOP].factor;
        this.deck[TOP].beads = Math.floor(this.base / this.deck[TOP].factor);
        this.deck[BOTTOM].orient = DEFAULT_BOTTOM_ORIENT;
        this.deck[TOP].orient = !DEFAULT_TOP_ORIENT;
        this.vertical = (this.vertical === undefined) ?
            true : !(parseInt(this.vertical) === 0);
        this.slot = false;
        this.diamond = false;
        this.medieval = true;
        this.deck[TOP].spaces = DEFAULT_TOP_SPACES - 1;
        this.deck[BOTTOM].spaces = DEFAULT_BOTTOM_SPACES;
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            (DEFAULT_TOP_SPACES - 1) : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            DEFAULT_BOTTOM_SPACES : parseInt(this.deck[BOTTOM].spaces);
        this.railIndex = 0;
        this.colorScheme = 0;
    } else {
        // "generic" default
        this.deck[TOP].factor = (this.deck[TOP].factor === undefined) ?
            convertBaseToBottom(this.base) :
            parseInt(this.deck[TOP].factor);
        this.deck[BOTTOM].beads = (this.deck[BOTTOM].beads === undefined) ?
            this.deck[TOP].factor : parseInt(this.deck[BOTTOM].beads);
        this.deck[TOP].beads = (this.deck[TOP].beads === undefined) ?
            Math.floor(this.base / this.deck[TOP].factor) :
            parseInt(this.deck[TOP].beads);
        this.deck[BOTTOM].orient = (this.deck[BOTTOM].orient === undefined) ?
            DEFAULT_BOTTOM_ORIENT :
            !(parseInt(this.deck[BOTTOM].orient) === 0);
        this.deck[TOP].orient = (this.deck[TOP].orient === undefined) ?
            DEFAULT_TOP_ORIENT :
            !(parseInt(this.deck[TOP].orient) === 0);
        this.vertical = (this.vertical === undefined) ?
            false : !(parseInt(this.vertical) === 0);
        this.slot = (this.slot === undefined) ?
            false : !(parseInt(this.slot) === 0);
        this.diamond = (this.diamond === undefined) ?
            false : !(parseInt(this.diamond) === 0);
        this.medieval = (this.medieval === undefined) ?
            false : !(parseInt(this.medieval) === 0);
        this.deck[TOP].spaces = (this.deck[TOP].spaces === undefined) ?
            DEFAULT_TOP_SPACES : parseInt(this.deck[TOP].spaces);
        this.deck[BOTTOM].spaces = (this.deck[BOTTOM].spaces === undefined) ?
            DEFAULT_BOTTOM_SPACES : parseInt(this.deck[BOTTOM].spaces);
        this.railIndex = 0;
        this.colorScheme = 0;
    }
    this.centsSymbol = "";
    if (this.currency === "jp" || format === "ja") {
        this.currency = "jp";
        this.currencyRails = 5;
        this.currencyOffset = 0; // no cents
        this.billOffset = 3;
        this.showValue = true;
        this.currencySymbol = "\u00a5";
    } else if (this.currency === "kr" || this.currency === "ko") {
        this.currency = "kr";
        this.currencyRails = 5;
        this.currencyOffset = 0; // no cents
        this.billOffset = 3;
        this.showValue = true;
        this.currencySymbol = "\u20a9";
    } else if (this.currency === "ru") {
        this.currency = "ru";
        this.currencyRails = 6;
        this.currencyOffset = 2;
        this.billOffset = 2;
        this.showValue = true;
        this.currencySymbol = "\u20bd";
    } else if (this.currency === "gb") {
        this.currency = "gb";
        this.currencyRails = 6;
        this.currencyOffset = 2;
        this.billOffset = 1;
        this.showValue = true;
        this.currencySymbol = "\u00a3";
        this.centsSymbol = "p";
    } else {
        this.currencyRails = 7;
        this.currencyOffset = 2; // cents
        this.billOffset = 0;
        this.showValue = false; // show obverse
        this.currencySymbol = "$";
        this.centsSymbol = "\u00a2";
    }
    this.allCells = 0;
    for (var level = 0; level < this.decks; level++) {
        this.deck[level].cells = this.deck[level].beads +
            this.deck[level].spaces;
        this.allCells += this.deck[level].cells;
    }

    if (typeof Audio === undefined) {
        this.sound = false;
    } else {
        this.sound = (this.sound === undefined) ?
            false : !(parseInt(this.sound) === 0);
    }
    if (this.currency !== "" && this.rails >= this.currencyRails) {
        this.setCurrency();
    }
    this.slices = 8;
    // beads are only circles, no odd sizes FIXME
    // not sure about setting a default size, FIXME?
    // default was 24
    this.beadSize = (this.beadSize === undefined) ?
        0 : parseInt((this.beadSize >> 1) << 1);
    if (this.beadSize === 0) {
        this.fullWindow = true;
    } else {
        this.fullWindow = false;
    }
    this.calculateAbacusSize();
},


calculateAbacusSize : function() {
    if (this.fullWindow) {
        if (this.vertical)
            this.frameSize = new Coord(window.innerHeight - 28, window.innerWidth - 28);
        else
            this.frameSize = new Coord(window.innerWidth - 28, window.innerHeight - 76);
        if (this.medieval)
            this.frameSize.x = ((3 * this.frameSize.x) >> 2);
        //this.beadSize = Math.floor(15 * this.frameSize.x / (16 * (this.rails + 3)));
        //this.beadSize = Math.floor(this.frameSize.y / 15);
        this.beadSize = Math.floor(Math.min(14 * this.frameSize.x / (16 * (this.rails + 3)), this.frameSize.y / 15));
        this.beadSize = (this.beadSize >> 1) << 1;
    }
    {
        this.frameThickness = (this.beadSize >> 1);
        this.beadWidth = this.beadSize;
        if (this.medieval)
            this.beadHeight = this.beadSize;
        else {
            this.beadHeight = Math.floor(this.beadSize * 2.0 / 3.0);
            this.beadHeight = (this.beadHeight >> 1) << 1;
        }
        this.beadRadiusX = (this.beadWidth >> 1);
        this.beadRadiusY = (this.beadHeight >> 1);
        if (this.medieval)
            this.beadGapX = this.beadSize;
        else
            this.beadGapX = 3 * (this.beadHeight >> 3);
        this.middleBarThickness = this.frameThickness;
        this.middleBarY = this.deck[TOP].cells * this.beadHeight +
             this.frameThickness;
        if (this.medieval)
            this.railThickness = (this.beadSize >> 5) + 1;
        else if (this.slot)
            this.railThickness = (this.beadSize >> 3) + 2;
        else
            this.railThickness = (this.beadSize >> 4) + 1;
        this.setFrame();
    }
},

setCurrency : function() {
    this.images = new Array(2);
    for (var deck = 0; deck < 2; deck++) {
        this.images[deck] = new Array(this.currencyRails);
        for (var rail = 0; rail < this.currencyRails; rail++) {
            if ((this.deck[BOTTOM].pieces === 0) || deck !== 1 || rail !== 2) {
                this.images[deck][rail] = new Image();
            }
        }
    }
    var count = 0;
    // coins should be png for masking, bills should be jpg for size
    if (this.currency === "jp") {
        // https://en.wikipedia.org/wiki/Japanese_yen
        // had to do cropping, looks like coins are not as round as should be
        // TODO should allow obverse
        this.images[0][count].src = "jp-1r.png";
        this.images[1][count++].src = "jp-5r.png"; // hole
        this.images[0][count].src = "jp-10r.png";
        this.images[1][count++].src = "jp-50r.png"; // hole
        this.images[0][count].src = "jp-100r.png";
        this.images[1][count++].src = "jp-500r.png";
        // Bank notes
        this.images[0][count].src = "jp-1000o.jpg";
        this.images[1][count++].src = "jp-5000o.jpg";
        this.images[0][count].src = "jp-10000o.jpg";
        // Added commemorative coin to round out.
        this.images[1][count++].src = "jp-50000o.png";
    } else if (this.currency === "kr") {
        // https://en.wikipedia.org/wiki/South_Korean_won
        // TODO should allow obverse
        this.images[0][count].src = "kr-1r.png";
        this.images[1][count++].src = "kr-5r.png";
        this.images[0][count].src = "kr-10r.png";
        this.images[1][count++].src = "kr-50r.png";
        this.images[0][count].src = "kr-100r.png";
        this.images[1][count++].src = "kr-500r.png";
        // Bank notes
        this.images[0][count].src = "kr-1000o.jpg";
        this.images[1][count++].src = "kr-5000o.jpg";
        this.images[0][count].src = "kr-10000o.jpg";
        this.images[1][count++].src = "kr-50000o.jpg";
    } else if (this.currency === "ru") {
        // https://en.wikipedia.org/wiki/Russian_ruble
        this.images[0][count].src = "ru-.01r.png";
        this.images[1][count++].src = "ru-.05r.png";
        this.images[0][count].src = "ru-.1r.png";
        this.images[1][count++].src = "ru-.5r.png";
        this.images[0][count].src = "ru-1r.png";
        this.images[1][count++].src = "ru-5r.png";
        this.images[0][count].src = "ru-10r.png";
        // Bank notes
        this.images[1][count++].src = "ru-50o.jpg";
        this.images[0][count].src = "ru-100o.jpg";
        this.images[1][count++].src = "ru-500o.jpg";
        this.images[0][count].src = "ru-1000o.jpg";
        this.images[1][count++].src = "ru-5000o.jpg";
    } else if (this.currency === "gb") {
        // https://en.wikipedia.org/wiki/Coins_of_the_pound_sterling
        this.images[0][count].src = "gb-.01r.png";
        this.images[1][count++].src = "gb-.05r.png";
        this.images[0][count].src = "gb-.1r.png";
        this.images[1][count++].src = "gb-.5r.png";
        this.images[0][count].src = "gb-1r.png";
        // Bank notes
        this.images[1][count++].src = "gb-5o.jpg";
        this.images[0][count].src = "gb-10o.jpg";
        this.images[1][count++].src = "gb-50o.jpg";
        this.images[0][count].src = "gb-100o.jpg";
        this.images[1][count++].src = "gb-500o.png";
        this.images[0][count].src = "gb-1000o.png";
        this.images[1][count++].src = "gb-5000o.png"; // does not exist
    } else {
        // https://en.wikipedia.org/wiki/United_States_dollar
        // File names were changed, but I guess I did not have to.
        // $20 is very common but does not fit in abacus.
        if (this.showValue) {
            // Kind of useless as US coins do not show value with digits
            this.images[0][count].src = "us-.01r.png";
            this.images[1][count++].src = "us-.05r.png";
            this.images[0][count].src = "us-.1r.png";
            this.images[1][count++].src = "us-.5r.png";
        } else {
            this.images[0][count].src = "us-.01o.png";
            this.images[1][count++].src = "us-.05o.png";
            this.images[0][count].src = "us-.1o.png";
            this.images[1][count++].src = "us-.5o.png";
        }
        if (this.deck[BOTTOM].pieces != 0)
            this.images[0][count++].src = "us-.25o.png"; // value on obverse
        // Bank notes
        this.images[0][count].src = "us-1o.jpg";
        this.images[1][count++].src = "us-5o.jpg";
        this.images[0][count].src = "us-10o.jpg";
        this.images[1][count++].src = "us-50o.jpg";
        this.images[0][count].src = "us-100o.jpg";
        // no longer use beyond 100
        this.images[1][count++].src = "us-500o.jpg";
        this.images[0][count].src = "us-1000o.jpg";
        this.images[1][count++].src = "us-5000o.jpg";
    }
    // That is it so far, but want to add more.
    // Euro has that silly "Specimen" stamp "security"
    // measure and did not use png for coins (minor gripe).
},

setFormatFromElement : function(display, element) {
    var article = document.getElementById(element);
    if (article !== null && article.dataset) {
        this.format = article.dataset.format;
        this.rails = article.dataset.rails;
        this.base = article.dataset.base;
        display.base = article.dataset.displayBase;
        this.decimalPosition = article.dataset.decimalPosition;

        this.deck[TOP].factor = article.dataset.topFactor;
        this.deck[BOTTOM].beads = article.dataset.bottomBeads;
        this.deck[TOP].beads = article.dataset.topBeads;
        this.deck[BOTTOM].spaces = article.dataset.bottomSpaces;
        this.deck[TOP].spaces = article.dataset.topSpaces;
        this.deck[BOTTOM].orient = article.dataset.bottomOrient;
        this.deck[TOP].orient = article.dataset.topOrient;
        this.deck[BOTTOM].pieces = article.dataset.bottomPieces;
        this.deck[TOP].pieces = article.dataset.topPieces;
        this.deck[BOTTOM].piecePercents = article.dataset.bottomPiecePercents;
        this.deck[TOP].piecePercents = article.dataset.topPiecePercents;
        this.subdecks = article.dataset.subdecks;
        this.subbeads = article.dataset.subbeads;
        this.subbase = article.dataset.subbase;
        this.sign = article.dataset.sign;
        this.anomaly = article.dataset.anomaly;
        this.anomalySq = article.dataset.anomalySq;
        this.shiftAnomaly = article.dataset.shiftAnomaly;
        this.shiftAnomalySq = article.dataset.shiftAnomalySq;
        this.diamond = article.dataset.diamond;
        this.vertical = article.dataset.vertical;
        this.slot = article.dataset.slot;
        this.medieval = article.dataset.medieval;
        this.romanNumerals = article.dataset.romanNumerals;
        this.ancientRoman = article.dataset.ancientRoman;
        this.modernRoman = article.dataset.modernRoman;
        this.latin = article.dataset.latin;
        this.museum = article.dataset.museum;
        this.currency = article.dataset.currency;
        this.group = article.dataset.group;
        this.groupSize = article.dataset.groupSize;
        this.decimalComma = article.dataset.decimalComma;
        this.sound = article.dataset.sound;
        this.beadSize = article.dataset.beadSize;
        this.beadColor[0][1] = article.dataset.beadColor0;
        this.beadColor[1][1] = article.dataset.beadColor1;
        this.railColor[0][1] = article.dataset.railColor0;
        this.railColor[1][1] = article.dataset.railColor1;
        this.frameColor = article.dataset.frameColor;
        this.background = article.dataset.background;
        this.border = article.dataset.border;
    }
    this.format = (this.format === undefined) ?
        "generic" : this.format.toLowerCase();
    this.setFormat(display, this.format);
},

setFrame : function() {
    this.frameSize = new Coord(this.rails * (this.beadSize + this.beadGapX)
        + this.beadGapX + 2 * this.frameThickness,
        this.allCells * this.beadHeight
        + 2 * this.frameThickness + this.middleBarThickness);
},

getPieces : function(deck) {
    if (deck === 0) {
        if (this.deck[BOTTOM].beads > (this.base >> 1))
            return this.deck[BOTTOM].pieces - this.base
                + this.deck[BOTTOM].beads;
        else
            return this.deck[BOTTOM].pieces - this.deck[TOP].factor
                + this.deck[BOTTOM].beads;
    }
    if (this.deck[TOP].beads > 0)
        return this.deck[TOP].pieces
            - Math.floor(this.base / this.deck[TOP].factor)
            + this.deck[TOP].beads;
    return 0;
},

getPieceSpaces : function(deck) {
    return this.deck[deck].cells - this.getPieces(deck);
},

getPieceFactor : function(deck) {
    return (deck === 0) ? 1 : this.deck[BOTTOM].pieces;
},

/*getPieceBase : function(deck) {
    return (this.deck[TOP].pieces > 0) ? this.deck[TOP].pieces
        * this.deck[BOTTOM].pieces : this.deck[BOTTOM].pieces;
},*/

getPiecePercents : function(deck) {
    if (deck === 0) {
        if (this.deck[BOTTOM].beads > (this.base >> 1))
            return this.deck[BOTTOM].piecePercents - this.base
                + this.deck[BOTTOM].beads;
        else
            return this.deck[BOTTOM].piecePercents - this.deck[TOP].factor
                + this.deck[BOTTOM].beads;
    }
    if (this.deck[TOP].beads > 0)
        return this.deck[TOP].piecePercents
            - Math.floor(this.base / this.deck[TOP].factor)
            + this.deck[TOP].beads;
    return 0;
},

getPiecePercentSpaces : function(deck) {
    return this.deck[deck].cells - this.getPiecePercents(deck);
},

getPiecePercentFactor : function(deck) {
    return (deck === 0) ? 1 : this.deck[BOTTOM].piecePercents;
},

/*getPiecePercentBase : function(deck) {
    return (this.deck[TOP].piecePercents > 0) ? this.deck[TOP].piecePercents
        * this.deck[BOTTOM].piecePercents : this.deck[BOTTOM].piecePercents;
}*/

getSubdeckBeads : function(subdeck) {
    var beads = Math.floor(this.subbeads / this.subdecks);

    if (subdeck === 0)
        beads += this.subbeads - this.subdecks * beads;
    return beads;
},

getSubdeckCells : function(subdeck) {
    return this.getSubdeckBeads(subdeck) + SUBDECK_SPACES;
},

getNumberSubbeadsOffset : function(local) {
    var nOffset = 0;
    if (local < 0)
        return this.subbeads + this.subdecks * SUBDECK_SPACES;
    for (var subdeck = 0; subdeck < this.subdecks - 1 - local; subdeck++) {
        nOffset += this.getSubdeckBeads(this.subdecks - 1 - subdeck)
            + SUBDECK_SPACES;
    }
    return nOffset;
},

getSubpositionSubdeck : function(position) {
   var subdeck = this.getSubdeckFromPosition(position);
   return position - this.getNumberSubbeadsOffset(subdeck);
},

getSubdeckFromPosition : function(position) {
    var subdeck;
    for (subdeck = this.subdecks - 1; subdeck >= 0; subdeck--) {
        if (position < this.getNumberSubbeadsOffset(subdeck - 1)) {
            break;
        }
    }
    return subdeck;
},

// These also have different writing on subdeck portion
getSubdeckSlotsSeparate : function(museum) {
    return (museum === "uk"); // museum !== "it" && museum !== "fr"
},

checkPiece : function() {
    return (this.rails > 1
        && this.deck[BOTTOM].pieces !== 0 && this.getPieceSpaces(BOTTOM) > 0
        && (this.deck[TOP].beads === 0 || this.getPieceSpaces(TOP) > 0));
},

checkPiecePercent : function() {
    return (this.rails > 1 + ((this.checkPiece()) ? 1 : 0) + this.shiftPercent
        && this.decimalPosition >= this.shiftPercent
        && this.deck[BOTTOM].piecePercents !== 0
        && this.getPiecePercentSpaces(BOTTOM) > 0
        && (this.deck[TOP].beads === 0 || this.getPiecePercentSpaces(TOP) > 0));
},

checkSubdeck : function() {
    return (this.rails >= 3 + ((this.checkPiece()) ? 1 : 0)
        + ((this.checkPiecePercent()) ? this.shiftPercent : 0)
        && this.slot && this.subdecks !== 0 && !this.medieval
        && this.deck[BOTTOM].cells >= this.subbeads
        + this.subdecks * SUBDECK_SPACES);
},

checkSign : function() {
    return (this.rails - this.decimalPosition
        - ((this.checkPiece()) ? 1 : 0)
        - ((this.checkPiecePercent()) ? 1 : 0)
        - ((this.checkSubdeck()) ? 2 : 0) > 1 && this.sign);
},

digit : function(display, number, place) {
    if (number === "0")
        return "";
    var roman = "IVXLCDMvxlcdm";
    /*var combiningMacron = "&#772;";*/
    var oldRoman = ["I", "V", "X", "L", "(", "I)", "(I)",
        "I))", "((I))", "I)))", "(((I)))", "I))))", "|x|"];

    var len = roman.length - 1;
    if (place * 2 > len)
        return "-";
    var i = (this.ancientRoman) ? oldRoman[place * 2] :
        roman.charAt(place * 2);
    var temp = "";
    var d;
    for (d = 1; d <= (display.base >> 2) + 1; d++) {
        temp = temp + i;
        if (number === d)
            return temp;
    }
    if (place * 2 + 1 > len)
        return "-";
    var v = (this.ancientRoman) ? oldRoman[place * 2 + 1] :
        roman.charAt(place * 2 + 1);
    temp = v;
    for (d = (display.base >> 2) + 2;
            d <= (display.base >> 1) - 1; d++) {
        temp = i + temp;
        if (number === d)
            return temp;
    }
    temp = v;
    for (d = (display.base >> 1);
            d <= (display.base >> 1) + (display.base >> 2) + 1; d++) {
        if (number === d)
            return temp;
        temp = temp + i;
    }
    //if (place * 2 + 2 > len)
    //    return "-";
    var x = (this.ancientRoman) ? oldRoman[place * 2 + 2] :
        roman.charAt(place * 2 + 2);
    temp = x;
    for (d = (display.base >> 1) + (display.base >> 2) + 2;
            d <= display.base - 1; d++) {
        temp = i + temp;
        if (number === d)
            return temp;
    }
    return "";
},

setRomanNumeral : function(display, value, pieceValue, subdeckValue) {
    var val = Math.floor(value);

    if (val < 1 && pieceValue === 0 && subdeckValue === 0)
        return "";
    var valString = val.toString(display.base);
    var len = valString.length;
    var roman = "";
    for (var i = 0; i < len; i++) {
        var letter = this.digit(display, parseInt(valString.charAt(len - 1 - i),
            display.base), i);
        if (letter === "-")
            return ""; // Roman Numeral Overflow
        roman = letter + roman;
    }

    var pieces = this.deck[BOTTOM].pieces;
    if (this.deck[TOP].pieces !== 0)
       pieces *= this.deck[TOP].pieces;
    if (pieces > 0 && ROMANFRACTIONBASE % pieces === 0) {
        if (pieces !== ROMANFRACTIONBASE)
            subdeckValue = 0; // words not scalable
        if (this.latin && // position?
                (pieceValue !== 0 || subdeckValue !== 0))
            roman += " ";
        roman += romanFraction(pieceValue, pieces,
            subdeckValue, this.subbase, this.latin);
    }
    if (roman !== "" && display.value > 0.0)
        return "  [" + roman + "]";
    return "";
},

setArabicNumeral : function(display, bead, vel) {
    var digit = 1;
    display.value = 0;
    if (vel !== 0) {
        if (bead.rail === this.decimalPosition + 1
                + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
            if (bead.deck === 0) {
               var subdeck = this.getSubdeckFromPosition(bead.cell);
               this.subbeadPosition[subdeck] =
                   this.subbeadPosition[subdeck] - vel;
            }
        } else {
            this.beadPosition[bead.deck][bead.rail] =
                this.beadPosition[bead.deck][bead.rail] - vel;
        }
    }
    var unitPosition = this.decimalPosition
        + ((this.checkPiece()) ? 1 : 0)
        + ((this.checkPiecePercent()) ? 1 : 0)
        + ((this.checkSubdeck()) ? 2 : 0);
    for (var rail = 0; rail < this.rails; rail++) {
        for (var deck = 0; deck < this.decks; deck++) {
            var beads = this.deck[deck].beads;
            var factor = this.deck[deck].factor;
            if ((rail !== unitPosition - 1 || !this.checkPiece()) &&
                    (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                    - (this.checkSubdeck() ? 2 : 0)
                    - 1 - this.shiftPercent || !this.checkPiecePercent()) &&
                    (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                    - 1 || !this.checkSubdeck()) &&
                    (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                    - 2 || !this.checkSubdeck()) &&
                    (rail !== this.rails - 1 || !this.checkSign())) {
                if (this.deck[deck].orient) {
                    display.value += digit
                        * (beads - this.beadPosition[deck][rail]) * factor;
                } else {
                    display.value += digit
                        * this.beadPosition[deck][rail] * factor;
                }
            }
        }
        if ((rail !== unitPosition - 1 || !this.checkPiece()) &&
                (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                - (this.checkSubdeck() ? 2 : 0)
                - 1 - this.shiftPercent || !this.checkPiecePercent()) &&
                (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                - 1 || !this.checkSubdeck()) &&
                (rail !== unitPosition - (this.checkPiece() ? 1 : 0)
                - 2 || !this.checkSubdeck()) &&
                (rail !== this.rails - 1 || !this.checkSign())) {
            if (rail - unitPosition + 1 === this.shiftAnomaly
                    && this.anomaly !== 0) {
                digit *= (this.base - this.anomaly);
            } else if (rail - unitPosition + 1 === this.shiftAnomalySq
                    && this.anomalySq !== 0) {
                digit *= (this.base - this.anomalySq);
            } else {
                digit *= this.base;
            }
        }
    }
    for (var i = 0; i < this.decimalPosition; i++) {
        display.value = display.value / this.base; // not DIV
    }
    var pieceValue = 0;
    if (this.checkPiece()) {
        var pieceBase = (this.deck[TOP].pieces > 0) ?
            this.deck[TOP].pieces * this.deck[BOTTOM].pieces :
            this.deck[BOTTOM].pieces;
        for (var deck = 0; deck < this.decks; deck++) {
            var pieces = this.getPieces(deck);
            if (pieces > 0) {
                var rail = this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    + ((this.checkSubdeck()) ? 2 : 0);
                var factor = this.getPieceFactor(deck);

                if (this.deck[deck].orient) {
                    pieceValue +=
                        (pieces - this.beadPosition[deck][rail]) * factor;
                } else {
                    pieceValue += this.beadPosition[deck][rail] * factor;
                }
            }
        }
        display.value += pieceValue / pieceBase; // not DIV
    }
    var piecePercentValue = 0;
    if (this.checkPiecePercent()) {
        var piecePercentBase = (this.deck[TOP].piecePercents > 0) ?
            this.deck[TOP].piecePercents *
            this.deck[BOTTOM].piecePercents :
            this.deck[BOTTOM].piecePercents;
        for (var deck = 0; deck < this.decks; deck++) {
            var piecePercents = this.getPiecePercents(deck);
            if (piecePercents > 0) {
                var rail = this.decimalPosition - this.shiftPercent;
                var factor = this.getPiecePercentFactor(deck);

                if (this.deck[deck].orient) {
                    piecePercentValue += (piecePercents -
                        this.beadPosition[deck][rail]) * factor;
                } else {
                    piecePercentValue +=
                        this.beadPosition[deck][rail] * factor;
                }
            }
        }
        display.value += piecePercentValue /
            (piecePercentBase *
            Math.pow(this.base, this.shiftPercent)); // not DIV
    }
    var subdeckValue = 0;
    if (this.checkSubdeck()) {
        var pieceBase = 1;
        if (this.checkPiece()) {
            pieceBase = (this.deck[TOP].pieces > 0) ?
                this.deck[TOP].pieces * this.deck[BOTTOM].pieces :
                    this.deck[BOTTOM].pieces;
        }
        for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
            var subfactor = this.convertRomanFactor(subdeck);
            var subbeads = this.getSubdeckBeads(subdeck) + 1;

            if (this.deck[BOTTOM].orient) {
                subdeckValue +=
                    (subbeads - this.subbeadPosition[subdeck]) * subfactor;
            } else {
                subdeckValue += this.subbeadPosition[subdeck] * subfactor;
            }
        }
        display.value += subdeckValue / (this.subbase * pieceBase); // not DIV
    }
    if (this.checkSign()) {
        var deck = 0;
        var rail = this.rails - 1;
        if (this.deck[deck].orient) {
            if (1 - this.beadPosition[deck][rail] > 0)
                display.value = -display.value;
        } else {
            if (this.beadPosition[deck][rail] > 0)
                display.value = -display.value;
        }
    }
    var valueString = "";
    // Fixed to not get exponential notation, need to trim 0s
    unitPosition = this.decimalPosition;
    if (this.checkPiece())
        unitPosition = Math.max(unitPosition, 3);
    if (this.checkPiecePercent())
        unitPosition = Math.max(unitPosition, 3 + this.shiftPercent);
    if (this.checkSubdeck())
        unitPosition = Math.max(unitPosition, (this.checkPiece()) ? 5 : 3);
    if (display.base === 10) // get rid of exponential notation
       valueString = trimmer(display.value.toFixed(unitPosition));
    else
       valueString = trimmer(fixed(display.value.toString(display.base),
           unitPosition));
    if (this.romanNumerals) {
       valueString += this.setRomanNumeral(display, display.value,
           pieceValue, subdeckValue);
    }
    this.setSpan(valueString);
    //saveAbacusState();
},

/* This is setup for Roman abacus of 3 subdecks
 * deck === 0 => 1/12 * pieceFactor
 * deck === 1 => 1/4 * pieceFactor
 * deck === 2 => 1/2 * pieceFactor
 * For other subdecks its more whimsical. */
convertRomanFactor : function(subdeck) {
   var pieces = this.deck[BOTTOM].pieces;

   if (this.deck[TOP].pieces !== 0)
       pieces *= this.deck[TOP].pieces;
   if (pieces === 0) // default if no pieces
       pieces = SUBBASE_TWELFTHS;
   if (this.subbase === SUBBASE_EIGHTHS) {
       if (subdeck <= 1)
           return 1;
       return subdeck * Math.floor(pieces / (this.subdecks + 3));
   }
   if (subdeck === 0)
       return 1;
   return subdeck * Math.floor(pieces / (this.subdecks + 1));
},

// Pointer

rotateInput : function(pointerInput) {
    return new Coord(pointerInput.y, this.frameSize.y - 1 - pointerInput.x);
},

getPosition : function(pointer) {
    var deck;
    pointer.x -= this.abacusCanvasElement.offsetLeft;
    pointer.y -= this.abacusCanvasElement.offsetTop;
    if (this.vertical)
        pointer = this.rotateInput(pointer);
    if (pointer.x < this.frameThickness ||
            pointer.y < this.frameThickness ||
            pointer.x >= this.frameSize.x - this.frameThickness ||
            pointer.y >= this.frameSize.y - this.frameThickness) {
       return null;
    }
    pointer.x -= (this.frameThickness + (this.beadGapX >> 1))
        + ((this.medieval) ? this.beadWidth : 0);
    pointer.x = Math.min(pointer.x, (this.rails - 1)
        * (this.beadWidth + this.beadGapX))
        + ((this.medieval) ? this.beadWidth : 0);
    pointer.x = Math.max(0, pointer.x);
    if (pointer.y > this.middleBarY || this.deck[TOP].beads === 0) {
        if (pointer.y < this.middleBarY + this.middleBarThickness) {
            return new Bead(this.decks, this.rails - 1 - Math.floor
                (pointer.x / (this.beadWidth + this.beadGapX)), -1, -1);
        }
        deck = 0; // BOTTOM
        pointer.y = pointer.y - this.middleBarY - this.middleBarThickness;
        pointer.y = Math.min(pointer.y, (this.deck[BOTTOM].cells - 1)
            * this.beadHeight);
    } else {
        deck = 1; // TOP
        pointer.y -= this.frameThickness;
        pointer.y = Math.min(pointer.y, (this.deck[TOP].cells - 1)
            * this.beadHeight);
    }
    pointer.y = Math.max(0, pointer.y);
    if (this.medieval) {
        return new Bead(1 - (Math.floor
            (2 * pointer.x / (this.beadWidth + this.beadGapX))) % 2,
            this.rails - 1 - Math.floor
            (pointer.x / (this.beadWidth + this.beadGapX)),
            ((deck === 0) ? 1 : -1), -1);
    } else {
        return new Bead(deck,
            this.rails - 1 - Math.floor
            (pointer.x / (this.beadWidth + this.beadGapX)),
            Math.floor(pointer.y / this.beadHeight), -1);
    }
},

getCursorPosition : function(event) {
    /* returns Bead with .deck, .rail, .cell, .index properties */
    var pointer;

    if (event.pageX !== undefined && event.pageY !== undefined) {
        pointer = new Coord(event.pageX, event.pageY);
    } else {
        pointer = new Coord(event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft,
            event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop);
    }
    return this.getPosition(pointer);
},

getTouchPosition : function(event, side) {
    /* returns Bead with .deck, .rail, .cell, .index properties */
    var pointer;
    var touches = event.changedTouches;
    if (side !== 0) {
        side = touches.length - 1;
    }
    pointer = new Coord(touches[side].pageX, touches[side].pageY);
    return this.getPosition(pointer);
},

drawStep : function(dir, spaces) {
    var deckPosition = (this.pressedBead.deck === 0) ? 1 : 0;
    var rail = this.pressedBead.rail;
    var cell = this.pressedBead.cell;
    var absDir = (dir < 0) ? -dir : dir;
    var direction = (dir < 0) ? -1 : 1;
    var beads = absDir;
    var start = new Coord(((this.rails - 1 - rail)
        * (this.beadWidth + this.beadGapX)) - (this.beadWidth >> 1)
        + this.beadRadiusX + this.frameThickness + this.beadGapX - 1,
        (deckPosition * this.middleBarY) + (cell * this.beadHeight)
        + this.frameThickness + newPos(dir, delta *
        Math.floor(this.beadHeight * spaces / this.slices)));
    var eraseStart, eraseSize;
    eraseSize = new Coord(this.beadWidth + 1, absDir * this.beadHeight);
    if (this.vertical) {
        if (dir < -1) {
            eraseStart = new Coord(start.x, start.y + this.beadHeight);
        } else {
            eraseStart = new Coord(start.x,
                start.y + absDir * this.beadHeight);
        }
    } else {
        if (dir < -1) {
            eraseStart = new Coord(start.x,
                start.y - (absDir - 1) * this.beadHeight);
        } else {
            eraseStart = new Coord(start.x, start.y);
        }
    }
    this.eraseBead(eraseStart, eraseSize);
    for (var bead = 0; bead < spaces; bead++) {
        var curSpace = new Bead(this.pressedBead.deck, this.pressedBead.rail,
            this.pressedBead.cell + direction * bead, this.pressedBead.index);
        this.drawRail(curSpace);
    }
    for (var bead = 0; bead < beads; bead++) {
        var curBead = new Bead(this.pressedBead.deck, this.pressedBead.rail,
            this.pressedBead.cell, this.pressedBead.index + direction * bead);
        this.drawBeadMove(curBead, false,
            bead * direction * this.beadHeight + direction * (delta + 1)
            * Math.floor(this.beadHeight * spaces / this.slices));
    }
},

findSpaces : function(bead) {
    if (bead.rail === this.decimalPosition
            + ((this.checkPiecePercent()) ? 1 : 0)
            + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
        return this.getPieceSpaces(bead.deck);
    } else if (bead.rail === this.decimalPosition - this.shiftPercent
            && this.checkPiecePercent()) {
        return this.getPiecePercentSpaces(bead.deck);
    } else if (bead.rail === this.decimalPosition
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        return 0;
    } else if (bead.rail === this.decimalPosition + 1
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        if (bead.deck === 0) {
            return SUBDECK_SPACES;
        }
        return 0;
    } else if (bead.rail === this.rails - 1 && this.checkSign()) {
        if (bead.deck === 1)
            return 0;
        return this.deck[BOTTOM].cells - 1;
    }
    return this.deck[bead.deck].spaces;
},

findBeadsToMove : function(bead) {
    var position = this.beadPosition[bead.deck][bead.rail];
    var spaces = this.findSpaces(bead);
    if (spaces === 0)
        return 0;
    if (bead.rail === this.decimalPosition + 1
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        var subdeck = this.getSubdeckFromPosition(bead.cell);
        var subcell = this.getSubpositionSubdeck(bead.cell);
        position = this.subbeadPosition[subdeck];
        var up = subcell - position - spaces + 1;
        var down = position - subcell;
        if (subcell > position) {
            bead.index = subcell - spaces;
        } else {
            bead.index = subcell;
        }
//alert("bead " + subdeck + " " + subcell + " " + position + " " + up + " " + down);
        if (up > 0 && down > 0) {
            return 0; // should not happen
        } else if (up > 0) {
            return -up;
        } else if (down > 0) {
            return down;
        }
        return 0;
    }
//alert("bead " + bead.deck + " " + bead.rail + " " + bead.cell + " " + spaces);
    var up = bead.cell - position - spaces + 1;
    var down = position - bead.cell;
    if (bead.cell > position) {
        bead.index = bead.cell - spaces;
    } else {
        bead.index = bead.cell;
    }
    if (up > 0 && down > 0) {
        return 0; // should not happen
    } else if (up > 0) {
        return -up;
    } else if (down > 0) {
        return down;
    }
    return 0;
},

placeCounter : function(bead) {
    var beads = this.deck[bead.deck].beads;
    if (bead.rail === this.decimalPosition
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkPiece()) {
        beads = this.getPieces(bead.deck);
        if (bead.deck === 1 && this.deck[TOP].pieces === 0)
            return;
    } else if (bead.rail === this.decimalPosition - this.shiftPercent
            && this.checkPiecePercent()) {
        beads = (bead.deck === 0) ? 1 : 0;
    }
    var potential = this.beadPosition[bead.deck][bead.rail] + bead.cell;
    if (potential <= beads && potential >= 0) {
        this.beadPosition[bead.deck][bead.rail] = potential;
        if (this.sound)
            bump.play();
    }
    this.setArabicNumeral(this.display, bead, 0);
},

trimForAbacus : function(string) {
    // fix for legal numbers
    var dots = 0;
    var newString = "";
    for (var i = 0; i < string.length; i++) {
        var charCode = string.charAt(i).charCodeAt();
        if (charCode >= '0'.charCodeAt() &&
                charCode <= '9'.charCodeAt() &&
                charCode < '0'.charCodeAt() + this.display.base)
            newString += string.charAt(i);
        else if (charCode >= 'a'.charCodeAt() &&
                charCode <= 'z'.charCodeAt() &&
                charCode < 'a'.charCodeAt() + this.display.base - 10)
            newString += string.charAt(i);
        else if (charCode >= 'A'.charCodeAt() &&
                charCode <= 'Z'.charCodeAt() &&
                charCode < 'A'.charCodeAt() + this.display.base - 10)
            newString += string.charAt(i).toLowerCase();
        else if (string.charAt(i) === '.' && dots === 0) {
            dots++;
            newString += string.charAt(i);
        }
    }
    string = newString;

    // fix for empty
    if (string === "") {
        string = "0";
    }
    // fix for leading "."
    if (string.charAt(0) === ".") {
        string = "0" + string;
    }
    // fix to fit in abacus itself, on left and right
    var parts = string.split(".", 2);
    this.beadPosition = new Array(2);
    var limit = this.rails - this.decimalPosition
        - ((this.checkPiece()) ? 1 : 0)
        - ((this.checkPiecePercent()) ? 1 : 0)
        - ((this.checkSubdeck()) ? 2 : 0);
    var length = parts[0].length;
    if (length > limit) {
        parts[0] = parts[0].substring(length - limit, length);
    }
    if (parts.length < 2) {
        string = parts[0];
    } else {
        limit = this.decimalPosition;
        length = parts[1].length;
        if (length > limit) {
            parts[1] = parts[1].substring(0, limit);
        }
        string = parts[0] + "." + parts[1];
    }
    // fix for leading "0"'s
    for (var i = 0; i < string.length; i++) {
        if (string.charAt(i) === '0' && i !== string.length - 1)
            continue;
        if ((string.charAt(i) !== '.' && i > 0) || i > 1) {
            string = string.substring(i, string.length);
        }
        break;
    }
    // fix for trailing "0"'s
    if (string.indexOf(".") !== -1) {
        for (var i = string.length - 1; i >= 0; i--) {
            if (string.charAt(i) === '0')
                continue;
            if (i < string.length - 1) {
                string = string.substring(0, i + 1);
            }
            break;
        }
    }
    // fix for trailing "."
    if (string.charAt(string.length - 1) === ".") {
        string = string.substring(0, string.length - 1);
    }
    return string;
},

letterToDigit : function(letter) {
    var charCode = letter.charCodeAt();
    if (charCode >= '0'.charCodeAt() && charCode <= '9'.charCodeAt()) {
         return charCode - '0'.charCodeAt();
    }
    if (charCode >= 'a'.charCodeAt() && charCode <= 'z'.charCodeAt()) {
        return charCode - 'a'.charCodeAt() + 10;
    }
    if (charCode >= 'A'.charCodeAt() && charCode <= 'Z'.charCodeAt()) {
        return charCode - 'A'.charCodeAt() + 10;
    }
    return 0;
},

setCounter : function(string) {
    if (this.base !== this.display.base) {
        alert("Currently base (" + this.base + ") must equal the display base ("
            + this.display.base + ") for beads to be updated.");
        return;
    }
    if (this.anomaly !== 0) {
        alert("Currently anomalies are not handled yet.");
        return;
    }
    var value = 0;
    var op = "+";
    var nextOp = "";
    while ((nextOp = this.nextOperation(string)) !== "") {
        var parts = string.split(nextOp, 2);
        value = this.show(parts[0], value, op);
        // parts[1] is truncated in JavaScript but not if Java
        string = string.substring(string.indexOf(nextOp) + 1);
        op = nextOp;
    }
    this.show(string, value, op);
},

nextOperation : function(string) {
    var indexPlus = string.indexOf("+");
    var indexMinus = string.indexOf("-");
    var indexMult = string.indexOf("*");
    var indexDivide = string.indexOf("/");
    if (indexPlus === -1 && indexMinus === -1 &&
            indexMult === -1 && indexDivide === -1) {
        return "";
    }
    var currentOp = "+";
    var indexOp = 0;

    if (indexPlus >= 0) {
        indexOp = indexPlus;
    }
    if (indexMinus >= 0) {
        currentOp = "-";
        indexOp = indexMinus;
    }
    if (indexMult >= 0) {
        currentOp = "*";
        indexOp = indexMult;
    }
    if (indexDivide >= 0) {
        currentOp = "/";
        indexOp = indexDivide;
    }
    if (indexMult >= 0 && indexMult < indexOp) {
        currentOp = "*";
        indexOp = indexMult;
    }
    if (indexMinus >= 0 && indexMinus < indexOp) {
        currentOp = "-";
        indexOp = indexMinus;
    }
    if (indexPlus >= 0 && indexPlus < indexOp) {
        currentOp = "+";
    }
    return currentOp;
},

show : function(string, value, operation) {
    string = this.trimForAbacus(string);
    if (this.display.base === 10) {
        switch (operation) {
        case "+":
            value += parseFloat(string);
            break;
        case "-":
            value -= parseFloat(string);
            if (value < 0) // no negatives
                value = 0;
            break;
        // no precedence yet
        case "*":
            value *= parseFloat(string);
            break;
        case "/":
            var rt = parseFloat(string);
            if (rt !== 0)
                value /= rt;
            else
                value = 0; // no divide by 0, actually infinite
            break;
        }
        string = this.trimForAbacus(value.toString());
    }
    this.clearAbacus(this.display);
    this.setAbacus(this.display, string);
    return value;
},

onKeyPress : function(event) {
    var valueString = this.getSpan();
    if (event.keyCode === 13) { // enter
        event.preventDefault();
        this.setSpan(valueString);
        this.setCounter(valueString);
    }
},

onTouchStart : function(event) {
    event.preventDefault();
    this.pressedBead = this.getTouchPosition(event, 0);
    this.pick();
},

onMouseDown : function(event) {
    event.preventDefault();
    this.pressedBead = this.getCursorPosition(event);
    this.pick();
},

onTouchStop : function(event) {
    event.preventDefault();
    if (this.pressedBead === null) {
        return;
    }
    var bead = this.getTouchPosition(event, 1);
    this.place(bead);
},

onMouseUp : function(event) {
    event.preventDefault();
    if (this.pressedBead === null) {
        return;
    }
    var bead = this.getCursorPosition(event);
    this.place(bead);
},

onMouseOut : function(event) {
    if (delta === 0) {
        this.drawAbacus();
        this.pressedBead = null;
    }
},

// for initial image loading
onLoad : function(event) {
    this.drawAbacus();
    this.pressedBead = null;
},

pick : function() {
    if (delta !== 0 || this.pressedBead === null)
       return;
    if (this.pressedBead.deck === this.decks) {
        this.drawDecimalPointer(this.pressedBead.rail);
        return;
    }
    if (this.medieval) {
        this.drawRailPointer(this.pressedBead);
        return;
    }
    var move = this.findBeadsToMove(this.pressedBead);
    if (move === 0) {
        this.pressedBead = null;
    } else {
        this.drawBead(this.pressedBead, true);
    }
},

place : function(bead) {
    if (delta !== 0)
       return;
    if (bead === null) {
        if (this.pressedBead === null)
            return;
        this.drawAbacus();
        this.pressedBead = null;
        return;
    }
    if (bead.deck === this.decks) {
        if (bead.deck !== this.pressedBead.deck) {
            this.drawAbacus();
            return;
        }
        if (this.pressedBead.rail !== bead.rail) {
            bead.rail =
                this.decimalPosition + bead.rail - this.pressedBead.rail
                + ((this.checkPiece()) ? 1 : 0)
                + ((this.checkPiecePercent()) ? 1 : 0)
                + ((this.checkSubdeck()) ? 2 : 0);
            if (bead.rail < 0)
                bead.rail = 0;
            else if (bead.rail >= this.rails)
                 bead.rail = this.rails - 1;
        }
        this.shiftRails(this.decimalPosition, bead.rail
            - ((this.checkPiece()) ? 1 : 0)
            - ((this.checkPiecePercent()) ? 1 : 0)
            - ((this.checkSubdeck()) ? 2 : 0));
        this.setArabicNumeral(this.display, bead, 0);
        this.drawAbacus();
        return;
    }
    if (bead.deck !== this.pressedBead.deck ||
            bead.rail !== this.pressedBead.rail) {
        this.drawAbacus();
        return;
    }
    if (this.medieval) {
        this.placeCounter(bead);
        this.drawAbacus();
    } else {
        //alert("place: " + bead.deck + ", " +
        //    bead.rail + ", " + bead.cell);
        var move = this.findBeadsToMove(this.pressedBead);
        if (move === 0) {
            this.pressedBead = null;
            this.drawAbacus();
        } else {
            this.setArabicNumeral(this.display, this.pressedBead, move);
            var spaces = this.findSpaces(this.pressedBead);
            if (animation) {
                timer = setInterval(drawMovement, 24, this, move, spaces);
            } else {
                this.drawAbacus();
                if (this.sound) {
                     bump.play();
                }
                this.pressedBead = null;
                delta = 0;
            }
        }
    }
},

shiftRails : function(oldRail, newRail) {
    if (oldRail === newRail ||
            this.checkPiece() && newRail === -1 ||
            this.checkPiecePercent() && newRail < this.shiftPercent ||
            this.checkSubdeck() && newRail < 0 || // FIXME
            this.checkSign() && newRail === this.rails - 1
                - ((this.checkPiece()) ? 1 : 0)
                - ((this.checkPiecePercent()) ? 1 : 0)
                - ((this.checkSubdeck()) ? 2 : 0)) {
        return;
    }
    if (newRail > oldRail) {
        if (this.checkPiece() || this.checkSubdeck()) {
            var jump = (this.checkPiece() ? 1 : 0)
                + (this.checkSubdeck() ? 2 : 0);
            var offset = ((this.checkPiecePercent()) ? 1 : 0);
            for (var deck = 0; deck < this.decks; deck++) {
                for (var rail = oldRail; rail < newRail; rail++) {
                    this.beadPosition[deck][rail + offset] =
                        this.beadPosition[deck][rail + offset + jump];
                }
            }
        }
        if (this.checkPiecePercent()) {
            for (var deck = 0; deck < this.decks; deck++) {
                for (var rail = oldRail; rail < newRail; rail++) {
                    this.beadPosition[deck][rail - this.shiftPercent] =
                        this.beadPosition[deck][rail
                        - this.shiftPercent + 1];
                }
            }
        }
    } else if (newRail < oldRail) {
        if (this.checkPiecePercent()) {
            for (var deck = 0; deck < this.decks; deck++) {
                for (var rail = oldRail; rail >= newRail; rail--) {
                    this.beadPosition[deck][rail - this.shiftPercent] =
                        this.beadPosition[deck][rail
                        - this.shiftPercent - 1];
                }
            }
        }
        if (this.checkPiece() || this.checkSubdeck()) {
            var jump = (this.checkPiece() ? 1 : 0)
                + (this.checkSubdeck() ? 2 : 0);
            var offset = ((this.checkPiecePercent()) ? 1 : 0);
            for (var deck = 0; deck < this.decks; deck++) {
                for (var rail = oldRail + jump - 1; rail >= newRail + jump - 1;
                        rail--) {
                    this.beadPosition[deck][rail + offset] =
                        this.beadPosition[deck][rail + offset - jump];
                }
            }
        }
    }
    this.decimalPosition = newRail;
    // clear these out... toss up as to whats best here
    if (this.checkPiece()) {
        var rail = this.decimalPosition
            + ((this.checkPiecePercent()) ? 1 : 0)
            + ((this.checkSubdeck()) ? 2 : 0);
        for (var deck = 0; deck < this.decks; deck++) {
            if (this.deck[deck].orient) {
                this.beadPosition[deck][rail] = this.getPieces(deck);
            } else {
                this.beadPosition[deck][rail] = 0;
            }
        }
    }
    if (this.checkPiecePercent()) {
        var rail = this.decimalPosition - this.shiftPercent;
        for (var deck = 0; deck < this.decks; deck++) {
            if (this.deck[deck].orient) {
                this.beadPosition[deck][rail] = this.getPiecePercents(deck);
            } else {
                this.beadPosition[deck][rail] = 0;
            }
        }
    }
    if (this.checkSubdeck()) {
        for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
            if (this.deck[BOTTOM].orient) {
                this.subbeadPosition[subdeck] = this.getSubdeckBeads(subdeck);
            } else {
                this.subbeadPosition[subdeck] = 0;
            }
        }
    }
    if (this.sound) {
        // not actually possible to do on real abacus, so using different sound
        if (this.checkPiece() || this.checkPiecePercent()
                || this.checkSubdeck())
            drip.play();
        else
            move.play();
    }
},

// View

rotateOutput : function(screenOutput) {
    return new Coord(this.frameSize.y - 1 - screenOutput.y, screenOutput.x);
},

getRailPositionX : function(rail) {
    return (this.beadWidth + this.beadGapX) * (this.rails - 1 - rail)
        + this.frameThickness + this.beadGapX
        + ((this.medieval) ? this.beadWidth : this.beadRadiusX);
},

getSubdeckPositionY : function(subdeckOffset) {
    return this.middleBarY + this.middleBarThickness
        + subdeckOffset * this.beadHeight;
},

/*
getDeckPositionY : function(deck) {
    if (deck === 0)
        return this.middleBarY + this.middleBarThickness;
    else if (deck === 1)
        return this.frameThickness;
    return 0;
},

getCellPositionY : function(deck, cell) {
    return getDeckPositionY(deck) + cell * this.beadHeight;
},
*/

drawFramePart : function(coord) {
    if (this.vertical) {
        for (var i = 0; i < coord.length; i++) {
            coord[i] = this.rotateOutput(coord[i]);
        }
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord[0].x, coord[0].y);
    for (var i = 1; i < coord.length; i++) {
        this.drawingContext.lineTo(coord[i].x, coord[i].y);
    }
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.frameColor;
    this.drawingContext.fill();
},

drawFrame : function() {
    /* no Miter
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(0, 0);
    this.drawingContext.lineTo(this.frameSize.x, 0);
    this.drawingContext.lineTo(this.frameSize.x, this.frameSize.y);
    this.drawingContext.lineTo(0, this.frameSize.y);
    this.drawingContext.lineTo(0, this.frameThickness);
    this.drawingContext.lineTo(this.frameThickness, this.frameThickness);
    this.drawingContext.lineTo(this.frameThickness,
        this.frameSize.y - this.frameThickness);
    this.drawingContext.lineTo(this.frameSize.x - this.frameThickness,
        this.frameSize.y - this.frameThickness);
    this.drawingContext.lineTo(this.frameSize.x - this.frameThickness,
        this.frameThickness);
    this.drawingContext.lineTo(0.0, this.frameThickness);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.frameColor;
    this.drawingContext.fill(); */
    // Miter joint, why not  :)
    var coord = new Array(4);
    coord[0] = new Coord(0, 0);
    coord[1] = new Coord(this.frameSize.x, 0);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.frameThickness);
    coord[3] = new Coord(this.frameThickness, this.frameThickness);
    this.drawFramePart(coord);
    coord[0] = new Coord(this.frameSize.x, this.frameSize.y);
    coord[1] = new Coord(0, this.frameSize.y);
    coord[2] = new Coord(this.frameThickness,
        this.frameSize.y - this.frameThickness);
    coord[3] = new Coord(this.frameSize.x - this.frameThickness,
        this.frameSize.y - this.frameThickness);
    this.drawFramePart(coord);
    if (this.slot || this.medieval) {
        coord[0] = new Coord(0, 0);
        coord[1] = new Coord(0, this.frameSize.y);
        coord[2] = new Coord(this.frameThickness,
            this.frameSize.y - this.frameThickness);
        coord[3] = new Coord(this.frameThickness, this.frameThickness);
        this.drawFramePart(coord);
        coord[0] = new Coord(this.frameSize.x, this.frameSize.y);
        coord[1] = new Coord(this.frameSize.x, 0);
        coord[2] = new Coord(this.frameSize.x - this.frameThickness,
            this.frameThickness);
        coord[3] = new Coord(this.frameSize.x - this.frameThickness,
            this.frameSize.y - this.frameThickness);
        this.drawFramePart(coord);
        return;
    }
    coord[0] = new Coord(0, 0);
    coord[1] = new Coord(0, this.middleBarY + this.frameThickness);
    coord[2] = new Coord(this.frameThickness,
        this.middleBarY);
    coord[3] = new Coord(this.frameThickness, this.frameThickness);
    this.drawFramePart(coord);
    coord[0] = new Coord(0, this.middleBarY);
    coord[1] = new Coord(0, this.frameSize.y);
    coord[2] = new Coord(this.frameThickness,
        this.frameSize.y - this.frameThickness);
    coord[3] = new Coord(this.frameThickness,
        this.middleBarY + this.frameThickness);
    this.drawFramePart(coord);
    coord[0] = new Coord(this.frameSize.x, this.frameSize.y);
    coord[1] = new Coord(this.frameSize.x, this.middleBarY);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY + this.frameThickness);
    coord[3] = new Coord(this.frameSize.x - this.frameThickness,
        this.frameSize.y - this.frameThickness);
    this.drawFramePart(coord);
    coord[0] = new Coord(this.frameSize.x, 0);
    coord[1] = new Coord(this.frameSize.x, this.middleBarY + this.frameThickness);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY);
    coord[3] = new Coord(this.frameSize.x - this.frameThickness,
        this.frameThickness);
    this.drawFramePart(coord);
    /* no Miter
    // Draw middle bar
    coord[0] = new Coord(this.frameThickness, this.middleBarY);
    coord[1] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY + this.middleBarThickness);
    coord[3] = new Coord(this.frameThickness,
        this.middleBarY + this.middleBarThickness);
    this.drawFramePart(coord);*/
    var frameThickness2 = this.frameThickness >> 1;
    coord[0] = new Coord(frameThickness2,
        this.middleBarY + frameThickness2);
    coord[1] = new Coord(this.frameThickness,
        this.middleBarY);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY);
    coord[3] = new Coord(this.frameSize.x - frameThickness2,
        this.middleBarY + frameThickness2);
    this.drawFramePart(coord);
    coord[0] = new Coord(frameThickness2,
        this.middleBarY + frameThickness2);
    coord[1] = new Coord(this.frameSize.x - frameThickness2,
        this.middleBarY + frameThickness2);
    coord[2] = new Coord(this.frameSize.x - this.frameThickness,
        this.middleBarY + this.frameThickness);
    coord[3] = new Coord(this.frameThickness,
        this.middleBarY + this.frameThickness);
    this.drawFramePart(coord);
},

drawDecimalPointer : function(rail) {
    var coord0 = new Coord(this.getRailPositionX(rail) - 2,
       this.middleBarY + (this.middleBarThickness >> 1) - 2);
    var coord1 = new Coord(coord0.x + 4,
        this.middleBarY + (this.middleBarThickness >> 1) + 2);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][2];
    this.drawingContext.fill();
},

drawRailPointer : function(p) {
    var coord0 = new Coord(((this.rails - 1 - p.rail)
        * (this.beadWidth + this.beadGapX))
        - this.beadWidth * p.deck - 2
        + this.beadWidth + this.frameThickness + this.beadGapX,
        this.middleBarThickness + this.middleBarY - 2
        + ((this.deck[BOTTOM].cells * this.beadHeight) >> 1));
    var coord1 = new Coord(coord0.x + 4,
        coord0.y + 4);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][2];
    this.drawingContext.fill();
},

drawDecimalSeparator : function(rail) {
    var y = this.middleBarY;
    if (this.medieval) {
        if (this.decimalPosition < 1)
            return;
        // This is a made up symbol to allow showing of decimals
        var x = this.getRailPositionX(rail);
        var offset = 1;
        var coord0 = new Coord(x + offset, y);
        var coord1 = new Coord(x + 5 + offset, y + (this.middleBarThickness >> 1));
        var coord2 = new Coord(x + 3 + offset, y + (this.middleBarThickness >> 1));
        var coord3 = new Coord(x + offset, y + 2);
        var coord4 = new Coord(x + offset, y + this.middleBarThickness);
        var coord5 = new Coord(x + offset, y + this.middleBarThickness - 2);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord1, coord2, coord5);
        var offset = 1 - this.railThickness % 2;
        coord0 = new Coord(x - offset, y);
        coord1 = new Coord(x - 5 - offset, y + (this.middleBarThickness >> 1));
        coord2 = new Coord(x - 3 - offset, y + (this.middleBarThickness >> 1));
        coord3 = new Coord(x - offset, y + 2);
        coord4 = new Coord(x - offset, y + this.middleBarThickness);
        coord5 = new Coord(x - offset, y + this.middleBarThickness - 2);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord1, coord2, coord5);
        return;
    }
    var coord0 = new Coord(this.getRailPositionX(rail)
        - (this.railThickness >> 1) - 3, y);
    var coord1 = new Coord(coord0.x + this.railThickness + 5,
        y + this.middleBarThickness);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][1];
    this.drawingContext.fill();
},

drawGroupSeparator : function(rail) {
    var y = this.middleBarY;
    if (this.medieval) {
        var x = this.getRailPositionX(rail) + 0.5;
        var offset = 1 - this.railThickness % 2;
        var coord0 = new Coord(x - 5 - offset, y + 2);
        var coord1 = new Coord(x - 3 - offset, y);
        var coord2 = new Coord(x + 5, y + this.middleBarThickness - 2);
        var coord3 = new Coord(x + 3, y + this.middleBarThickness);
        var coord4 = new Coord(x - 5 - offset, y + this.middleBarThickness - 2);
        var coord5 = new Coord(x - 3 - offset, y + this.middleBarThickness);
        var coord6 = new Coord(x + 5, y + 2);
        var coord7 = new Coord(x + 3, y);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        return;
    }
    var coord0 = new Coord(this.getRailPositionX(rail)
        - (this.railThickness >> 1), y);
    var coord1 = new Coord(coord0.x + this.railThickness,
        y + this.middleBarThickness);
    var coord2 = new Coord(coord0.x - 1, coord0.y + 2);
    var coord3 = new Coord(coord1.x + 1, coord1.y - 2);
    var coord4 = new Coord(coord2.x - 1, coord2.y + 2);
    var coord5 = new Coord(coord3.x + 1, coord3.y - 2);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
        coord2 = this.rotateOutput(coord2);
        coord3 = this.rotateOutput(coord3);
        coord4 = this.rotateOutput(coord4);
        coord5 = this.rotateOutput(coord5);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][1];
    this.drawingContext.fill();
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord2.x, coord2.y);
    this.drawingContext.lineTo(coord3.x, coord2.y);
    this.drawingContext.lineTo(coord3.x, coord3.y);
    this.drawingContext.lineTo(coord2.x, coord3.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][1];
    this.drawingContext.fill();
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord4.x, coord4.y);
    this.drawingContext.lineTo(coord5.x, coord4.y);
    this.drawingContext.lineTo(coord5.x, coord5.y);
    this.drawingContext.lineTo(coord4.x, coord5.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][1];
    this.drawingContext.fill();
},

drawAllGroupSeparators : function(decimalPosition) {
    for (var separator = 1; separator <= Math.floor((this.rails
            - ((this.checkSign()) ? 1 : 0)
            - decimalPosition - ((this.checkPiece()) ? 1 : 0)
            - ((this.checkPiecePercent()) ? 1 : 0)
            - ((this.checkSubdeck()) ? 2 : 0)
            - 1) / this.groupSize); separator++)
        this.drawGroupSeparator(decimalPosition
            + ((this.checkPiece()) ? 1 : 0)
            + ((this.checkPiecePercent()) ? 1 : 0)
            + ((this.checkSubdeck()) ? 2 : 0)
            + this.groupSize * separator);
},

fillQuad : function(coord0, coord1, coord2, coord3) {
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
        coord2 = this.rotateOutput(coord2);
        coord3 = this.rotateOutput(coord3);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord2.x, coord2.y);
    this.drawingContext.lineTo(coord3.x, coord3.y);
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[0][1];
    this.drawingContext.fill();
},

/*
// does not seem to work right
drawLine : function(coord0, coord1) {
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.strokeStyle = this.beadColor[0][1];
    this.drawingContext.stroke();
},
*/

drawRomanI : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 1, y);
    var coord1 = new Coord(x + 1, y);
    var coord2 = new Coord(x + 1, y + this.middleBarThickness);
    var coord3 = new Coord(x - 1, y + this.middleBarThickness);
    this.fillQuad(coord0, coord1, coord2, coord3);
},

drawRomanX : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 4, y);
    var coord1 = new Coord(x - 2, y);
    var coord2 = new Coord(x + 4, y + this.middleBarThickness);
    var coord3 = new Coord(x + 2, y + this.middleBarThickness);
    var coord4 = new Coord(x - 4, y + this.middleBarThickness);
    var coord5 = new Coord(x - 2, y + this.middleBarThickness);
    var coord6 = new Coord(x + 4, y);
    var coord7 = new Coord(x + 2, y);
    this.fillQuad(coord0, coord1, coord2, coord3);
    this.fillQuad(coord4, coord5, coord6, coord7);
},

drawRomanC : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 4, y + 1);
    var coord1 = new Coord(x - 2, y + 1);
    var coord2 = new Coord(x - 2, y + this.middleBarThickness - 1);
    var coord3 = new Coord(x - 4, y + this.middleBarThickness - 1);
    var coord4 = new Coord(x - 3, y);
    var coord5 = new Coord(x - 3, y + 2);
    var coord6 = new Coord(x + 3, y + 2);
    var coord7 = new Coord(x + 3, y);
    var coord8 = new Coord(x - 3, y + this.middleBarThickness);
    var coord9 = new Coord(x - 3, y + this.middleBarThickness - 2);
    var coord10 = new Coord(x + 3, y + this.middleBarThickness - 2);
    var coord11 = new Coord(x + 3, y + this.middleBarThickness);
    var coord12 = new Coord(x + 2, y + 1);
    var coord13 = new Coord(x + 4, y + 1);
    var coord14 = new Coord(x + 4, y + 3);
    var coord15 = new Coord(x + 2, y + 3);
    var coord16 = new Coord(x + 2, y + this.middleBarThickness - 1);
    var coord17 = new Coord(x + 4, y + this.middleBarThickness - 1);
    var coord18 = new Coord(x + 4, y + this.middleBarThickness - 3);
    var coord19 = new Coord(x + 2, y + this.middleBarThickness - 3);
    this.fillQuad(coord0, coord1, coord2, coord3);
    this.fillQuad(coord4, coord5, coord6, coord7);
    this.fillQuad(coord8, coord9, coord10, coord11);
    this.fillQuad(coord12, coord13, coord14, coord15);
    this.fillQuad(coord16, coord17, coord18, coord19);
},

drawRomanM : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    if (this.modernRoman) {
        var coord0 = new Coord(x - 4, y);
        var coord1 = new Coord(x - 2, y);
        var coord2 = new Coord(x, y + this.middleBarThickness - 5);
        var coord3 = new Coord(x, y + this.middleBarThickness - 4);
        var coord4 = new Coord(x + 4, y);
        var coord5 = new Coord(x + 2, y);
        var coord6 = new Coord(x, y + this.middleBarThickness - 5);
        var coord7 = new Coord(x, y + this.middleBarThickness - 4);
        var coord8 = new Coord(x - 4, y);
        var coord9 = new Coord(x - 2, y);
        var coord10 = new Coord(x - 2, y + this.middleBarThickness);
        var coord11 = new Coord(x - 4, y + this.middleBarThickness);
        var coord12 = new Coord(x + 4, y);
        var coord13 = new Coord(x + 2, y);
        var coord14 = new Coord(x + 2, y + this.middleBarThickness);
        var coord15 = new Coord(x + 4, y + this.middleBarThickness);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
    } else {
        var coord0 = new Coord(x - 1, y);
        var coord1 = new Coord(x + 1, y);
        var coord2 = new Coord(x + 1, y + this.middleBarThickness);
        var coord3 = new Coord(x - 1, y + this.middleBarThickness);
        var coord4 = new Coord(x - 5, y + 3);
        var coord5 = new Coord(x - 4, y + 3);
        var coord6 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord7 = new Coord(x - 5, y + this.middleBarThickness - 1);
        var coord8 = new Coord(x + 5, y + 3);
        var coord9 = new Coord(x + 4, y + 3);
        var coord10 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord11 = new Coord(x + 5, y + this.middleBarThickness - 1);
        var coord12 = new Coord(x - 4, y + 2);
        var coord13 = new Coord(x - 2, y + 2);
        var coord14 = new Coord(x - 2, y + 3);
        var coord15 = new Coord(x - 4, y + 3);
        var coord16 = new Coord(x - 4, y + this.middleBarThickness);
        var coord17 = new Coord(x - 2, y + this.middleBarThickness);
        var coord18 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord19 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord20 = new Coord(x + 4, y + 2);
        var coord21 = new Coord(x + 2, y + 2);
        var coord22 = new Coord(x + 2, y + 3);
        var coord23 = new Coord(x + 4, y + 3);
        var coord24 = new Coord(x + 4, y + this.middleBarThickness);
        var coord25 = new Coord(x + 2, y + this.middleBarThickness);
        var coord26 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord27 = new Coord(x + 4, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
        this.fillQuad(coord20, coord21, coord22, coord23);
        this.fillQuad(coord24, coord25, coord26, coord27);
    }
},

drawRomanx : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    if (this.modernRoman) {
        var coord0 = new Coord(x - 4, y + 2);
        var coord1 = new Coord(x - 2, y + 2);
        var coord2 = new Coord(x + 4, y + this.middleBarThickness);
        var coord3 = new Coord(x + 2, y + this.middleBarThickness);
        var coord4 = new Coord(x - 4, y + this.middleBarThickness);
        var coord5 = new Coord(x - 2, y + this.middleBarThickness);
        var coord6 = new Coord(x + 4, y + 2);
        var coord7 = new Coord(x + 2, y + 2);
        var coord8 = new Coord(x - 4, y);
        var coord9 = new Coord(x - 4, y + 1);
        var coord10 = new Coord(x + 4, y + 1);
        var coord11 = new Coord(x + 4, y);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
    } else {
        var coord0 = new Coord(x - 1, y);
        var coord1 = new Coord(x + 1, y);
        var coord2 = new Coord(x + 1, y + this.middleBarThickness);
        var coord3 = new Coord(x - 1, y + this.middleBarThickness);
        var coord4 = new Coord(x - 4, y + 4);
        var coord5 = new Coord(x - 3, y + 4);
        var coord6 = new Coord(x - 3, y + this.middleBarThickness - 1);
        var coord7 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord8 = new Coord(x + 4, y + 4);
        var coord9 = new Coord(x + 3, y + 4);
        var coord10 = new Coord(x + 3, y + this.middleBarThickness - 1);
        var coord11 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord12 = new Coord(x - 3, y + 3);
        var coord13 = new Coord(x - 2, y + 3);
        var coord14 = new Coord(x - 2, y + 4);
        var coord15 = new Coord(x - 3, y + 4);
        var coord16 = new Coord(x - 3, y + this.middleBarThickness);
        var coord17 = new Coord(x - 2, y + this.middleBarThickness);
        var coord18 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord19 = new Coord(x - 3, y + this.middleBarThickness - 1);
        var coord20 = new Coord(x + 3, y + 3);
        var coord21 = new Coord(x + 2, y + 3);
        var coord22 = new Coord(x + 2, y + 4);
        var coord23 = new Coord(x + 3, y + 4);
        var coord24 = new Coord(x + 3, y + this.middleBarThickness);
        var coord25 = new Coord(x + 2, y + this.middleBarThickness);
        var coord26 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord27 = new Coord(x + 3, y + this.middleBarThickness - 1);
        var coord28 = new Coord(x - 6, y + 2);
        var coord29 = new Coord(x - 5, y + 2);
        var coord30 = new Coord(x - 5, y + this.middleBarThickness - 1);
        var coord31 = new Coord(x - 6, y + this.middleBarThickness - 1);
        var coord32 = new Coord(x + 6, y + 2);
        var coord33 = new Coord(x + 5, y + 2);
        var coord34 = new Coord(x + 5, y + this.middleBarThickness - 1);
        var coord35 = new Coord(x + 6, y + this.middleBarThickness - 1);
        var coord36 = new Coord(x - 5, y + 1);
        var coord37 = new Coord(x - 3, y + 1);
        var coord38 = new Coord(x - 3, y + 2);
        var coord39 = new Coord(x - 5, y + 2);
        var coord40 = new Coord(x - 5, y + this.middleBarThickness);
        var coord41 = new Coord(x - 4, y + this.middleBarThickness);
        var coord42 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord43 = new Coord(x - 5, y + this.middleBarThickness - 1);
        var coord44 = new Coord(x + 5, y + 1);
        var coord45 = new Coord(x + 3, y + 1);
        var coord46 = new Coord(x + 3, y + 2);
        var coord47 = new Coord(x + 5, y + 2);
        var coord48 = new Coord(x + 5, y + this.middleBarThickness);
        var coord49 = new Coord(x + 4, y + this.middleBarThickness);
        var coord50 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord51 = new Coord(x + 5, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
        this.fillQuad(coord20, coord21, coord22, coord23);
        this.fillQuad(coord24, coord25, coord26, coord27);
        this.fillQuad(coord28, coord29, coord30, coord31);
        this.fillQuad(coord32, coord33, coord34, coord35);
        this.fillQuad(coord36, coord37, coord38, coord39);
        this.fillQuad(coord40, coord41, coord42, coord43);
        this.fillQuad(coord44, coord45, coord46, coord47);
        this.fillQuad(coord48, coord49, coord50, coord51);
    }
},

drawRomanc : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    if (this.modernRoman) {
        var coord0 = new Coord(x - 4, y + 3);
        var coord1 = new Coord(x - 2, y + 3);
        var coord2 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord3 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord4 = new Coord(x - 3, y + 2);
        var coord5 = new Coord(x - 3, y + 4);
        var coord6 = new Coord(x + 3, y + 4);
        var coord7 = new Coord(x + 3, y + 2);
        var coord8 = new Coord(x - 3, y + this.middleBarThickness);
        var coord9 = new Coord(x - 3, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x + 3, y + this.middleBarThickness);
        var coord12 = new Coord(x + 2, y + 3);
        var coord13 = new Coord(x + 4, y + 3);
        var coord14 = new Coord(x + 4, y + 5);
        var coord15 = new Coord(x + 2, y + 5);
        var coord16 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord17 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord18 = new Coord(x + 4, y + this.middleBarThickness - 3);
        var coord19 = new Coord(x + 2, y + this.middleBarThickness - 3);
        var coord20 = new Coord(x - 4, y);
        var coord21 = new Coord(x - 4, y + 1);
        var coord22 = new Coord(x + 4, y + 1);
        var coord23 = new Coord(x + 4, y);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
        this.fillQuad(coord20, coord21, coord22, coord23);
    } else {
        var coord0 = new Coord(x - 1, y);
        var coord1 = new Coord(x + 1, y);
        var coord2 = new Coord(x + 1, y + this.middleBarThickness);
        var coord3 = new Coord(x - 1, y + this.middleBarThickness);
        var coord4 = new Coord(x - 4, y + 4);
        var coord5 = new Coord(x - 3, y + 4);
        var coord6 = new Coord(x - 3, y + this.middleBarThickness - 1);
        var coord7 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord8 = new Coord(x + 4, y + 4);
        var coord9 = new Coord(x + 3, y + 4);
        var coord10 = new Coord(x + 3, y + this.middleBarThickness - 1);
        var coord11 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord12 = new Coord(x - 3, y + 3);
        var coord13 = new Coord(x - 2, y + 3);
        var coord14 = new Coord(x - 2, y + 4);
        var coord15 = new Coord(x - 3, y + 4);
        var coord16 = new Coord(x - 3, y + this.middleBarThickness);
        var coord17 = new Coord(x - 2, y + this.middleBarThickness);
        var coord18 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord19 = new Coord(x - 3, y + this.middleBarThickness - 1);
        var coord20 = new Coord(x + 3, y + 3);
        var coord21 = new Coord(x + 2, y + 3);
        var coord22 = new Coord(x + 2, y + 4);
        var coord23 = new Coord(x + 3, y + 4);
        var coord24 = new Coord(x + 3, y + this.middleBarThickness);
        var coord25 = new Coord(x + 2, y + this.middleBarThickness);
        var coord26 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord27 = new Coord(x + 3, y + this.middleBarThickness - 1);
        var coord28 = new Coord(x - 6, y + 2);
        var coord29 = new Coord(x - 5, y + 2);
        var coord30 = new Coord(x - 5, y + this.middleBarThickness - 1);
        var coord31 = new Coord(x - 6, y + this.middleBarThickness - 1);
        var coord32 = new Coord(x + 6, y + 2);
        var coord33 = new Coord(x + 5, y + 2);
        var coord34 = new Coord(x + 5, y + this.middleBarThickness - 1);
        var coord35 = new Coord(x + 6, y + this.middleBarThickness - 1);
        var coord36 = new Coord(x - 5, y + 1);
        var coord37 = new Coord(x - 3, y + 1);
        var coord38 = new Coord(x - 3, y + 2);
        var coord39 = new Coord(x - 5, y + 2);
        var coord40 = new Coord(x - 5, y + this.middleBarThickness);
        var coord41 = new Coord(x - 4, y + this.middleBarThickness);
        var coord42 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord43 = new Coord(x - 5, y + this.middleBarThickness - 1);
        var coord44 = new Coord(x + 5, y + 1);
        var coord45 = new Coord(x + 3, y + 1);
        var coord46 = new Coord(x + 3, y + 2);
        var coord47 = new Coord(x + 5, y + 2);
        var coord48 = new Coord(x + 5, y + this.middleBarThickness);
        var coord49 = new Coord(x + 4, y + this.middleBarThickness);
        var coord50 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord51 = new Coord(x + 5, y + this.middleBarThickness - 1);

        var coord52 = new Coord(x - 8, y + 1);
        var coord53 = new Coord(x - 7, y + 1);
        var coord54 = new Coord(x - 7, y + this.middleBarThickness - 1);
        var coord55 = new Coord(x - 8, y + this.middleBarThickness - 1);
        var coord56 = new Coord(x + 8, y + 1);
        var coord57 = new Coord(x + 7, y + 1);
        var coord58 = new Coord(x + 7, y + this.middleBarThickness - 1);
        var coord59 = new Coord(x + 8, y + this.middleBarThickness - 1);
        var coord60 = new Coord(x - 7, y);
        var coord61 = new Coord(x - 5, y);
        var coord62 = new Coord(x - 5, y + 1);
        var coord63 = new Coord(x - 7, y + 1);
        var coord64 = new Coord(x - 7, y + this.middleBarThickness);
        var coord65 = new Coord(x - 6, y + this.middleBarThickness);
        var coord66 = new Coord(x - 6, y + this.middleBarThickness - 1);
        var coord67 = new Coord(x - 7, y + this.middleBarThickness - 1);
        var coord68 = new Coord(x + 7, y);
        var coord69 = new Coord(x + 5, y);
        var coord70 = new Coord(x + 5, y + 1);
        var coord71 = new Coord(x + 7, y + 1);
        var coord72 = new Coord(x + 7, y + this.middleBarThickness);
        var coord73 = new Coord(x + 6, y + this.middleBarThickness);
        var coord74 = new Coord(x + 6, y + this.middleBarThickness - 1);
        var coord75 = new Coord(x + 7, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
        this.fillQuad(coord20, coord21, coord22, coord23);
        this.fillQuad(coord24, coord25, coord26, coord27);
        this.fillQuad(coord28, coord29, coord30, coord31);
        this.fillQuad(coord32, coord33, coord34, coord35);
        this.fillQuad(coord36, coord37, coord38, coord39);
        this.fillQuad(coord40, coord41, coord42, coord43);
        this.fillQuad(coord44, coord45, coord46, coord47);
        this.fillQuad(coord48, coord49, coord50, coord51);
        this.fillQuad(coord52, coord53, coord54, coord55);
        this.fillQuad(coord56, coord57, coord58, coord59);
        this.fillQuad(coord60, coord61, coord62, coord63);
        this.fillQuad(coord64, coord65, coord66, coord67);
        this.fillQuad(coord68, coord69, coord70, coord71);
        this.fillQuad(coord72, coord73, coord74, coord75);
    }
},

drawRomanm : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    if (this.modernRoman) {
        var coord0 = new Coord(x - 4, y + 2);
        var coord1 = new Coord(x - 2, y + 2);
        var coord2 = new Coord(x, y + this.middleBarThickness - 4);
        var coord3 = new Coord(x, y + this.middleBarThickness - 3);
        var coord4 = new Coord(x + 4, y + 2);
        var coord5 = new Coord(x + 2, y + 2);
        var coord6 = new Coord(x, y + this.middleBarThickness - 4);
        var coord7 = new Coord(x, y + this.middleBarThickness - 3);
        var coord8 = new Coord(x - 4, y + 2);
        var coord9 = new Coord(x - 2, y + 2);
        var coord10 = new Coord(x - 2, y + this.middleBarThickness);
        var coord11 = new Coord(x - 4, y + this.middleBarThickness);
        var coord12 = new Coord(x + 4, y + 2);
        var coord13 = new Coord(x + 2, y + 2);
        var coord14 = new Coord(x + 2, y + this.middleBarThickness);
        var coord15 = new Coord(x + 4, y + this.middleBarThickness);
        var coord16 = new Coord(x - 4, y);
        var coord17 = new Coord(x - 4, y + 1);
        var coord18 = new Coord(x + 4, y + 1);
        var coord19 = new Coord(x + 4, y);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
    } else {
        var coord0 = new Coord(x - 4, y + 2);
        var coord1 = new Coord(x - 2, y + 2);
        var coord2 = new Coord(x + 4, y + this.middleBarThickness);
        var coord3 = new Coord(x + 2, y + this.middleBarThickness);
        var coord4 = new Coord(x - 4, y + this.middleBarThickness);
        var coord5 = new Coord(x - 2, y + this.middleBarThickness);
        var coord6 = new Coord(x + 4, y + 2);
        var coord7 = new Coord(x + 2, y + 2);
        var coord8 = new Coord(x - 5, y);
        var coord9 = new Coord(x - 4, y);
        var coord10 = new Coord(x - 4, y + this.middleBarThickness);
        var coord11 = new Coord(x - 5, y + this.middleBarThickness);
        var coord12 = new Coord(x + 5, y);
        var coord13 = new Coord(x + 4, y);
        var coord14 = new Coord(x + 4, y + this.middleBarThickness);
        var coord15 = new Coord(x + 5, y + this.middleBarThickness);
        var coord16 = new Coord(x - 4, y);
        var coord17 = new Coord(x - 4, y + 1);
        var coord18 = new Coord(x + 4, y + 1);
        var coord19 = new Coord(x + 4, y);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
    }
},

drawRomanMarkers : function() {
    var unitPosition = this.decimalPosition + ((this.checkPiece()) ? 1 : 0)
        + ((this.checkPiecePercent()) ? 1 : 0)
        + ((this.checkSubdeck()) ? 2 : 0);
    var iRails = this.rails - unitPosition - ((this.checkSign()) ? 1 : 0);

    this.drawRomanI(unitPosition);
    if (iRails < 2)
        return;
    this.drawRomanX(unitPosition + 1);
    if (iRails < 3)
        return;
    this.drawRomanC(unitPosition + 2);
    if (iRails < 4)
        return;
    this.drawRomanM(unitPosition + 3);
    if (iRails < 5)
        return;
    this.drawRomanx(unitPosition + 4);
    if (iRails < 6)
        return;
    this.drawRomanc(unitPosition + 5);
    if (iRails < 7)
        return;
    this.drawRomanm(unitPosition + 6);
},

drawPiece : function(rail) {
    if (this.slot) {
        var x = this.getRailPositionX(rail);
        var y = this.middleBarY;
        var coord0 = new Coord(x - 4, y + 1);
        var coord1 = new Coord(x - 2, y + 1);
        var coord2 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord3 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord4 = new Coord(x - 3, y);
        var coord5 = new Coord(x - 3, y + 2);
        var coord6 = new Coord(x + 3, y + 2);
        var coord7 = new Coord(x + 3, y);
        var coord8 = new Coord(x - 3, y + this.middleBarThickness);
        var coord9 = new Coord(x - 3, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x + 3, y + this.middleBarThickness);
        var coord12 = new Coord(x + 2, y + 1);
        var coord13 = new Coord(x + 4, y + 1);
        var coord14 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord15 = new Coord(x + 2, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        return;
    }
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 4, y + (this.middleBarThickness >> 1) - 1);
    var coord1 = new Coord(x - 4, y + (this.middleBarThickness >> 1) + 1);
    var coord2 = new Coord(x + 4, y + (this.middleBarThickness >> 1) + 1);
    var coord3 = new Coord(x + 4, y + (this.middleBarThickness >> 1) - 1);
    var coord4 = new Coord(x - 1, y);
    var coord5 = new Coord(x + 1, y);
    var coord6 = new Coord(x + 1, y + this.middleBarThickness);
    var coord7 = new Coord(x - 1, y + this.middleBarThickness);
    this.fillQuad(coord0, coord1, coord2, coord3);
    this.fillQuad(coord4, coord5, coord6, coord7);
},

drawRomanHalf : function(rail, offset) {
    var x = this.getRailPositionX(rail) - 4;
    var y = this.getSubdeckPositionY(this.getNumberSubbeadsOffset(offset));
    if (this.museum === "it") {
        var coord0 = new Coord(x - 3, y);
        var coord1 = new Coord(x + 3, y);
        var coord2 = new Coord(x + 3, y + 2);
        var coord3 = new Coord(x - 3, y + 2);
        var coord4 = new Coord(x + 4, y + this.middleBarThickness - 2);
        var coord5 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord6 = new Coord(x - 4, y + 2);
        var coord7 = new Coord(x - 2, y + 1);
        var coord8 = new Coord(x - 3, y + this.middleBarThickness);
        var coord9 = new Coord(x + 3, y + this.middleBarThickness);
        var coord10 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x - 3, y + this.middleBarThickness - 2);
        var coord12 = new Coord(x + 2, y + 1);
        var coord13 = new Coord(x + 4, y + 1);
        var coord14 = new Coord(x + 4, y + 3);
        var coord15 = new Coord(x + 2, y + 3);
        var coord16 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord17 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord18 = new Coord(x - 2, y + this.middleBarThickness - 3);
        var coord19 = new Coord(x - 4, y + this.middleBarThickness - 3);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
    } else if (this.museum === "uk") {
        var coord0 = new Coord(x - 3, y);
        var coord1 = new Coord(x + 3, y);
        var coord2 = new Coord(x + 3, y + 2);
        var coord3 = new Coord(x - 3, y + 2);
        var coord4 = new Coord(x + 2, y + (this.middleBarThickness >> 1));
        var coord5 = new Coord(x, y + (this.middleBarThickness >> 1));
        var coord6 = new Coord(x - 4, y + 2);
        var coord7 = new Coord(x - 2, y + 1);
        var coord8 = new Coord(x + 2, y + (this.middleBarThickness >> 1) + 1);
        var coord9 = new Coord(x, y + (this.middleBarThickness >> 1));
        var coord10 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord12 = new Coord(x + 2, y + 1);
        var coord13 = new Coord(x + 4, y + 1);
        var coord14 = new Coord(x + 4, y + 3);
        var coord15 = new Coord(x + 2, y + 3);
        var coord16 = new Coord(x - 4, y + this.middleBarThickness - 1);
        var coord17 = new Coord(x - 2, y + this.middleBarThickness - 1);
        var coord18 = new Coord(x - 2, y + this.middleBarThickness - 3);
        var coord19 = new Coord(x - 4, y + this.middleBarThickness - 3);
        var coord20 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord21 = new Coord(x + 4, y + this.middleBarThickness - 2);
        var coord22 = new Coord(x + 4, y + this.middleBarThickness);
        var coord23 = new Coord(x - 4, y + this.middleBarThickness);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
        this.fillQuad(coord16, coord17, coord18, coord19);
        this.fillQuad(coord20, coord21, coord22, coord23);
    } else if (this.museum === "fr") {
        var coord0 = new Coord(x, y);
        var coord1 = new Coord(x + 1, y + 1);
        var coord2 = new Coord(x - 2, y + (this.middleBarThickness >> 1));
        var coord3 = new Coord(x - 4, y + (this.middleBarThickness >> 1) - 1);
        var coord4 = new Coord(x - 4, y + (this.middleBarThickness >> 1) - 1);
        var coord5 = new Coord(x - 4, y + (this.middleBarThickness >> 1) + 1);
        var coord6 = new Coord(x + 2, y + (this.middleBarThickness >> 1) + 1);
        var coord7 = new Coord(x + 2, y + (this.middleBarThickness >> 1) - 1);
        var coord8 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord9 = new Coord(x - 2, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x + 2, y + (this.middleBarThickness >> 1));
        var coord11 = new Coord(x, y + (this.middleBarThickness >> 1));
        var coord12 = new Coord(x - 4, y + this.middleBarThickness);
        var coord13 = new Coord(x + 4, y + this.middleBarThickness);
        var coord14 = new Coord(x + 4, y + this.middleBarThickness - 2);
        var coord15 = new Coord(x - 4, y + this.middleBarThickness - 2);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
    }
},

drawRomanQuarter : function(rail, offset) {
    var x = this.getRailPositionX(rail) - 4;
    var y = this.getSubdeckPositionY(this.getNumberSubbeadsOffset(offset));
    if (this.museum === "it") {
        var coord0 = new Coord(x + 4, y + 1);
        var coord1 = new Coord(x + 2, y + 1);
        var coord2 = new Coord(x + 2, y + this.middleBarThickness - 1);
        var coord3 = new Coord(x + 4, y + this.middleBarThickness - 1);
        var coord4 = new Coord(x + 3, y);
        var coord5 = new Coord(x + 3, y + 2);
        var coord6 = new Coord(x - 3, y + 2);
        var coord7 = new Coord(x - 3, y);
        var coord8 = new Coord(x + 3, y + this.middleBarThickness);
        var coord9 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x - 3, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x - 3, y + this.middleBarThickness);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
    } else if (this.museum === "uk") {
        var coord0 = new Coord(x + 3, y + 3);
        var coord1 = new Coord(x + 1, y + 3);
        var coord2 = new Coord(x + 1, y + this.middleBarThickness - 3);
        var coord3 = new Coord(x + 3, y + this.middleBarThickness - 3);
        var coord4 = new Coord(x + 2, y + 3);
        var coord5 = new Coord(x + 3, y + 2);
        var coord6 = new Coord(x - 2, y);
        var coord7 = new Coord(x - 3, y + 1);
        var coord8 = new Coord(x + 2, y + this.middleBarThickness - 3);
        var coord9 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x - 2, y + this.middleBarThickness);
        var coord11 = new Coord(x - 3, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
    } else if (this.museum === "fr") {
        var coord0 = new Coord(x + 3, y + 1);
        var coord1 = new Coord(x + 1, y + 1);
        var coord2 = new Coord(x + 1, y + this.middleBarThickness - 3);
        var coord3 = new Coord(x + 3, y + this.middleBarThickness - 3);
        var coord4 = new Coord(x + 2, y);
        var coord5 = new Coord(x + 3, y + 1);
        var coord6 = new Coord(x - 2, y + 3);
        var coord7 = new Coord(x - 3, y + 2);
        var coord8 = new Coord(x + 2, y + this.middleBarThickness - 3);
        var coord9 = new Coord(x + 3, y + this.middleBarThickness - 2);
        var coord10 = new Coord(x - 2, y + this.middleBarThickness);
        var coord11 = new Coord(x - 3, y + this.middleBarThickness - 1);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
    }
},

drawRomanTwelfth : function(rail, offset) {
    var x = this.getRailPositionX(rail) - 4;
    var y = this.getSubdeckPositionY(this.getNumberSubbeadsOffset(offset));
    if (this.museum === "it") {
        var coord0 = new Coord(x - 4, y);
        var coord1 = new Coord(x + 4, y);
        var coord2 = new Coord(x + 4, y + 2);
        var coord3 = new Coord(x - 4, y + 2);
        var coord4 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord5 = new Coord(x - 2, y + this.middleBarThickness - 2);
        var coord6 = new Coord(x + 4, y + 2);
        var coord7 = new Coord(x + 2, y + 2);
        var coord8 = new Coord(x - 4, y + this.middleBarThickness);
        var coord9 = new Coord(x + 4, y + this.middleBarThickness);
        var coord10 = new Coord(x + 4, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x - 4, y + this.middleBarThickness - 2);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
    } else if (this.museum === "uk" || this.museum === "fr") {
        var coord0 = new Coord(x - 3, y);
        var coord1 = new Coord(x + 3, y);
        var coord2 = new Coord(x + 3, y + 2);
        var coord3 = new Coord(x - 3, y + 2);
        var coord4 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord5 = new Coord(x - 2, y + this.middleBarThickness - 2);
        var coord6 = new Coord(x + 4, y + 2);
        var coord7 = new Coord(x + 3, y + 1);
        var coord8 = new Coord(x - 4, y + this.middleBarThickness);
        var coord9 = new Coord(x + 4, y + this.middleBarThickness);
        var coord10 = new Coord(x + 4, y + this.middleBarThickness - 2);
        var coord11 = new Coord(x - 4, y + this.middleBarThickness - 2);
        var coord12 = new Coord(x - 2, y + 1);
        var coord13 = new Coord(x - 4, y + 1);
        var coord14 = new Coord(x - 4, y + 3);
        var coord15 = new Coord(x - 2, y + 3);
        this.fillQuad(coord0, coord1, coord2, coord3);
        this.fillQuad(coord4, coord5, coord6, coord7);
        this.fillQuad(coord8, coord9, coord10, coord11);
        this.fillQuad(coord12, coord13, coord14, coord15);
    }
},

drawSubdeckMarkers : function(rail) {
    this.drawRomanHalf(rail, 2);
    if (this.subdecks > 1)
        this.drawRomanQuarter(rail, 1);
    if (this.subdecks > 2)
        this.drawRomanTwelfth(rail, 0);
},

drawSign : function(rail) {
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 4, y + (this.middleBarThickness >> 1) - 1);
    var coord1 = new Coord(x - 4, y + (this.middleBarThickness >> 1) + 1);
    var coord2 = new Coord(x + 4, y + (this.middleBarThickness >> 1) + 1);
    var coord3 = new Coord(x + 4, y + (this.middleBarThickness >> 1) - 1);
    this.fillQuad(coord0, coord1, coord2, coord3);
},

drawAnomaly : function(rail) {
    // This is a made up symbol to show the position of anomaly
    var x = this.getRailPositionX(rail);
    var y = this.middleBarY;
    var coord0 = new Coord(x - 4, y + 2);
    var coord1 = new Coord(x - 2, y);
    var coord2 = new Coord(x + 4, y + this.middleBarThickness - 2);
    var coord3 = new Coord(x + 2, y + this.middleBarThickness);
    var coord4 = new Coord(x - 4, y + this.middleBarThickness - 2);
    var coord5 = new Coord(x - 2, y + this.middleBarThickness);
    var coord6 = new Coord(x + 4, y + 2);
    var coord7 = new Coord(x + 2, y);
    this.fillQuad(coord0, coord1, coord2, coord3);
    this.fillQuad(coord4, coord5, coord6, coord7);
    if (this.medieval) {
        this.drawSign(rail);
    }
},

drawAnomalies : function() {
    var unitPosition = this.decimalPosition
        + ((this.checkPiece()) ? 1 : 0)
        + ((this.checkPiecePercent()) ? 1 : 0)
        + ((this.checkSubdeck()) ? 2 : 0);
    var iRails = this.rails - unitPosition - ((this.checkSign()) ? 1 : 0);
    if (iRails > this.shiftAnomaly && this.anomaly > 0)
        this.drawAnomaly(unitPosition + this.shiftAnomaly);
    if (iRails > this.shiftAnomalySq && this.anomalySq > 0)
        this.drawAnomaly(unitPosition + this.shiftAnomalySq);
},

drawAllMarkers : function() {
    if (this.checkPiece()) {
        this.drawPiece(this.decimalPosition
            + ((this.checkPiecePercent()) ? 1 : 0)
            + ((this.checkSubdeck()) ? 2 : 0));
    }
    if (this.checkPiecePercent()) {
        this.drawPiece(this.decimalPosition - this.shiftPercent);
    }
    if (this.checkSign(this)) {
        this.drawSign(this.rails - 1);
    }
    if (this.anomaly > 0 || this.anomalySq > 0) {
        this.drawAnomalies();
        if (this.anomalySq > 0) {
            this.drawAllGroupSeparators(this.decimalPosition + this.anomalySq);
        } else {
            this.drawAllGroupSeparators(this.decimalPosition + this.anomaly);
        }
    } else if (this.slot) {
        this.drawRomanMarkers();
        return;
    } else {
        this.drawAllGroupSeparators(this.decimalPosition);
    }
    this.drawDecimalSeparator(this.decimalPosition
        + ((this.checkPiece()) ? 1 : 0)
        + ((this.checkPiecePercent()) ? 1 : 0)
        + ((this.checkSubdeck()) ? 2 : 0));
},

drawRail : function(curSpace) {
    var y;
    var x = this.getRailPositionX(curSpace.rail) - (this.railThickness >> 1);
    if (curSpace.deck === 0)
        y = this.middleBarY + this.middleBarThickness;
    else if (curSpace.deck === 1)
        y = this.frameThickness;
    var subdeck = -1;
    var subposition = 0;
    var subcell = curSpace.cell;
    if (curSpace.rail === this.decimalPosition + 1
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        if (this.getSubdeckSlotsSeparate(this.museum)) {
            subdeck = this.getSubdeckFromPosition(subcell);
            subposition = this.getSubpositionSubdeck(subcell);
        }
    }
    y += curSpace.cell * this.beadHeight;
    var beads = this.deck[curSpace.deck].beads;
    var spaces = this.deck[curSpace.deck].spaces;
    var coord0;
    var coord1;
    if (this.medieval && curSpace.deck === 0) {
        coord0 = new Coord(x, y - this.middleBarThickness
            - this.deck[TOP].cells * this.beadHeight);
        coord1 = new Coord(x + this.railThickness, y + this.beadHeight);
    } else if  (this.medieval && curSpace.deck !== 0) {
        return;
    } else if (this.slot && (curSpace.cell === 0 ||
            (subdeck !== -1 && subposition === 0))) {
        coord0 = new Coord(x + 1,
            y + 3 * (this.beadHeight >> 3));
        coord1 = new Coord(x + this.railThickness - 1,
            y + 3 * (this.beadHeight >> 3) + 1);
        if (this.vertical) {
            coord0 = this.rotateOutput(coord0);
            coord1 = this.rotateOutput(coord1);
        }
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(coord0.x, coord0.y);
        this.drawingContext.lineTo(coord0.x, coord1.y);
        this.drawingContext.lineTo(coord1.x, coord1.y);
        this.drawingContext.lineTo(coord1.x, coord0.y);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.border;
        this.drawingContext.fill();
        coord0 = new Coord(x, y + 3 * (this.beadHeight >> 3) + 1);
        coord1 = new Coord(x + this.railThickness, y + this.beadHeight);
    } else if (this.slot && (curSpace.cell === beads + spaces - 1 ||
            (subdeck !== -1
            && subposition === this.getSubdeckBeads(subdeck)))) {
        coord0 = new Coord(x + 1,
            y + this.beadHeight - 3 * (this.beadHeight >> 3) - 1);
        coord1 = new Coord(x + this.railThickness - 1,
            y + this.beadHeight - 3 * (this.beadHeight >> 3));
        if (this.vertical) {
            coord0 = this.rotateOutput(coord0);
            coord1 = this.rotateOutput(coord1);
        }
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(coord0.x, coord0.y);
        this.drawingContext.lineTo(coord0.x, coord1.y);
        this.drawingContext.lineTo(coord1.x, coord1.y);
        this.drawingContext.lineTo(coord1.x, coord0.y);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.border;
        this.drawingContext.fill();
        coord0 = new Coord(x, y);
        coord1 = new Coord(x + this.railThickness,
            y + this.beadHeight - 3 * (this.beadHeight >> 3) - 1);
    } else {
        coord0 = new Coord(x, y);
        coord1 = new Coord(x + this.railThickness, y + this.beadHeight);
    }
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.closePath();
    if (this.slot || this.medieval)
        this.drawingContext.fillStyle = this.border;
    else
        this.drawingContext.fillStyle = this.railColor[this.railIndex][1];
    this.drawingContext.fill();
    // add some lighting
    if (!(this.slot || this.medieval)) {
        var diff;
        if (this.vertical) {
            diff = coord1.y - coord0.y;
        } else {
            diff = coord1.x - coord0.x;
        }
        if (diff < 2) {
            return;
        }
        this.drawingContext.beginPath();
        if (this.vertical) {
            this.drawingContext.moveTo(coord0.x, coord1.y);
            this.drawingContext.lineTo(coord1.x, coord1.y);
            this.drawingContext.lineTo(coord1.x, coord1.y - 1);
            this.drawingContext.lineTo(coord0.x, coord1.y - 1);
        } else {
            this.drawingContext.moveTo(coord1.x, coord0.y);
            this.drawingContext.lineTo(coord1.x, coord1.y);
            this.drawingContext.lineTo(coord1.x - 1, coord1.y);
            this.drawingContext.lineTo(coord1.x - 1, coord0.y);
        }
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.railColor[this.railIndex][2];
        this.drawingContext.fill();
        this.drawingContext.beginPath();
        if (this.vertical) {
            this.drawingContext.moveTo(coord0.x, coord0.y);
            this.drawingContext.lineTo(coord1.x, coord0.y);
            this.drawingContext.lineTo(coord1.x, coord0.y + 1);
            this.drawingContext.lineTo(coord0.x, coord0.y + 1);
        } else {
            this.drawingContext.moveTo(coord0.x, coord0.y);
            this.drawingContext.lineTo(coord0.x, coord1.y);
            this.drawingContext.lineTo(coord0.x + 1, coord1.y);
            this.drawingContext.lineTo(coord0.x + 1, coord0.y);
        }
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.railColor[this.railIndex][0];
        this.drawingContext.fill();
    }
},

drawRailHole : function(curSpace) {
    var y;
    var x = this.getRailPositionX(curSpace.rail) - (this.railThickness >> 1);
    if (curSpace.deck === 0)
        y = this.middleBarY + this.middleBarThickness;
    else if (curSpace.deck === 1)
        y = this.frameThickness;
    var subdeck = -1;
    var subposition = 0;
    var subcell = curSpace.cell;
    if (curSpace.rail === this.decimalPosition + 1
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        if (this.getSubdeckSlotsSeparate(this.museum)) {
            subdeck = this.getSubdeckFromPosition(subcell);
            subposition = this.getSubpositionSubdeck(subcell);
        }
    }
    y += curSpace.cell * this.beadHeight;
    var beads = this.deck[curSpace.deck].beads;
    var spaces = this.deck[curSpace.deck].spaces;
    var coord0;
    var coord1;
    if (this.medieval && curSpace.deck === 0) {
        coord0 = new Coord(x, y - this.middleBarThickness
            - this.deck[TOP].cells * this.beadHeight
            + (this.beadHeight >> 1) - (this.beadHeight >> 3));
        coord1 = new Coord(x + this.railThickness, y +
            (this.beadHeight >> 1) + (this.beadHeight >> 3));
    } else if  (this.medieval && curSpace.deck !== 0) {
        return;
    } else {
        coord0 = new Coord(x, y + (this.beadHeight >> 1) - (this.beadHeight >> 3));
        coord1 = new Coord(x + this.railThickness, y + (this.beadHeight >> 1) + (this.beadHeight >> 3));
    }
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord0.x, coord1.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord1.x, coord0.y);
    this.drawingContext.closePath();
    if (this.slot || this.medieval)
        this.drawingContext.fillStyle = this.border;
    else
        this.drawingContext.fillStyle = this.railColor[this.railIndex][1];
    // can not make darker
    this.drawingContext.fill();
},

drawRails : function() {
    for (var deck = 0; deck < this.decks; deck++) {
        var spaces = this.deck[deck].spaces;
        var cells = this.deck[deck].cells;
        var pieces = this.getPieces(deck);
        var pieceSpaces = this.getPieceSpaces(deck);
        var piecePercents = this.getPiecePercents(deck);
        var piecePercentSpaces = this.getPiecePercentSpaces(deck);
        for (var rail = 0; rail < this.rails; rail++) {
            var position = (this.medieval) ? 0 : this.beadPosition[deck][rail];
            var limit;
            if (rail === this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
                if (pieces <= 0)
                    continue;
                limit = position + pieceSpaces;
            } else if (rail === this.decimalPosition - this.shiftPercent
                    && this.checkPiecePercent()) {
                if (piecePercents <= 0)
                    continue;
                limit = position + piecePercentSpaces;
            } else if (rail === this.decimalPosition + 1
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    && this.checkSubdeck()) {
                if (deck === 0) {
                    for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
                        var specialOffset =
                            this.getNumberSubbeadsOffset(subdeck);
                        position = this.subbeadPosition[subdeck]
                            + specialOffset;
                        limit = position + SUBDECK_SPACES;
                        for (var cell = position; cell < limit; cell++) {
                            var curSpace = new Bead(deck, rail, cell, cell);
                            this.drawRail(curSpace);
                        }
                    }
                }
                continue;
            } else if (rail === this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    && this.checkSubdeck()) {
                continue;
            } else if (rail === this.rails - 1 && this.checkSign()) {
                if (deck !== 0)
                    continue;
                limit = position + cells - 1;
            } else {
                limit = position + spaces;
            }
            limit = (this.medieval) ? cells : limit;
            for (var space = position; space < limit; space++) {
                var curSpace = new Bead(deck, rail, space, -1);
                this.drawRail(curSpace);
            }
        }
    }
},

drawAllCounters : function() {
    for (var deck = 0; deck < this.decks; deck++) {
        for (var rail = 0; rail < this.rails; rail++) {
            var number = this.beadPosition[deck][rail];
            var curCounter = new Bead(deck, rail, number, -1);
            this.drawCounters(curCounter, number, false);
        }
    }
},

drawAllBeads : function() {
    for (var deck = 0; deck < this.decks; deck++) {
        var spaces = this.deck[deck].spaces;
        var cells = this.deck[deck].cells;
        var pieces = this.getPieces(deck);
        var pieceSpaces = this.getPieceSpaces(deck);
        var piecePercents = this.getPiecePercents(deck);
        var piecePercentSpaces = this.getPiecePercentSpaces(deck);
        var curBead;
        for (var rail = 0; rail < this.rails; rail++) {
            var position = this.beadPosition[deck][rail];

            if (rail === this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
                if (pieces > 0) {
                    for (var cell = 0; cell < cells; cell++) {
                        if (cell >= position + pieceSpaces) {
                            curBead = new Bead(deck, rail,
                                cell, cell - pieceSpaces);
                            this.drawBead(curBead, false);
                        } else if (cell < position) {
                            curBead = new Bead(deck, rail, cell, cell);
                            this.drawBead(curBead, false);
                        }
                    }
                }
            } else if (rail === this.decimalPosition - this.shiftPercent
                    && this.checkPiecePercent()) {
                if (piecePercents > 0) {
                    for (var cell = 0; cell < cells; cell++) {
                        if (cell >= position + piecePercentSpaces) {
                            curBead = new Bead(deck, rail,
                                cell, cell - piecePercentSpaces);
                            this.drawBead(curBead, false);
                        } else if (cell < position) {
                            curBead = new Bead(deck, rail, cell, cell);
                            this.drawBead(curBead, false);
                        }
                    }
                }
            } else if (rail === this.decimalPosition + 1
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    && this.checkSubdeck()) {
                if (deck === 0) {
                    for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
                        var specialOffset =
                            this.getNumberSubbeadsOffset(subdeck);
                        var position = this.subbeadPosition[subdeck]
                            + specialOffset;
                        for (var cell = specialOffset;
                                cell < position; cell++) {
                            var curBead = new Bead(deck, rail, cell, cell);
                            this.drawBead(curBead, false);
                        }
                        for (var cell = position + SUBDECK_SPACES;
                                cell < specialOffset +
                               this.getSubdeckCells(subdeck); cell++) {
                            var curBead = new Bead(deck, rail, cell, cell);
                            this.drawBead(curBead, false);
                        }
                    }
                }
            } else if (rail === this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    && this.checkSubdeck()) {
                if (deck === 0)
                    this.drawSubdeckMarkers(rail);
            } else if (rail === this.rails - 1 && this.checkSign()) {
                if (deck === 0) {
                    for (var cell = 0; cell < cells; cell++) {
                         if (cell >= position + cells - 1) {
                             curBead = new Bead(deck, rail,
                                 cell, cell - cells + 1);
                             this.drawBead(curBead, false);
                         } else if (cell < position) {
                             curBead = new Bead(deck, rail, cell, cell);
                             this.drawBead(curBead, false);
                         }
                     }
                }
            } else {
                for (var cell = 0; cell < cells; cell++) {
                    if (cell >= position + spaces) {
                        curBead = new Bead(deck, rail, cell, cell - spaces);
                        this.drawBead(curBead, false);
                    } else if (cell < position) {
                        curBead = new Bead(deck, rail, cell, cell);
                        this.drawBead(curBead, false);
                    }
                }
            }
        }
    }
},

drawAbacus : function() {
    if (this.vertical) {
        this.drawingContext.clearRect(0, 0, this.frameSize.y, this.frameSize.x);
    } else {
        this.drawingContext.clearRect(0, 0, this.frameSize.x, this.frameSize.y);
    }
    this.drawFrame();
    this.drawAllMarkers();
    this.drawRails();
    if (this.medieval) {
        this.drawAllCounters();
    } else {
        this.drawAllBeads();
    }
},

eraseBead : function(start, size) {
    if (this.vertical) {
        start = this.rotateOutput(start);
        var temp = size.x;
        size.x = size.y;
        size.y = temp;
    }
    this.drawingContext.clearRect(start.x, start.y,
        size.x, size.y);
},

setAbacusStart : function(start) {
    start.x = (this.rails - 1 - p.rail)
        * (this.beadWidth + this.beadGapX)
        + this.beadRadiusX + this.frameThickness + this.beadGapX;
    start.y = (((p.deck === 0) ? 1 : 0) * this.middleBarY)
        + p.cell * this.beadHeight
        + this.beadRadiusY + this.frameThickness + offset;
    if (this.vertical)
        start = this.rotateOutput(start);
},

drawEllipsePosition : function(p, color, special, start) {
    var shade = 1 + special;
    var radius = new Coord(this.beadWidth >> 1, this.beadHeight >> 1);
    var centerX = start.x;
    var centerY = start.y;
    var step = 0.01;
    var counter = step;
    var pi2 = Math.PI * 2 - step;

    if (radius.x < 1 || radius.y < 1) {
         return;
    }
    this.drawingContext.beginPath();
    if (radius.x == radius.y) {
        this.drawingContext.arc(start.x, start.y, radius.x,
            0, Math.PI * 2, false);
    } else {
        if (this.vertical) {
            var temp = radius.x;
            radius.x = radius.y;
            radius.y = temp;
        }
        this.drawingContext.moveTo(centerX + radius.x * Math.cos(0),
            centerY + radius.y * Math.sin(0));
        for (; counter < pi2; counter += step) {
            this.drawingContext.lineTo(centerX + radius.x * Math.cos(counter),
                centerY + radius.y * Math.sin(counter));
        }
    }
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[color][shade];
    this.drawingContext.fill();
    this.drawingContext.strokeStyle =
        this.beadColor[color][Math.min(shade + 1, 3)];
    this.drawingContext.stroke();
},

drawRoundBeadPosition : function(p, color, special, reflection, start) {
    var shade = 1 + special;
    var radius;
    if (this.beadHeight > this.beadWidth) {
        radius = this.beadRadiusX;
    } else {
        radius = this.beadRadiusY;
    }
    radius = radius + Math.floor(this.beadWidth >> 6) - 1;
    if (radius < 1) {
        return;
    }
    //radius = ((radius >> 1) << 1);
    if (this.beadHeight === this.beadWidth) {
        this.drawingContext.beginPath();
        this.drawingContext.arc(start.x, start.y, radius, 0, Math.PI * 2, false);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        this.drawingContext.strokeStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.stroke();
    } else if (this.beadWidth > this.beadHeight) {
        var halfSpace = (this.beadWidth - this.beadHeight) >> 1;
        // draw circles
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.arc(start.x, start.y - halfSpace, radius, 0, Math.PI * 2, false);
        else
            this.drawingContext.arc(start.x - halfSpace, start.y, radius, 0, Math.PI * 2, false);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        this.drawingContext.strokeStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.stroke();
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.arc(start.x, start.y + halfSpace, radius, 0, Math.PI * 2, false);
        else
            this.drawingContext.arc(start.x + halfSpace, start.y, radius, 0, Math.PI * 2, false);
        this.drawingContext.closePath();

        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        this.drawingContext.strokeStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.stroke();
        // draw middle
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.rect(start.x - (this.beadHeight >> 1),
                start.y - halfSpace + 1,
                2 * (this.beadHeight >> 1),
                2 * halfSpace - 2);
        else
            this.drawingContext.rect(start.x - halfSpace + 1,
                start.y - (this.beadHeight >> 1),
                2 * halfSpace - 2,
                2 * (this.beadHeight >> 1));
        this.drawingContext.closePath();
        this.drawingContext.fillStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.fill();
        // some slight tweaks here
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.rect(start.x - (this.beadHeight >> 1) + 1,
                start.y - halfSpace - 1,
                2 * (this.beadHeight >> 1) - 2,
                2 * halfSpace);
        else
            this.drawingContext.rect(start.x - halfSpace,
                start.y - (this.beadHeight >> 1) + 1,
                2 * halfSpace - 1,
                2 * (this.beadHeight >> 1) - 2);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        // erase internal arcs, needed all the time only if nearly round
        if (this.beadHeight * 3 > this.beadWidth * 2) {
            this.drawingContext.beginPath();
            this.drawingContext.arc(start.x, start.y, radius, 0, Math.PI * 2, false);
            this.drawingContext.closePath();
            this.drawingContext.fillStyle = this.beadColor[color][shade];
            this.drawingContext.fill();
        }
    } else if (this.beadHeight > this.beadWidth) {
        var halfSpace = (this.beadHeight - this.beadWidth) >> 1;
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.arc(start.x - halfSpace, start.y, radius, 0, Math.PI * 2, false);
        else
            this.drawingContext.arc(start.x, start.y - halfSpace, radius, 0, Math.PI * 2, false);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        this.drawingContext.strokeStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.stroke();
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.arc(start.x + halfSpace, start.y, radius, 0, Math.PI * 2, false);
        else
            this.drawingContext.arc(start.x, start.y + halfSpace, radius, 0, Math.PI * 2, false);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        this.drawingContext.strokeStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.stroke();
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.rect(start.x - halfSpace,
                start.y - (this.beadWidth >> 1),
                2 * halfSpace,
                2 * (this.beadWidth >> 1));
        else
            this.drawingContext.rect(start.x - (this.beadHeight >> 1),
                start.y - halfSpace + 1,
                2 * (this.beadHeight >> 1),
                2 * halfSpace - 2);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle =
            this.beadColor[color][Math.min(shade + 1, 3)];
        this.drawingContext.fill();
        // some slight tweaks here
        this.drawingContext.beginPath();
        if (this.vertical)
            this.drawingContext.rect(start.x - halfSpace,
                start.y - (this.beadHeight >> 1) + 1,
                2 * halfSpace - 1,
                2 * (this.beadHeight >> 1) - 2);
        else
            this.drawingContext.rect(start.x - (this.beadHeight >> 1) + 1,
                start.y - halfSpace - 1,
                2 * (this.beadHeight >> 1) - 2,
                2 * halfSpace);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade];
        this.drawingContext.fill();
        // needed all the time only if nearly round
        if (this.beadWidth * 3 > this.beadHeight * 2) {
            this.drawingContext.beginPath();
            this.drawingContext.arc(start.x, start.y, radius, 0, Math.PI * 2, false);
            this.drawingContext.closePath();
            this.drawingContext.fillStyle = this.beadColor[color][shade];
            this.drawingContext.fill();
        }
    }
    if (!reflection)
        return;
    var newStart = new Coord(
        Math.floor(3 * this.beadWidth / 10) - this.beadRadiusX,
        Math.floor(3 * this.beadHeight / 10) - this.beadRadiusY);
    if (this.vertical) {
        var start = this.rotateInput(start);
        newStart.x = newStart.x + start.x;
        newStart.y = newStart.y + start.y;
        newStart = this.rotateOutput(newStart);
        newStart.x -= ((5 * this.beadGapX) >> 2); // fix for lighting
    } else {
        newStart.x += start.x;
        newStart.y += start.y;
    }
    if (radius >= 4) {
        this.drawingContext.beginPath();
        this.drawingContext.arc(newStart.x, newStart.y, radius >> 2,
            0, Math.PI * 2, false);
        this.drawingContext.closePath();
        this.drawingContext.fillStyle = this.beadColor[color][shade - 1];
        this.drawingContext.fill();
    }
},

drawRoundBead : function(p, color, special, offset, reflection) {
    //var start = new Coord();
    //this.setAbacusStart(p, start);
    var start = new Coord(((this.rails - 1 - p.rail)
        * (this.beadWidth + this.beadGapX))
        + this.beadRadiusX + this.frameThickness + this.beadGapX,
        (((p.deck === 0) ? 1 : 0) * this.middleBarY)
        + (p.cell * this.beadHeight)
        + this.beadRadiusY + this.frameThickness + offset);
    if (this.vertical)
        start = this.rotateOutput(start);
    this.drawRoundBeadPosition(p, color, special, reflection, start);
},

drawEngravingPosition : function(p, start) {
    var decimalOffset = ((this.checkPiece()) ? 1 : 0);
    var centsOffset = ((this.centsSymbol === "") ? 0 : 2);
    this.drawingContext.font="10px Georgia";
    this.drawingContext.fillStyle = this.border;
    start.x -= 8;
    start.y += 2;
    if (p.rail - this.decimalPosition >= decimalOffset) {
        var zeroes = "";
        for (i = 0; i < p.rail - this.decimalPosition - decimalOffset; i++)
            zeroes += "0";
        this.drawingContext.fillText(this.currencySymbol
            + ((p.deck === 1) ?
            this.deck[TOP].factor.toString() :
            this.deck[BOTTOM].factor.toString()) + zeroes,
            start.x - (zeroes.length - 1) * 3, start.y);
    } else if (p.rail < this.decimalPosition) {
        var zeroes = "";
        if  (p.rail >= this.decimalPosition - centsOffset) {
            for (i = 0; i < p.rail - this.decimalPosition + centsOffset; i++)
                zeroes += "0";
            this.drawingContext.fillText(((p.deck === 1) ?
                this.deck[TOP].factor.toString() :
                this.deck[BOTTOM].factor.toString()) + zeroes + this.centsSymbol,
                start.x - (zeroes.length - 1) * 2, start.y);
        } else {
            zeroes += ".";
            for (i = 0; i < this.decimalPosition - p.rail - centsOffset - 1; i++)
                zeroes += "0";
            this.drawingContext.fillText(
                ((this.centsSymbol == "") ? this.currencySymbol : "")
                + zeroes + ((p.deck === 1) ?
                this.deck[TOP].factor.toString() :
                this.deck[BOTTOM].factor.toString()) + this.centsSymbol,
                start.x - (zeroes.length - 1 - ((this.centsSymbol == "") ? 0 : 1)) * 2, start.y);
        }
    } else if (p.rail - this.decimalPosition === 0) {
        var zeroes = "";
        this.drawingContext.fillText(
            ((this.centsSymbol == "") ? this.currencySymbol : "")
            + zeroes + "25"
            + this.centsSymbol, start.x, start.y);
    }
},

drawBillPosition : function(p, start) {
    var currency = p.rail - this.decimalPosition + this.currencyOffset;
    if (currency >= 0 && currency < this.currencyRails &&
        this.images[p.deck][currency]) {
        try {
            if (this.vertical) {
                //this.images[p.deck][currency].rotate(90);
                //this.images[p.deck][currency].style.webkitTransform = "rotate(90deg)";
                //this.images[p.deck][currency].style.mozTransform = "rotate(90deg)";
                //this.images[p.deck][currency].style.oTransform = "rotate(90deg)";
                //this.images[p.deck][currency].style.msTransform = "rotate(90deg)";
                //this.images[p.deck][currency].style.transform = "rotate(90deg)";
                this.drawingContext.drawImage(this.images[p.deck][currency],
                    start.x - (this.beadHeight >> 1), start.y - (this.beadWidth >> 1),
                    this.beadHeight, this.beadWidth);
            } else {
                this.drawingContext.drawImage(this.images[p.deck][currency],
                    start.x - (this.beadWidth >> 1), start.y - (this.beadHeight >> 1),
                     this.beadWidth, this.beadHeight);
            }
            return;
        } catch(err) {
        }
    }
    var color = 3;
    var shade = 1;
    this.drawingContext.beginPath();
    if (this.vertical) {
        this.drawingContext.rect(start.x - (this.beadHeight >> 1),
            start.y - (this.beadWidth >> 1),
            this.beadHeight, this.beadWidth);
//        this.drawingContext.rotate(Math.PI / 2);
    } else {
        this.drawingContext.rect(start.x - (this.beadWidth >> 1),
            start.y - (this.beadHeight >> 1),
            this.beadWidth, this.beadHeight);
    }
    this.drawingContext.closePath();
    this.drawingContext.fillStyle = this.beadColor[color][shade];
    this.drawingContext.fill();
    this.drawingContext.strokeStyle =
    this.beadColor[color][Math.min(shade + 1, 3)];
    this.drawingContext.stroke();
    this.drawEngravingPosition(p, start);
},

drawCoinPosition : function(p, start) {
    var currency = p.rail - this.decimalPosition + this.currencyOffset;
    if (currency >= 0 && currency < this.currencyRails &&
            this.images[p.deck][currency]) {
        try {
            if (this.currency === "jp" && p.deck == 1 &&
                    (currency == 0 || currency == 1)) {
                this.drawRailHole(p);
            }
            if (this.vertical) {
                this.drawingContext.drawImage(this.images[p.deck][currency],
                    start.x - (this.beadHeight >> 1), start.y - (this.beadWidth >> 1),
                    this.beadHeight, this.beadWidth);
            } else {
                this.drawingContext.drawImage(this.images[p.deck][currency],
                    start.x - (this.beadWidth >> 1), start.y - (this.beadHeight >> 1),
                    this.beadWidth, this.beadHeight);
            }
            return;
        } catch(err) {
        }
    }
    this.drawEllipsePosition(p, 2, 0, start);
    this.drawEngravingPosition(p, start);
},

drawBill : function(p, offset) {
    var start = new Coord(((this.rails - 1 - p.rail)
        * (this.beadWidth + this.beadGapX))
        + this.beadRadiusX + this.frameThickness + this.beadGapX,
        (((p.deck === 0) ? 1 : 0) * this.middleBarY)
        + (p.cell * this.beadHeight)
        + this.beadRadiusY + this.frameThickness + offset);
    if (this.vertical)
        start = this.rotateOutput(start);
    this.drawBillPosition(p, start);
},

drawCoin : function(p, offset) {
    var start = new Coord(((this.rails - 1 - p.rail)
        * (this.beadWidth + this.beadGapX))
        + this.beadRadiusX + this.frameThickness + this.beadGapX,
        (((p.deck === 0) ? 1 : 0) * this.middleBarY)
        + (p.cell * this.beadHeight)
        + this.beadRadiusY + this.frameThickness + offset);
    if (this.vertical)
        start = this.rotateOutput(start);
    this.drawCoinPosition(p, start);
},

drawDiamondBead : function(p, color, special, offset) {
    var deckPosition = (p.deck === 0) ? 1 : 0;
    var shade = 1 + special;
    var start = new Coord(this.getRailPositionX(p.rail) - this.beadRadiusX,
        (deckPosition * this.middleBarY) + (p.cell * this.beadHeight)
        + this.frameThickness + offset);
    var coord0 = new Coord(start.x + this.beadRadiusX
        + ((this.railThickness - 1) >> 1) + 2, start.y + this.beadHeight);
    var coord1 = new Coord(start.x + this.beadRadiusX
        - (this.railThickness >> 1) - 2, start.y + this.beadHeight);
    var coord2 = new Coord(start.x - 1, start.y + this.beadRadiusY);
    var coord3 = new Coord(start.x + this.beadWidth,
        start.y + this.beadRadiusY);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
        coord2 = this.rotateOutput(coord2);
        coord3 = this.rotateOutput(coord3);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord2.x, coord2.y);
    this.drawingContext.lineTo(coord3.x, coord3.y);
    this.drawingContext.closePath();
    if (this.vertical) { // fix for lighting
        this.drawingContext.fillStyle = this.beadColor[color][shade - 1];
    } else {
        this.drawingContext.fillStyle = this.beadColor[color][shade];
    }
    this.drawingContext.fill();
    coord0 = new Coord(start.x + this.beadRadiusX
        - (this.railThickness >> 1) - 2, start.y);
    coord1 = new Coord(start.x + this.beadRadiusX
        + ((this.railThickness - 1) >> 1) + 2, start.y);
    coord2 = new Coord(start.x + this.beadWidth, start.y + this.beadRadiusY);
    coord3 = new Coord(start.x - 1, start.y + this.beadRadiusY);
    if (this.vertical) {
        coord0 = this.rotateOutput(coord0);
        coord1 = this.rotateOutput(coord1);
        coord2 = this.rotateOutput(coord2);
        coord3 = this.rotateOutput(coord3);
    }
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(coord0.x, coord0.y);
    this.drawingContext.lineTo(coord1.x, coord1.y);
    this.drawingContext.lineTo(coord2.x, coord2.y);
    this.drawingContext.lineTo(coord3.x, coord3.y);
    this.drawingContext.closePath();
    if (this.vertical) { // fix for lighting
        this.drawingContext.fillStyle = this.beadColor[color][shade];
    } else {
        this.drawingContext.fillStyle = this.beadColor[color][shade - 1];
    }
    this.drawingContext.fill();
},

drawCounters : function(p, count, selected) {
    var color = 0;
    var special = 0;
    var shade = 1 + special;
    for (var i = 0; i < count; i++) {
        var done = 0;
        var start = new Coord(((this.rails - 1 - p.rail)
            * (this.beadWidth + this.beadGapX))
            - this.beadWidth * p.deck
            + this.beadWidth + this.frameThickness + this.beadGapX,
            this.middleBarThickness + this.middleBarY
            + ((this.deck[BOTTOM].cells * this.beadHeight) >> 1)
            + i * this.beadHeight - (count - 1) * (this.beadHeight >> 1));
        if (this.vertical)
            start = this.rotateOutput(start);
        if (this.currency !== "") {
            var currency = p.rail - this.decimalPosition + this.currencyOffset;
            if (p.rail - this.decimalPosition -
                    ((this.checkPiece()) ? 1 : 0) >= this.billOffset) {
                this.drawBillPosition(p, start);
            } else {
                this.drawCoinPosition(p, start);
            }
        } else {
            var radius = (this.beadWidth >> 1) - Math.floor(this.beadWidth / 40);
            if (radius < 1) {
                return;
            }
            this.drawingContext.beginPath();
            this.drawingContext.arc(start.x, start.y, radius,
                0, Math.PI * 2, false);
            this.drawingContext.closePath();
            this.drawingContext.fillStyle = this.beadColor[color][shade];
            this.drawingContext.fill();
            this.drawingContext.strokeStyle =
                this.beadColor[color][Math.min(shade + 1, 3)];
        }
    }
},

drawBead : function(p, selected) {
    this.drawBeadMove(p, selected, 0);
},

drawBeadMove : function(p, selected, offset) {
    var color = 0;
    var special = 0;
    if (selected)
        special++;
    var beads = this.deck[p.deck].beads;
    if (p.rail === this.decimalPosition - 1
            + ((this.checkPiece()) ? 1 : 0)
            + ((this.checkPiecePercent()) ? 1 : 0)
            + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
        beads = this.getPieces(p.deck);
        if (this.colorScheme === 0)
            special++;
    }
    if (p.rail === this.decimalPosition - 1 - this.shiftPercent
            + ((this.checkPiecePercent()) ? 1 : 0)
            && this.checkPiecePercent()) {
        beads = this.getPiecePercents(p.deck);
        if (this.colorScheme === 0)
            special++;
    }
    if (p.rail === this.decimalPosition + 1
            + ((this.checkPiecePercent()) ? 1 : 0) && this.checkSubdeck()) {
        if (this.getSubdeckFromPosition(p.cell) % 2 === 1)
            special++;
    }
    if (p.rail === this.rails - 1 && this.checkSign()) {
        beads = ((p.deck === 0) ? 1 : 0);
        special++;
    }
    if ((this.colorScheme & COLOR_HALF) !== 0) {
        if ((beads & 1) !== 0) {
            if (p.index === (beads >> 1))
                color++;
        } else if (p.index >= (beads >> 1)) {
            if (this.deck[p.deck].orient)
                color++;
        } else {
            if (!this.deck[p.deck].orient)
                color++;
        }
    }
    if ((this.colorScheme & COLOR_MIDDLE) !== 0) {
        if ((((p.index === (beads >> 1) - 1) && ((beads & 1) === 0)) ||
                p.index === (beads >> 1)) && beads > 2)
            special++;
    }
    var anomalyPosition = 0;
    if (this.anomaly > 0 || this.anomalySq > 0) {
        if (this.anomalySq > 0) {
            anomalyPosition = this.anomalySq;
        } else {
            anomalyPosition = this.anomaly;
        }
    }
    if ((this.colorScheme & COLOR_FIRST) !== 0 &&
            p.deck === 0 &&
            p.rail - this.decimalPosition - anomalyPosition
                - ((this.checkPiece()) ? 1 : 0)
                - ((this.checkPiecePercent()) ? 1 : 0)
                - ((this.checkSubdeck()) ? 2 : 0) > 0 &&
                (p.rail - this.decimalPosition - anomalyPosition
                - ((this.checkPiece()) ? 1 : 0)
                - ((this.checkPiecePercent()) ? 1 : 0)
                - ((this.checkSubdeck()) ? 2 : 0)) % this.groupSize === 0 &&
                !(this.checkSign() && p.rail === this.rails - 1)) {
        if (p.index === beads - 1 && this.deck[p.deck].orient)
            special++;
        else if (p.index === 0 && !this.deck[p.deck].orient)
            special++;
    }
    if (this.currency !== "") {
        if (p.rail - this.decimalPosition -
                ((this.checkPiece()) ? 1 : 0) >= this.billOffset) {
            this.drawBill(p, offset);
        } else {
            this.drawCoin(p, offset);
        }
    } else if (this.diamond) {
        this.drawDiamondBead(p, color, special, offset);
    } else {
        this.drawRoundBead(p, color, special, offset, true);
    }
},

setAbacus : function(display, string) {
    var parts = string.split(".", 2);
    this.beadPosition = new Array(2);
    this.subbeadPosition = new Array(this.subdecks);
    for (var deck = 0; deck < this.decks; deck++) {
        this.beadPosition[deck] = new Array(this.rails);
        for (var rail = 0; rail < this.rails; rail++) {
            var beads = this.deck[deck].beads;
            var digit = 0;
            var digitPart = 0;
            if (rail === this.decimalPosition
                    + ((this.checkPiecePercent()) ? 1 : 0)
                    + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
                beads = this.getPieces(deck);
            } else if (rail === this.decimalPosition - this.shiftPercent
                    && this.checkPiecePercent()) {
                beads = this.getPiecePercents(deck);
            } else if (rail === this.decimalPosition + 1 &&
                    this.checkSubdeck()) {
                if (deck === 0) {
                    for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
                        this.subbeadPosition[subdeck] =
                            (this.deck[deck].orient) ?
                            this.getSubdeckBeads(subdeck) : 0;
                    }
                }
                continue;
            } else if (rail === this.decimalPosition &&
                    this.checkSubdeck()) {
                continue;
            } else if (rail === this.rails - 1 && this.checkSign()) {
                beads = (deck === 0) ? 1 : 0;
            } else if (this.deck[TOP].beads === 0 && deck === 1) {
                digit = 0;
            } else {
                if (rail >= this.decimalPosition +
                        ((this.checkPiece()) ? 1 : 0) +
                        ((this.checkPiecePercent()) ? 1 : 0) +
                        ((this.checkSubdeck()) ? 2 : 0)) {
                    if (rail - this.decimalPosition -
                            ((this.checkPiece()) ? 1 : 0) -
                            ((this.checkPiecePercent()) ? 1 : 0) -
                            ((this.checkSubdeck()) ? 2 : 0)
                            < parts[0].length) {
                        digit = this.letterToDigit(
                            parts[0].charAt(parts[0].length - rail +
                            this.decimalPosition +
                            ((this.checkPiece()) ? 1 : 0) +
                            ((this.checkPiecePercent()) ? 1 : 0) +
                            ((this.checkSubdeck()) ? 2 : 0) - 1));
                    }
                } else {
                    if (parts.length > 1 && this.decimalPosition - rail - 1
                            < parts[1].length) {
                        var pos = this.decimalPosition - rail - 1;
                        digit = this.letterToDigit(parts[1].charAt(pos +
                            ((this.shiftPercent > pos &&
                            this.checkPiecePercent()) ? 1 : 0)));
                    }
                }
                digitPart = (deck === 0) ? digit % this.deck[TOP].factor :
                    Math.floor(digit / this.deck[TOP].factor);
            }
            this.beadPosition[deck][rail] = (this.deck[deck].orient) ?
                beads - digitPart : digitPart;
        }
    }
    display.value = string; // TODO chop up and put back
    this.setSpan(display.value);
    this.drawAbacus();
},

clearAbacus : function(display) {
    this.beadPosition = new Array(2);
    this.subbeadPosition = new Array(this.subdecks);
    for (var deck = 0; deck < this.decks; deck++) {
        this.beadPosition[deck] = new Array(this.rails);
        for (var rail = 0; rail < this.rails; rail++) {
            var beads = this.deck[deck].beads;
            if (rail === this.decimalPosition
                   + ((this.checkPiecePercent()) ? 1 : 0)
                   + ((this.checkSubdeck()) ? 2 : 0) && this.checkPiece()) {
                beads = this.getPieces(deck);
            }
            if (rail === this.decimalPosition - this.shiftPercent
                    && this.checkPiecePercent()) {
                beads = this.getPiecePercents(deck);
            }
            if (rail === this.decimalPosition + 1 && this.checkSubdeck()) {
                if (deck === 0) {
                    for (var subdeck = 0; subdeck < this.subdecks; subdeck++) {
                        if (this.deck[deck].orient) {
                            this.subbeadPosition[subdeck] =
                                this.getSubdeckBeads(subdeck);
                        } else {
                            this.subbeadPosition[subdeck] = 0;
                        }
                    }
                }
                continue;
            }
            if (rail === this.rails - 1 && this.checkSign()) {
                beads = (deck === 0) ? 1 : 0;
            }
            if (this.deck[deck].orient) {
                this.beadPosition[deck][rail] = beads;
            } else {
                this.beadPosition[deck][rail] = 0;
            }
        }
    }
    display.value = 0;
    this.setSpan(display.value);
    this.drawAbacus();
},

decrementAbacus : function(display) {
    var valueString = this.getSpan();
    var string = "0";
    if (this.rails > 1)
        this.rails--;
    if (this.decimalPosition >= this.rails
            - ((this.checkPiece()) ? 1 : 0)
            - ((this.checkPiecePercent()) ? 1 : 0))
        this.decimalPosition = this.rails - 1
            - ((this.checkPiece()) ? 1 : 0)
            - ((this.checkPiecePercent()) ? 1 : 0);
    this.setFrame();
    this.setSize();
    this.clearAbacus(display);
    if (this.base !== this.display.base || this.anomaly !== 0) {
        string = "0";
    } else {
        string = this.trimForAbacus(valueString);
    }
    if (string !== valueString) {
        this.setSpan(string);
    }
    this.setAbacus(display, string);
    this.setStyleDisplay(display);
},

incrementAbacus : function(display) {
    var valueString = this.getSpan();
    var string = "0";
    this.rails++;
    this.setFrame();
    this.setSize();
    this.clearAbacus(display);
    string = this.trimForAbacus(valueString);
    if (this.base !== this.display.base || this.anomaly !== 0) {
        string = "0";
    } else {
        string = this.trimForAbacus(valueString);
    }
    if (string !== valueString) {
        this.setSpan(string);
    }
    this.setAbacus(display, string);
    this.setStyleDisplay(display);
},

fullScreenAbacus : function(element) {
    /*if (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled) {
       if (document.exitFullscreen()) {
           document.exitFullscreen();
       } else if (document.mozCancelFullScreen()) {
           document.mozCancelFullScreen();
       } else if (document.webkitExitFullScreen()) {
           document.webkitExitFullScreen();
       }
       return;
    }*/
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
},

setStyleDisplay : function(display) {
    var style = "border: ridge 2px #99aabb; padding: 0; width: "
        + (this.abacusCanvasElement.width - 4)
        + "px; margin: 0; text-align: right; "
        + "line-height: 23px; color: " + this.border;
    document.getElementById(display.PElement.id).setAttribute("style", style);
},

getSpan : function() {
    if ("textContent" in this.display.PElement) {
        return this.display.PElement.textContent;
    }
    return this.display.PElement.innerText;
    //return this.display.PElement.innerHTML;
},

setSpan : function(string) {
    if (this.group) {
        string = numberWithCommas(string, this.groupSize);
    }
    if (this.decimalComma) { // swap
        string = string.replace(/\./g, "@").replace(/,/g, ".").replace(/@/g, ",");
    }
    if ("textContent" in this.display.PElement) {
        this.display.PElement.textContent = string;
    } else {
        this.display.PElement.innerText = string;
    }
    //this.display.PElement.innerHTML = string;
},

setSize : function() {
    if (this.vertical) {
        this.abacusCanvasElement.width = this.frameSize.y;
        this.abacusCanvasElement.height = this.frameSize.x;
    } else {
        this.abacusCanvasElement.width = this.frameSize.x;
        this.abacusCanvasElement.height = this.frameSize.y;
    }
}
  };
 }
}

var primary = null;
var auxiliary0 = null;
var auxiliary1 = null;

function auxiliary0OnKeyPress(event) {
    auxiliary0.onKeyPress(event);
}

function auxiliary1OnKeyPress(event) {
    auxiliary1.onKeyPress(event);
}

function primaryOnKeyPress(event) {
    primary.onKeyPress(event);
}

function auxiliary0OnMouseDown(event) {
    auxiliary0.onMouseDown(event);
}

function auxiliary1OnMouseDown(event) {
    auxiliary1.onMouseDown(event);
}

function primaryOnMouseDown(event) {
    primary.onMouseDown(event);
}

function auxiliary0OnTouchStart(event) {
    auxiliary0.onTouchStart(event);
}

function auxiliary1OnTouchStart(event) {
    auxiliary1.onTouchStart(event);
}

function primaryOnTouchStart(event) {
    primary.onTouchStart(event);
}

function auxiliary0OnMouseUp(event) {
    auxiliary0.onMouseUp(event);
}

function auxiliary1OnMouseUp(event) {
    auxiliary1.onMouseUp(event);
}

function primaryOnMouseUp(event) {
    primary.onMouseUp(event);
}

function auxiliary0OnTouchStop(event) {
    auxiliary0.onTouchStop(event);
}

function auxiliary1OnTouchStop(event) {
    auxiliary1.onTouchStop(event);
}

function primaryOnTouchStop(event) {
    primary.onTouchStop(event);
}

function auxiliary0OnMouseOut(event) {
    auxiliary0.onMouseOut(event);
}

function auxiliary1OnMouseOut(event) {
    auxiliary1.onMouseOut(event);
}

function primaryOnMouseOut(event) {
    primary.onMouseOut(event);
}

function auxiliary0OnLoad(event) {
    auxiliary0.onLoad(event);
}

function auxiliary1OnLoad(event) {
    auxiliary1.onLoad(event);
}

function primaryOnLoad(event) {
    primary.onLoad(event);
}

function auxiliary0Clear(event) {
    auxiliary0.clearAbacus(auxiliary0.display);
}

function auxiliary1Clear(event) {
    auxiliary1.clearAbacus(auxiliary1.display);
}

function primaryClear(event) {
    primary.clearAbacus(primary.display);
}

function auxiliary0Decrement(event) {
    auxiliary0.decrementAbacus(auxiliary0.display);
}

function auxiliary1Decrement(event) {
    auxiliary1.decrementAbacus(auxiliary1.display);
}

function primaryDecrement(event) {
    primary.decrementAbacus(primary.display);
}

function auxiliary0Increment(event) {
    auxiliary0.incrementAbacus(auxiliary0.display);
}

function auxiliary1Increment(event) {
    auxiliary1.incrementAbacus(auxiliary1.display);
}

function primaryIncrement(event) {
    primary.incrementAbacus(primary.display);
}

function primaryFullScreen(event) {
    primary.fullScreenAbacus(document.body);
}

function getCharPress(event) {
    event = event || window.event;
    var charCode = event.keyCode || event.which;
    var charStr = String.fromCharCode(charCode);
    if (charStr === "c") {
        if (auxiliary0 !== null)
            auxiliary0.clearAbacus(auxiliary0.display);
        if (auxiliary1 !== null)
            auxiliary1.clearAbacus(auxiliary1.display);
        primary.clearAbacus(primary.display);
    } else if (charStr === "d") {
        /*if (auxiliary0 !== null)
            auxiliary0.decrementAbacus(auxiliary0.display);
        if (auxiliary1 !== null)
            auxiliary1.decrementAbacus(auxiliary1.display);*/
        primary.decrementAbacus(primary.display);
    } else if (charStr === "i") {
        /*if (auxiliary0 !== null)
            auxiliary0.incrementAbacus(auxiliary0.display);
        if (auxiliary1 !== null)
            auxiliary1.incrementAbacus(auxiliary1.display);*/
        primary.incrementAbacus(primary.display);
    }
}

function initAbacus(canvasElement, pElement) {
    init(abaci, 1);
    primary = abaci[0];
    primary.initSpaceAbacus();
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
        canvasElement.id = "abacus_canvas";
        document.body.appendChild(canvasElement);
    }
    primary.abacusCanvasElement = canvasElement;
    if (!pElement) {
        pElement = document.createElement("p");
        document.body.appendChild(pElement);
    }
    pElement.id = "abacus_p";
    primary.display.PElement = pElement;
    if (primary.display.PElement.addEventListener) {
        primary.display.PElement.addEventListener("keypress",
            primaryOnKeyPress, false);
    }
    if (primary.abacusCanvasElement.addEventListener) {
        primary.abacusCanvasElement.addEventListener("mousedown",
            primaryOnMouseDown, false);
        primary.abacusCanvasElement.addEventListener("mouseup",
            primaryOnMouseUp, false);
        primary.abacusCanvasElement.addEventListener("touchstart",
            primaryOnTouchStart, false);
        primary.abacusCanvasElement.addEventListener("touchend",
            primaryOnTouchStop, false);
        primary.abacusCanvasElement.addEventListener("mouseout",
            primaryOnMouseOut, false);
    }
    if (window.addEventListener) {
        window.addEventListener("keypress", getCharPress, false);
        window.addEventListener("load", primaryOnLoad, false);
    }
    if (document.getElementById("clear")) {
        document.getElementById("clear").addEventListener("click",
            primaryClear);
    }
    if (document.getElementById("decrement")) {
        document.getElementById("decrement").addEventListener("click",
            primaryDecrement);
    }
    if (document.getElementById("increment")) {
        document.getElementById("increment").addEventListener("click",
            primaryIncrement);
    }
    if (document.getElementById("fullScreen")) {
        document.getElementById("fullScreen").addEventListener("click",
            primaryFullScreen);
    }
    if (!primary.abacusCanvasElement.getContext) {
        alert("Canvas is unsupported in your browser.");
        return;
    }
    primary.setFormatFromElement(primary.display, "abacus_article");
    primary.setSize();
    primary.setStyleDisplay(primary.display);
    primary.abacusCanvasElement.style.backgroundColor = primary.background;
    primary.drawingContext = primary.abacusCanvasElement.getContext("2d");
    //if (!resumeAbacus())
        primary.clearAbacus(primary.display);
}

function initLeeAbacus(canvas0Element, canvas1Element, canvasElement,
        p0Element, p1Element, pElement) {
    var number = LEE;
    init(abaci, number);
    auxiliary0 = abaci[0];
    auxiliary1 = abaci[1];
    primary = abaci[2];
    for (var i = 0; i < number; i++) {
       abaci[i].initSpaceAbacus();
    }
    if (!canvas0Element) {
        canvas0Element = document.createElement("canvas");
        canvas0Element.id = "auxiliary0_canvas";
        document.body.appendChild(canvas0Element);
    }
    auxiliary0.abacusCanvasElement = canvas0Element;
    if (!canvas1Element) {
        canvas1Element = document.createElement("canvas");
        canvas1Element.id = "auxiliary1_canvas";
        document.body.appendChild(canvas1Element);
    }
    auxiliary1.abacusCanvasElement = canvas1Element;
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
        document.body.appendChild(canvasElement);
    }
   canvasElement.id = "primary_canvas";
    primary.abacusCanvasElement = canvasElement;
    if (!p0Element) {
        p0Element = document.createElement("p");
        document.body.appendChild(p0Element);
    }
    p0Element.id = "auxiliary0_p";
    auxiliary0.display.PElement = p0Element;
    if (auxiliary0.display.PElement.addEventListener) {
        auxiliary0.display.PElement.addEventListener("keypress",
            auxiliary0OnKeyPress, false);
    }
    if (!p1Element) {
        p1Element = document.createElement("p");
        document.body.appendChild(p1Element);
    }
    p1Element.id = "auxiliary1_p";
    auxiliary1.display.PElement = p1Element;
    if (auxiliary1.display.PElement.addEventListener) {
        auxiliary1.display.PElement.addEventListener("keypress",
            auxiliary1OnKeyPress, false);
    }
    if (!pElement) {
        pElement = document.createElement("p");
        pElement.id = "primary_p";
        document.body.appendChild(pElement);
    }
    primary.display.PElement = pElement;
    if (primary.display.PElement.addEventListener) {
        primary.display.PElement.addEventListener("keypress",
            primaryOnKeyPress, false);
    }
    if (primary.abacusCanvasElement.addEventListener) {
        auxiliary0.abacusCanvasElement.addEventListener("mousedown",
            auxiliary0OnMouseDown, false);
        auxiliary0.abacusCanvasElement.addEventListener("mouseup",
            auxiliary0OnMouseUp, false);
        auxiliary0.abacusCanvasElement.addEventListener("touchstart",
            auxiliary0OnTouchStart, false);
        auxiliary0.abacusCanvasElement.addEventListener("touchend",
            auxiliary0OnTouchStop, false);
        auxiliary0.abacusCanvasElement.addEventListener("mouseout",
            auxiliary0OnMouseOut, false);
        auxiliary1.abacusCanvasElement.addEventListener("mousedown",
            auxiliary1OnMouseDown, false);
        auxiliary1.abacusCanvasElement.addEventListener("mouseup",
            auxiliary1OnMouseUp, false);
        auxiliary1.abacusCanvasElement.addEventListener("touchstart",
            auxiliary1OnTouchStart, false);
        auxiliary1.abacusCanvasElement.addEventListener("touchend",
            auxiliary1OnTouchStop, false);
        auxiliary1.abacusCanvasElement.addEventListener("mouseout",
            auxiliary1OnMouseOut, false);
        primary.abacusCanvasElement.addEventListener("mousedown",
            primaryOnMouseDown, false);
        primary.abacusCanvasElement.addEventListener("mouseup",
            primaryOnMouseUp, false);
        primary.abacusCanvasElement.addEventListener("touchstart",
            primaryOnTouchStart, false);
        primary.abacusCanvasElement.addEventListener("touchend",
            primaryOnTouchStop, false);
        primary.abacusCanvasElement.addEventListener("mouseout",
            primaryOnMouseOut, false);
    }
    if (window.addEventListener) {
        window.addEventListener("keypress", getCharPress, false);
        window.addEventListener("load", auxiliary0OnLoad, false);
        window.addEventListener("load", auxiliary1OnLoad, false);
        window.addEventListener("load", primaryOnLoad, false);
    }
    if (document.getElementById("clear")) {
        document.getElementById("clear").addEventListener("click",
            auxiliary0Clear);
        document.getElementById("clear").addEventListener("click",
            auxiliary1Clear);
        document.getElementById("clear").addEventListener("click",
            primaryClear);
    }
    if (document.getElementById("decrement")) {
        /*document.getElementById("decrement").addEventListener("click",
            auxiliary0Decrement);
        document.getElementById("decrement").addEventListener("click",
            auxiliary1Decrement);*/
        document.getElementById("decrement").addEventListener("click",
            primaryDecrement);
    }
    if (document.getElementById("increment")) {
        /*document.getElementById("increment").addEventListener("click",
            auxiliary0Increment);
        document.getElementById("increment").addEventListener("click",
            auxiliary1Increment);*/
        document.getElementById("increment").addEventListener("click",
            primaryIncrement);
    }
    if (!primary.abacusCanvasElement.getContext) {
        alert("Canvas is unsupported in your browser.");
        return;
    }
    for (var i = 0; i < number; i++) {
        abaci[i].setFormatFromElement(abaci[i].display, (i === number - 1) ?
            "primary_article" : ("auxiliary" + i + "_article"));
        abaci[i].setSize();
        abaci[i].setStyleDisplay(abaci[i].display);
        abaci[i].abacusCanvasElement.style.backgroundColor =
            abaci[i].background;
        abaci[i].drawingContext =
            abaci[i].abacusCanvasElement.getContext("2d");
        //if (!resumeAbacus())
            abaci[i].clearAbacus(abaci[i].display);
    }
}
