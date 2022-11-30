/*
 * Script for overall piano core functions
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

 /* Voice Manager class */
class VoiceManager extends EventTarget {
	/**
		Events fire:
			`lengthupdate` ─ Fired when 'voiceLength' has been updated
			`playstart` ─ Fired when starting play AudioChunk on voice slot and it's successful
			`playstop` ─ Fired when stopping play AudioChunk on voice slot and it's successful
	**/
	
	// Members
	voiceSlot = [];
	voiceLength = 0;
	
	// Constructor
	constructor() {
		super();
		
		for(let i = 0; i < MAX_VOICES; i++) {
			this.voiceSlot[i] = AudioChunkGenerator.createEmpty();
		}
	}
	
	// Functions
	getFirstAvailableSlot = () => {
		let firstAvailableSlot = -1;
		
		for(let index in this.voiceSlot) {
			index = parseInt(index);
			
			if(!this.voiceSlot[index].isLoaded() && !this.voiceSlot[index].isPlaying()) {
				firstAvailableSlot = index;
				break;
			} else continue;
		}
		
		return firstAvailableSlot;
	};

	loadBufferOnSlot = (slot, pcmData) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");

		this.voiceSlot[slot].loadBuffer(pcmData);
		this.voiceLength += 1;

		super.dispatchEvent(new Event("lengthupdate"));
	};

	unloadBufferOnSlot = async (slot) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");
		if(!this.voiceSlot[slot].isLoaded()) throw new Error("AudioChunk on this voice slot has not been loaded.");

		await this.voiceSlot[slot].unloadBuffer();
		this.voiceLength -= 1;

		super.dispatchEvent(new Event("lengthupdate"));
	};

	startLoopPlayOnSlot = (slot) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");
		if(!this.voiceSlot[slot].isLoaded()) throw new Error("AudioChunk on this voice slot has not been loaded.");

		this.voiceSlot[slot].play(true);
		if(this.voiceSlot[slot].isPlaying()) super.dispatchEvent(new Event("playstart"));
	};

	stopPlayOnSlot = async (slot) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");
		if(!this.voiceSlot[slot].isLoaded()) throw new Error("AudioChunk on this voice slot has not been loaded.");

		await this.voiceSlot[slot].stop();
		await this.unloadBufferOnSlot(slot);
		if(!this.voiceSlot[slot].isPlaying()) super.dispatchEvent(new Event("playstop"));
	};
}
/* === */

/* Engine */
class Engine {
	// Members
	voiceManager = new VoiceManager();
	loadedSoundfont = null;

	// Constructor
	constructor() {
		if(this.loadedSoundfont && !this.loadedSoundfont.isCached()) {
			this.loadedSoundfont.cache();
		}
	}

	playPcmOnAvailableVoiceSlot = (pcmData) => {
		let assignedSlot = this.voiceManager.getFirstAvailableSlot();

		this.voiceManager.loadBufferOnSlot(assignedSlot, pcmData);
		this.voiceManager.startLoopPlayOnSlot(assignedSlot);

		return assignedSlot;
	};
	
	stopPlayOnVoiceSlot = this.voiceManager.stopPlayOnSlot;

	stopAllAudio = () => {
		for(let i = 0; i < MAX_VOICES; i++) {
			try {
				this.voiceManager.stopPlayOnSlot(i);
			} catch { }
		}
	};

	loadNewSoundfont = async (soundfont) => {
		if(this.loadedSoundfont) this.loadedSoundfont.destroy();
		
		this.loadedSoundfont = soundfont;

		if(!this.loadedSoundfont.isCached()) {
			await AsyncDialog.showAwaitDialog("사운드폰트 데이터를 캐싱 중입니다. 잠시만 기다려주세요...", this.loadedSoundfont.cache);
		}
	};
}
/* === */
