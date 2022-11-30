/*
 * Siina initialization script
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

console.info("★ Siina를 사용해 주셔서 감사합니다. 기술적인 의견이나 개선 사항 등이 있으면 언제든지 **** 메일로 알려주세요! ★", "\n\n20-700*****@**.***");

const settings = new Settings("sdsk.siina");
const engine = new Engine();
let REGISTERED_PIANO_KEYS = null;

(/*** Keyboard key events ***/ () => {
	keyCodeToPianoKeyObjMap = {};
	lastDownKeyCode = -1;
	
	window.addEventListener("keydown", (keyEvent) => {
		if(!Flyout.isAnyFlyoutShown() && settings.get("keyboard.enable_keyboard_play", true)) {
			const keyCode = keyEvent.keyCode;
			
			if(keyCode == lastDownKeyCode) return false;
			this.lastDownKeyCode = keyCode;
			
			if(KEY_SCALE_MAP[keyCode] == undefined) return true;
			
			const targetFreqIndex = `${KEY_SCALE_MAP[keyCode][0]}${KEY_SCALE_MAP[keyCode][1] + (keyEvent.shiftKey ? 1 : 0) + (parseInt(settings.get("keyboard.default_octave_offset", 0)))}`;
			const calculatedCode = FrequencyUtil.freqIndexToCode(targetFreqIndex);
			const pianoKeyObj = REGISTERED_PIANO_KEYS[calculatedCode];
			
			if(pianoKeyObj) {
				if(keyCodeToPianoKeyObjMap[keyCode] == undefined) {
					pianoKeyObj.pressKey();
					
					keyCodeToPianoKeyObjMap[keyCode] = pianoKeyObj;
				}
			} else {
				logError("Piano Roll - KeyEvent", "No piano key object found for keyboard key you pressed");
			}
			
			logDebug("Piano Roll - KeyEvent", "KEYDOWN", keyCode, calculatedCode);
		}
		
		return false;
	});
	
	window.addEventListener("keyup", (keyEvent) => {
		const keyCode = keyEvent.keyCode;
		lastDownKeyCode = -1;
		
		if(KEY_SCALE_MAP[keyCode] == undefined) return true;
		
		if(keyCodeToPianoKeyObjMap[keyCode] != undefined) {
			keyCodeToPianoKeyObjMap[keyCode].releaseKey();
		
			delete keyCodeToPianoKeyObjMap[keyCode];
		}

		logDebug("Piano Roll - KeyEvent","KEYUP", keyCode);
		
		return false;
	});
})();

(/*** Ignore Tab key ***/ () => {
	window.addEventListener("keydown", (event) => {
		if(IGNORE_TAB_KEY && event.keyCode == 9) {	// Tab key code = 9
			logDebug("Global - KeyEvent", "Tab key event ignored (keydown)");
			event.preventDefault();
			return false;
		}
	});
})();

(/*** Ignore Context Menu ***/ () => {
	window.addEventListener("contextmenu", (event) => {
		event.preventDefault();
		return false;
	});
})();

(/*** Set TabIndex to -1 for input/anchor elements ***/ () => {
	window.addEventListener("load", () => {
		$qa("input, select, a").forEach((e) => e.tabIndex = -1);
	});
})();

(/*** Apply appearance settings ***/ () => {
	window.addEventListener("load", () => {
		if(!settings.get("appearance.enable_filter_effect", true)) document.body.classList.add("no_filter");
		if(!settings.get("appearance.enable_transition", true)) document.body.classList.add("no_transition");
	});
})();

(/*** Top bar area & Soundfont ***/ () => {
	$q("#siina_top_container #voice_container #voice_max").innerHTML = MAX_VOICES;
	
	/* === Top bar events ===*/
	/* Scroll to top when click on title circle */
	$q("#siina_top_container #title_container i").addEventListener("click", () => { $id("sound_control_container").scrollTo(0, 0); });
	/* === */
	
	/* === Soundfont selection === */
	const soundfontSelectElem = $q("#siina_top_container #soundfont_container #soundfont_select_list");
	
	/* Soundfont selection change */
	soundfontSelectElem.addEventListener("change", async () => {
		const selectedValue = soundfontSelectElem.selectedOptions[0].attributes["name"].value;
		logDebug("Soundfont Selection", `Soundfont '${selectedValue}' selected and it is being loaded...`);

		await engine.loadNewSoundfont(new Soundfont(selectedValue, preinstalledSoundfontWaves[selectedValue]));
		settings.set("soundfont.last_selection", selectedValue);

		if(engine.loadedSoundfont != null) logDebug("Soundfont Selection", `Soundfont '${selectedValue}' has been loaded.`);
	});

	/* Load last selected soundfont */
	window.addEventListener("load", () => {
		if(settings.get("soundfont.enable_save_last_selection", true)
			&& settings.get("soundfont.last_selection")
			&& soundfontSelectElem.options[settings.get("soundfont.last_selection")]) {
			logDebug("Initialization", "Using last selected soundfont");
			soundfontSelectElem.value = soundfontSelectElem.options[settings.get("soundfont.last_selection")].innerText;
		} else {
			logDebug("Initialization", "Using default soundfont (index 0)");
			soundfontSelectElem.selectedIndex = 0;
		}
		
		soundfontSelectElem.dispatchEvent(new Event("change"));
	});
	/* === */

	/* === Voice slot availability === */
	engine.voiceManager.addEventListener("lengthupdate", () => {
		$q("#siina_top_container #soundfont_voice_container #voice_container #voice_current").innerHTML = engine.voiceManager.voiceLength;
	});
	/* === */
})();

(/*** Piano Roll ***/ () => {
	/* Piano Roll UI building */
	REGISTERED_PIANO_KEYS = PianoRollBuilder.buildInto($id("piano_roll_container"));
	/* === */
	
	window.addEventListener("load", async () => {
		/* Make F4 piano key is center of browser view */
		const pianoKeyF4Element = $q(`#piano_roll_container .piano_key[data-code='F4']`);
		
		if(pianoKeyF4Element) {
			$id("piano_roll_container").scrollTo(pianoKeyF4Element.offsetLeft - (window.innerWidth / 2) + (pianoKeyF4Element.offsetWidth / 2), 0);
		}
	});

	/* (temp) Piano Key - mouse up/down event */
	let mousePlayPressedPianoKeyObject = null;
	let lastMouseDownIsPianoKey = false;
	
	$id("piano_roll_container").addEventListener("pointerdown", (event) => {
		if(settings.get("mouse.enable_mouse_play", true)) {
			if(event.which == 1) {
				if(event.target.classList.contains("piano_key") && !event.target.classList.contains("pressed")) {
					logDebug("Piano Roll", "PIANO_KEY_POINTER_DOWN", event);
					lastMouseDownIsPianoKey = true;
					
					mousePlayPressedPianoKeyObject = REGISTERED_PIANO_KEYS[event.target.dataset["code"]];
					mousePlayPressedPianoKeyObject.pressKey();
				} else { lastMouseDownIsPianoKey = false; }
			}
		}
	});
	
	const mousePlayReleaseEventCallback = (event) => {
		if(lastMouseDownIsPianoKey) {
			logDebug("Piano Roll", "PIANO_KEY_POINTER_UP/CANCEL", event);
			mousePlayPressedPianoKeyObject.releaseKey();
			
			mousePlayPressedPianoKeyObject = null;
			lastMouseDownIsPianoKey = false;
			pianoRollMouseScrollActivated = false;
		}
	};
	
	window.addEventListener("pointerup", mousePlayReleaseEventCallback);
	window.addEventListener("pointercancel", mousePlayReleaseEventCallback);

	/* === */
	
	/* Piano roll scroll events */
	let pianoRollMouseScrollActivated = false;
	
	$id("piano_roll_container").addEventListener("mousemove", (event) => {
		if(settings.get("piano_roll.enable_mouse_drag_scroll", true)) {
			if(event.buttons == 1) {
				if(Math.abs(event.movementX) >= parseInt(settings.get("piano_roll.mouse_drag_scroll_threshold", 8)) && !pianoRollMouseScrollActivated) {	// Scroll guard
					pianoRollMouseScrollActivated = true;
					logDebug("Piano Roll", "Piano roll area mouse scroll activated");
				}
				
				if(pianoRollMouseScrollActivated) $id("piano_roll_container").scrollLeft += -event.movementX;
			}
		}
	});
	
	$id("piano_roll_container").addEventListener("mousewheel", (event) => {
		$id("piano_roll_container").scrollBy(event.deltaY, 0);
	}, { passive: true });
	/* === */
	
	/* Piano Tools initialize */
	let pianoToolsNumpadOffset = 1;
	
	$qa("#piano_tools_container .piano_tool_item").forEach((e) => {
		if(e.classList.contains("toggleable")) {
			e.setAttribute("data-numpad", pianoToolsNumpadOffset++);
			
			e.addEventListener("click", () => {
				let result = e.classList.toggle("enabled");
				
				PianoToolsHandler.handle(e.dataset.toolName, result);
			});
		}
	});
	
	window.addEventListener("keypress", (e) => {
		if(!Flyout.isAnyFlyoutShown() && Object.values(NUMPAD_KEY_MAP).indexOf(e.code) >= 0) {		// Numpad numbers
			const toolItem = $q(`#piano_tools_container .piano_tool_item[data-numpad="${e.key}"]`);
			
			if(toolItem) toolItem.click();
		}
	});
	/* === */
})();

(/*** Flyout ***/ () => {
	const rightFlyout = new Flyout($id("right_flyout_container"));
	$qa("#siina_top_container #icons_container .flyout_initiator").forEach((e) => Flyout.registerClickEventForInitiator(e, rightFlyout));
	$q("#right_flyout_container .flyout_content[data-name='info'] iframe").src += `?ver=${VERSION}`;
})();
