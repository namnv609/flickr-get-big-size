var csrfToken = null,
    apiKey = null,
    reqId = null,
    menuContexts = ["image", "link"];

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var restUrl = null;
    var regExPattern = new RegExp("^https\:\/\/(www\.){0,1}(\\w+\.){0,1}flickr\.com\/.*(reqId|csrf|api_key).*", "gmi");
    console.log(details.url);
    if (details.type === "xmlhttprequest"
        && regExPattern.test(details.url)
        // && !csrfToken && !apiKey && !reqId
    ) {
        getAllNeededParameters(details.url);
    }
}, {
    urls: ["<all_urls>"]
});

chrome.contextMenus.create({
    title: "Get big size",
    contexts: menuContexts,
    onclick: getBigSize
});

function getAllNeededParameters(flickUrl) {
    var $anchorElement = $("<a />", {
        href: flickUrl
    })[0];
    var queryString = $anchorElement.search.replace(/^\?/, "").split("&");

    if (queryString.length > 0) {
        for (var i = 0; i < queryString.length; i++) {
            var parameter = queryString[i];

            switch (true) {
                case /^csrf\=/.test(parameter):
                    csrfToken = parameter.split("=")[1];
                    break;
                case /^api_key\=/.test(parameter):
                    apiKey = parameter.split("=")[1];
                    break;
                case /^reqId\=/.test(parameter):
                    reqId = parameter.split("=")[1];
                    break;
            }
        }
    }
}

function getBigSize(pageInfo, tabInfo) {
    var flickrUrl = getFlickrUrl(pageInfo);
    var photoId = getPhotoId(flickrUrl);
    var reqUrl = getPhotoDetailUrl(photoId);
    console.log('%s - %s - %s - %s', reqId, csrfToken, apiKey, reqUrl)
    $.getJSON(reqUrl, function(e) {
        // console.log(e);
        if (e.photo) {
            chrome.tabs.create({
                url: getBigSizeUrl(e.photo)
            });
        } else {
            alert("Not found");
        }
    });
}

function getFlickrUrl(pageInfo) {
    flickrUrl = null;

    if (typeof pageInfo.linkUrl !== "undefined") {
        flickrUrl = pageInfo.linkUrl;
    } else if (typeof pageInfo.srcUrl !== "undefined") {
        flickrUrl = pageInfo.srcUrl;
    }

    return flickrUrl;
}

function getPhotoDetailUrl(photoId) {
    return "https://api.flickr.com/services/rest?datecreate=1&extras=sizes%2Cicon_urls%2Cignored%2Crev_ignored%2Cvenue%2Cdatecreate%2Ccan_addmeta%2Ccan_comment%2Ccan_download%2Ccan_share%2Ccontact%2Ccount_comments%2Ccount_faves%2Ccount_views%2Cdate_taken%2Cdate_upload%2Cdescription%2Cicon_urls_deep%2Cisfavorite%2Cispro%2Clicense%2Cmedia%2Cneeds_interstitial%2Cowner_name%2Cowner_datecreate%2Cpath_alias%2Crealname%2Crotation%2Csafety_level%2Csecret_k%2Csecret_h%2Curl_c%2Curl_f%2Curl_h%2Curl_k%2Curl_l%2Curl_m%2Curl_n%2Curl_o%2Curl_q%2Curl_s%2Curl_sq%2Curl_t%2Curl_z%2Cvisibility%2Cvisibility_source%2Co_dims%2Cis_marketplace_printable%2Cis_marketplace_licensable%2Cpubliceditability%2Cstatic_maps&photo_id=" + photoId + "&static_map_zoom=3%2C6%2C14&static_map_width=245&static_map_height=100&viewerNSID=137875620%40N03&method=flickr.photos.getInfo&csrf=" + csrfToken + "&api_key=" + apiKey + "&format=json&hermes=1&hermesClient=1&reqId=" + reqId + "&nojsoncallback=1"
}

function getPhotoId(photoUrl) {
    var photoId = null;
    photoUrl = photoUrl.match(/\/[0-9]+\//);

    if (photoUrl) {
        photoId = photoUrl[0].replace(/\//g, '');
    }

    return photoId;
}

function getBigSizeUrl(photoObject) {
    console.log(photoObject.url_o);
    console.log(photoObject.url_k);
    console.log(photoObject.url_h);
    console.log(photoObject.url_l);
    if (photoObject.height_o) {
        return photoObject.url_o;
    } else if (photoObject.height_k) {
        return photoObject.url_k;
    } else if (photoObject.height_h) {
        return photoObject.url_h;
    } else if (photoObject.height_l) {
        return photoObject.url_l;
    } else {
        return null;
    }
}
