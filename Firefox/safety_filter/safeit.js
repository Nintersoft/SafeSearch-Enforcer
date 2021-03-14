/*-----------------------------------------------------------------------------------
	Author: Mauro Mascarenhas
	Organization link: https://www.nintersoft.com/
	Last update: 13/03/2021
	Version: 1.3.4
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
			url: browser.runtime.getURL("static/welcome.html")
		});
		blockWelcomePage();
	}
	if (settings.enableb != null){
		let entry = settings.blocklist;
		RULES.blocklist.enable = settings.enableb && settings.blocklist;
		if (RULES.blocklist.enable)
			RULES.blocklist.rule = new RegExp(`(${entry.replaceAll("\n", ")|(")})`);
	}
}

function blockWelcomePage(){
	browser.storage.sync.set({
		firstRun: false
	});
}

//-------------------------------- GLOBAL CONSTANTS ----------------------------------

var RULES = {
	searchable : {
		urls : [
			new RegExp(".google."),
			new RegExp(".bing."),
			new RegExp("search.yahoo.com"),
			new RegExp("yandex."),
			new RegExp("duckduckgo.")
		],
		filter : new RegExp("(q=)|(/search/)")
	},
	apiFilter : {
		redditLike : [
			new RegExp(".reddit.com"),
			new RegExp(".imgur.com")
		]
	},
	blocklist : {
		enable : false,
		rule : null
	}
}

//--------------------------------- INITIALIZE VARS ----------------------------------

browser.storage.sync.get().then(hasGotSettings);

//------------------------------------ FUNCTIONS -------------------------------------

function chooseSafe(requestDetails){
	let urlstr = requestDetails.url;

	// ------- Block list Check -------
	if (RULES.blocklist.enable && RULES.blocklist.rule.test(urlstr)){
		let params = new URLSearchParams();
		params.append("reason", "block_ui_blocklist");
		params.append("url", urlstr);

		return{
			redirectUrl : browser.runtime.getURL("static/blocked.html") + "?" + params.toString()
		};
	}
	// ----- Reddit + Imgur check -----
	else if (RULES.apiFilter.redditLike.some((r) => r.test(urlstr))){
		let mtcs = /((\/r\/.*?\/comments\/[^\/?]*)|(\/user\/[^\/?]*)|(\/r\/[^\/?]*))(?<=.*)/ig.exec(urlstr);
		if (!mtcs || mtcs[0].endsWith(".json")) return;
		else {
			let grp = 1;
			if (mtcs[2]) grp = 2;
			else if (mtcs[3]) grp = 3;
			else if (mtcs[4]) grp = 4;
			
			let params = new URLSearchParams();
			params.append("url", urlstr);

			switch (apiCheckSafe(mtcs[grp], grp)) {
				case -1: params.append("reason", "block_ui_cant_check"); break;
				case 0: params.append("reason", "block_ui_over18"); break;
				default: return;
			}

			return {
				redirectUrl : browser.runtime.getURL("static/blocked.html") + "?" + params.toString()
			};
		}
	}
	// ----- Search Engines check -----
	else if (RULES.searchable.filter.test(urlstr)){
		for (let i = 0; i < RULES.searchable.urls.length; i++) {
			if (RULES.searchable.urls[i].test(urlstr)){
				let res = defineParams(i, urlstr);
				if (res.replaced) return {
					redirectUrl : res.url
				};
				else return;
			}
		}
	}
}

/**
	Checks whether the URL is safe or not (by using reddit JSON API)
	Returns 1 if is safe, 0 if it is not or -1 on error
	@param {string} path : URL path (without domain)
	@param {number} group : Matched group (RegExp)
	@returns {number}
*/
function apiCheckSafe(path, group){
	let req = new XMLHttpRequest();
	switch (group) {
		case 2: req.open("GET", "https://www.reddit.com" + path + ".json?limit=1", false); break;
		case 3: case 4: req.open("GET", "https://www.reddit.com" + path + "/about.json", false); break;
		default: return -1;
	}
	req.send(null);

	if (req.status === 200){
		let obj = JSON.parse(req.responseText);
		try {
			switch (group) {
				case 2: return obj[0].data.children[0].data.over_18 ? 0 : 1; //Post
				case 3: return obj.data.subreddit.over_18 ? 0 : 1; //Usuario
				case 4: return obj.data.over18 ? 0 : 1; //Subreddit
				default: return -1; //Fail
			}
		}
		catch(_) { return -1; }
	}
	return -1;
}

/**
	Defines the new URL (safe)
	@param {number} pos : Element position on array
	@param {string} urlstr : Requested URL
	@returns {object}
*/
function defineParams(pos, urlstr){
	switch (pos) {
		case 0: return safeIt(urlstr, 'safe', 'active');
		case 1: return safeIt(urlstr, 'adlt', 'strict');
		case 2: return safeIt(urlstr, 'vm', 'r');
		case 3: return safeIt(urlstr, 'fyandex', '1');
		default: return safeIt(urlstr, 'kp', '1');
	}
}

/**
	Generates a safe URL, if necessary.
	@param {string} urlstr : Requested URL as string
	@param {string} paramName : Safe search parameter name
	@param {string} paramValue : Safe search parameter value
	@returns {object}
*/
function safeIt(urlstr, paramName, paramValue){
	let url = new URL(urlstr);
	let params = url.searchParams;
	if (params.has(paramName) && params.get(paramName) === paramValue) return {
		replaced : false,
		url : urlstr
	};
	params.set(paramName, paramValue);
	return {
		replaced : true,
		url : `${url.protocol}//${url.host}${url.pathname}?${params.toString()}`
	};
}