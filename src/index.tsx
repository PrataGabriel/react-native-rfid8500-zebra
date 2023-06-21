import { NativeModules, NativeEventEmitter, Platform } from 'react-native'

const LINKING_ERROR =
  'The package \'react-native-rfid8500-zebra\' doesn\'t seem to be linked. Make sure: \n\n' +
  Platform.select({ ios: '- You have run \'pod install\'\n', default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n'

const Rfid8500Zebra = NativeModules.Rfid8500Zebra
  ? NativeModules.Rfid8500Zebra
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR)
      },
    }
  )

const eventEmitter = new NativeEventEmitter()

const events: any = {}

Rfid8500Zebra.on = (event: string, handler: (data: any) => void) => {
  const eventListener = eventEmitter.addListener(event, handler)

  events[event] = events[event]
    ? [...events[event], eventListener]
    : [eventListener]
}

Rfid8500Zebra.off = (event: string) => {
  if (Object.hasOwnProperty.call(events, event)) {
    const eventListener = events[event].shift()

    if (eventListener) eventListener.remove()
  }
}

Rfid8500Zebra.removeAll = (event: string) => {
  if (Object.hasOwnProperty.call(events, event)) {
    eventEmitter.removeAllListeners(event)

    events[event] = []
  }
}

export default Rfid8500Zebra
