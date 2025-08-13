'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SLIDER_CONFIG =
  exports.computeSwipeTarget =
  exports.useSparkSlider =
  exports.SparkSlider =
    void 0;
var SparkSlider_js_1 = require('./spark/SparkSlider.js');
Object.defineProperty(exports, 'SparkSlider', {
  enumerable: true,
  get: function () {
    return __importDefault(SparkSlider_js_1).default;
  },
});
var useSparkSlider_js_1 = require('./spark/useSparkSlider.js');
Object.defineProperty(exports, 'useSparkSlider', {
  enumerable: true,
  get: function () {
    return useSparkSlider_js_1.useSparkSlider;
  },
});
Object.defineProperty(exports, 'computeSwipeTarget', {
  enumerable: true,
  get: function () {
    return useSparkSlider_js_1.computeSwipeTarget;
  },
});
var config_js_1 = require('./spark/config.js');
Object.defineProperty(exports, 'SLIDER_CONFIG', {
  enumerable: true,
  get: function () {
    return config_js_1.SLIDER_CONFIG;
  },
});
