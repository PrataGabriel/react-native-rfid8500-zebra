import type { EmitterSubscription } from 'react-native'

interface handlerType {
  error?: string
  status?: boolean
  distance?: number
  level?: number
  cause?: string
}

interface devicesType {
  name?: string
  mac?: string 
}

interface deviceDetailsType extends devicesType {
  antennaLevel?: number
}

export interface EventsType {
  [key: string]: EmitterSubscription[]
}

export const Rfid8500ZebraType: {
  on: (event: string, handler: (data: string | string[] | handlerType) => void) => void
  off: (event: string) => void
  removeAll: (event: string) => void
  isConnected: () => Promise<boolean>
  getDevices: () => Promise<devicesType>
  disconnect: () => Promise<boolean>
  reconnect: () => void
  connect: (name: string, mac: string) => Promise<boolean>
  getDeviceDetails: () => Promise<deviceDetailsType>
  clear: () => void
  setSingleRead: (enable: boolean) => void
  setAntennaLevel: (antennaLevel: number) => Promise<boolean>
  programTag: (oldTag: string, newTag: string) => Promise<boolean>
  setEnabled: (enable: boolean) => Promise<boolean>
  enableLocateTag: (enable: boolean, tag: string) => Promise<boolean>
  softReadCancel: (enable: boolean) => Promise<void>
  setSession: (session: number) => Promise<boolean>
}
// # sourceMappingURL=index.d.ts.map