'use strict';

require('./index.html');
var Elm = require('./Main');
var Packery = require('packery');
var css = require("!style!css!less!../assets/styles/main.less");

var Main = Elm.embed(Elm.Main, document.getElementById('main'), {localePort: navigator.language});

Main.ports.meta.subscribe(metaUpdate);
var links = {};

function metaUpdate(meta) {
  document.title = meta.title;
  meta.links.map(function(data) {
    var link = links[data[0]] || document.head.appendChild(document.createElement('link'));
    link.href = data[1];
    link.rel = "alternate";
    link.hreflang = data[0];
    links[data[0]] = link;
  })
}

// vanilla JS
var grid = document.querySelector('.gallery');
// initialize with element
var pckry = new Packery( grid, {
  columnWidth: 100,
  itemSelector: 'a',
  gutter: 10
});
