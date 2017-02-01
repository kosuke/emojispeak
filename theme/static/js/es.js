var emojispeak = emojispeak || {};

//---
// Common
//---

emojispeak.siteURL = "";

/**
 * Miscellaneous helper functions.
 */ 
emojispeak.utils = (function () {
    //Capitalize the first character of a string.
    var capitalize = function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    //Checks if local storage is supported.
    var isStorageSupported = function () {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    };
    var fadeAll = function (elements, opacity) {
        for (var i = 0; i < elements.length; ++i) {
            elements[i].style.opacity = opacity;
        }
    };
    var showHidden = function () {
        var elements = document.querySelectorAll('.hidden');
        for (var i = 0; i < elements.length; ++i) {
            elements[i].classList.toggle('visible');
        }
    };
    //Block double-tap zoom
    var blockDoubleTap = function (element) {
       var blocker = function(e) {
           element.click();
           e.preventDefault();
       };
       element.addEventListener('touchstart', blocker, true);
    };
    return {
        capitalize: capitalize,
        isStorageSupported: isStorageSupported,
        fadeAll: fadeAll,
        showHidden: showHidden,
        blockDoubleTap: blockDoubleTap
    };
})();

/**
 * Model. Manages entries loaded from a JSON file.
 */
emojispeak.posts = (function () {
    var entries = [];
    var filtered = [];
    var filter = null;  
    //Load JSON file
    var loadJSON = function (file, func) {
        var ajax = new XMLHttpRequest();
        ajax.overrideMimeType("application/json");
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == "200") {
                func(JSON.parse(ajax.responseText));
            }
        };
        ajax.open('GET', file, true);
        ajax.send(null);
    };
    //Reload posts
    var reload = function (func) {
        loadJSON('posts.min.json', function (json) {
            //Meta
            var size = json[0].count;
            emojispeak.siteURL = json[0].url;
            //Posts
            entries = json.slice(1);
            if (size != entries.length) {
                console.log("Broken JSON file.");
            }
            filtered = filter ? filter(entries) : entries;
            if (func) {
                func();
            }
        });
    };
    //Set new filter and update entries.
    var setFilter = function (newFilter) {
        filter = newFilter;
        filtered = filter ? filter(entries) : entries;
    };
    //Return the number of posts
    var count = function () {
        return filtered.length;
    };
    //Return the post at index
    var get = function (index) {
        return filtered[index];
    };
    return {
        count: count,
        reload: reload,
        get: get,
        getFilter: function () {
            return filter;
        },
        setFilter: setFilter,
        all: function () {
            return filtered;
        }
    };
})();

/**
 * Returns a filter function to select entries in the category. 
 */ 
emojispeak.filterByCategory = function (category) {
    return function (entries) {
        var filtered = [];
        for (var i = 0; i < entries.length; ++i) {
            var p = entries[i];
            if (category === p.category) {
                filtered.push(p);
            }
        }
        return filtered;
    };
};

/**
 * Returns a filter function to select entries that have the tag. 
 */ 
emojispeak.filterByTag = function (tag) {
    return function (entries) {
        var filtered = [];
        for (var i = 0; i < entries.length; ++i) {
            var p = entries[i];
            for (var j = 0; j < p.tags.length; ++j) {
                if (tag === p.tags[j]) {
                    filtered.push(p);
                    break;
                }
            }
        }
        return filtered;
    };
};

/**
 * Modal menu.
 */ 
emojispeak.menu = (function () {
    var utils = emojispeak.utils;
    var button;
    var overlay;
    var box;
    //Show menu
    var switchMenu = function (visible) {
        var display = visible ? "block" : "none";
        return function () {
            overlay.style.display = display;
            box.style.display = display;
        };
    };
    //Initialize 
    var init = function () {
        //Display
        button = document.getElementById("button-menu");
        overlay = document.getElementById("overlay");
        box = document.getElementById("menu-box");
        //Events
        button.onclick = switchMenu(true);
        overlay.onclick = switchMenu(false);
        utils.blockDoubleTap(button);
    };
    return {
        init: init
    };
})();

/**
 * Manages the display options of emojispeak. Options are stored in the
 * local storage, and used to show/hide labels.
 */ 
emojispeak.settings = (function () {
    var utils = emojispeak.utils;
    //Setting entries
    var Entry = function (name, defaultValue) {
        var suffix = utils.capitalize(name);
        this.buttonId = 'button' + suffix;
        this.localName = 'show' + suffix;
        this.selector = 'p.' + name;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    };
    //Return 'On'/'Off'
    Entry.prototype.toLabel = function () {
        return this.value ? 'On' : 'Off';
    };
    //Set value from 'On'/'Off'
    Entry.prototype.fromLabel = function (label) {
        if (label) {
            this.value = label === 'On' ? true : false;
        }
    };
    //Flip on/off
    Entry.prototype.flipValue = function () {
        return this.value = !this.value;
    };
    //Show/Hide
    Entry.prototype.blockDisplay = function () {
        return this.value ? 'block' : 'none';
    };
    //Elements 
    Entry.prototype.all = function () {
        return document.querySelectorAll(this.selector);
    };
    //
    //Entries
    var entries = [];
    entries.push(new Entry('kana', true));
    entries.push(new Entry('alphabet', true));
    entries.push(new Entry('translation', true));
    //Apply current settings to the view
    var update = function (entry) {
        var elements = entry.all();
        for (var i = 0; i < elements.length; ++i) {
            elements[i].style.display = entry.blockDisplay();
        }
    };
    //Load an option from the local storage
    var load = function (entry) {
        entry.fromLabel(localStorage.getItem(entry.localName));
        update(entry);
    };
    //Load all options
    var loadAll = function () {
        for (var i = 0; i < entries.length; ++i) {
            load(entries[i]);
        }
    };
    //Save an option to the local storage
    var save = function (entry) {
        localStorage.setItem(entry.localName, entry.toLabel());
        update(entry);
    };
    //Initialize
    var init = function () {
        if (!utils.isStorageSupported()) {
            return;
        }
        loadAll();
        //Initialize button if there's any
        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            var btn = document.getElementById(entry.buttonId);
            if (!btn) {
                continue;
            }
            btn.innerHTML = entry.toLabel();
            btn.onclick = (function (e) {
                return function (ev) {
                    e.flipValue();
                    save(e);
                    this.innerHTML = e.toLabel();
                    return false;
                };
            })(entry);
        }
    };
    return {
        init: init,
        refresh: loadAll
    };
})();

/**
 * Main view. Displays a single post.
 */ 
emojispeak.view = (function () {
    var utils = emojispeak.utils;
    var block = {};
    var tagClicked = null;
    //Switch display: none/block;
    var displayStyle = function (text) {
        return text ? 'block' : 'none';
    };
    //Refresh the display
    var updateBlock = function (post, index, count) {
        if (!post) {
            //Error
            block.error.style.display = "block";
            block.post.style.display = "none";
            return;
        } else {
            block.error.style.display = "none";
            block.post.style.display = "block";
        }
        var permalink = emojispeak.siteURL + '/' + post.url;
        var permalinkTitle = "Permalink to " + post.title;
        block.title.innerHTML = post.title;
        block.title.href = permalink;
        block.title.title = permalinkTitle;
        block.emoji.style.visibility = "hidden";
        block.emoji.src = '';
        block.emoji.onload = function () {
            this.style.visibility = "visible";
        };
        block.emoji.src = emojispeak.siteURL + '/images/build/' + post.slug + '.png';
        block.emoji.width = post.width;
        block.emoji.height = post.height;
        block.kana.innerHTML = post.kana;
        block.kana.style.block = displayStyle(post.kana);
        block.romaji.innerHTML = post.romaji;
        block.romaji.style.block = displayStyle(post.romaji);
        block.english.innerHTML = post.english;
        //tags
        while (block.tags.firstChild) {
            block.tags.removeChild(block.tags.firstChild);
        }
        for (var i = 0; i < post.tags.length / 2; ++i) {
            var name = post.tags[i * 2 + 0];
            var slug = post.tags[i * 2 + 1];
            var a = document.createElement("a");
            a.href = emojispeak.siteURL + "/search.html#" + 'tag='
                    + slug;
            a.innerHTML = "#" + name;
            a.setAttribute("data-tag", slug);
            a.onclick = tagClicked;
            var l = document.createElement("li");
            l.appendChild(a);
            block.tags.appendChild(l);
        }
        //social
        block.social_gp.href = 'https://plus.google.com/share?url='
                + permalink;
        block.social_fb.href =
                'https://www.facebook.com/sharer/sharer.php?u=' + permalink;
        block.social_tw.href = 'https://twitter.com/share?url='
                + permalink + '&amp;text=' + permalinkTitle;
        //published
        block.social_perm.href = permalink;
        block.social_perm.innerHTML = post.created;
        block.social_perm.title = permalinkTitle;
        //modified

    };
    //Refresh asynchronously
    var previousTimeout;
    var load = function (post, index, count) {
        utils.fadeAll(block.crossfade, 0);
        clearTimeout(previousTimeout);
        previousTimeout = setTimeout(function () {
            updateBlock(post, index, count);
            utils.fadeAll(block.crossfade, 1);
        }, 500);
    };
    //Initialize 
    var init = function () {
        //Display
        block = {
            crossfade: document.querySelectorAll(".crossfade"),
            error: document.getElementById("error"),
            post: document.getElementById("post"),
            title: document.getElementById("title"),
            emoji: document.getElementById("emoji"),
            kana: document.getElementById("kana"),
            romaji: document.getElementById("romaji"),
            english: document.getElementById("english"),
            tags: document.getElementById("tags"),
            social_gp: document.getElementById("social_gp"),
            social_fb: document.getElementById("social_fb"),
            social_tw: document.getElementById("social_tw"),
            social_perm: document.getElementById("social_perm"),
            modified: document.getElementById("modified")
        };
        return emojispeak.view;
    };
    return {
        init: init,
        load: load,
        setTagClicked: function (func) {
            tagClicked = func;
        }
    };
})();

/**
 * Displays the main paginator.
 */ 
emojispeak.navigation = (function () {
    var utils = emojispeak.utils;
    var block = {};
    var next = null;
    var previous = null;
    //Set label 
    var setLabel = function (label) {
        block.filter.style.display = label ? "block" : "none";
        block.label.innerHTML = label || "";
    };
    //Switch icons
    var iconClass = function (enabled) {
        return enabled ? 'material-icons' : 'material-icons md-inactive';
    };
    //Update the navigation
    var load = function (index, count) {
        //navigator
        block.page.innerHTML = index + " of " + count;
        block.prev.firstElementChild.className = iconClass(index > 1);
        block.next.firstElementChild.className = iconClass(index < count);
    };
    //Initialize
    var init = function () {
        block = {
            page: document.getElementById("page"),
            prev: document.getElementById("button-previous"),
            next: document.getElementById("button-next"),
            filter: document.getElementById("nav-filter"),
            label: document.getElementById("label-filter")
        };
        //Events
        block.prev.onclick = function () {
            previous();
        };
        block.next.onclick = function () {
            next();
        };
        utils.blockDoubleTap(block.next);
        utils.blockDoubleTap(block.prev);
        return emojispeak.navigation;
    };
    return {
        init: init,
        load: load,
        setNext: function (func) {
            next = func;
        },
        setPrevious: function (func) {
            previous = func;
        },
        setLabel: setLabel
    };
})();

//---
// Initializers
//---

/**
 * Initializes the common modules: menu, settings.
 */ 
emojispeak.initCommon = function () {
    var menu = emojispeak.menu;
    var settings = emojispeak.settings;
    menu.init();
    settings.init();
};

/**
 * Initializes the index page. This module supports dynamic
 * loading of posts.  
 */ 
emojispeak.initIndex = function () {
    emojispeak.initCommon();
    var utils = emojispeak.utils;
    var view = emojispeak.view.init();
    var navigation = emojispeak.navigation.init();
    var posts = emojispeak.posts;
    //Navigation
    var currentPage = -1;
    //Move to the page without invoking history change
    var moveTo = function (page) {
        page = page < 1 ? 1
                : (posts.count() <= page ? posts.count() : page);
        if (currentPage != page) {
            currentPage = page;
            var post = page > 0 ? posts.get(page - 1) : null;
            view.load(post, page, posts.count());
            navigation.load(page, posts.count());
            return post.url;
        }
        return null;
    };
    //Change the hash part of URL
    var replaceHash = function (hash) {
        var url = window.location.href.replace(window.location.hash, '');
        return url + hash;
    };
    //Move to the page leaving a trace in history 
    var jumpTo = function (page) {
        if (moveTo(page)) {
            history.pushState(currentPage, null, replaceHash('#page=' + page));
        }
    };
    //Buttons
    navigation.setNext(function () {
        jumpTo(currentPage + 1);
    });
    navigation.setPrevious(function () {
        jumpTo(currentPage - 1);
    });
    //Parse hash
    var parseHash = function (hash) {
        var p = /(^|&)page=(\w+)/g.exec(hash);
        var page = (p && p.length > 2) ? p[2] : null;
        return parseInt(page);
    };
    //Initialize
    posts.reload(function () {
        //Check hash string (e.g., index.html#page=xx).
        var p = parseHash(window.location.hash.substring(1)) || posts.count();
        var url = moveTo(p);
        //history.replaceState(p, null, replaceHash('#page=' + p));
        utils.showHidden();
        //Start listening history change
        window.addEventListener('popstate', function (e) {
            var page = parseInt(e.state) 
                || parseHash(window.location.hash.substring(1)) 
                || posts.count();
            moveTo(page);
        });
    });
};

/**
 * Represents search parameters used in the search module.
 */
emojispeak.query = (function () {
    //Query object to store search arguments
    var Query = function (category, tag, page) {
        this.category = category;
        this.tag = tag;
        this.page = page;
    };
    //Create hash string from query object
    var toHash = function (q) {
        if (q.category) {
            return "#cat=" + q.category + "&page=" + q.page;
        }
        if (q.tag) {
            return "#tag=" + q.tag + "&page=" + q.page;
        }
        return "#page=" + q.page;
    };
    //Create query object from hash string
    var fromHash = function (hash) {
        var take2 = function (array) {
            return (array && array.length > 2) ? array[2] : null;
        };
        var c = /(^|&)cat=(\w+)/g.exec(hash);
        var t = /(^|&)tag=([\w.\-]+)/g.exec(hash);
        var p = /(^|&)page=(\w+)/g.exec(hash);
        return new Query(take2(c), take2(t), parseInt(take2(p)) || 1);
    };
    var create = function (category, tag, page) {
        return new Query(category, tag, page);
    };
    //Check equality of two queries excluding page values.
    var compare = function (q0, q1) {
        return (null == q0 && null == q1)
                || ((null != q0 && null != q1)
                        && (q0.category === q1.category)
                        && (q0.tag === q1.tag));
    };
    return {
        create: create,
        fromHash: fromHash,
        toHash: toHash,
        compare: compare
    };
})();

/**
 * Displays search results using a tag or category.
 */ 
emojispeak.initSearch = function () {
    emojispeak.initCommon();
    var utils = emojispeak.utils;
    var view = emojispeak.view.init();
    var navigation = emojispeak.navigation.init();
    var posts = emojispeak.posts;
    var query = emojispeak.query;
    var currentQuery = null;
    //Navigation
    var updateView = function () {
        var page = currentQuery ? currentQuery.page : null;
        var post = currentQuery ? posts.get(page - 1) : null;
        view.load(post, page, posts.count());
        navigation.load(page, posts.count());
    };
    //Change the hash part of URL
    var replaceHash = function (hash) {
        var url = window.location.href.replace(window.location.hash, '');
        return url + hash;
    };
    //Partial update on query 
    var moveTo = function (page) {
        page = page < 1 ? 1
                : (posts.count() <= page ? posts.count() : page);
        if (currentQuery.page != page) {
            currentQuery.page = page;
            updateView();
            history.pushState(currentQuery, null,
                    replaceHash(query.toHash(currentQuery)));
        }
    };
    //Update the entire query
    var updateQuery = function (q) {
        if (!query.compare(currentQuery, q)) {
            if (q && q.category) {
                posts.setFilter(emojispeak.filterByCategory(q.category));
            } else if (q && q.tag) {
                posts.setFilter(emojispeak.filterByTag(q.tag));
            } else {
                posts.setFilter(null);//Or error
            }
            var label = !q ? null
                    : q.category ? ("Category: " + utils.capitalize(q.category))
                    : q.tag ? ("Tag: " + q.tag) : "";
            navigation.setLabel(label);
        }
        currentQuery = q;
        updateView();
    };
    //Buttons
    navigation.setNext(function () {
        moveTo(currentQuery.page + 1);
    });
    navigation.setPrevious(function () {
        moveTo(currentQuery.page - 1);
    });
    view.setTagClicked(function (e) {
        var tag = this.getAttribute('data-tag');
        updateQuery(query.create(null, tag, 1));
        history.pushState(currentQuery, null,
                replaceHash(query.toHash(currentQuery)));
        e.preventDefault();
    });
    //Initialize
    posts.reload(function () {
        var q = query.fromHash(window.location.hash.substring(1));
        history.replaceState(q, null, replaceHash(query.toHash(q)));
        updateQuery(q);
        utils.showHidden();
        //Start listening history change
        window.addEventListener('popstate', function (e) {
            updateQuery(e.state);
        });
    });
};

/**
 * Displays each page. This is primarily used when the target page
 * is accessed via a permalink rather than the index page.
 */
emojispeak.initPost = function (indexURL, currentPage, pageCount) {
    var utils = emojispeak.utils;
    emojispeak.initCommon();
    var navigation = emojispeak.navigation.init();
    //Buttons
    var nextPage = currentPage + 1;
    var prevPage = currentPage - 1;
    navigation.setNext(function () {
        window.location = indexURL + '#page=' + nextPage;
    });
    navigation.setPrevious(function () {
        window.location = indexURL + '#page=' + prevPage;
    });
    navigation.load(currentPage, pageCount);
    utils.showHidden();
};

/**
 * Displays a single page that doesn't contain an emoji post. 
 * Used by about.html, settings.html among others.
 */
emojispeak.initPage = function () {
    emojispeak.initCommon();
    emojispeak.utils.showHidden();
};

/**
 * Entry point. Switches Non-JS/JS style of the top html element.
 */
(function () {
    //Switch no-js/js
    document.documentElement.className =
            document.documentElement.className.replace("no-js", "js");
})();
