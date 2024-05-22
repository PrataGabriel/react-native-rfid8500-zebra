import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';

import type {
  EmitterSubscription,
  Permission,
  PermissionStatus,
} from 'react-native';

export interface HandlerType {
  type?: string;
  errorMessage?: string;
  error?: boolean;
  status?: boolean;
  distance?: number;
  level?: number;
  cause?: string;
}

export interface DevicesType {
  name: string;
  mac: string;
}

export interface DeviceDetailsType {
  antennaLevel?: number;
  name?: string;
  mac?: string;
  batteryLevel?: number;
}

export interface EventsType {
  [key: string]: EmitterSubscription[];
}

export interface RfidZebraType {
  on: (
    event: string,
    handler: (data: string | string[] | HandlerType) => void
  ) => void;
  off: (event: string) => void;
  removeAll: (event: string) => void;
  isConnected: () => Promise<boolean>;
  getDevices: () => Promise<DevicesType[]>;
  disconnect: () => Promise<boolean>;
  reconnect: () => void;
  connect: (name: string, mac: string) => Promise<boolean>;
  getDeviceDetails: () => Promise<DeviceDetailsType>;
  clear: () => void; // limpa as tags lida da memória
  setSingleRead: (enable: boolean) => void;
  setAntennaLevel: (antennaLevel: number) => Promise<boolean>;
  programTag: (oldTag: string, newTag: string) => Promise<boolean>; // Mudar o valor de uma tag
  setEnabled: (enable: boolean) => Promise<boolean>; // Ativa o modo de leitura RFID = true // ativa o modo leitura BARCODE = false
  enableLocateTag: (enable: boolean, tag: string) => Promise<boolean>;
  softReadCancel: (enable: boolean) => Promise<void>; // Ativa ou desativa o modo leitura
  setSession: (session: number) => Promise<boolean>;
  setBeeperQuiet: (enable: boolean) => void;
}

export interface IwriteTagStatusState {
  status?: boolean;
  error?: string;
}

export type UseSingleRead = () => [
  string | undefined,
  (enable: boolean) => void,
];

export type UseReaderPermissions = () => [
  PermissionStatus | undefined,
  () => Promise<PermissionStatus | undefined>,
];

export type UseTags = () => [string[], () => void];

const LINKING_ERROR =
  "The package 'react-native-rfid8500-zebra' doesn't seem to be linked. Make sure: \n\n" +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RfidZebra: RfidZebraType = NativeModules.Rfid8500Zebra
  ? NativeModules.Rfid8500Zebra
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter();

const events: EventsType = {};

RfidZebra.on = (event, handler) => {
  const eventListener = eventEmitter.addListener(event, handler);

  events[event] = [...(events[event] || []), eventListener];
};

RfidZebra.off = (event) => {
  if (Object.hasOwnProperty.call(events, event)) {
    const eventListener = events[event]?.shift();

    if (eventListener) {
      eventListener.remove();
    }
  }
};

RfidZebra.removeAll = (event: string) => {
  if (Object.hasOwnProperty.call(events, event)) {
    eventEmitter.removeAllListeners(event);

    events[event] = [];
  }
};

const wait = async (timing: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve?.(undefined), timing);
  });
};

export const useReaderPermissions: UseReaderPermissions = () => {
  const appState = useRef(AppState.currentState);

  const [permission, setPermission] = useState<PermissionStatus>();

  const permissionsList: Array<Permission> = [
    'android.permission.BLUETOOTH_CONNECT',
    'android.permission.BLUETOOTH_SCAN',
  ];

  const requestPermission = useCallback(async () => {
    const results = await PermissionsAndroid.requestMultiple(permissionsList);
    let resultPermission = PermissionsAndroid.RESULTS.GRANTED;

    Object.values(results).some((result) => {
      if (result === PermissionsAndroid.RESULTS['NEVER_ASK_AGAIN']) {
        resultPermission = PermissionsAndroid.RESULTS['NEVER_ASK_AGAIN'];

        return true;
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        resultPermission = PermissionsAndroid.RESULTS.DENIED;
      }

      return false;
    });

    setPermission(resultPermission);

    return resultPermission;
  }, []);

  const checkPermissions = useCallback(
    async (permissions: Array<Permission>) => {
      const results = await Promise.all(
        permissions.map((permission) => PermissionsAndroid.check(permission))
      );

      if (results.every((result) => result)) {
        setPermission(PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setPermission(PermissionsAndroid.RESULTS['NEVER_ASK_AGAIN']);
      }
    },
    []
  );

  const AppStateChangeEvent = () => {
    return AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (permission && permission !== PermissionsAndroid.RESULTS.GRANTED) {
          await checkPermissions(permissionsList);
        }
      }

      appState.current = nextAppState;
    });
  };

  useEffect(() => {
    checkPermissions(permissionsList);
  }, [checkPermissions]);

  useEffect(() => {
    if (permission && permission !== PermissionsAndroid.RESULTS.GRANTED) {
      const subscription = AppStateChangeEvent();

      return () => subscription.remove();
    }

    return () => {};
  }, [permission]);

  return [permission, requestPermission];
};

export const useWriteTag = () => {
  const [writeTagStatus, setWriteTagStatus] = useState<IwriteTagStatusState>();

  const writeTag = async (tag: string, newTag: string) => {
    await wait(5);

    await RfidZebra.programTag(tag, newTag);
  };

  useEffect(() => {
    RfidZebra.on('WRITE_TAG_STATUS', (data) =>
      setWriteTagStatus(data as IwriteTagStatusState)
    );
  }, []);

  return [writeTagStatus, writeTag];
};

export const useReader = () => {
  const [reconnecting, setReconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetailsType>({});

  const connect = async (name: string, mac: string): Promise<boolean> => {
    await wait(5);

    if (deviceDetails?.mac === mac) {
      await RfidZebra.disconnect();
    }

    if (await RfidZebra.connect(name, mac)) {
      const deviceDetailsData = await RfidZebra.getDeviceDetails();

      setDeviceDetails((deviceDetails) => ({
        ...deviceDetails,
        ...deviceDetailsData,
      }));
      RfidZebra.clear();

      setIsConnected(true);

      return true;
    }

    setIsConnected(false);
    setDeviceDetails({});

    return false;
  };

  const disconnect = async (): Promise<boolean> => {
    await wait(5);

    if (await RfidZebra.disconnect()) {
      setDeviceDetails({});
      setIsConnected(false);

      return true;
    }

    return false;
  };

  const setAntennaLevel = async (level: number) => {
    try {
      await wait(5);

      if (isConnected) {
        await RfidZebra.setAntennaLevel(level);

        setDeviceDetails((deviceDetails) => ({
          ...deviceDetails,
          ...{ antennaLevel: level },
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  const setMode = async (mode: 'RFID' | 'BARCODE') => {
    await wait(5);

    if (mode === 'RFID') {
      return await RfidZebra.setEnabled(true);
    }

    if (mode === 'BARCODE') {
      return await RfidZebra.setEnabled(false);
    }

    return false;
  };

  useEffect(() => {
    RfidZebra.on('READER_STATUS', (data) => {
      const readerData = data as HandlerType;

      setReconnecting((reconnecting) => {
        if (
          readerData?.status &&
          (Object.keys(deviceDetails).length > 0 || reconnecting)
        ) {
          RfidZebra.getDeviceDetails().then((deviceDetailsData) => {
            setDeviceDetails((deviceDetails) => ({
              ...deviceDetails,
              ...deviceDetailsData,
            }));

            setIsConnected(true);
          });
        } else if (!readerData?.status) {
          if (readerData?.type === 'event' && !reconnecting) {
            RfidZebra.reconnect();

            setIsConnected(false);
            return true;
          }

          setIsConnected(false);
        }

        return readerData?.type !== 'event' ? false : reconnecting;
      });
    });

    RfidZebra.on('BATTERY_STATUS', (data) => {
      const batteryLevel = (data as HandlerType)?.level;

      setDeviceDetails((deviceDetails) => ({
        ...deviceDetails,
        batteryLevel,
      }));
    });

    RfidZebra.on('TRIGGER_STATUS', (data) => {
      const triggerDataStatus = data as HandlerType;

      setTriggerStatus(!!triggerDataStatus?.status);
    });
  }, []);

  useEffect(() => {
    if (!isConnected && !reconnecting) {
      setDeviceDetails({});
    }
  }, [isConnected]);

  return {
    isConnected,
    connect,
    disconnect,
    triggerStatus,
    reconnect: RfidZebra.reconnect,
    deviceDetails,
    setAntennaLevel,
    setMode,
    softRead: RfidZebra.softReadCancel,
    setSession: RfidZebra.setSession,
    setBeeperQuiet: RfidZebra.setBeeperQuiet,
  };
};

export const useDevicesList = () => {
  const [devices, setDevices] = useState<DevicesType[]>([]);

  const updateDevices = async (): Promise<void> => {
    await wait(5);

    await RfidZebra.getDevices().then((devicesList) => setDevices(devicesList));
  };

  return { devices, updateDevices };
};

export const useSingleRead: UseSingleRead = () => {
  const [tag, setTag] = useState<string>();
  const [isSingleRead, setIsSingleRead] = useState(false);

  const setSingleRead = (enable: boolean): void => {
    setIsSingleRead(enable);
    RfidZebra.setSingleRead(enable);
  };

  useEffect(() => {
    if (isSingleRead) {
      RfidZebra.on('TAG', (data) => {
        const tagData = data as string;

        setTag(tagData);
      });
    } else {
      RfidZebra.off('TAG');
    }
  }, [isSingleRead]);

  return [tag, setSingleRead];
};

export const useTags: UseTags = () => {
  const [tags, setTags] = useState<string[]>([]);

  const clearTags = (): void => {
    RfidZebra.clear();
    setTags([]);
  };

  useEffect(() => {
    RfidZebra.on('TAGS', (data) => {
      const tagsList = data as string[];

      setTags((tags) => [...tags, ...tagsList]);
    });
  }, []);

  return [tags, clearTags];
};

export const useLocateTag = () => {
  const [distance, setDistance] = useState<number>(0);
  const [isLocateTag, setIsLocateTag] = useState<boolean>(false);
  const [tag, setTag] = useState<string>();

  const start = (tag: string): void => {
    if (tag) {
      RfidZebra.enableLocateTag(true, tag).then((status) => {
        if (status) {
          setIsLocateTag(true);
          setTag(tag);
          setDistance(0);
        }
      });
    }
  };

  const stop = (): void => {
    RfidZebra.enableLocateTag(false, '').then((status) => {
      if (status) {
        setIsLocateTag(false);
        setTag(undefined);
        setDistance(0);
      }
    });
  };

  useEffect(() => {
    if (isLocateTag) {
      RfidZebra.on('LOCATE_TAG', (data) => {
        const distance = (data as HandlerType)?.distance;

        if (distance !== undefined && distance !== null) {
          setDistance(distance);
        }
      });
    } else {
      RfidZebra.off('LOCATE_TAG');
    }
  }, [isLocateTag]);

  return { distance, isLocateTag, tag, start, stop };
};

export const useBarCode = () => {
  const [barCode, setBarCode] = useState<string>();

  useEffect(() => {
    RfidZebra.on('BARCODE', (data) => {
      if (data) {
        setBarCode(data as string);
      }
    });
  }, []);

  return barCode;
};
