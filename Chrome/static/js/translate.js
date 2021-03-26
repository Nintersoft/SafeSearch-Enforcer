function translateUI() {
	for (let elem of document.querySelectorAll("[data-i18n]"))
		elem.textContent = chrome.i18n.getMessage(`page_ui_${elem.dataset.i18n}`);

	for (let elem of document.querySelectorAll("[data-i18n_placeholder]"))
		elem.placeholder = chrome.i18n.getMessage(`page_ui_${elem.dataset.i18n_placeholder}`);

	for (let elem of document.querySelectorAll("[data-i18n_a]")){
		elem.href = chrome.i18n.getMessage(`page_ui_a_href_${elem.dataset.i18n_a}`);
		if (chrome.i18n.getMessage(`page_ui_a_alt_${elem.dataset.i18n_a}`))
			elem.alt = chrome.i18n.getMessage(`page_ui_a_alt_${elem.dataset.i18n_a}`)
		if (chrome.i18n.getMessage(`page_ui_a_content_${elem.dataset.i18n_a}`))
			elem.textContent = chrome.i18n.getMessage(`page_ui_a_content_${elem.dataset.i18n_a}`)
	}
}

document.addEventListener("DOMContentLoaded", translateUI);
