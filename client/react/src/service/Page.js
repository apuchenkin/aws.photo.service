import fetch from 'isomorphic-fetch';
import config from '../config.json';

// var url = require('url');
// var url_parts = url.parse(request.url, true);
// var query = url_parts.query;

const defaults = {
  locale: 'en',
  location: config.apiEndpoint,
}

const CategoryService = class {

  constructor(options = defaults) {
    this.token = options.token;
    this.location = options.location;
    this.locale = options.locale;
    this.contentType = 'application/json; charset=utf-8';
  }

  fetchPages () {
    let me = this;

    return fetch(me.location + config.apiPrefix + '/page', {
        headers: {
          'Authorization': me.token,
          'Accept-Language': me.locale,
          'Content-Type': me.contentType
        },
      })
      .then(response => {
        return response.text();
      })
      .then(stream => {
        return JSON.parse(stream);
      })
  }
};

export default CategoryService;
