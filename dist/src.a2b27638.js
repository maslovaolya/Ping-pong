// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/index.js":[function(require,module,exports) {
var canvas = document.getElementById("cnvs");
var timeIngame = 0;
var lose = false;
var killBonus = false;
var isBonus = false;
var gameState = {};

function onMouseMove(e) {
  if (lose) {
    return;
  }

  gameState.pointer.x = e.pageX;
  gameState.pointer.y = e.pageY;
}

function queueUpdates(numTicks) {
  for (var i = 0; i < numTicks; i++) {
    gameState.lastTick = gameState.lastTick + gameState.tickLength;
    update(gameState.lastTick);
  }
}

function draw(tFrame) {
  var context = canvas.getContext('2d'); // clear canvas

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatform(context);
  drawBall(context);
  drawTime(context);
  drawBonus(context);
}

function update(tick) {
  var vx = (gameState.pointer.x - gameState.player.x) / 10;
  gameState.player.x += vx;

  if (gameState.ball.y > canvas.height) {
    stopGame(gameState.stopCycle);
    lose = true;
  }

  moveBall();
  moveBonus();
}

function moveBall() {
  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;
  collisionPlatform();
  collisionUpside();
  collisionRightside();
  collisionLeftside();
}

function collisionPlatform() {
  if (canvas.height - gameState.player.height <= gameState.ball.y + gameState.ball.radius && gameState.player.x - gameState.player.width / 2 < gameState.ball.x && gameState.ball.x < gameState.player.x + gameState.player.width / 2 && gameState.ball.vy > 0 && gameState.ball.y < canvas.height) {
    gameState.ball.vy *= -1;
  }
}

function collisionUpside() {
  if (gameState.ball.y <= 0) {
    gameState.ball.vy *= -1;
  }
}

function collisionRightside() {
  if (gameState.ball.x > canvas.width) {
    gameState.ball.vx *= -1;
  }
}

function collisionLeftside() {
  if (gameState.ball.x <= 0) {
    gameState.ball.vx *= -1;
  }
}

function generateBonus() {
  gameState.bonus.x = getRandomInRange(0, canvas.width);
  gameState.bonus.y = getRandomInRange(0, canvas.height / 3);
  gameState.bonus.vx = getRandomInRange(-2, 2);
  gameState.bonus.vy = getRandomInRange(5, 10);
}

function moveBonus() {
  gameState.bonus.x += gameState.bonus.vx;
  gameState.bonus.y += gameState.bonus.vy;
  collisionBonus();
}

function collisionBonus() {
  if (gameState.bonus.x + gameState.bonus.width >= canvas.width) {
    gameState.bonus.vx *= -1;
  }

  if (gameState.bonus.x - gameState.bonus.width <= 0) {
    gameState.bonus.vx *= -1;
  }

  if (gameState.bonus.y + gameState.bonus.height >= canvas.height - gameState.player.height && killBonus == false && isBonus == true) {
    killBonus = true;
    isBonus = false;
  }
}

function run(tFrame) {
  gameState.stopCycle = window.requestAnimationFrame(run);
  var nextTick = gameState.lastTick + gameState.tickLength;
  var numTicks = 0;

  if (tFrame > nextTick) {
    var timeSinceTick = tFrame - gameState.lastTick;
    numTicks = Math.floor(timeSinceTick / gameState.tickLength);
  }

  queueUpdates(numTicks);
  draw(tFrame);
  gameState.lastRender = tFrame;
}

function stopGame(handle) {
  window.cancelAnimationFrame(handle);
}

function drawPlatform(context) {
  var _gameState$player = gameState.player,
      x = _gameState$player.x,
      y = _gameState$player.y,
      width = _gameState$player.width,
      height = _gameState$player.height;
  context.beginPath();
  context.rect(x - width / 2, y - height / 2, width, height);
  context.arc(gameState.player.x, gameState.player.y, 5, 0, 2 * Math.PI);
  context.fillStyle = "#FF0000";
  context.fill();
  context.closePath();
  context.beginPath();
  context.arc(gameState.player.x, gameState.player.y, 5, 0, 2 * Math.PI);
  context.fillStyle = "#000000";
  context.fill();
  context.closePath();
}

function drawBall(context) {
  var _gameState$ball = gameState.ball,
      x = _gameState$ball.x,
      y = _gameState$ball.y,
      radius = _gameState$ball.radius;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = "#0000FF";
  context.fill();
  context.closePath();
}

function drawTime(context) {
  context.beginPath();
  context.strokeStyle = "#000000";
  context.lineWidth = "1";
  context.font = "italic 30pt Impact";
  context.shadowColor = "8b00ff";
  context.shadowOffsetX = 5;
  context.shadowOffsetY = 5;
  context.shadowBlur = 10;
  context.strokeText(timeIngame, 20, 20, 50);
  context.textBaseline = "top";
  context.closePath();
}

function drawBonus(context) {
  if (isBonus) {
    context.beginPath();
    context.strokeStyle = "magenta";
    context.lineWidth = "10";
    context.moveTo(gameState.bonus.x - gameState.bonus.width, gameState.bonus.y);
    context.lineTo(gameState.bonus.x + gameState.bonus.width, gameState.bonus.y);
    context.stroke();
    context.moveTo(gameState.bonus.x, gameState.bonus.y - gameState.bonus.height);
    context.lineTo(gameState.bonus.x, gameState.bonus.y + gameState.bonus.height);
    context.stroke();
    context.closePath();
  }
}

function updateTime() {
  console.log(timeIngame);
  timeIngame++;

  if (timeIngame % 5 == 0) {
    gameState.ball.vx += gameState.ball.vx / 10;
    gameState.ball.vy += gameState.ball.vy / 10;
  }

  if (killBonus) {
    timeIngame += 15;
    killBonus = false;
  }

  if (timeIngame % 15 == 0) {
    generateBonus();
    isBonus = true;
  }
}

function setup() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener('mousemove', onMouseMove, false);
  gameState.lastTick = performance.now();
  gameState.lastRender = gameState.lastTick;
  gameState.tickLength = 15; //ms

  setInterval(updateTime, 1000);
  var platform = {
    width: 400,
    height: 50
  };
  gameState.player = {
    x: 100,
    y: canvas.height - platform.height / 2,
    width: platform.width,
    height: platform.height
  };
  gameState.pointer = {
    x: 0,
    y: 0
  };
  gameState.ball = {
    x: canvas.width / 4,
    y: 50,
    radius: 25,
    vx: 3,
    vy: 3
  };
  gameState.bonus = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    vx: 0,
    vy: 0
  };
}

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setup();
run();
},{}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63770" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map