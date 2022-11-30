/*
 * Script for processing keyboard key event
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* Key - Audio scale map */
// Using QWERTY keymap; Scale mapping based on FL Studio

// KEYCODE: [SCALE INDEX, OCTAVE]
const KEY_SCALE_MAP = {
	90: [FrequencyUtil.SCALE_MAP.C, 3],		/* Z */
	83: [FrequencyUtil.SCALE_MAP.C_SHARP, 3],		/* S */
	88: [FrequencyUtil.SCALE_MAP.D, 3],		/* X */
	68: [FrequencyUtil.SCALE_MAP.D_SHARP, 3],	/* D */
	67: [FrequencyUtil.SCALE_MAP.E, 3],		/* C */
	86: [FrequencyUtil.SCALE_MAP.F, 3],		/* V */
	71: [FrequencyUtil.SCALE_MAP.F_SHARP, 3],		/* G */
	66: [FrequencyUtil.SCALE_MAP.G, 3],	/* B */
	72: [FrequencyUtil.SCALE_MAP.G_SHARP, 3],	/* H */
	78: [FrequencyUtil.SCALE_MAP.A, 3],		/* N */
	74: [FrequencyUtil.SCALE_MAP.A_SHARP, 3],		/* J */
	77: [FrequencyUtil.SCALE_MAP.B, 3],		/* M */
	188: [FrequencyUtil.SCALE_MAP.C, 4],	/* Comma */
	76: [FrequencyUtil.SCALE_MAP.C_SHARP, 4],		/* L */
	190: [FrequencyUtil.SCALE_MAP.D, 4],	/* Period */
	186: [FrequencyUtil.SCALE_MAP.D_SHARP, 4],	/* Semicolon */
	191: [FrequencyUtil.SCALE_MAP.E, 4],	/* Slash */
	81: [FrequencyUtil.SCALE_MAP.C, 4],		/* Q */
	50: [FrequencyUtil.SCALE_MAP.C_SHARP, 4],		/* 2 */
	87: [FrequencyUtil.SCALE_MAP.D, 4],		/* W */
	51: [FrequencyUtil.SCALE_MAP.D_SHARP, 4],	/* 3 */
	69: [FrequencyUtil.SCALE_MAP.E, 4],		/* E */
	82: [FrequencyUtil.SCALE_MAP.F, 4],		/* R */
	53: [FrequencyUtil.SCALE_MAP.F_SHARP, 4],		/* 5 */
	84: [FrequencyUtil.SCALE_MAP.G, 4],	/* T */
	54: [FrequencyUtil.SCALE_MAP.G_SHARP, 4],	/* 6 */
	89: [FrequencyUtil.SCALE_MAP.A, 4],		/* Y */
	55: [FrequencyUtil.SCALE_MAP.A_SHARP, 4],		/* 7 */
	85: [FrequencyUtil.SCALE_MAP.B, 4],		/* U */
	73: [FrequencyUtil.SCALE_MAP.C, 5],		/* I */
	57: [FrequencyUtil.SCALE_MAP.C_SHARP, 5],		/* 9 */
	79: [FrequencyUtil.SCALE_MAP.D, 5],		/* O */
	48: [FrequencyUtil.SCALE_MAP.D_SHARP, 5],	/* 0 */
	80: [FrequencyUtil.SCALE_MAP.E, 5],		/* P */
	219: [FrequencyUtil.SCALE_MAP.F, 5],	/* [ */
	187: [FrequencyUtil.SCALE_MAP.F_SHARP, 5],	/* Equal */
	221: [FrequencyUtil.SCALE_MAP.G, 5],	/* ] */
	220: [FrequencyUtil.SCALE_MAP.G_SHARP, 5],	/* Backslash */
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
