'use strict';

var SIGN_IN = 0;
var SIGNED_IN = 1;

var ELEMENTS = [{
  screen: SIGN_IN,
  selector: '#host-input'
}, {
  screen: SIGN_IN,
  selector: '#user'
}, {
  screen: SIGN_IN,
  selector: '#password'
}, {
  screen: SIGN_IN,
  selector: '#signin-button',
  event: 'click',
  listener: 'signin'
}, {
  screen: SIGNED_IN,
  selector: '#host'
}, {
  screen: SIGNED_IN,
  selector: '#signout-button',
  event: 'click',
  listener: 'signout'
}, {
  screen: SIGNED_IN,
  selector: '#services-list'
}, {
  screen: SIGNED_IN,
  selector: '#endpoint'
}, {
  screen: SIGNED_IN,
  selector: '#method'
}, {
  screen: SIGNED_IN,
  selector: '#body'
}, {
  screen: SIGNED_IN,
  selector: '#send-button',
  event: 'click',
  listener: 'send'
}, {
  screen: SIGNED_IN,
  selector: '#response'
}];

function getElementName(str) {
  str = str.toLowerCase().replace('#', '');
  return str.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

var App = {
  get session() {
    if (!this._session) {
      this._session = Session.get();
    }
    return this._session;
  },

  init: function() {
    App.elements = {};
    App.screens = {
      signin: document.querySelector('#signin'),
      signedin: document.querySelector('#signedin')
    };
    if (App.session === null ||
        App.session.token === null ||
        !App.session.token.length) {
      App.show(SIGN_IN);
    } else {
      App.show(SIGNED_IN);
      App.showServices();
    }
  },

  addListener: function(element, event, listener) {
    if (!element || !event || !listener) {
      return;
    }
    element.addEventListener(event, this[listener]);
  },

  removeListener: function(element, event, listener) {
    if (!element || !event || !listener) {
      return;
    }
    element.removeEventListener(event, this[listener]);
  },

  loadElements: function(screen) {
    var self = this;
    ELEMENTS.forEach(function(element) {
      var name = getElementName(element.selector);
      if (element.screen == screen) {
        try {
          self.elements[name] = document.querySelector(element.selector);
        } catch (e) {}
        if (element.event && element.listener) {
          self.addListener(self.elements[name],
                           element.event, element.listener);
        }
        return;
      }
      if (element.event && element.listener) {
        self.removeListener(self.elements[name],
                            element.event, element.listener);
      }
      self.elements[name] = null;
    });
  },

  show: function(screen) {
    if (this.currentScreen == screen) {
      return;
    }
    this.currentScreen = screen;
    this.screens.signin.hidden = (screen != SIGN_IN);
    this.screens.signedin.hidden = (screen != SIGNED_IN);
    this.loadElements(screen);
  },

  showServices: function() {
    if (!App.elements.servicesList) {
      return;
    }
    Session.request('GET', '/services/list.json').then(function(response) {
      console.log(response);
      return response.json();
    }).then(function(list) {
      console.log(list);
      App.elements.servicesList.textContent = list.length ? list :
        'No registered services';
    }).catch(function(error) {
      console.error(error);
    });
  },

  signin: function() {
    var host = App.elements.hostInput.value;
    var pwd = App.elements.password.value;
    var user = App.elements.user.value;

    Session.set(host, user, pwd).then(function() {
      App.show(SIGNED_IN);
      App.showServices();
    }).catch(function(error) {
      window.alert('Signin error ' + error);
    });
  },

  signout: function() {
    Session.clear();
    App.show(SIGN_IN);
  }
};

document.addEventListener('DOMContentLoaded', App.init);
