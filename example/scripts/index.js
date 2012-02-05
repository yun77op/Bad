(function() {
  var slice = Array.prototype.slice;

  Bad.container = document.getElementById('content');

  var tmpls = {
    index: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    join: 'Wow wow wow, join <strong>us</strong>',
    ninja: '<div class="subject clearfix"><div id="mainpic"><a title="Secrets of the JavaScript Ninja" href="http://img1.douban.com/lpic/s4683232.jpg" class="nbg"><img rel="v:photo" alt="Secrets of the JavaScript Ninja" title="点击看大图" src="http://img1.douban.com/mpic/s4683232.jpg"></a><br></div><div id="info"><span><span class="pl">作者</span>: <a href="http://ejohn.org/">John Resig</a> / <a href="http://www.bibeault.org/">Bear Bibeault</a></span><br><span class="pl">出版社:</span> Manning Publications<br><span class="pl">出版年:</span> 2012-3-28<br><span class="pl">页数:</span> 300<br><span class="pl">定价:</span> USD 39.99<br><span class="pl">装帧:</span> Paperback<br><span class="pl">ISBN:</span> 9781933988696<br></div></div>',
    blog: 'Bloooooooooooooooooooooooooooog',
    contact: '囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧囧',
    help: '<p>Start Here.  Ask a question, post a rant, tell us your story. </p><button onclick="Bad.showPageByName(\'helpWindow\', true);">Open help window</button>',
    helpWindow: 'A long long long story'
  };

  var indexPage = new Bad.InlinePage({
    name: 'index',
    title: 'Bad',
    path: '/',
    initialize: function() {

    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var ninjaPage = new Bad.InlinePage({
    name: 'ninja',
    title: 'Ninja',
    path: '/ninja',
    initialize: function() {

    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var helpPage = new Bad.InlinePage({
    name: 'help',
    title: 'Help',
    path: '/help',
    initialize: function() {

    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var helpWindow = new Bad.Window({
    name: 'helpWindow',
    title: 'Help window',
    path: '/helpwin',
    initialize: function() {

    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var joinWindow = new Bad.Window({
    name: 'join',
    title: 'Join us',
    path: '/join',
    width: 500,
    initialize: function() {

    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var aboutWindow = new Bad.Window({
    name: 'about',
    title: 'About',
    path: '/about',
    width: 500,
    initialize: function() {
      this.bind('didShowPage', function(e) {

        function showTab(itemNode, updateHistory) {
          if (itemNode.classList.contains('ui-state-active'))
            return;

          var linkNode = itemNode.querySelector('a');
          var pageName = linkNode.getAttribute('data-page');

          Bad.showPageByName(pageName, updateHistory);
        }

        // UI Tab component
        $('#about .ui-tab-nav').delegate('li', 'click', function(e) {
          // Prevent link click redirect
          e.preventDefault();
          showTab(this, true);
        });

        if (location.pathname == this.path) {
          var defaultNavItemNode = document.querySelector('#about .ui-tab-nav li:first-child');
          showTab(defaultNavItemNode);
        }
      });
    },

    getPageContent: function(callback) {
      Bad.getTemplate('about', function(tmpl) {
        callback(null, tmpl);
      });
    }
  });

  var blogWindow = new Bad.Window({
    name: 'blog',
    title: 'Blog',
    path: '/blog',
    initialize: function() {
      this.bind('didShowPage', function() {
        var itemNode = document.querySelector('#about .ui-tab-nav-' + this.name);
        var activeState = 'ui-state-active';
        var prevActiveNavItem = itemNode.parentNode.querySelector('.' + activeState);
        if (prevActiveNavItem)
          prevActiveNavItem.classList.remove(activeState);
        itemNode.classList.add(activeState);
      });
    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  var contactWindow = new Bad.Window({
    name: 'contact',
    title: 'Contact',
    path: '/contact',
    initialize: function() {
      this.bind('didShowPage', function() {
        var itemNode = document.querySelector('#about .ui-tab-nav-' + this.name);
        var activeState = 'ui-state-active';
        var prevActiveNavItem = itemNode.parentNode.querySelector('.' + activeState);
        if (prevActiveNavItem)
          prevActiveNavItem.classList.remove(activeState);
        itemNode.classList.add(activeState);
      });
    },

    getPageContent: function(callback) {
      var html = tmpls[this.name];
      callback(null, html);
    }
  });

  Bad.registerPage(ninjaPage);
  Bad.registerPage(helpPage);
  Bad.registerPage(helpWindow);
  Bad.registerPage(indexPage);
  Bad.registerPage(joinWindow);
  Bad.registerPage(aboutWindow);
  Bad.registerPage(blogWindow);
  Bad.registerPage(contactWindow);


  Bad.registerSubPage(helpWindow, helpPage);

  Bad.registerSubPage(blogWindow, aboutWindow, '#about .ui-tab-panel');
  Bad.registerSubPage(contactWindow, aboutWindow, '#about .ui-tab-panel');

  var navLinkNodes = slice.call(document.querySelectorAll('nav a'));
  navLinkNodes.forEach(function(el) {
    el.onclick = function(e) {
      e.preventDefault();
      var pageName = this.getAttribute('data-page');
      Bad.showPageByName(pageName, true);
    };

  });

  document.addEventListener('DOMContentLoaded', function() {
    Bad.defaultRoute(indexPage);
    document.querySelector('.site-title a').onclick = function(e) {
      e.preventDefault();
      Bad.showPageByName('index', true);
    };
  }, false);
})();