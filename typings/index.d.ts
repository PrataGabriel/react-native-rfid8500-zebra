declare module 'react-native-rfid8500-zebra' {
  interface HandlerType {
    error?: string
    status?: boolean
    distance?: number
    level?: number
    cause?: string
  }
  
  interface DevicesType {
    name?: string
    mac?: string 
  }
  
  interface DeviceDetailsType extends DevicesType {
    antennaLevel?: number
  }
  
  const RfidZebra: {
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
  
  export default RfidZebra
}