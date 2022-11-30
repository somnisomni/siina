/*
 * Script for soundfont function
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

const preinstalledSoundfontWaves = {
	"sin": PCMGenerator.createSinWave,
	"saw": PCMGenerator.createSawWave,
	"tri": PCMGenerator.createTriWave,
	"sqr": PCMGenerator.createSqrWave
};

/* Sound Font class */
class Soundfont {
	// Members
	pcmCache = {};
	pcmWaveFunc = null;
	name = "Unnamed soundfont";
	
	// Constructor
	constructor(name, pcmWaveFunc) {
		if(name == undefined || pcmWaveFunc == undefined) {
			throw new Error("Required parameter missing.");
		}

		this.name = name;
		this.pcmWaveFunc = pcmWaveFunc;

		logDebug("Soundfont", `Soundfont ${this.name} has been constructed (PCM data not cached yet)`);
	}
	
	cache = async () => new Promise((resolve, reject) => {
		logDebug("Soundfont", `Caching PCM data of soundfont '${this.name}'...`);

		try {
			for(let octave = LOWEST_OCTAVE; octave <= HIGHEST_OCTAVE; octave++) {
				for(let scale = 0; scale <= 11; scale++) {
					this.pcmCache[`${scale}${octave}`] = this.pcmWaveFunc(FrequencyUtil.scaleToFreq(scale, octave), 1, 1);
				}
			}
		} catch { reject(); }

		if(this.isCached()) {
			logDebug("Soundfont", `PCM data of soundfont '${this.name}' has been cached successfully.`);

			resolve();
		} else {
			reject();
		}
	});

	isCached = () => {
		if(Object.keys(this.pcmCache).length == (12 * Math.abs(HIGHEST_OCTAVE - LOWEST_OCTAVE + 1))) {
			return true;
		} else {
			return false;
		}
	};

	destroy = () => {
		for(let i = 0; i <= this.pcmCache.length; i++) delete this.pcmCache[i];
		this.pcmCache = [];

		logDebug("Soundfont", `Soundfont '${this.name}' destroyed manually`);
	};
}
/* === */
