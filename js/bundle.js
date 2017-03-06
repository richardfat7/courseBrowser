(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var xhr = require('xhr');
var extend = require('xtend');
var finder = require('../index');
var _ = require('../util');

var xhrCnt = 0;

function HTMLParser(aHTMLString) {
    var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
        body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
    html.documentElement.appendChild(body);

    body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
        .getService(Components.interfaces.nsIScriptableUnescapeHTML)
        .parseFragment(aHTMLString, false, null, body));

    return body;
}

function convertURL(base, url) {
    if (url.startsWith("http://") || url.startsWith("https://"))
        return url;
    else if (url.startsWith("/")) {
        var parser = document.createElement('a');
        parser.href = base;
        return parser.origin + url;
    } else if (base.endsWith("/"))
        return base + url;
    else
        return base + "/../" + url;
}


function getDatatypeByExt(aPath) {

    var list = [{
            ext: ".pdf",
            dt: "pdf"
        },
        {
            ext: ".doc",
            dt: "doc"
        },
        {
            ext: ".docx",
            dt: "doc"
        },
        {
            ext: ".xls",
            dt: "xls"
        },
        {
            ext: ".xlsx",
            dt: "xls"
        },
        {
            ext: ".ppt",
            dt: "ppt"
        },
        {
            ext: ".pptx",
            dt: "ppt"
        },
        {
            ext: ".zip",
            dt: "zip"
        },
        {
            ext: ".7z",
            dt: "zip"
        },
        {
            ext: ".rar",
            dt: "zip"
        },
        {
            ext: ".gz",
            dt: "zip"
        },
        {
            ext: ".jpg",
            dt: "img"
        },
        {
            ext: ".png",
            dt: "img"
        },
        {
            ext: ".gif",
            dt: "img"
        },
        {
            ext: ".tiff",
            dt: "img"
        },
        {
            ext: ".bmp",
            dt: "img"
        },
        {
            ext: ".jpeg",
            dt: "img"
        },
        {
            ext: ".wav",
            dt: "aud"
        },
        {
            ext: ".mp3",
            dt: "aud"
        },
        {
            ext: ".ogg",
            dt: "aud"
        },
        {
            ext: ".wma",
            dt: "aud"
        },
        {
            ext: ".mp4",
            dt: "vid"
        },
        {
            ext: ".wmv",
            dt: "vid"
        },
        {
            ext: ".avi",
            dt: "vid"
        },
        {
            ext: ".3pg",
            dt: "vid"
        },
        {
            ext: ".c",
            dt: "cod"
        },
        {
            ext: ".h",
            dt: "cod"
        },
        {
            ext: ".cpp",
            dt: "cod"
        },
        {
            ext: ".py",
            dt: "cod"
        },
        {
            ext: ".java",
            dt: "cod"
        },
        {
            ext: ".json",
            dt: "cod"
        },
        {
            ext: ".pas",
            dt: "cod"
        },
        {
            ext: ".sql",
            dt: "cod"
        },
        {
            ext: ".xml",
            dt: "cod"
        }
    ];
    for (var i = 0; i < list.length; i++)
        if (aPath.endsWith(list[i].ext))
            return list[i].dt;

    if (aPath.includes("youtube.com") || aPath.includes("youtu.be"))
        return "utb";
    if (aPath.includes("dropbox.com"))
        return "drp";
    if (aPath.includes("stackoverflow.com"))
        return "sof";
    if (aPath.includes("stackexchange.com"))
        return "sex";
    if (aPath.includes("stackexchange.com"))
        return "sex";
    if (aPath.includes("github.com"))
        return "git";

    return undefined;
}

function getFile(courseStr, callback, loadingIndicator) {
    var LECT_FOLDER = "Lecture Notes";
    var TUT_FOLDER = "Tutorial Notes";
    var HW_FOLDER = "Assignments";
    var LECT_NAME_CH = "Chaptor ";
    var LECT_NAME_WK = "Week ";
    var LECT_NAME_LT = "Lecture ";
    var TUT_NAME = "Tutorial ";
    var HW_NAME = "Assignment "
    var thisCourse = [];
    var xhrCount = 0;
    var xhrFinish = 0;
    switch (courseStr) {
        case "ENGG2430A":
            var baseurl = "http://www.cse.cuhk.edu.hk/~syzhang/course/Prob17/";
            var lecturl = baseurl + "lectures.htm";
            var tuturl = baseurl + "tutorials.htm";
            var hwurl = baseurl + "assignments.htm";
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + lecturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("li");
                var root = [];
                var count = 1;
                for (var i = 0; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": rows[i].innerText.replace(/week [0-9]: | [0-9]\. \(pptx, pdf\)[.\s]*/g, ""),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.label = links[j].innerHTML;
                        tmp.url = convertURL(lecturl, links[j].attributes.href.value);
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                    // root.push({
                    // "label": rows[i].innerText,
                    // "children": []
                    // });
                    // for (var j = 0; j < links.length; j++) {
                    // var tmp = {};
                    // tmp.label = links[j].innerHTML;
                    // tmp.url = convertURL(lecturl, links[j].attributes.href.value);
                    // tmp.datatype = getDatatypeByExt(tmp.url);
                    // root[root.length - 1].children.push(tmp)
                    // }
                }
                var arr = {};
                for (var k = 0, len = root.length; k < len; k++)
                    arr[root[k]['label']] = root[k];
                root = new Array();
                for (var key in arr)
                    root.push(arr[key]);
                thisCourse.push({
                    "label": LECT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + tuturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("li");
                var root = [];
                var count = 1;
                for (var i = 0; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": TUT_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.label = links[j].innerHTML;
                        tmp.url = convertURL(tuturl, links[j].attributes.href.value);
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": TUT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + hwurl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("li");
                var root = [];
                var count = 1;
                for (var i = 0; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": HW_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.label = links[j].innerHTML;
                        tmp.url = convertURL(hwurl, links[j].attributes.href.value);
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": HW_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            /* 
            thisCourse.push({
                "label": "Lecture Notes",
                "children": []
            });
            for (var i = 1; i <= 3; i++) {
                thisCourse[thisCourse.length - 1].children.push({
                    "label": "Chapter " + i,
                    "url": "http://www.cse.cuhk.edu.hk/~syzhang/course/Prob17/ch" + i + ".pdf",
                    "datatype": "pdf"
                });
            }
            thisCourse.push({
                "label": "Tutorial Notes",
                "children": []
            });
            for (var i = 1; i <= 14; i++) {
                thisCourse[thisCourse.length - 1].children.push({
                    "label": "Tutorial " + i,
                    "url": "http://www.cse.cuhk.edu.hk/~syzhang/course/Prob17/t" + i + ".pdf",
                    "datatype": "pdf"
                });
            }
            thisCourse.push({
                "label": "Assignment",
                "children": []
            });
            for (var i = 1; i <= 2; i++) {
                thisCourse[thisCourse.length - 1].children.push({
                    "label": "Homework " + i,
                    "url": "http://www.cse.cuhk.edu.hk/~syzhang/course/Prob17/hw" + i + ".pdf",
                    "datatype": "pdf"
                });
            }
			*/
            return thisCourse;
        case "CSCI2100A":
            var baseurl = "http://www.cse.cuhk.edu.hk/irwin.king/teaching/csci2100/2016";
            var lecturl = baseurl + "";
            var tuturl = baseurl + "/tutorial";
            var hwurl = baseurl + "";
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + lecturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var cols = HTMLpage.getElementsByClassName("inline")[2].getElementsByClassName("col2 centeralign");
                var root = [];
                for (var i = 1; i < cols.length; i++) {
                    var links = cols[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    var topic = cols[i].getElementsByTagName("strong");
                    var cc = "";
                    for (var j = 0; j < topic.length; j++) {
                        cc += topic[j].innerHTML + " ";
                    }
                    root.push({
                        "label": cc,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.label = links[j].innerHTML;
                        tmp.url = convertURL(lecturl, links[j].title);
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": LECT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + tuturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var cols = HTMLpage.getElementsByClassName("inline")[1].getElementsByClassName("col2 centeralign");
                var root = [];
                for (var i = 1; i < cols.length; i++) {
                    var links = cols[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    var tmp = {};
                    tmp.label = links[0].innerHTML;
                    tmp.url = convertURL(tuturl, links[0].attributes.href.value);
                    tmp.datatype = getDatatypeByExt(tmp.url);
                    root.push({
                        "label": TUT_NAME + (root.length + 1),
                        "children": [tmp]
                    });
                    var res = cols[i].parentElement.getElementsByClassName("col4")[0].getElementsByTagName("a");
                    for (var j = 0; j < res.length; j++) {
                        var tmp = {};
                        tmp.label = res[j].innerHTML;
                        tmp.url = convertURL(tuturl, res[j].attributes.href.value);
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": TUT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            return thisCourse;
        case "SEEM2420":
            var baseurl = "http://seem2420:GPA4.0:>@www1.se.cuhk.edu.hk/~ckng/seem2420/";
            var lecturl = baseurl + "lecture.html";
            var tuturl = baseurl + "tutorial.html";
            var hwurl = baseurl + "homework.html";
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + lecturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": LECT_NAME_CH + (i - 1),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(lecturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": LECT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + tuturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                var count = 1;
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": TUT_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(tuturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": TUT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + hwurl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                var count = 1;
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": HW_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(hwurl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": HW_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            return thisCourse;
        case "SEEM2450C":
            var baseurl = "http://engg2450:GPA~4.0~@www1.se.cuhk.edu.hk/~ckng/engg2450/";
            var lecturl = baseurl + "lecture.html";
            var tuturl = baseurl + "tutorial.html";
            var hwurl = baseurl + "homework.html";
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + lecturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": LECT_NAME_WK + (i - 1),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(lecturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": LECT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + tuturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                var count = 1;
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": TUT_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(tuturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": TUT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + hwurl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                var count = 1;
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": HW_NAME + count++,
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(hwurl, links[j].attributes.href.value);
                        tmp.label = links[j].innerHTML;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": HW_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            return thisCourse;
        case "CSCI3180":
            var baseurl = "http://course.cse.cuhk.edu.hk/~csci3180/";
            var lecturl = baseurl + "lecture/index.html";
            var tuturl = baseurl + "tutorial/index.html";
            var hwurl = baseurl + "assignment/index.html";
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + lecturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": LECT_NAME_LT + (i - 1),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(lecturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerText;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": LECT_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + tuturl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": TUT_NAME + (i),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(tuturl, links[j].attributes.href.value);
                        tmp.label = links[j].innerText;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": TUT_NAME,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            xhrCount++;
            xhr({
                method: "GET",
                uri: 'fetch.php?url=' + hwurl,
                responseType: "document"
            }, function done(err, resp, body) {
                var HTMLpage = body;
                var rows = HTMLpage.getElementsByTagName("tr");
                var root = [];
                for (var i = 1; i < rows.length; i++) {
                    var links = rows[i].getElementsByTagName("a");
                    if (links.length <= 0)
                        continue;
                    root.push({
                        "label": HW_NAME + (i),
                        "children": []
                    });
                    for (var j = 0; j < links.length; j++) {
                        var tmp = {};
                        tmp.url = convertURL(hwurl, links[j].attributes.href.value);
                        tmp.label = links[j].innerText;
                        tmp.datatype = getDatatypeByExt(tmp.url);
                        root[root.length - 1].children.push(tmp)
                    }
                }
                thisCourse.push({
                    "label": HW_FOLDER,
                    "children": root
                });
                if (++xhrFinish == xhrCount) {
                    // clear loading spinner
                    _.remove(loadingIndicator);
                    callback(thisCourse);
                }
            });
            return thisCourse;
    }

}

var course = []
var data = [];
// do gen
course.push({
    "label": "ENGG2430A",
    "type": "course",
    "courseCode": "ENGG2430A"
    //getFile("ENGG2430A")
});
course.push({
    "label": "CSCI2100A",
    "type": "course",
    "courseCode": "CSCI2100A"
    //getFile("CSCI2100A")
});
// course.push({
    // "label": "CSCI3180 (VPN needed)",
    // "type": "course",
    // "courseCode": "CSCI3180"
    // getFile("CSCI3180")
// });
data.push({
    "label": "CSCI",
    "type": "major",
    "children": course
});
// var course = [];
// course.push({
// "label": "SEEM2420",
// "children": getFile("SEEM2420")
// });
// course.push({
// "label": "SEEM2450C",
// "children": getFile("SEEM2450C")
// });
// data.push({
// "label": "SEEM",
// "children": course
// });

var emitter;

module.exports = createExample;



function createExample(container) {
    emitter = finder(container, remoteSource, {
        createItemContent: createItemContent
    });

    // when a leaf node selected, display the details in a new column
    // emitter.on('leaf-selected', function selected(item) {
    // emitter.emit('create-column', createSimpleColumn(item));
    // });

    // scroll to the right if necessary when a new column is created
    emitter.on('column-created', function columnCreated() {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
    });
}


function remoteSource(parent, cfg, callback) {
    var loadingIndicator = createLoadingColumn();
    var xhrUid = ++xhrCnt;
    //var type = 'region';

    // determine which column we're on based on previous selection
    // if (parent) {
    // if (parent.type === 'region') {
    // type = 'subregion';
    // } else if (parent.type === 'subregion') {
    // type = 'name'; // country
    // } else { // must be a country
    // return cfg.emitter.emit('create-column', createSimpleColumn(parent));
    // }
    // }
    if (parent) {
        if (parent.type === "major") {
            callback(data[0].children);
        } else if (parent.type === "course") {
            // loading spinner
            cfg.emitter.emit('create-column', loadingIndicator);
            getFile(parent.courseCode, callback, loadingIndicator);
		} else {
			return;
		}
    } else {
        callback(data);
	}
    /*
      // loading spinner
      cfg.emitter.emit('create-column', loadingIndicator);

      // xhr request
      xhr({
        uri: 'https://restcountries.eu/rest/v1/all'
      }, function done(err, resp, body) {
        var rawData = JSON.parse(body);
        var data = uniqueCountryData(rawData, type, parent);

        // clear loading spinner
        _.remove(loadingIndicator);

        // stale request
        if (xhrUid !== xhrCnt) {
          return;
        }

        // execute callback
        callback(data);
      });
      */
}


// how each item in a column should be rendered
function createItemContent(cfg, item) {
    var data = item.children || cfg.data;
    var frag = document.createDocumentFragment();
    var label = _.el('span');
    var iconPrepend = _.el('i');
    var iconAppend = _.el('i');
    var prependClasses = ['fa'];
    var appendClasses = ['fa'];
	switch (item.datatype) {
        case "pdf":
            prependClasses.push('fa-file-pdf-o');
            break;
        case "doc":
            prependClasses.push('fa-file-word-o');
            break;
        case "xls":
            prependClasses.push('fa-file-excel-o');
            break;
        case "ppt":
            prependClasses.push('fa-file-powerpoint-o');
            break;
        case "img":
            prependClasses.push('fa-file-image-o');
            break;
        case "zip":
            prependClasses.push('fa-file-archive-o');
            break;
        case "aud":
            prependClasses.push('fa-file-audio-o');
            break;
        case "vid":
            prependClasses.push('fa-file-video-o');
            break;
        case "cod":
            prependClasses.push('fa-file-code-o');
            break;
        case "utb":
            prependClasses.push('fa-youtube');
            break;
        case "drp":
            prependClasses.push('fa-dropbox');
            break;
        case "sof":
            prependClasses.push('fa-stack-overflow');
            break;
        case "sex":
            prependClasses.push('fa-stack-exchange');
            break;
        case "git":
            prependClasses.push('fa-github');
            break;
        default:
			if (data || item.type === "major" || item.type === "course") {
				prependClasses.push('fa-folder');
			} else 
				prependClasses.push('fa-file-o');
    }

    // prepended icon
    // if (data) {
    // prependClasses.push('fa-folder');
    // } else if (item.type === 'github-url') {
    // prependClasses.push('fa-github');
    // } else {
    // prependClasses.push('fa-file-o');
    // }
    _.addClass(iconPrepend, prependClasses);

    // text label
    _.append(label, [iconPrepend, _.text(item.label)]);
    frag.appendChild(label);

    // appended icon
    if ('url' in item) {
        appendClasses.push('fa-external-link');
    } else if (data) {
        appendClasses.push('fa-caret-right');
    }
    _.addClass(iconAppend, appendClasses);
    frag.appendChild(iconAppend);

    return frag;
}

function createSimpleColumn(item) {
    var div = _.el('div.fjs-col.leaf-col');
    var row = _.el('div.leaf-row');
    var filename = _.text(item.label);
    var i = _.el('i');
    var size = _.el('div.meta');
    var sizeLabel = _.el('strong');
    var mod = _.el('div.meta');
    var modLabel = _.el('strong');

    _.addClass(i, ['fa', 'fa-file-o']);
    _.append(sizeLabel, _.text('Size: '));
    _.append(size, [sizeLabel, _.text(item.size)]);
    _.append(modLabel, _.text('Modified: '));
    _.append(mod, [modLabel, _.text(item.modified)]);
    _.append(row, [i, filename, size, mod]);

    return _.append(div, row);
}

function createLoadingColumn() {
  var div = _.el('div.fjs-col.leaf-col');
  var row = _.el('div.leaf-row');
  var text = _.text('Loading...');
  var i = _.el('span');

  _.addClass(i, ['fa', 'fa-refresh', 'fa-spin']);
  _.append(row, [i, text]);

  return _.append(div, row);
}
},{"../index":3,"../util":15,"xhr":13,"xtend":14}],2:[function(require,module,exports){
'use strict';

var browser = require('./browser');

browser(document.getElementById('browser'));

},{"./browser":1}],3:[function(require,module,exports){
/**
 * finder.js module.
 * @module finderjs
 */
'use strict';

var extend = require('xtend');
var document = require('global/document');
var EventEmitter = require('eventemitter3');
var isArray = require('x-is-array');

var _ = require('./util');
var defaults = {
  className: {
    container: 'fjs-container',
    col: 'fjs-col',
    list: 'fjs-list',
    item: 'fjs-item',
    active: 'fjs-active',
    children: 'fjs-has-children',
    url: 'fjs-url',
    itemPrepend: 'fjs-item-prepend',
    itemContent: 'fjs-item-content',
    itemAppend: 'fjs-item-append'
  }
};

module.exports = finder;

/**
 * @param  {element} container
 * @param  {Array|Function} data
 * @param  {object} options
 * @return {object} event emitter
 */
function finder(container, data, options) {
  var emitter = new EventEmitter();
  var cfg = extend(defaults, {
    container: container,
    emitter: emitter
  }, options);

  // xtend doesn't deep merge
  cfg.className = extend(defaults.className, options ? options.className : {});

  // store the fn so we can call it on subsequent selections
  if (typeof data === 'function') {
    cfg.data = data;
  }

  // dom events
  container.addEventListener(
    'click', finder.clickEvent.bind(null, cfg, emitter));
  container.addEventListener(
    'keydown', finder.keydownEvent.bind(null, container, cfg, emitter));

  // internal events
  emitter.on('item-selected', finder.itemSelected.bind(null, cfg, emitter));
  emitter.on(
    'create-column', finder.addColumn.bind(null, container, cfg, emitter));
  emitter.on(
    'navigate', finder.navigate.bind(null, cfg, emitter));

  _.addClass(container, cfg.className.container);
  finder.createColumn(data, cfg, emitter);
  container.setAttribute('tabindex', 0);

  return emitter;
}

/**
 * @param {element} container
 * @param {element} column to append to container
 */
finder.addColumn = function addColumn(container, cfg, emitter, col) {
  container.appendChild(col);

  emitter.emit('column-created', col);
};

/**
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event value
 */
finder.itemSelected = function itemSelected(cfg, emitter, value) {
  var itemEl = value.item;
  var item = itemEl._item;
  var col = value.col;
  var data = item.children || cfg.data;
  var activeEls = col.getElementsByClassName(cfg.className.active);

  if (activeEls.length) {
    _.removeClass(activeEls[0], cfg.className.active);
  }
  _.addClass(itemEl, cfg.className.active);
  _.nextSiblings(col).map(_.remove);

  if (item.url) {
    //document.location.href = item.url;
	window.open(item.url);
  } else if (data) {
    finder.createColumn(data, cfg, emitter, item);
  } else {
    emitter.emit('leaf-selected', item);
  }
};

/**
 * Click event handler for whole container
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event
 */
finder.clickEvent = function clickEvent(cfg, emitter, event) {
  var el = event.target;
  var col = _.closest(el, function test(el) {
    return _.hasClass(el, cfg.className.col);
  });
  var item = _.closest(el, function test(el) {
    return _.hasClass(el, cfg.className.item);
  });

  _.stop(event);

  // list item clicked
  if (item) {
    emitter.emit('item-selected', {
      col: col,
      item: item
    });
  }
};

/**
 * Keydown event handler for container
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event
 */
finder.keydownEvent = function keydownEvent(container, cfg, emitter, event) {
  var arrowCodes = {
    38: 'up',
    39: 'right',
    40: 'down',
    37: 'left'
  };

  if (event.keyCode in arrowCodes) {
    _.stop(event);

    emitter.emit('navigate', {
      direction: arrowCodes[event.keyCode],
      container: container
    });
  }
};

/**
 * Navigate the finder up, down, right, or left
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event value - `container` prop contains a reference to the
 * container, and `direction` can be 'up', 'down', 'right', 'left'
 */
finder.navigate = function navigate(cfg, emitter, value) {
  var active = finder.findLastActive(value.container, cfg);
  var target = null;
  var dir = value.direction;
  var item;
  var col;

  if (active) {
    item = active.item;
    col = active.col;

    if (dir === 'up' && item.previousSibling) {
      target = item.previousSibling;
    } else if (dir === 'down' && item.nextSibling) {
      target = item.nextSibling;
    } else if (dir === 'right' && col.nextSibling) {
      col = col.nextSibling;
      target = _.first(col, '.' + cfg.className.item);
    } else if (dir === 'left' && col.previousSibling) {
      col = col.previousSibling;
      target = _.first(col, '.' + cfg.className.active) ||
        _.first(col, '.' + cfg.className.item);
    }
  } else {
    col = _.first(value.container, '.' + cfg.className.col);
    target = _.first(col, '.' + cfg.className.item);
  }

  if (target) {
    emitter.emit('item-selected', {
      col: col,
      item: target
    });
  }
};

/**
 * Find last (right-most) active item and column
 * @param  {Element} container
 * @param  {Object} config
 * @return {Object}
 */
finder.findLastActive = function findLastActive(container, cfg) {
  var activeItems = container.getElementsByClassName(cfg.className.active);
  var item;
  var col;

  if (!activeItems.length) {
    return null;
  }

  item = activeItems[activeItems.length - 1];
  col = _.closest(item, function test(el) {
    return _.hasClass(el, cfg.className.col);
  });

  return {
    col: col,
    item: item
  };
};

/**
 * @param  {object} data
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {parent} [parent] - parent item that clicked/triggered createColumn
 * @return {element} column
 */
finder.createColumn = function createColumn(data, cfg, emitter, parent) {
  var div;
  var list;
  function callback(data) {
    finder.createColumn(data, cfg, emitter, parent);
  };

  if (typeof data === 'function') {
    data.call(null, parent, cfg, callback);
  } else if (isArray(data)) {
    list = finder.createList(data, cfg);
    div = _.el('div');
    div.appendChild(list);
    _.addClass(div, cfg.className.col);

    emitter.emit('create-column', div);
  } else {
    throw new Error('Unknown data type');
  }
};

/**
 * @param  {array} data
 * @param  {object} config
 * @return {element} list
 */
finder.createList = function createList(data, cfg) {
  var ul = _.el('ul');
  var items = data.map(finder.createItem.bind(null, cfg));
  var docFrag;

  docFrag = items.reduce(function each(docFrag, curr) {
    docFrag.appendChild(curr);
    return docFrag;
  }, document.createDocumentFragment());

  ul.appendChild(docFrag);
  _.addClass(ul, cfg.className.list);

  return ul;
};

/**
 * Default item render fn
 * @param  {object} cfg config object
 * @param  {object} item data
 * @return {DocumentFragment}
 */
finder.createItemContent = function createItemContent(cfg, item) {
  var frag = document.createDocumentFragment();
  var prepend = _.el('div.' + cfg.className.itemPrepend);
  var content = _.el('div.' + cfg.className.itemContent);
  var append = _.el('div.' + cfg.className.itemAppend);

  frag.appendChild(prepend);
  content.appendChild(document.createTextNode(item.label));
  frag.appendChild(content);
  frag.appendChild(append);

  return frag;
};

/**
 * @param  {object} cfg config object
 * @param  {object} item data
 * @return {element} list item
 */
finder.createItem = function createItem(cfg, item) {
  var frag = document.createDocumentFragment();
  var liClassNames = [cfg.className.item];
  var li = _.el('li');
  var a = _.el('a');
  var createItemContent = cfg.createItemContent || finder.createItemContent;

  frag = createItemContent.call(null, cfg, item);
  a.appendChild(frag);

  a.href = '';
  a.setAttribute('tabindex', -1);
  if (item.url) {
    a.href = item.url;
    liClassNames.push(cfg.className.url);
  }
  if (item.className) {
    liClassNames.push(item.className);
  }
  if (item.children) {
    liClassNames.push(cfg.className.children);
  }
  _.addClass(li, liClassNames);
  li.appendChild(a);
  li._item = item;

  return li;
};

},{"./util":15,"eventemitter3":5,"global/document":7,"x-is-array":12,"xtend":14}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],6:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":9}],7:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":4}],8:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],10:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":6,"trim":11}],11:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],12:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],13:[function(require,module,exports){
"use strict";
var window = require("global/window")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            setTimeout(loadFunc, 0)
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer
    var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
    }

    if ("json" in options && options.json !== false) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.onabort = function(){
        aborted = true;
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            if (aborted) return
            aborted = true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}

},{"global/window":8,"is-function":9,"parse-headers":10,"xtend":14}],14:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],15:[function(require,module,exports){
/**
 * util.js module.
 * @module util
 */
'use strict';

var document = require('global/document');
var isArray = require('x-is-array');

/**
 * check if variable is an element
 * @param  {*} potential element
 * @return {Boolean} return true if is an element
 */
function isElement(element) {
  try {
    return element instanceof Element;
  } catch (error) {
    return !!(element && element.nodeType === 1);
  }
}

/**
 * createElement shortcut
 * @param  {String} tag
 * @return {Element} element
 */
function el(element) {
  var classes = [];
  var tag = element;
  var el;

  if (isElement(element)) {
    return element;
  }

  classes = element.split('.');
  if (classes.length > 1) {
    tag = classes[0];
  }
  el = document.createElement(tag);
  addClass(el, classes.slice(1));

  return el;
}

/**
 * createDocumentFragment shortcut
 * @return {DocumentFragment}
 */
function frag() {
  return document.createDocumentFragment();
}

/**
 * createTextNode shortcut
 * @return {TextNode}
 */
function text(text) {
  return document.createTextNode(text);
}

/**
 * remove element
 * @param  {Element} element to remove
 * @return {Element} removed element
 */
function remove(element) {
  if ('remove' in element) {
    element.remove();
  } else {
    element.parentNode.removeChild(element);
  }

  return element;
}

/**
 * Find first element that tests true, starting with the element itself
 * and traversing up through its ancestors
 * @param  {Element} element
 * @param  {Function} test fn - return true when element located
 * @return {Element}
 */
function closest(element, test) {
  var el = element;

  while (el) {
    if (test(el)) {
      return el;
    }
    el = el.parentNode;
  }

  return null;
}

/**
 * Add one or more classnames to an element
 * @param {Element} element
 * @param {Array.<string>|String} array of classnames or string with
 * classnames separated by whitespace
 * @return {Element}
 */
function addClass(element, className) {
  var classNames = className;

  function _addClass(el, cn) {
    if (!el.className) {
      el.className = cn;
    } else if (!hasClass(el, cn)) {
      el.className += ' ' + cn;
    }
  }

  if (!isArray(className)) {
    classNames = className.trim().split(/\s+/);
  }
  classNames.forEach(_addClass.bind(null, element));

  return element;
}

/**
 * Remove a class from an element
 * @param  {Element} element
 * @param  {Array.<string>|String} array of classnames or string with
 * @return {Element}
 */
function removeClass(element, className) {
  var classNames = className;

  function _removeClass(el, cn) {
    var classRegex = new RegExp('(?:^|\\s)' + cn + '(?!\\S)', 'g');
    el.className = el.className.replace(classRegex, '').trim();
  }

  if (!isArray(className)) {
    classNames = className.trim().split(/\s+/);
  }
  classNames.forEach(_removeClass.bind(null, element));

  return element;
}

/**
 * Check if element has a class
 * @param  {Element}  element
 * @param  {String}  className
 * @return {boolean}
 */
function hasClass(element, className) {
  if (!element || !('className' in element)) {
    return false;
  }

  return element.className.split(/\s+/).indexOf(className) !== -1;
}

/**
 * Return all next siblings
 * @param  {Element} element
 * @return {Array.<element>}
 */
function nextSiblings(element) {
  var next = element.nextSibling;
  var siblings = [];

  while (next) {
    siblings.push(next);
    next = next.nextSibling;
  }

  return siblings;
}

/**
 * Return all prev siblings
 * @param  {Element} element
 * @return {Array.<element>}
 */
function previousSiblings(element) {
  var prev = element.previousSibling;
  var siblings = [];

  while (prev) {
    siblings.push(prev);
    prev = prev.previousSibling;
  }

  return siblings;
}

/**
 * Stop event propagation
 * @param  {Event} event
 * @return {Event}
 */
function stop(event) {
  event.stopPropagation();
  event.preventDefault();

  return event;
}

/**
 * Returns first element in parent that matches selector
 * @param  {Element} parent
 * @param  {String} selector
 * @return {Element}
 */
function first(parent, selector) {
  return parent.querySelector(selector);
}

function append(parent, children) {
  var _frag = frag();
  var children = isArray(children) ? children : [children];

  children.forEach(_frag.appendChild.bind(_frag));
  parent.appendChild(_frag);

  return parent;
}

module.exports = {
  el: el,
  frag: frag,
  text: text,
  closest: closest,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  nextSiblings: nextSiblings,
  previousSiblings: previousSiblings,
  remove: remove,
  stop: stop,
  first: first,
  append: append
};

},{"global/document":7,"x-is-array":12}]},{},[2]);
