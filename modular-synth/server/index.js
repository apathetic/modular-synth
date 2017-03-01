
var express = require('express');
var app = express();

// NOTE... i will do this with a db... eventually
// var FM = require('../static/patches/FM');
// var mod = require('../static/patches/Mod');
// var blank = require('../static/patches/blank');
// var grid = require('../static/patches/gridTest');
// var miditest = require('../static/patches/midiTest');
// var juno = require('../static/patches/juno');

// var json = {
//   patches: [
//     FM,
//     mod,
//     blank,
//     grid,
//     juno,
//     miditest
//   ]
// };

// app.use(express.static('static'))

app.use('/api', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var json, patch, params = {};

  console.log(req.path);

  // send patch list
  if (req.path == '/patches') {
    json = {
      patches: ['FM', 'mod', 'blank', 'grid', 'juno', 'miditest']
    };
    res.send(JSON.stringify(json));
    return;

  // send a particular patch + params
  } else {
    switch (req.path) {
      case '/patches/juno':
        patch = require('../static/patches/juno/patch');
        params = require('../static/patches/juno/_params');
        break;
      case '/patches/blank':
        patch = require('../static/patches/blank/patch');
        break;

      default:
        res.send('not found');
        return;
    }

    var json = {
      patch: patch,
      params: [
        params
      ]
    };

    console.log('returning', json);
    res.send(JSON.stringify(json));
  }
});

app.listen(8081);
console.log('api server running');
