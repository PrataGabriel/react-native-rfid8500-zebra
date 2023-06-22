"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = 'The package \'react-native-rfid8500-zebra\' doesn\'t seem to be linked. Make sure: \n\n' + _reactNative.Platform.select({
  ios: '- You have run \'pod install\'\n',
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const Rfid8500Zebra = _reactNative.NativeModules.Rfid8500Zebra ? _reactNative.NativeModules.Rfid8500Zebra : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const eventEmitter = new _reactNative.NativeEventEmitter();
const events = {};
Rfid8500Zebra.on = (event, handler) => {
  const eventListener = eventEmitter.addListener(event, handler);
  events[event] = events[event] ? [...events[event], eventListener] : [eventListener];
};
Rfid8500Zebra.off = event => {
  if (Object.hasOwnProperty.call(events, event)) {
    const eventListener = events[event].shift();
    if (eventListener) eventListener.remove();
  }
};
Rfid8500Zebra.removeAll = event => {
  if (Object.hasOwnProperty.call(events, event)) {
    eventEmitter.removeAllListeners(event);
    events[event] = [];
  }
};
var _default = Rfid8500Zebra;
exports.default = _default;
//# sourceMappingURL=index.js.map