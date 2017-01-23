var express = require('express');
var app = express();

var FM = require('../static/patches/FM');
var mod = require('../static/patches/Mod');
var blank = require('../static/patches/blank');
var grid = require('../static/patches/gridTest');
var miditest = require('../static/patches/midiTest');
var juno = require('../static/patches/juno');

var json = {
  patches: [
    FM,
    mod,
    blank,
    grid,
    juno,
    miditest
  ]
};

// app.use(express.static('static'))

app.use('/api', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send( JSON.stringify(json) );
});

app.listen(8081);
console.log('api server running');
