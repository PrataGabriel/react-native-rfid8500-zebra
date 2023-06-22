import { NativeModules, NativeEventEmitter, Platform, EmitterSubscription } from 'react-native'
import type RfidZebraType from 'react-native-rfid8500-zebra'

export interface EventsType {
  [key: string]: EmitterSubscription[]
}

const LINKING_ERROR =
  'The package \'react-native-rfid8500-zebra\' doesn\'t seem to be linked. Make sure: \n\n' +
  Platform.select({ ios: '- You have run \'pod install\'\n', default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n'

const RfidZebra: typeof RfidZebraType = NativeModules.Rfid8500Zebra
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

const events: EventsType = {}

RfidZebra.on = (event, handler) => {
  const eventListener = eventEmitter.addListener(event, handler)

  events[event] = [...(events[event] || []), eventListener]
}

RfidZebra.off = (event) => {
  if (Object.hasOwnProperty.call(events, event)) {
    const eventListener = events[event]?.shift()

    if (eventListener) eventListener.remove()
  }
}

RfidZebra.removeAll = (event: string) => {
  if (Object.hasOwnProperty.call(events, event)) {
    eventEmitter.removeAllListeners(event)

    events[event] = []
  }
}

export default RfidZebra
