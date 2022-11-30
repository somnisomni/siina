/*
 * Script for utility functions
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */
 
class StaticClass { constructor() { throw new TypeError("Illegal constructor"); } }

const degToRad = (degree) => degree * (Math.PI / 180.0);
const radToDeg = (radian) => radian * (180.0 / Math.PI);

const $id = (id) => document.getElementById(id);
const $q = (query) => document.querySelector(query);
const $qa = (query) => document.querySelectorAll(query);
const $ce = (tag) => document.createElement(tag);

const sleepAsync = async (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
