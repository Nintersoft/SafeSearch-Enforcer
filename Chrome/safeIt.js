/*-----------------------------------------------------------------------------------
	Author: Mauro Mascarenhas
	Organization link: https://www.nintersoft.com/
	Last update: 21/01/2017
	Version: 1.0
-----------------------------------------------------------------------------------*/

//------------------------------------ LISTENER -------------------------------------

chrome.webRequest.onBeforeRequest.addListener(
  chooseSafe,
  {urls: ["<all_urls>"]},
  ["blocking"]
);

//------------------------------------ FUNCTIONS -------------------------------------

function chooseSafe(requestDetails){
	
	// ---- Variable declarations ----
	var URL = requestDetails.url;
	var pGoogle = new RegExp(".google.");
	var pBing = new RegExp(".bing.");
	var pYahoo = new RegExp("search.yahoo.com");
	var pYandex = new RegExp("yandex.");
	var pDDG = new RegExp("duckduckgo.");
	var pSearch = new RegExp("/search");
	var urlTemp;
	
	var canReload = false;
	
	// ---- ---- ---- ---- ---- ---- ----
	if (pSearch.test(URL) && pGoogle.test(URL)){
		canReload = true;
		urlTemp = safeIt(URL, 'safe', 'active');
	}
	else if (pSearch.test(URL) && pBing.test(URL)){
		canReload = true;
		urlTemp = safeIt(URL, 'adlt', 'strict');
	}
	else if (pSearch.test(URL) && pYahoo.test(URL)){
		canReload = true;
		urlTemp = safeIt(URL, 'vm', 'r');
	}
	else if (pSearch.test(URL) && pYandex.test(URL)){
		canReload = true;
		urlTemp = safeIt(URL, 'fyandex', '1');
	}
	else if (pDDG.test(URL)){
		canReload = true;
		urlTemp = safeIt(URL, 'kp', '1');
	}
	
	// Loads a new and safe URL if necessary 
	if (URL != urlTemp && canReload){
		return{
			redirectUrl : urlTemp
		};
	}
}

/*
	This function just canges or generates a safe URL if necessary.
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
	Replace url SafeSearch parameter if necessary
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
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue 
}