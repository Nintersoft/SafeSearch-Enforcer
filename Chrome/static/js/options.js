function saveOptions(e) {
	e.preventDefault();
	chrome.storage.sync.set({
		enableb: document.querySelector("#benable").checked,
		blocklist: document.querySelector('[name="blocked"]').value
	});
	$("#infoModal").modal("show");
	setTimeout(() => { chrome.runtime.reload(); }, 3000);
}

function askRestore(e){
	e.preventDefault();
	$("#resetModal").modal("show");
}

function restoreDefault() {
	document.querySelector("#bdisable").checked = true;
	document.querySelector('[name="blocked"]').value = "";
	chrome.storage.sync.clear();
	$("#infoModal").modal("show");
	setTimeout(() => { chrome.runtime.reload(); }, 3000);
}

function translateUI() {
	for (let elem of document.querySelectorAll("[data-i18n]"))
		elem.textContent = chrome.i18n.getMessage(`options_ui_${elem.dataset.i18n}`);

	for (let elem of document.querySelectorAll("[data-i18n_placeholder]"))
			elem.placeholder = chrome.i18n.getMessage(`options_ui_${elem.dataset.i18n_placeholder}`);
}

function restoreOptions() {

	function setCurrentChoice(result) {
		var enableb = result.enableb == null ? false : result.enableb;
		document.querySelector("#benable").checked = enableb;
		document.querySelector("#bdisable").checked = !enableb;

		document.querySelector('[name="blocked"]').value = result.blocklist == null ? "" : result.blocklist;
	}

	var getting = chrome.storage.sync.get(null, setCurrentChoice);

	document.querySelector("#settingsform").addEventListener("submit", saveOptions);
	document.querySelector("#settingsform").addEventListener("reset", askRestore);
	document.querySelector("#resetConfirmation").addEventListener("click", restoreDefault);
	document.querySelector("#successMsgBtn").addEventListener("click", () => { chrome.runtime.reload(); });
}

document.addEventListener("DOMContentLoaded", translateUI);
document.addEventListener("DOMContentLoaded", restoreOptions);
