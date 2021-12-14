/*
 * Script for common utility functions
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

const removeUnsafeHtmlMarkup = (htmlText) => {
	const unsafeHtmlMarkupRegex = /<\/?( +)?(script|iframe|link|button|input|embed)( +)?\/?>/ig;
	let processedHtmlText = htmlText;
	
	while(unsafeHtmlMarkupRegex.test(processedHtmlText)) {
		processedHtmlText = processedHtmlText.replaceAll(unsafeHtmlMarkupRegex, "");
	}

	return processedHtmlText;
};

/* Debug logging functions */
const logDebug = (title, ...objs) => {
	if(ENABLE_DEBUG_LOGGING) {
		console.debug.apply(null, [`[${title.toUpperCase()}]`, objs].flat());
	}
};

const logWarn = (title, ...objs) => {
	console.warn.apply(null, [`[${title.toUpperCase()}]`, objs].flat());
};

const logError = (title, ...objs) => {
	console.error.apply(null, [`[${title.toUpperCase()}]`, objs].flat());
};
/* === */

/* Global regular expressions */
const REGEXP_TONE_CODE = /^([A-G]\#?)(\d+)$/;
const REGEXP_TONE_CODE_FULL_TONE = /^([A-G])(\d+)$/;
const REGEXP_TONE_CODE_HALF_TONE = /^([A-G]\#)(\d+)$/;
/* === */
