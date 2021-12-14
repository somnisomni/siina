/*
 * Script for processing keyboard key event
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* Key - Audio scale map */
// Using QWERTY keymap; Scale mapping based on FL Studio

// KEYCODE: [SCALE INDEX, OCTAVE]
const KEY_TONE_MAP = {
	90: [ToneUtil.SCALE_MAP["C"], 3],		/* Z */
	83: [ToneUtil.SCALE_MAP["C#"], 3],		/* S */
	88: [ToneUtil.SCALE_MAP["D"], 3],		/* X */
	68: [ToneUtil.SCALE_MAP["D#"], 3],	/* D */
	67: [ToneUtil.SCALE_MAP["E"], 3],		/* C */
	86: [ToneUtil.SCALE_MAP["F"], 3],		/* V */
	71: [ToneUtil.SCALE_MAP["F#"], 3],		/* G */
	66: [ToneUtil.SCALE_MAP["G"], 3],	/* B */
	72: [ToneUtil.SCALE_MAP["G#"], 3],	/* H */
	78: [ToneUtil.SCALE_MAP["A"], 3],		/* N */
	74: [ToneUtil.SCALE_MAP["A#"], 3],		/* J */
	77: [ToneUtil.SCALE_MAP["B"], 3],		/* M */
	188: [ToneUtil.SCALE_MAP["C"], 4],	/* Comma */
	76: [ToneUtil.SCALE_MAP["C#"], 4],		/* L */
	190: [ToneUtil.SCALE_MAP["D"], 4],	/* Period */
	186: [ToneUtil.SCALE_MAP["D#"], 4],	/* Semicolon */
	191: [ToneUtil.SCALE_MAP["E"], 4],	/* Slash */
	81: [ToneUtil.SCALE_MAP["C"], 4],		/* Q */
	50: [ToneUtil.SCALE_MAP["C#"], 4],		/* 2 */
	87: [ToneUtil.SCALE_MAP["D"], 4],		/* W */
	51: [ToneUtil.SCALE_MAP["D#"], 4],	/* 3 */
	69: [ToneUtil.SCALE_MAP["E"], 4],		/* E */
	82: [ToneUtil.SCALE_MAP["F"], 4],		/* R */
	53: [ToneUtil.SCALE_MAP["F#"], 4],		/* 5 */
	84: [ToneUtil.SCALE_MAP["G"], 4],	/* T */
	54: [ToneUtil.SCALE_MAP["G#"], 4],	/* 6 */
	89: [ToneUtil.SCALE_MAP["A"], 4],		/* Y */
	55: [ToneUtil.SCALE_MAP["A#"], 4],		/* 7 */
	85: [ToneUtil.SCALE_MAP["B"], 4],		/* U */
	73: [ToneUtil.SCALE_MAP["C"], 5],		/* I */
	57: [ToneUtil.SCALE_MAP["C#"], 5],		/* 9 */
	79: [ToneUtil.SCALE_MAP["D"], 5],		/* O */
	48: [ToneUtil.SCALE_MAP["D#"], 5],	/* 0 */
	80: [ToneUtil.SCALE_MAP["E"], 5],		/* P */
	219: [ToneUtil.SCALE_MAP["F"], 5],	/* [ */
	187: [ToneUtil.SCALE_MAP["F#"], 5],	/* Equal */
	221: [ToneUtil.SCALE_MAP["G"], 5],	/* ] */
	220: [ToneUtil.SCALE_MAP["G#"], 5],	/* Backslash */
};
/* === */

/* Piano Tools key map */
// Numpad 0~9 will be used for Piano Tools
const NUMPAD_KEY_MAP = {
	0: "Numpad0",
	1: "Numpad1",
	2: "Numpad2",
	3: "Numpad3",
	4: "Numpad4",
	5: "Numpad5",
	6: "Numpad6",
	7: "Numpad7",
	8: "Numpad8",
	9: "Numpad9"
};
/* === */
