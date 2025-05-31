"use strict";

function _toConsumableArray(e) {
  return _arrayWithoutHoles(e) || _iterableToArray(e) || _unsupportedIterableToArray(e) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(e, r) {
  if (e) {
    if ("string" == typeof e) return _arrayLikeToArray(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    return "Object" === t && e.constructor && (t = e.constructor.name),
      "Map" === t || "Set" === t ? Array.from(e)
      : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
        ? _arrayLikeToArray(e, r)
        : void 0;
  }
}
function _iterableToArray(e) {
  if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e);
}
function _arrayWithoutHoles(e) {
  if (Array.isArray(e)) return _arrayLikeToArray(e);
}
function _arrayLikeToArray(e, r) {
  (null == r || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++) a[t] = e[t];
  return a;
}

function _classCallCheck(e, r) {
  if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var a = r[t];
    a.enumerable = a.enumerable || !1;
    a.configurable = !0;
    "value" in a && (a.writable = !0);
    Object.defineProperty(e, a.key, a);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), e;
}

// 配置项
var config = {
  src: "/img/ms.png",
  rows: 15,
  cols: 7
};

// 随机工具函数
var randomRange = function (e, r) {
  return e + Math.random() * (r - e);
};
var randomIndex = function (e) {
  return 0 | randomRange(0, e.length);
};
var removeFromArray = function (e, r) {
  return e.splice(r, 1)[0];
};
var removeItemFromArray = function (e, r) {
  return removeFromArray(e, e.indexOf(r));
};
var removeRandomFromArray = function (e) {
  return removeFromArray(e, randomIndex(e));
};
var getRandomFromArray = function (e) {
  return e[0 | randomIndex(e)];
};

// 设置人物初始位置
var resetPeep = function (e) {
  var r, t, a = e.stage, n = e.peep, o = Math.random() < 0.5 ? 1 : -1;
  var i = 100 - 250 * gsap.parseEase("power2.in")(Math.random());
  var s = a.height - n.height + i;
  if (o == 1) {
    r = -n.width, t = a.width, n.scaleX = 1;
  } else {
    r = a.width + n.width, t = 0, n.scaleX = -1;
  }
  n.x = r;
  n.y = s;
  return { startX: r, startY: n.anchorY = s, endX: t };
};

// 行走动画定义
var normalWalk = function (e) {
  var r = e.peep, t = e.props, a = t.startY, n = t.endX, o = gsap.timeline();
  o.timeScale(randomRange(0.5, 1.5));
  o.to(r, { duration: 10, x: n, ease: "none" }, 0);
  o.to(r, { duration: 0.25, repeat: 40, yoyo: !0, y: a - 10 }, 0);
  return o;
};

var walks = [normalWalk];

// Peep 类
var Peep = function () {
  function e(r) {
    var t = r.image, a = r.rect;
    _classCallCheck(this, e);
    this.image = t;
    this.setRect(a);
    this.x = 0;
    this.y = 0;
    this.anchorY = 0;
    this.scaleX = 1;
    this.walk = null;
  }

  return _createClass(e, [{
    key: "setRect",
    value: function (e) {
      this.rect = e;
      this.width = e[2];
      this.height = e[3];
      this.drawArgs = [this.image].concat(_toConsumableArray(e), [0, 0, this.width, this.height]);
    }
  }, {
    key: "render",
    value: function (e) {
      e.save();
      e.translate(this.x, this.y);
      e.scale(this.scaleX, 1);
      e.drawImage.apply(e, _toConsumableArray(this.drawArgs));
      e.restore();
    }
  }]), e;
}();

// 主逻辑
var img = document.createElement("img");
img.onload = init;
img.src = config.src;

let canvas = document.querySelector("#peoplecanvas");
let ctx = canvas ? canvas.getContext("2d") : void 0;
let stage = { width: 0, height: 0 };
let allPeeps = [], availablePeeps = [], crowd = [];

function init() {
  if (!canvas) return;
  createPeeps();
  resize();
  gsap.ticker.add(render);
  window.addEventListener("resize", resize);
}

function createPeeps() {
  var e = config.rows, r = config.cols, t = e * r;
  var a = img.naturalWidth / e;
  var n = img.naturalHeight / r;
  for (var o = 0; o < t; o++) {
    allPeeps.push(new Peep({
      image: img,
      rect: [o % e * a, (o / e | 0) * n, a, n]
    }));
  }
}

function resize() {
  if (!canvas || canvas.clientWidth === 0) return;
  stage.width = canvas.clientWidth;
  stage.height = canvas.clientHeight;
  canvas.width = stage.width * devicePixelRatio;
  canvas.height = stage.height * devicePixelRatio;

  crowd.forEach((e) => e.walk.kill());
  crowd.length = 0;
  availablePeeps.length = 0;
  availablePeeps.push(...allPeeps);
  initCrowd();
}

function initCrowd() {
  while (availablePeeps.length) {
    addPeepToCrowd().walk.progress(Math.random());
  }
}

function addPeepToCrowd() {
  var e = removeRandomFromArray(availablePeeps);
  var r = getRandomFromArray(walks)({
    peep: e,
    props: resetPeep({ peep: e, stage: stage })
  }).eventCallback("onComplete", function () {
    removePeepFromCrowd(e);
    addPeepToCrowd();
  });

  e.walk = r;
  crowd.push(e);
  crowd.sort((a, b) => a.anchorY - b.anchorY);
  return e;
}

function removePeepFromCrowd(e) {
  removeItemFromArray(crowd, e);
  availablePeeps.push(e);
}

function render() {
  if (!canvas) return;
  canvas.width = canvas.width;
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  crowd.forEach((e) => e.render(ctx));
  ctx.restore();
}

// 页面跳转重新初始化
document.addEventListener("pjax:success", (e) => {
  canvas = document.querySelector("#peoplecanvas");
  ctx = canvas ? canvas.getContext("2d") : void 0;
  window.removeEventListener("resize", resize);
  gsap.ticker.remove(render);
  setTimeout(() => { init(); }, 300);
});
