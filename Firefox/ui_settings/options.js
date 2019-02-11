function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    enableb: document.querySelector("#benable").checked,
    blacklisted: document.querySelector('[name="blacklisted"]').value
  });
}

function restoreDefault(e) {
  e.preventDefault();
  document.querySelector("#bdisable").checked = true;
  document.querySelector('[name="blacklisted"]').value = "";
  browser.storage.sync.clear();
}

function restoreOptions() {

  function setCurrentChoice(result) {
    var enableb = result.benable == null ? false : true;
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

document.addEventListener("DOMContentLoaded", restoreOptions);
