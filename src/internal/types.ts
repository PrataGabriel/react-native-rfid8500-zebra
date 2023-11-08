import type { EmitterSubscription } from 'react-native'

export interface HandlerType {
  error?: string
  status?: boolean
  distance?: number
  level?: number
  cause?: string
}

export interface DevicesType {
  name?: string
  mac?: string 
}

export interface DeviceDetailsType extends DevicesType {
  antennaLevel?: number
}

export interface EventsType {
  [key: string]: EmitterSubscription[]
}

export interface RfidZebraType {
  on: (event: string, handler: (data: string | string[] | HandlerType) => void) => void
  off: (event: string) => void
  removeAll: (event: string) => void
  isConnected: () => Promise<boolean>
  getDevices: () => Promise<DevicesType>
  disconnect: () => Promise<boolean>
  reconnect: () => void
  connect: (name: string, mac: string) => Promise<boolean>
  getDeviceDetails: () => Promise<DeviceDetailsType>
  clear: () => void
  setSingleRead: (enable: boolean) => void
  setAntennaLevel: (antennaLevel: number) => Promise<boolean>
  programTag: (oldTag: string, newTag: string) => Promise<boolean>
  setEnabled: (enable: boolean) => Promise<boolean>
  enableLocateTag: (enable: boolean, tag: string) => Promise<boolean>
  softReadCancel: (enable: boolean) => Promise<void>
  setSession: (session: number) => Promise<boolean>
}