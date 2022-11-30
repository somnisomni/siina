/*
 * Script for Settings flyout
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

window.addEventListener("load", () => {
	(/*** Setting content UI build-up ***/ () => {
		const settingsParentContainer = $q("#right_flyout_container #settings_flyout_container");
		
		function buildSettingItem(settingCategory, settingName, defaultValue, settingType, title, description, settingData) {
			const itemContainer = $ce("div");
			itemContainer.classList.add("setting_item_container");
			itemContainer.dataset["setting"] = `${settingCategory}.${settingName}`;
			itemContainer.dataset["default"] = defaultValue;
			
			/* Title & Description container */
			const titleDescriptionContainer = $ce("div");
			titleDescriptionContainer.classList.add("setting_title_description_container");
			
			const titleElement = $ce("span");
			titleElement.classList.add("setting_title");
			titleElement.innerText = title;
			titleDescriptionContainer.append(titleElement);
			
			if(description) {
				const descriptionElement = $ce("span");
				descriptionElement.classList.add("setting_description");
				descriptionElement.innerText = description;
				titleDescriptionContainer.append(descriptionElement);
			}
			itemContainer.append(titleDescriptionContainer);
			/* === */
			
			/* Setting control element */
			let controlElement;
			
			if(settingType == "binary") {
				controlElement = $ce("input");
				controlElement.type = "checkbox";
			} else if(settingType == "enum") {
				if(!settingData) throw new Error("No enum data has given on argument `settingData`");
				
				controlElement = $ce("select");
				
				Object.keys(settingData).forEach((v) => {
					let optionElement = $ce("option");
					optionElement.setAttribute("name", v);
					optionElement.innerText = settingData[v];
					controlElement.add(optionElement);
				});
			} else if(settingType == "number") {
				controlElement = $ce("input");
				controlElement.type = "number";
				
				if(settingData && settingData.min) controlElement.setAttribute("min", parseInt(settingData.min));
				if(settingData && settingData.max) controlElement.setAttribute("max", parseInt(settingData.max));
			}
			
			controlElement.classList.add("setting_control");
			itemContainer.append(controlElement);
			/* === */
			
			return itemContainer;
		}

		function buildSettingViewFromJson(json) {
			const settingViewData = typeof(json) == "string" ? JSON.parse(json) : (typeof(json) == "object" ? json : null);
			const containerElement = $ce("div");
			containerElement.classList.add("settings_container");
			
			const categoryTitleElement = $ce("h2");
			categoryTitleElement.innerText = settingViewData.category_title;
			containerElement.append(categoryTitleElement);
			
			Object.keys(settingViewData.settings).forEach((v) => {
				const item = settingViewData.settings[v];
				let itemSettingData = null;
				
				if(item.type == "enum") itemSettingData = item.enum;
				else if(item.type == "number") itemSettingData = { "min": item.number_min, "max": item.number_max };
				
				containerElement.append(buildSettingItem(settingViewData.category_domain, v, item.default, item.type, item.title, item.description, itemSettingData));
			});
			
			return containerElement;
		}
		
		logDebug("Flyout - Settings", "Begin building settings flyout content...");
		settingsParentContainer.append(buildSettingViewFromJson(JSON_FLYOUT_SETTINGS_APPEARANCE));
		settingsParentContainer.append(buildSettingViewFromJson(JSON_FLYOUT_SETTINGS_PIANO_ROLL));
		settingsParentContainer.append(buildSettingViewFromJson(JSON_FLYOUT_SETTINGS_MOUSE));
		settingsParentContainer.append(buildSettingViewFromJson(JSON_FLYOUT_SETTINGS_KEYBOARD));
		settingsParentContainer.append(buildSettingViewFromJson(JSON_FLYOUT_SETTINGS_SOUNDFONT));
		logDebug("Flyout - Settings", "Settings flyout content built.");
	})();
	
	
	(/*** Setting content interaction ***/ () => {
		logDebug("Flyout - Settings", "Setting up settings flyout content...");
		
		$qa("#right_flyout_container #settings_flyout_container .setting_item_container").forEach((e) => {
			const settingName = e.dataset["setting"];
			const settingValue = settings.get(settingName, e.dataset["default"]);
			const controlElement = e.querySelector(".setting_control");
			let controlType = null;
			
			// Load setting value
			if(controlElement.tagName.toLowerCase() == "input") {
				if(controlElement.type == "checkbox") {
					controlElement.checked = (settingValue == "true" || settingValue == "1") ? true : false;
					controlType = "checkbox";
				} else if(controlElement.type == "number") {
					controlElement.value = settingValue;
					controlType = "number";
				}
			} else if(controlElement.tagName.toLowerCase() == "select") {
				try {
					controlElement.value = controlElement.namedItem(settingValue).innerText;
				} catch {
					controlElement.value = controlElement.namedItem(e.dataset["default"]).innerText;
				}
				controlType = "select";
			}
			
			// Add event listener for further changes
			controlElement.addEventListener("change", () => {
				if(controlType) {
					if(controlType == "checkbox") {
						settings.set(settingName, controlElement.checked);
					} else if(controlType == "select") {
						settings.set(settingName, controlElement.selectedOptions[0].getAttribute("name"));
					} else if(controlType == "number") {
						settings.set(settingName, controlElement.value);
					}
				}
			});

			// Initial setting save
			controlElement.dispatchEvent(new Event("change"));
		});
		
		logDebug("Flyout - Settings", "Completed setup for settings flyout content.");
	})();
});
