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
var SparkSlider_1 = require('./spark/SparkSlider');
Object.defineProperty(exports, 'SparkSlider', {
  enumerable: true,
  get: function () {
    return __importDefault(SparkSlider_1).default;
  },
});
var useSparkSlider_1 = require('./spark/useSparkSlider');
Object.defineProperty(exports, 'useSparkSlider', {
  enumerable: true,
  get: function () {
    return useSparkSlider_1.useSparkSlider;
  },
});
Object.defineProperty(exports, 'computeSwipeTarget', {
  enumerable: true,
  get: function () {
    return useSparkSlider_1.computeSwipeTarget;
  },
});
var config_1 = require('./spark/config');
Object.defineProperty(exports, 'SLIDER_CONFIG', {
  enumerable: true,
  get: function () {
    return config_1.SLIDER_CONFIG;
  },
});
