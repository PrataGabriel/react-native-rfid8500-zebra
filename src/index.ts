import { useCallback, useEffect, useState } from 'react'
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from 'react-native'

import type {
  DeviceDetailsType,
  DevicesType,
  EventsType,
  HandlerType,
  IwriteTagStatusState,
  RfidZebraType,
} from './internal/types'

const LINKING_ERROR =
  "The package 'react-native-rfid8500-zebra' doesn't seem to be linked. Make sure: \n\n" +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n'

const RfidZebra: RfidZebraType = NativeModules.Rfid8500Zebra
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

    if (eventListener) {
      eventListener.remove()
    }
  }
}

RfidZebra.removeAll = (event: string) => {
  if (Object.hasOwnProperty.call(events, event)) {
    eventEmitter.removeAllListeners(event)

    events[event] = []
  }
}

const requestPermissions = async (permissions: string | string[]) => {
  const requests = []

  if (Array.isArray(permissions)) {
    permissions.forEach((permission: string) => {
      const permissionData = PermissionsAndroid.PERMISSIONS[permission]

      if (permissionData) {
        requests.push(PermissionsAndroid.request(permissionData))
      }
    })
  } else {
    const permissionData = PermissionsAndroid.PERMISSIONS[permissions]

    if (permissionData) {
      requests.push(PermissionsAndroid.request(permissionData))
    }
  }

  const granteds = await Promise.all(requests)

  return granteds.every(
    (granted) => granted === PermissionsAndroid.RESULTS.GRANTED
  )
}

export const useWriteTag = () => {
  const [writeTagStatus, setWriteTagStatus] = useState<IwriteTagStatusState>()

  const writeTag = (tag: string, newTag: string) => {
    RfidZebra.programTag(tag, newTag)
  }

  useEffect(() => {
    RfidZebra.on('WRITE_TAG_STATUS', (data) =>
      setWriteTagStatus(data as IwriteTagStatusState)
    )
  }, [])

  return [writeTagStatus, writeTag]
}

export const useReader = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetailsType>({})

  const connect = async (name: string, mac: string): Promise<boolean> => {
    if (deviceDetails?.mac === mac) {
      await RfidZebra.disconnect()
    }

    if (await RfidZebra.connect(name, mac)) {
      const deviceDetailsData = await RfidZebra.getDeviceDetails()

      setDeviceDetails((deviceDetails) => ({
        ...deviceDetails,
        ...deviceDetailsData,
      }))
      RfidZebra.clear()

      return true
    }

    setIsConnected(false)
    setDeviceDetails({})

    return false
  }

  const setAntennaLevel = async (level: number) => {
    if (isConnected) {
      await RfidZebra.setAntennaLevel(level)

      setDeviceDetails((deviceDetails) => ({
        ...deviceDetails,
        ...{ antennaLevel: level },
      }))
    }
  }

  const setMode = async (mode: 'RFID' | 'BARCODE') => {
    if (mode === 'RFID') {
      return await RfidZebra.setEnabled(true)
    }

    if (mode === 'BARCODE') {
      return await RfidZebra.setEnabled(false)
    }

    return false
  }

  useEffect(() => {
    RfidZebra.on('READER_STATUS', (data) => {
      const status = (data as HandlerType)?.status

      setIsConnected(!!status)
    })

    RfidZebra.on('BATTERY_STATUS', (data) => {
      const batteryLevel = (data as HandlerType)?.level

      setDeviceDetails((deviceDetails) => ({
        ...deviceDetails,
        batteryLevel,
      }))
    })
  }, [])

  return {
    isConnected,
    connect,
    disconnect: RfidZebra.disconnect,
    reconnect: RfidZebra.reconnect,
    deviceDetails,
    setAntennaLevel,
    setMode,
    softRead: RfidZebra.softReadCancel,
    setSession: RfidZebra.setSession,
  }
}

export const useDevicesList = () => {
  const [devices, setDevices] = useState<DevicesType[]>([])

  const verifyPermission = useCallback(async () => {
    if (await requestPermissions(['BLUETOOTH_CONNECT', 'BLUETOOTH_SCAN'])) {
      setDevices(await RfidZebra.getDevices())
    }
  }, [requestPermissions])

  const updateDevices = (): void => {
    RfidZebra.getDevices().then((devicesList) => setDevices(devicesList))
  }

  useEffect(() => {
    verifyPermission()
  }, [])

  return { devices, updateDevices }
}

export const useSingleRead = () => {
  const [tag, setTag] = useState<string>()
  const [isSingleRead, setIsSingleRead] = useState(false)

  const setSingleRead = (enable: boolean): void => {
    setIsSingleRead(enable)
    RfidZebra.setSingleRead(enable)
  }

  useEffect(() => {
    if (isSingleRead) {
      RfidZebra.on('TAG', (data) => {
        const tagData = data as string

        setTag(tagData)
      })
    } else {
      RfidZebra.off('TAG')
    }
  }, [isSingleRead])

  return [tag, setSingleRead]
}

export const useTags = () => {
  const [tags, setTags] = useState<string[]>([])

  const clearTags = (): void => {
    RfidZebra.clear()
    setTags([])
  }

  useEffect(() => {
    RfidZebra.on('TAGS', (data) => {
      const tagsList = data as string[]

      setTags((tags) => [...tags, ...tagsList])
    })
  }, [])

  return [tags, clearTags]
}

export const useLocateTag = () => {
  const [distance, setDistance] = useState<number>(0)
  const [isLocateTag, setIsLocateTag] = useState<boolean>(false)
  const [tag, setTag] = useState<string>()

  const start = (tag: string): void => {
    if (tag) {
      RfidZebra.enableLocateTag(true, tag).then((status) => {
        if (status) {
          setIsLocateTag(true)
          setTag(tag)
          setDistance(0)
        }
      })
    }
  }

  const stop = (): void => {
    RfidZebra.enableLocateTag(false, '').then((status) => {
      if (status) {
        setIsLocateTag(false)
        setTag(undefined)
        setDistance(0)
      }
    })
  }

  useEffect(() => {
    if (isLocateTag) {
      RfidZebra.on('LOCATE_TAG', (data) => {
        const distance = (data as HandlerType)?.distance

        if (distance !== undefined && distance !== null) {
          setDistance(distance)
        }
      })
    } else {
      RfidZebra.off('LOCATE_TAG')
    }
  }, [isLocateTag])

  return { distance, isLocateTag, tag, start, stop }
}

export const useBarCode = () => {
  const [barCode, setBarCode] = useState<string>('')

  useEffect(() => {
    RfidZebra.on('BARCODE', (data) => {
      if (data) {
        setBarCode(data as string)
      }
    })
  }, [])

  return barCode
}
