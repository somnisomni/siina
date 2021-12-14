/*
 * Dialog for async work
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* AsyncDialog */
class AsyncDialog extends StaticClass {
	static isAnyDialogShown() {
		return document.body.classList.contains("dialog_shown") || false;
	}

	static async showAwaitDialog(message, promiseCallback) {
		const dialogElement = $ce("dialog");
		dialogElement.id = "async_dialog";
		dialogElement.innerHTML = `<span>${message}</span>`;
		document.body.appendChild(dialogElement);

		await sleepAsync(25);
		dialogElement.showModal();
		document.body.classList.add("dialog_shown");
		await sleepAsync(25);

		const promiseResult = await promiseCallback();

		await sleepAsync(25);
		dialogElement.close();
		document.body.classList.remove("dialog_shown");
		await sleepAsync(25);
		setTimeout(() => { dialogElement.remove(); }, 1000);

		return promiseResult;
	}
	
	static async showInputDialog(title, hintMessage = null, defaultValue = null, numeric = false, textarea = false, readonly = false) {
		return new Promise(async (resolve, reject) => {
			const dialogElement = $ce("dialog");
			const titleElement = $ce("div");
			const inputElement = $ce(textarea ? "textarea" : "input");
			const controlContainer = $ce("div");
			const okButtonElement = $ce("button");
			const cancelButtonElement = $ce("button");

			dialogElement.id = "async_dialog";
			dialogElement.classList.add("input");
			dialogElement.addEventListener("keydown", (e) => {
				if(e.keyCode === 27) {
					e.preventDefault();
					e.stopImmediatePropagation();
					e.stopPropagation();

					cancelButtonElement.click();
				}
			});

			titleElement.innerText = title;
			titleElement.classList.add("title");
			dialogElement.append(titleElement);
			
			if(hintMessage) {
				const descriptionElement = $ce("div");
				descriptionElement.innerText = hintMessage;
				descriptionElement.classList.add("description");
				dialogElement.append(descriptionElement);
			}

			inputElement.readOnly = readonly;
			if(!textarea) inputElement.type = numeric ? "number" : "text";
			if(defaultValue) inputElement.value = defaultValue;
			if(hintMessage) inputElement.placeholder = hintMessage;
			inputElement.addEventListener("keypress", (e) => {
				if(!textarea && e.keyCode === 13) {
					okButtonElement.click();
				}
			});
			dialogElement.append(inputElement);

			controlContainer.classList.add("controls");

			okButtonElement.innerText = "확인";
			okButtonElement.addEventListener("click", async () => {
				resolve(inputElement.value);

				await sleepAsync(25);
				dialogElement.close();
				document.body.classList.remove("dialog_shown");
				await sleepAsync(25);
				setTimeout(() => { dialogElement.remove(); }, 1000);
			});
			controlContainer.append(okButtonElement);

			cancelButtonElement.innerText = "취소";
			cancelButtonElement.addEventListener("click", async () => {
				reject();

				await sleepAsync(25);
				dialogElement.close();
				document.body.classList.remove("dialog_shown");
				await sleepAsync(25);
				setTimeout(() => { dialogElement.remove(); }, 1000);
			});
			controlContainer.append(cancelButtonElement);

			dialogElement.append(controlContainer);
			document.body.appendChild(dialogElement);
			
			await sleepAsync(25);
			dialogElement.showModal();
			document.body.classList.add("dialog_shown");
			await sleepAsync(25);
		});
	}
}
