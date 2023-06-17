import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-rfid8500-zebra' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Rfid8500Zebra = NativeModules.Rfid8500Zebra
  ? NativeModules.Rfid8500Zebra
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return Rfid8500Zebra.multiply(a, b);
}
