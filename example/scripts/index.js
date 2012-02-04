
var slice = Array.prototype.slice;

Bad.container = document.getElementById('content');

var tmpls = {
  index: 'Index it',
  join: 'Wow wow wow, join <strong>us</strong>',
  tos: 'This is our term of use',
  blog: 'Bloooooooooooooooooooooooooooog',
  contact: 'Contact us',
  help: 'Help me <button onclick="Bad.showPageByName(\'helpWindow\', true);">Open help window</button>',
  helpWindow: 'A long long long story'
};

var indexPage = new Bad.InlinePage({
  name: 'index',
  title: 'Bad',
  path: '/',
  initialize: function() {

  },

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
  }
});

var tosPage = new Bad.InlinePage({
  name: 'tos',
  title: 'Term of use',
  path: '/tos',
  initialize: function() {

  },

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
  }
});

var helpPage = new Bad.InlinePage({
  name: 'help',
  title: 'Help',
  path: '/help',
  initialize: function() {

  },

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
  }
});

var helpWindowPage = new Bad.Window({
  name: 'helpWindow',
  title: 'Help window',
  path: '/helpwin',
  initialize: function() {

  },

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
  }
});

var joinWindow = new Bad.Window({
  name: 'join',
  title: 'Join us',
  path: '/join',
  width: 500,
  initialize: function() {

  },

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
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

      // if (location.pathname == this.path) {
      //   var defaultNavItemNode = document.querySelector('#about .ui-tab-nav li:first-child');
      //   showTab(defaultNavItemNode);
      // }
    });
  },

  getPageContent: function(fn) {
    Bad.getTemplate('about', function(tmpl) {
      fn(tmpl);
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

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
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

  getPageContent: function(fn) {
    var html = tmpls[this.name];
    fn(html);
  }
});

Bad.registerPage(tosPage);
Bad.registerPage(helpPage);
Bad.registerPage(helpWindowPage);
Bad.registerPage(indexPage);
Bad.registerPage(joinWindow);
Bad.registerPage(aboutWindow);
Bad.registerPage(blogWindow);
Bad.registerPage(contactWindow);


Bad.registerSubPage(helpWindowPage, helpPage);

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
  Bad.defaultRoute();

}, false);
