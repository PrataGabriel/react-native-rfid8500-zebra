import type { EmitterSubscription } from 'react-native'

export interface HandlerType {
  error?: string
  status?: boolean
  distance?: number
  level?: number
  cause?: string
}

export interface DevicesType {
  name: string
  mac: string
}

export interface DeviceDetailsType {
  antennaLevel?: number
  name?: string
  mac?: string
  batteryLevel?: number
}

export interface EventsType {
  [key: string]: EmitterSubscription[]
}

export interface RfidZebraType {
  on: (
    event: string,
    handler: (data: string | string[] | HandlerType) => void
  ) => void
  off: (event: string) => void
  removeAll: (event: string) => void
  isConnected: () => Promise<boolean>
  getDevices: () => Promise<DevicesType[]>
  disconnect: () => Promise<boolean>
  reconnect: () => void
  connect: (name: string, mac: string) => Promise<boolean>
  getDeviceDetails: () => Promise<DeviceDetailsType>
  clear: () => void // limpa as tags lida da memória
  setSingleRead: (enable: boolean) => void
  setAntennaLevel: (antennaLevel: number) => Promise<boolean>
  programTag: (oldTag: string, newTag: string) => Promise<boolean> // Mudar o valor de uma tag
  setEnabled: (enable: boolean) => Promise<boolean> // Ativa o modo de leitura RFID = true // ativa o modo leitura BARCODE = false
  enableLocateTag: (enable: boolean, tag: string) => Promise<boolean>
  softReadCancel: (enable: boolean) => Promise<void> // Ativa ou desativa o modo leitura
  setSession: (session: number) => Promise<boolean>
}

export interface IwriteTagStatusState {
  status?: boolean
  error?: string
}
