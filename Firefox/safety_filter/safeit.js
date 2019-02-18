/*-----------------------------------------------------------------------------------
	Author: Mauro Mascarenhas
	Organization link: https://www.nintersoft.com/
	Last update: 17/02/2019
	Version: 1.2.6
-----------------------------------------------------------------------------------*/

//------------------------------------ LISTENERS ------------------------------------

browser.webRequest.onBeforeRequest.addListener(
  chooseSafe,
  {
    urls: ["<all_urls>"],
    types: ["main_frame","sub_frame"]
  },
  ["blocking"]
);

//----------------------------- WELCOME PAGE AND SETTINGS ----------------------------

function hasGotSettings(settings){
  if (settings.firstRun == null){
    browser.tabs.create({
      url: browser.runtime.getURL("ui_first_run/welcome.html")
    });
    blockWelcomePage();
  }
  if (settings.blacklisted)
    urlFilter = new RegExp(settings.blacklisted.replace("\n", "|"));
  if (settings.enableb != null)
    enableBlacklist = settings.enableb;
}

function blockWelcomePage(){
  browser.storage.sync.set({
    firstRun: false
  });
}

var urlFilter;
var enableBlacklist = false;
var getting = browser.storage.sync.get();
getting.then(hasGotSettings);

//-------------------------------- GLOBAL CONSTANTS ----------------------------------

var blockableURLs = [
  new RegExp(".google."),
  new RegExp(".bing."),
  new RegExp("search.yahoo.com"),
  new RegExp("yandex."),
  new RegExp("duckduckgo."),
  new RegExp(".reddit.com"),
  new RegExp(".imgur.com")
];

var blockFilter = new RegExp("q=|/search[^/]|over18|imgur.com/r/");

//------------------------------------ FUNCTIONS -------------------------------------

function chooseSafe(requestDetails){
  // ---- Variable declarations ----
  var URL = requestDetails.url;
  var urlTemp;
	var canReload = false;
	// ---- ---- ---- ---- ---- ---- -

  // ------- Blacklist Check -------
  if (urlFilter != null && enableBlacklist){
    if (urlFilter.test(URL)){
      // Blocks the current URL, if necessary
      return{
        redirectUrl : browser.runtime.getURL("safety_filter/blocked.html")
      };
    }
  }

  if (!blockFilter.test(URL)) return;

  for (var i = 0; i < blockableURLs.length; i++) {
    if (blockableURLs[i].test(URL)){
      urlTemp = defineParams(i, URL);
      canReload = true;
      break;
    }
  }

	// Loads a new and safe URL if necessary
	if (URL != urlTemp && canReload){
		return{
			redirectUrl : urlTemp
		};
	}
}

/*
  Defines the new URL (safe)
*/

function defineParams(pos, URL){
  switch (pos) {
    case 0:
      return safeIt(URL, 'safe', 'active');
      break;
    case 1:
      return safeIt(URL, 'adlt', 'strict');
      break;
    case 2:
      return safeIt(URL, 'vm', 'r');
      break;
    case 3:
      return safeIt(URL, 'fyandex', '1');
      break;
    case 4:
      return safeIt(URL, 'kp', '1');
      break;
    case 5:
      return "http://www.reddit.com/";
      break;
    default:
      return "http://www.imgur.com/";
  }
}

/*
	Changes or generates a safe URL, if necessary.
*/

function safeIt(url, paramName, paramValue){

	let params = new URL(url).searchParams;
	var parameter = params.get(paramName);

	if (parameter === null){
		url += ('&' + paramName + "=" + paramValue);
	}

	else if (parameter != paramValue){
		url = replaceUrlParam(url, paramName, paramValue);
	}

	return url;
}

/*
	Replace url SafeSearch parameter, if necessary
	Author: stenix (StackOverflow user)
	Source: http://stackoverflow.com/a/20420424/3248289
*/

function replaceUrlParam(url, paramName, paramValue){
    if(paramValue == null)
        paramValue = '';
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|$)')
    if(url.search(pattern)>=0){
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
}
