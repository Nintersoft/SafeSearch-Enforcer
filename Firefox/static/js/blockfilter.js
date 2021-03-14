document.addEventListener("DOMContentLoaded", function(){
    let params = (new URL(document.URL)).searchParams;
    document.querySelector('[data-i18n="page_ui_blocked_site"]').textContent = browser.i18n.getMessage('page_ui_blocked_site');
    document.querySelector('[data-i18n="page_ui_blocked_reason"]').textContent = browser.i18n.getMessage('page_ui_blocked_reason');
    document.querySelector("#burl").textContent = params.get("url");
    document.querySelector("#breason").textContent = browser.i18n.getMessage(params.get("reason"));
});