function saveOptions(e) {
  e.preventDefault();

  browser.storage.sync.set({
    enableb: document.querySelector("#benable").checked,
    blacklisted: document.querySelector('[name="blacklisted"]').value
  });

  browser.runtime.reload();
}

function restoreDefault(e) {
  e.preventDefault();

  document.querySelector("#bdisable").checked = true;
  document.querySelector('[name="blacklisted"]').value = "";
  browser.storage.sync.clear();

  browser.runtime.reload();
}

function translateUI() {
  for (let elem of document.querySelectorAll("[data-i18n]"))
    elem.textContent = browser.i18n.getMessage(`options_ui_${elem.dataset.i18n}`);

  for (let elem of document.querySelectorAll("[data-i18n_placeholder]"))
      elem.placeholder = browser.i18n.getMessage(`options_ui_${elem.dataset.i18n_placeholder}`);
}

function restoreOptions() {

  function setCurrentChoice(result) {
    var enableb = result.enableb == null ? false : result.enableb;
    document.querySelector("#benable").checked = enableb;
    document.querySelector("#bdisable").checked = !enableb;

    document.querySelector('[name="blacklisted"]').value = result.blacklisted == null ? "" : result.blacklisted;
  }

  function onError(error) {
    document.querySelector("#bdisable").checked = true;
    document.querySelector('[name="blacklisted"]').value = "WARNING: IT WAS NOT POSSIBLE TO RETRIEVE THE SETTINGS.";
  }

  var getting = browser.storage.sync.get();
  getting.then(setCurrentChoice, onError);

  document.querySelector("#settingsform").addEventListener("submit", saveOptions);
  document.querySelector("#settingsform").addEventListener("reset", restoreDefault);
}

document.addEventListener("DOMContentLoaded", translateUI);
document.addEventListener("DOMContentLoaded", restoreOptions);
