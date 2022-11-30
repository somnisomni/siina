/*
 * Dialog for async work
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* AsyncDialog */
class AsyncDialog extends StaticClass {
	static showAwaitDialog = async (message, promiseCallback) => {
		const dialogElement = $ce("dialog");
		dialogElement.id = "async_dialog";
		dialogElement.innerHTML = `<span>${message}</span>`;
		document.body.appendChild(dialogElement);

		await sleepAsync(25);
		dialogElement.showModal();
		await sleepAsync(25);

		let promiseResult = await promiseCallback();

		await sleepAsync(25);
		dialogElement.close();
		await sleepAsync(25);
		setTimeout(() => { dialogElement.remove(); }, 1000);
	
		return promiseResult;
	};
}
