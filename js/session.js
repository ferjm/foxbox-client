'use strict';

(function(exports) {
  exports.Session = {
    _session: null,

    get: function() {
      try {
        this._session = JSON.parse(localStorage.getItem('session'));
      } catch(e) {
        console.error(e);
      }
      return this._session;
    },

    set: function(host, username, pwd) {
      if (!host || !username || !pwd) {
        return Promise.reject();
      }

      return fetch(host + '/users/login', {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({
          'Authorization': 'Basic ' + btoa(username + ':' + pwd)
        }),
      }).then(function(response) {
        return response.json();
      }).then(function(json) {
        if (!json.session_token) {
          throw new Error();
        }
        this._session = {
          host: host,
          token: json.session_token
        };
        localStorage.setItem('session', JSON.stringify(this._session));
        this._host = host;
      }.bind(this));
    },

    clear: function() {
      localStorage.setItem('session', '');
    },

    request: function(method, endpoint, body) {
      var options = {
        method: method,
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({
          'Authorization': 'Bearer ' + this._session.token
        })
      };

      if (body && body.length) {
        options.body = body;
      }

      return fetch(this._session.host + endpoint, options);
    }
  };
}(window));
