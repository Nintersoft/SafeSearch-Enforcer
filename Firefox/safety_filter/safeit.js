/*-----------------------------------------------------------------------------------
	Author: Mauro Mascarenhas
	Organization link: https://www.nintersoft.com/
	Last update: 11/01/2019
	Version: 1.2.6
-----------------------------------------------------------------------------------*/

//

//console.log(browser.runtime.getURL("ui_first_run/welcome.html"));
console.log("run only once?");

var getting = browser.storage.sync.get();
getting.then(setCurrentChoice, onError);

//------------------------------------ LISTENER -------------------------------------

browser.webRequest.onBeforeRequest.addListener(
  chooseSafe,
  {urls: ["<all_urls>"], types: ["main_frame","sub_frame"]},
  ["blocking"]
);

//------------------------------------ FUNCTIONS -------------------------------------

function chooseSafe(requestDetails){
	// ---- Variable declarations ----
	var URL = requestDetails.url;

  var blockableURLs = [
    new RegExp(".google."),
    new RegExp(".bing."),
    new RegExp("search.yahoo.com"),
    new RegExp("yandex."),
    new RegExp("duckduckgo."),
    new RegExp(".reddit.com")
  ];

	var blockFilter = new RegExp("q=|/search[^/]|over18");
  if (!blockFilter.test(URL)) return;

	var urlTemp;

	var canReload = false;

	// ---- ---- ---- ---- ---- ---- ----

  for (var i = 0; i < blockableURLs.length; i++) {
    if (blockableURLs[i].test(URL)){
      urlTemp = defineParams(i);
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

function defineParams(pos){
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
    default:
      return "http://www.reddit.com/";
  }
}

/*
	This function just canges or generates a safe URL, if necessary.
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
