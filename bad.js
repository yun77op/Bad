(function(global) {

  var slice = Array.prototype.slice;

  function extend(obj) {
    slice.call(arguments, 1).forEach(function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  }

  var Bad = {};
  var registeredPages = {};
  var convertedPageName;


  Bad.container = null;

  Bad.activePage_ = null;
  Bad.reservedInlinePagePath_;

  Bad.registerPage = function(page) {
    registeredPages[page.name] = page;
    page.initialize = page.initialize || function(){};
    page.initialize();
  };

  Bad.registerSubPage = function(subPage, parentPage, selector) {
    subPage.parentPage = parentPage;
    if (selector)
      subPage.pageContainerSelector = selector;
  };

  Bad.getPageByPath = function(path) {
    var pageName, page;
    for (pageName in registeredPages) {
      page = registeredPages[pageName];
      if (page.path == path)
        return page;
    }
    return null;
  };

  Bad.showPageByName = function(name, updateHistory, replaceState) {
    var targetPage = registeredPages[name];
    var activePage = this.activePage_;

    // The page is already in history (the user may have clicked the same link
    // twice). Do nothing.
    if (activePage && activePage.name == targetPage.name)
      return;

    
    //Show hierarchy

    var pages = [];
    var page;

    //TODO siblings
    if (activePage && targetPage.isAncestorOfPage(activePage)) {
      pages.push(targetPage);
    } else {
      page = targetPage;
      while (page && (!activePage || page.name !== activePage.name)) {
        pages.push(page);
        page = page.parentPage;
      }
      
      if (activePage && !activePage.isAncestorOfPage(targetPage) &&
          targetPage instanceof InlinePage) {
        convertedPageName = null;
      }
    }

    // Rerverse order
    pages.reverse();

    this.activePage_ = targetPage;
    this.setupReservedPath_(targetPage);

    var topmostPage = pages[0];
    if (!activePage && !(topmostPage instanceof InlinePage) ||
        topmostPage.name == convertedPageName) {
      topmostPage = this.convertToInlinePage(topmostPage);
      pages[0] = topmostPage;

      convertedPageName = topmostPage.name;
    }


    targetPage = pages.pop();

    var tasks = pages.map(function(page) {
      return function(callback) {
        page.show(callback);
      };
    });

    async.series(tasks, function() {
      targetPage.emit('willShowPage', targetPage);
      targetPage.show(function() {
        if (updateHistory)
          Bad.updateHistoryState_(replaceState);
        document.title = targetPage.title;
      });
    });
  };

  /**
   * @friend
   */
  Bad.updateHistoryState_  = function(replaceState) {
    var page = this.activePage_;
    var path = location.pathname;
    if (path)
      path = path.slice(1).replace(/\/$/, '');  // Remove trailing slash.

    // If there is no path, the current location is /.
    // Override this with the new page.
    var historyFunction = (!path || replaceState) ? window.history.replaceState :
                                 window.history.pushState;
    historyFunction.call(window.history,
                         {pageName: page.name},
                         page.title,
                         page.path);
  };

  Bad.setState = function(data) {
    if (data && data.pageName) {
      this.showPageByName(data.pageName, false);
    }
  };

  Bad.defaultRoute = function(fallbackPage) {
    var path = location.pathname;
    var page = this.getPageByPath(path);
    if (page) {
      Bad.showPageByName(page.name, true);
    } else {
      Bad.showPageByName(fallbackPage.name, true, true);
    }
  };

  Bad.convertToInlinePage = function(page, props) {
    var data = {};
    var prop;
    for (prop in page) {
      if (page.hasOwnProperty(prop)) {
        data[prop] = page[prop];
      }
    }
    data = extend(data, props);
    return new InlinePage(data);
  };

  Bad.setupReservedPath_ = function(page) {
    var ancestorPage = page.getAncestorPage();
    if (ancestorPage && ancestorPage instanceof InlinePage) {
      this.reservedInlinePagePath_ = ancestorPage.path;
    } else if (!Window.isWindowVisible()) {
      this.reservedInlinePagePath_ = location.pathname;
    }
  };


  'Bad' in global || (global.Bad = Bad);


  /**
   * Page class
   * @class
   */

  function Page(data) {
    EventProxy.call(this);
    extend(this, data);
  }

  Page.prototype = {
    constructor: Page,

    __proto__: EventProxy.prototype,

    initialize: function() {},

    getPageContent: function() {},

    emitDidShowPage: function() {
      var self = this;
      //DOM ready
      window.setTimeout(function() {
        self.emit('didShowPage');
      }, 0);
    },

    isAncestorOfPage: function(page) {
      var parent = page.parentPage;
      while (parent) {
        if (parent.name == this.name)
          return true;
        parent = parent.parentPage;
      }
      return false;
    },

    isSlibingPage: function(page) {
      return page && page.parentPage &&
        this.parentPage && this.parentPage.name == page.parentPage.name;
    },

    getAncestorPage: function() {
      var page = this;
      if (!page.parentPage)
        return null;

      while (page.parentPage) {
        page = page.parentPage;
      }
      return page;
    }
  };


  function Window(data) {
    extend(this, Window.DEFAULTS);
    Page.call(this, data);
  }

  Window.DEFAULTS = {
    hideOnOverlayClick: true,
    hideOnContentClick: false,

    width: 600
  };

  Window.WRAPPER = '<div class="window-wrapper"><div class="window"><div class="window-header"><h1 class="window-title"></h1><div class="window-control"><button class="window-control-close"></button></div></div><div class="window-content">Hello world</div></div></div>';

  Window.initialize = function() {
    var overlay = document.createElement('div');
    overlay.className = 'window-overlay';
    overlay.hidden = true;
    overlay.innerHTML = Window.WRAPPER;
    document.body.appendChild(overlay);

    var wrapper = overlay.querySelector('.window-wrapper');
    wrapper.querySelector('.window-control-close').onclick = function() {
      Window.hide(true);
    };

    Window.overlay = overlay;
    Window.wrapper = wrapper;
  };

  Window.hide = function(updateHistory) {
    if (updateHistory) {
      var targetPage = Bad.getPageByPath(Bad.reservedInlinePagePath_);
      Bad.showPageByName(targetPage.name, true);
    }
    Window.overlay.hidden = true;
  };

  Window.isWindowVisible = function() {
    return !Window.overlay.hidden;
  };

  Window.getVisibleWindow = function() {
    var activePage = Bad.activePage_;
    return activePage instanceof Window ? activePage : null;
  };

  Window.getRootVisibleWindow = function() {
    var visibleWindow = this.getVisibleWindow();
    var win = visibleWindow;
    while(win) {
      if (!win.parentPage || win.parentPage instanceof InlinePage)
        return win;
      win = win.parentPage;
    }
    return null;
  };


  Window.prototype = {
    constructor: Window,

    __proto__: Page.prototype,

    estimateSize_: function() {
      
    },

    getViewpoint_: function() {
      return [
        window.innerWidth,
        window.innerHeight,
        document.body.scrollLeft,
        document.body.scrollTop
      ];
    },

    show: function(callback) {
      var isSubPage = this.parentPage && this.parentPage instanceof Window;
      this[isSubPage ? 'showSubPage_' : 'showRootPage_'](callback);
    },

    showRootPage_: function(callback) {
      var self = this;
      this.setTitle_(this.title);
      this.getPageContent(function(err, pageContent) {
        self.setContent_(pageContent);
        self.position_();
        self.setupBehaviours_();
        if (!Window.isWindowVisible()) {
          Window.overlay.hidden = false;
        }

        self.emitDidShowPage();
        callback && callback();
      });
    },

    showSubPage_: function(callback) {
      var self = this;
      this.getPageContent(function(err, pageContent) {
        var container = document.querySelector(self.pageContainerSelector);
        container.innerHTML = pageContent;

        self.emitDidShowPage();
        callback && callback();
      });
    },

    position_: function() {
      var width = this.width ? this.width : this.estimateSize_();
      var cssText = [];
      cssText.push('width:' + width + 'px;');
      
      var viewpoint = this.getViewpoint_();
      var left = (viewpoint[0] - width) / 2 + viewpoint[2];
      cssText.push('left:' + left + 'px;');

      Window.wrapper.style.cssText = cssText.join('');
    },

    setTitle_: function(title) {
      Window.wrapper.querySelector('.window-title').innerHTML = title;
      return this;
    },

    setContent_: function(content) {
      Window.wrapper.querySelector('.window-content').innerHTML = content;
      return this;
    },

    setupBehaviours_: function() {
      if (this.hideOnOverlayClick) {
        Window.overlay.onclick = function() {
          Window.hide(true);
        };
      }

      if (!this.hideOnContentClick) {
        Window.wrapper.querySelector('.window').addEventListener('click', function(e) {
          e.stopPropagation();
        }, false);
      }
      

    }
  };



  function InlinePage(data) {
    extend(this, InlinePage.DEFAULTS);
    Page.call(this, data);
  }

  InlinePage.DEFAULTS = {
    layout: 'fixed'
  };

  InlinePage.prototype = {
    constructor: InlinePage,

    __proto__: Page.prototype,

    show: function(callback) {
      var self = this;

      Window.hide();
      this.getPageContent(function(err, pageContent) {
        self.setupLayout();
        self.setupPage();
        Bad.container.innerHTML = pageContent;

        self.emitDidShowPage();
        callback && callback();
      });
    },

    setupLayout: function() {
      this.setBodyClassName('layout', this.layout);
    },

    setupPage: function() {
      this.setBodyClassName('page', this.name);
    },

    setBodyClassName: function(prefix, name) {
      var body = document.body;
      prefix += '-';
      var prevCls = body.className.match(new RegExp(prefix + '\\w+'));
      if (prevCls)
        body.classList.remove(prevCls[0]);
      body.classList.add(prefix + name);
    }
  };

  

  function Popup(data) {
    Page.call(this, data);
  }

  Popup.prototype = {
    constructor: Popup,

    __proto__: Page.prototype,

    position: function() {
      
    }

  };

  Bad.Window = Window;
  Bad.Popup = Popup;
  Bad.InlinePage = InlinePage;

  document.addEventListener('DOMContentLoaded', function() {
    Window.initialize();

  }, false);

  window.onpopstate = function(e) {
    Bad.setState(e.state);
  };


})(window);

/**
 * Templates
 * V5 @see https://github.com/V5Framework/
 */
(function (global) {
  var Bad = global.Bad;
  Bad._templates = {};

  /**
   * @description templateMode, optimized or normal.
   */
  Bad.templateMode = "normal";

  var getTemplateNormally = function (name, callback) {
    var template = Bad._templates[name];
    if (template) {
      callback(template);
    } else {
      $.get("templates/" + name + ".tmpl?_=" + new Date().getTime(), function (templ) {
        Bad._templates[name] = templ;
        callback(templ);
      });
    }
  };

  var getTemplateOptimized = function (name, callback) {
    var template = Bad._templates[name];
    if (template) {
      callback(template);
    } else {
      $.get("templates/optimized_combo.tmpl?_=" + new Date().getTime(), function (templ) {
        $(templ).find("script").each(function (index, script) {
          var templateNode = $(script);
          var id = templateNode.attr("id");
          Bad._templates[id] = templateNode.html();
        });
        callback(Bad._templates[name]);
      });
    }
  };

  /**
   * @description Fetch the template file.
   */
  Bad.getTemplate = function (name, callback) {
    if (Bad.templateMode === "normal") {
      getTemplateNormally(name, callback);
    } else {
      getTemplateOptimized(name, callback);
    }
  };

}(window));