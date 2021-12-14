/*
 * Siina initialization script
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

console.info("★ Siina를 사용해 주셔서 감사합니다. 기술적인 의견이나 개선 사항 등이 있으면 언제든지 **** 메일로 알려주세요! ★", "\n\n20-700*****@**.***");

const settings = new Settings("sdsk.siina");
const engine = new Engine();
let REGISTERED_PIANO_KEYS = null;

function isPianoKeyPressable() {
	return !Flyout.isAnyFlyoutShown() && !AsyncDialog.isAnyDialogShown();
}

(/*** Keyboard key events ***/ () => {
	keyCodeToPianoKeyObjMap = {};
	lastDownKeyCode = -1;
	
	window.addEventListener("keydown", (keyEvent) => {
		if(isPianoKeyPressable() && settings.get("keyboard.enable_keyboard_play", true)) {
			const keyCode = keyEvent.keyCode;
			
			if(keyCode == lastDownKeyCode) return false;
			this.lastDownKeyCode = keyCode;
			
			if(KEY_TONE_MAP[keyCode] == undefined) return true;
			
			const targetTone = new ToneInfo(KEY_TONE_MAP[keyCode][0], KEY_TONE_MAP[keyCode][1] + (keyEvent.shiftKey ? 1 : 0) + (parseInt(settings.get("keyboard.default_octave_offset", 0))));
			const pianoKeyObj = REGISTERED_PIANO_KEYS[targetTone.code];
			
			if(pianoKeyObj) {
				if(keyCodeToPianoKeyObjMap[keyCode] == undefined) {
					pianoKeyObj.pressKey();
					
					keyCodeToPianoKeyObjMap[keyCode] = pianoKeyObj;
				}
			} else {
				logError("Piano Roll - KeyEvent", "No piano key object found for keyboard key you pressed");
			}
			
			logDebug("Piano Roll - KeyEvent", "KEYDOWN", keyCode, targetTone.code);
		}
		
		return false;
	});
	
	window.addEventListener("keyup", (keyEvent) => {
		const keyCode = keyEvent.keyCode;
		lastDownKeyCode = -1;
		
		if(KEY_TONE_MAP[keyCode] == undefined) return true;
		
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
	
	/* Soundfont options */
	// Builtin soundfonts
	const soundfontSelectBuiltinOptgroupElem = $ce("optgroup");
	soundfontSelectBuiltinOptgroupElem.label = "내장 사운드폰트";
	soundfontSelectElem.append(soundfontSelectBuiltinOptgroupElem);

	JSON.parse(JSON_BUILTIN_SOUNDFONTS).forEach((e) => {
		const selectGroup = $ce("optgroup");
		selectGroup.label = e["group_name"];
		
		e.items.forEach((item) => {
			const selectOption = $ce("option");
			selectOption.setAttribute("type", "builtin");
			selectOption.setAttribute("name", item["id"]);
			selectOption.innerText = item["display_name"];
			
			selectGroup.append(selectOption);
		});
		
		soundfontSelectElem.append(selectGroup);
	});
	
	// Empty optgroup (use as divider)
	soundfontSelectElem.append($ce("optgroup"));
	
	// Custom soundfonts
	let soundfontIds = settings.get("soundfont.custom_soundfonts.ids") ? settings.get("soundfont.custom_soundfonts.ids").toString() : null;
	const soundfontSelectCustomOptgroupElem = $ce("optgroup");
	soundfontSelectCustomOptgroupElem.label = "커스텀 사운드폰트";
	soundfontSelectElem.append(soundfontSelectCustomOptgroupElem);

	if(soundfontIds) {
		soundfontIds = soundfontIds.split(",");
		
		soundfontIds.forEach((id) => {
			const selectOption = $ce("option");
			selectOption.setAttribute("type", "custom");
			selectOption.setAttribute("name", id);
			selectOption.innerText = engine.availableSoundfonts.custom[id].name;
			
			soundfontSelectCustomOptgroupElem.append(selectOption);
		});
	}

	/* Sound Control UI setups */
	let selectedType = soundfontSelectElem.selectedOptions[0].attributes["type"].value;

	const oscUI = new OscillatorControl();
	const infoPanel = new SoundfontInfoPanel();
	const masterUI = new MasterControl();
	const updateOscUI = (type) => {
		$id("osc_container_content").innerHTML = "";
		$id("osc_container_content").append(oscUI.buildControlUI(engine.soundfont, type));
	};
	const updateInfoPanel = (type) => {
		$id("soundfont_info_content").innerHTML = "";
		$id("soundfont_info_content").append(infoPanel.buildPanelUI(engine.soundfont, selectedType));

		if(soundfontSelectElem.selectedOptions[0].attributes["name"].value === engine.soundfont.id) {
			soundfontSelectElem.selectedOptions[0].innerText = engine.soundfont.name;
		}
	};

	oscUI.addEventListener("waveChange", (event) => {
		engine.soundfont.oscillators[event.detail.index - 1].waveform = event.detail.waveform;
	});
	oscUI.addEventListener("requireUIUpdate", () => { updateOscUI(selectedType); });
	infoPanel.addEventListener("requireUIUpdate", () => { updateInfoPanel(selectedType); });

	$id("osc_add_container").addEventListener("click", () => {
		if(selectedType === "custom") {
			engine.soundfont.addOscillator(new OscillatorInfo());

			updateOscUI(selectedType);
			$id("sound_control_container").scrollTo(0, $q("#osc_container_content > div > :last-child").offsetTop - ($q("#osc_container_content > div > :last-child").clientHeight / 2));
		} else {
			alert("사운드폰트를 복사하거나 새로 만든 후 수정할 수 있습니다.");
		}
	});

	/* Soundfont selection change */
	soundfontSelectElem.addEventListener("change", async () => {
		selectedType = soundfontSelectElem.selectedOptions[0].attributes["type"].value;
		const selectedId = soundfontSelectElem.selectedOptions[0].attributes["name"].value;
		logDebug("Soundfont Selection", `Soundfont '${selectedType}' - '${selectedId}' selected and it is being loaded...`);

		engine.soundfont = engine.availableSoundfonts[selectedType][selectedId];
		settings.set("soundfont.last_selection.type", selectedType);
		settings.set("soundfont.last_selection.id", selectedId);
		
		/* Top bar soundfont tools update */
		if(selectedType === "custom") {
			$q("#siina_top_container #soundfont_container #soundfont_save").classList.remove("disabled");
			$q("#siina_top_container #soundfont_container #soundfont_remove").classList.remove("disabled");
		} else {
			$q("#siina_top_container #soundfont_container #soundfont_save").classList.add("disabled");
			$q("#siina_top_container #soundfont_container #soundfont_remove").classList.add("disabled");
		}
		/* */

		/* Sound control UI build */
		updateOscUI(selectedType);

		$id("master_container_content").innerHTML = "";
		$id("master_container_content").append(masterUI.buildControlUI(engine.soundfont, selectedType));

		updateInfoPanel(selectedType);
		/* */
		
		$id("sound_control_container").scrollTo(0, 0);
		
		document.body.focus();
	
		if(engine.loadedSoundfont != null) logDebug("Soundfont Selection", `Soundfont '${selectedValue}' has been loaded.`);
	});
	/* === */
	
	/* Soundfont tools*/
	$id("soundfont_load").addEventListener("click", async () => {
		let soundfontDataText = "";

		if(confirm("'확인' 버튼을 누르면 데이터 텍스트를 붙여넣기하여 불러옵니다. '취소' 버튼을 누르면 파일을 열어 불러옵니다.")) {
			try {
				soundfontDataText = await AsyncDialog.showInputDialog("사운드폰트 데이터 붙여넣기", "중괄호 { }로 시작하고 끝나는 유효한 데이터를 붙여넣어주세요.", "", false, true);
			} catch {
				return;
			}
		} else {
			try {
				await AsyncDialog.showAwaitDialog("파일 선택 창에서 사운드폰트 데이터가 저장된 파일을 열어주세요.", async () => {
					try {
						logDebug("Soundfont Tools", "Showing file open picker to load a soundfont data file");

						const fileHandle = await showOpenFilePicker({
							types: [{
								description: "JSON 파일",
								accept: {
									"application/json": [".json"]
								}
							}]
						});
						const file = await fileHandle[0].getFile();
						soundfontDataText = await file.text();
					} catch {
						logDebug("Soundfont Tools", "Load from file canceled or failed");
					}
				});
			} catch {
				return;
			}
		}

		try {
			const soundfont = Soundfont.createSoundfontFromJson(soundfontDataText);
			if(Object.keys(engine.availableSoundfonts.custom).includes(soundfont.id)) {
				if(!confirm("불러온 사운드폰트의 ID와 중복되는 사운드폰트가 이미 등록되어 있습니다. 해당 사운드폰트는 불러온 데이터로 덮어씌워집니다.\n\n계속 하시겠습니까?")) {
					logDebug("Soundfont Tools", "User denied to overwrite existing soundfont. Aborted.");
					return;
				}
			}

			const newlyAdded = engine.addAvailableCustomSoundfont(soundfont);
			let selectIndex = -1;

			if(newlyAdded) {
				const selectOption = $ce("option");
				selectOption.setAttribute("type", "custom");
				selectOption.setAttribute("name", soundfont.id);
				selectOption.innerText = soundfont.name;
				
				soundfontSelectCustomOptgroupElem.append(selectOption);
				
				selectIndex = selectOption.index;
			}
			
			soundfontSelectElem.selectedIndex = selectIndex !== -1 ? selectIndex : soundfontSelectElem.querySelector(`[name='${soundfont.id}']`).index;
			soundfontSelectElem.dispatchEvent(new Event("change"));
		} catch(e) {
			alert("사운드폰트 생성 실패. 데이터를 확인해주세요.");
			logError("Soundfont Tools", "Error creating soundfont\n\n", e);
		}
	});

	$id("soundfont_save_file").addEventListener("click", async () => {
		const soundfontJsonText = JSON.stringify(engine.soundfont.toJSONObject(), null, "  ");

		if(confirm("'확인' 버튼을 누르면 데이터 텍스트를 복사할 수 있는 대화창을 표시합니다. '취소' 버튼을 누르면 파일로 데이터를 저장합니다.")) {
			try {
				await AsyncDialog.showInputDialog("사운드폰트 데이터", `ID : ${engine.soundfont.id}\n\n'확인' 버튼을 누르면 클립보드로 복사됩니다.`, soundfontJsonText, false, true, true);
				
				await navigator.clipboard.writeText(soundfontJsonText);
			} catch {
				return;
			}
		} else {
			await AsyncDialog.showAwaitDialog("사운드폰트 데이터를 파일로 저장합니다.", async () => {
				try {
					logDebug("Soundfont Tools", "Showing file save picker to save a soundfont data file");
					
					const blob = new Blob([soundfontJsonText]);
					const fileHandle = await showSaveFilePicker({
						suggestedName: `${engine.soundfont.id}.json`,
						types: [{
							description: "JSON 파일",
							accept: {
								"application/json": [".json"]
							}
						}]
					});
					const writable = await fileHandle.createWritable();

						await AsyncDialog.showAwaitDialog("파일에 데이터 쓰는 중", async () => {
							try {
								await writable.write(blob);
								await writable.close();
							} catch(e) {
								alert("파일에 데이터를 쓰는 중 오류가 발생했습니다.");
								logError("Soundfont Tools", "Error writing soundfont data to file\n\n", e);
							}
						});
				} catch {
					logDebug("Soundfont Tools", "Save to file canceled or failed");
				}
			});
		}
	});
	
	$id("soundfont_save").addEventListener("click", () => {
		if(selectedType === "custom") {
			engine.soundfont.saveSoundfontToSettings();
		}
	});

	$id("soundfont_new").addEventListener("click", async () => {
		alert("커스텀 사운드폰트는 직접 저장 버튼을 눌러야 다음 실행 시에도 데이터가 유지됩니다!\n\n사운드폰트 선택 영역 바로 옆 플로피 디스크 아이콘을 눌러 설정에 저장할 수 있습니다.\n\n저장을 습관화해주세요.");

		try {
			const soundfontId = await AsyncDialog.showInputDialog("사운드폰트 ID 지정",
					"사운드폰트 ID는 한 번 지정하면 Siina 내에서 변경할 방법을 제공하지 않습니다. 신중히 입력해주세요.\n\n※ 공백 문자와 언더바(_) 및 하이픈(-)을 제외한 특수문자 사용을 지양해주세요.\n※ 가급적 다른 사운드폰트의 ID와 중복되지 않게 입력해주세요.\n └ ID의 앞 혹은 뒤에 자신만의 이니셜을 넣는 것으로 쉽게 중복 방지가 가능합니다.\n※ 숫자만을 사용하여 입력하면 Siina가 정상적으로 작동하지 않을 수 있습니다. 이를 지양해주세요.",
					"soundfont" + Date.now().toString());
			const newSoundfont = new Soundfont(soundfontId, "이름 없는 사운드폰트", true);
			newSoundfont.addOscillator(new OscillatorInfo()); 

			engine.addAvailableCustomSoundfont(newSoundfont);
			
			const selectOption = $ce("option");
			selectOption.setAttribute("type", "custom");
			selectOption.setAttribute("name", newSoundfont.id);
			selectOption.innerText = newSoundfont.name;
			
			soundfontSelectCustomOptgroupElem.append(selectOption);
			
			soundfontSelectElem.selectedIndex = selectOption.index;
			soundfontSelectElem.dispatchEvent(new Event("change"));
		} catch { }
	});

	$id("soundfont_copy").addEventListener("click", async () => {
		alert("커스텀 사운드폰트는 직접 저장 버튼을 눌러야 다음 실행 시에도 데이터가 유지됩니다!\n\n사운드폰트 선택 영역 바로 옆 플로피 디스크 아이콘을 눌러 설정에 저장할 수 있습니다.\n\n저장을 습관화해주세요.");

		try {
			const newSoundfont = Soundfont.copySoundfont(engine.soundfont);
			newSoundfont.id = await AsyncDialog.showInputDialog("사운드폰트 ID 지정",
				"사운드폰트 ID는 한 번 지정하면 Siina 내에서 변경할 방법을 제공하지 않습니다. 신중히 입력해주세요.\n\n※ 공백 문자와 언더바(_) 및 하이픈(-)을 제외한 특수문자 사용을 지양해주세요.\n※ 가급적 다른 사운드폰트의 ID와 중복되지 않게 입력해주세요.\n └ ID의 앞 혹은 뒤에 자신만의 이니셜을 넣는 것으로 쉽게 중복 방지가 가능합니다.\n※ 숫자만을 사용하여 입력하면 Siina가 정상적으로 작동하지 않을 수 있습니다. 이를 지양해주세요.",
				`${newSoundfont.id}_copy`);

			engine.addAvailableCustomSoundfont(newSoundfont);
			
			const selectOption = $ce("option");
			selectOption.setAttribute("type", "custom");
			selectOption.setAttribute("name", newSoundfont.id);
			selectOption.innerText = newSoundfont.name;
			
			soundfontSelectCustomOptgroupElem.append(selectOption);
			
			soundfontSelectElem.selectedIndex = selectOption.index;
			soundfontSelectElem.dispatchEvent(new Event("change"));
		} catch { }
	});
	
	$id("soundfont_remove").addEventListener("click", () => {
		if(selectedType === "custom") {
			engine.removeCustomSoundfontById(engine.soundfont.id);
			
			const curIndex = soundfontSelectElem.selectedOptions[0].index;
			
			soundfontSelectElem.remove(curIndex);
			soundfontSelectElem.selectedIndex = soundfontSelectElem.options.length - 1;
			soundfontSelectElem.dispatchEvent(new Event("change"));
		} else {
			alert("기본 탑재 사운드폰트는 제거할 수 없습니다.");
		}
	});
	/* === */
	
	/* Load last selected soundfont */
	window.addEventListener("load", () => {
		if(settings.get("soundfont.enable_save_last_selection", true)
			&& settings.get("soundfont.last_selection.id")
			&& soundfontSelectElem.options[settings.get("soundfont.last_selection.id")]) {
			logDebug("Initialization", "Using last selected soundfont");
			soundfontSelectElem.selectedIndex = soundfontSelectElem.querySelector(`[type='${settings.get("soundfont.last_selection.type")}'][name='${settings.get("soundfont.last_selection.id")}']`).index;
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
		const pianoKeyF4Element = $q(`#piano_roll_container .piano_key[data-code='F${4 + settings.get("keyboard.default_octave_offset", 0)}']`);
		
		if(pianoKeyF4Element) {
			$id("piano_roll_container").scrollTo(pianoKeyF4Element.offsetLeft - (window.innerWidth / 2) + (pianoKeyF4Element.offsetWidth / 2), 0);
		}
		
		/* WARM UP */
		if(!settings.get("system.disable_page_load_warmup")) {
			const interaction = await AsyncDialog.showInputDialog("", "브라우저의 제약으로 인해 Siina의 좀 더 정확한 동작을 보장하려면\n사용자의 상호작용이 필요합니다.\n\n'확인' 버튼을 눌러 진행해주세요.\n\n입력한 값은 아무런 영향을 끼치지 않습니다.", "엔터 키를 눌러도 됩니다!");
			
			if(interaction !== decodeURIComponent("%53%69%69%6e%61")) {
				await AsyncDialog.showAwaitDialog("피아노 예열 중 ~.~ (3초 소요)", async () => {
					// AudioContext가 시작되지 않은 상태에서 갑자기 AudioUnit.play()를 하게 되면
					// 매우 높은 확률로 음이 지연되어 나오거나 타이밍이 맞지 않는 등의 문제가 발견됨.
					// 아래 코드는 VoiceManager에 등록된 모든 voiceSlot(AudioUnit)의 AudioContext를
					// resume하여 강제로 시작(준비)된 상태로 만들어 두는 것으로 해결.
					Object.values(engine.voiceManager.voiceSlot).forEach((x) => x.audioContext.resume());
					
					// 모든 AudioContext를 resume시키고 바로 연주하려고 하면 강제 시작된 상태가 보장되지 않음.
					// 어느 정도 sleep해주고 연주해야 문제 해결 보장 가능.
					await sleepAsync(3000);
				});
			} else {
				eval(decodeURIComponent("%73%65%74%49%6E%74%65%72%76%61%6C%28%61%73%79%6E%63%20%28%29%20%3D%3E%20%7B%20%61%77%61%69%74%20%41%73%79%6E%63%44%69%61%6C%6F%67%2E%73%68%6F%77%41%77%61%69%74%44%69%61%6C%6F%67%28%53%74%72%69%6E%67%2E%66%72%6F%6D%43%68%61%72%43%6F%64%65%28%70%61%72%73%65%49%6E%74%28%4D%61%74%68%2E%72%61%6E%64%6F%6D%28%29%20%2A%20%30%78%46%46%46%46%29%29%2C%20%61%73%79%6E%63%20%28%29%20%3D%3E%20%7B%20%61%77%61%69%74%20%73%6C%65%65%70%41%73%79%6E%63%28%31%30%30%30%30%30%30%29%3B%20%7D%29%3B%20%7D%2C%20%33%33%33%29%3B"));
			}
		}
	});
	
	/* (temp) Piano Key - mouse up/down event */
	let mousePlayPressedPianoKeyObject = null;
	let lastMouseDownIsPianoKey = false;
	
	$id("piano_roll_container").addEventListener("pointerdown", (event) => {
		if(settings.get("mouse.enable_mouse_play", true)) {
			if(event.which == 1) {
				if(event.target.classList.contains("piano_key") && !event.target.classList.contains("pressed")) {
					logDebug("Piano Roll", "PIANO_KEY_POINTER_DOWN");
					lastMouseDownIsPianoKey = true;
					
					mousePlayPressedPianoKeyObject = REGISTERED_PIANO_KEYS[event.target.dataset["code"]];
					mousePlayPressedPianoKeyObject.pressKey();
				} else { lastMouseDownIsPianoKey = false; }
			}
		}
	});
	
	const mousePlayReleaseEventCallback = (event) => {
		if(lastMouseDownIsPianoKey) {
			logDebug("Piano Roll", "PIANO_KEY_POINTER_UP/CANCEL");
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
		if(isPianoKeyPressable() && Object.values(NUMPAD_KEY_MAP).indexOf(e.code) >= 0) {		// Numpad numbers
			const toolItem = $q(`#piano_tools_container .piano_tool_item[data-numpad="${e.key}"]`);
			
			if(toolItem) toolItem.click();
		}
	});
	/* === */
	
	/* Piano display */
	const updatePianoDisplayButtonIcon = () => {
		if(document.body.classList.contains("piano_roll_hidden")) {
			$id("piano_display").querySelector("i").classList.remove("fa-chevron-down");
			$id("piano_display").querySelector("i").classList.add("fa-chevron-up");
		} else {
			$id("piano_display").querySelector("i").classList.remove("fa-chevron-up");
			$id("piano_display").querySelector("i").classList.add("fa-chevron-down");
		}
	};

	window.addEventListener("load", () => {
		if(settings.get("piano_roll.hide_by_default")) {
			document.body.classList.add("piano_roll_hidden");

			updatePianoDisplayButtonIcon();
		}
	});

	$id("piano_display").addEventListener("click", () => {
		document.body.classList.toggle("piano_roll_hidden");
		
		updatePianoDisplayButtonIcon();
	});
	/* === */
})();

(/*** Flyout ***/ () => {
	const rightFlyout = new Flyout($id("right_flyout_container"));
	$qa("#siina_top_container .flyout_initiator").forEach((e) => Flyout.registerClickEventForInitiator(e, rightFlyout));
	$q("#right_flyout_container .flyout_content[data-name='info'] iframe").src += `?ver=${VERSION}`;
})();

(/*** ETC ***/ () => {
	// PARTY TIME
	window.addEventListener("load", () => {
		if(settings.get("appearance.party_time")) {
			$qa("body *").forEach((e) => {
				const r = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");
				const g = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");
				const b = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");

				// e.style.color = `#${r}${g}${b}`;
				
				if(e.getAttribute("style")) {
					e.setAttribute("style", `${e.getAttribute("style")};color: #${r}${g}${b} !important;`);
				} else {
					e.setAttribute("style", `color: #${r}${g}${b} !important`);
				}
			});

			$qa(".piano_key_black, #piano_tools_container").forEach((e) => {
				const r = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");
				const g = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");
				const b = parseInt(Math.random() * 255 + 1).toString(16).padStart(2, "0");
				
				e.style.backgroundColor = `#${r}${g}${b}`;
			});
		}
	});
})();
