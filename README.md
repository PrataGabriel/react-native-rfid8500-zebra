# react-native-rfid8500-zebra

RFID Zebra Reader

## Installation

```sh
npm install react-native-rfid8500-zebra
```

## Conectando a um dispositivo

```js
import { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';
import {
  useReader,
  useDevicesList,
  useReaderPermissions,
} from 'react-native-rfid8500-zebra';

function App() {
  const { connect } = useReader();
  // Lista de dispositivos pareados.
  const { devices, updateDevices } = useDevicesList();
  const [permission, requestPermission] = useReaderPermissions();

  useEffect(() => {
    requestPermission().then(async (result) => {
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await updateDevices();
      }
    });
  }, []);

  useEffect(() => {
    console.log(devices);
    // [{"mac": "84:C6:92:41:3C:4B", "name": "RFD850022260520100556"}]

    if (devices.length > 0) {
      const { name, mac } = devices[0];

      connect(name, mac).then((status) => {
        if (status) {
          // Conectado
        } else {
          // Erro ao conectar
        }
      });
    }
  }, [devices]);
}
```

## Desconectando de um dispositivo

```js
import { useEffect } from 'react';
import { useReader, useDevicesList } from 'react-native-rfid8500-zebra';

function App() {
  const { disconnect } = useReader();

  useEffect(() => {
    disconnect().then((status) => {
      if (status) {
        // Desconectado
      } else {
        // Erro ao desconectar
      }
    });
  }, []);
}
```

## Capturando informações do dispositivo

```js
import { useEffect } from 'react';
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  const { deviceDetails } = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Informações do dispositivo conectado
    console.log(deviceDetails);
    // {
    //   name: "RFD850022260520100556"
    //   mac: "84:C6:92:41:3C:4B"
    //   antennaLevel: 27
    //   batteryLevel: 80
    // }
  }, [deviceDetails]);
}
```

## Alterar nível da antena

```js
import { useEffect } from 'react';
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  const { isConnected, setAntennaLevel } = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Altera o nível da antena
    // 1 - 30
    setAntennaLevel(15).then(() => {
      // Atualizado
    });
  }, [isConnected]);
}
```

## Capturar as etiquetas lidas

```js
import { useEffect } from 'react';
import { useReader, useTags } from 'react-native-rfid8500-zebra';

function App() {
  const [tags, clearTags] = useTags();

  // conecte o dispositivo antes

  useEffect(() => {
    console.log(tags);
    // [
    //   "ASDH12358012308ASD",
    //   "ASDH12358012308ASD",
    //   "ASDH12358012308ASD",
    // ]

    // Limpar as tags lidas
    clearTags();
  }, [tags]);
}
```

## Forçar o leitor a iniciar a leitura

```js
import { useEffect } from 'react';
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  const { isConnected, softRead } = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Forçar leitura
    softRead(true).then(() => {
      // Iniciou a leitura
    });

    // Cancelar leitura
    softRead(false).then(() => {
      // Cancelou a leitura
    });
  }, [isConnected]);
}
```

## Localizar uma etiqueta através de distancia

```js
import { useEffect } from 'react';
import { useReader, useLocateTag } from 'react-native-rfid8500-zebra';

function App() {
  const { isConnected } = useReader();
  const { start, stop, isLocateTag, distance } = useLocateTag();

  // conecte o dispositivo antes

  useEffect(() => {
    // Inicia a busca de uma etiqueta
    start('ASDH12358012308ASD');

    // Para a busca de uma etiqueta
    stop();
  }, [isConnected]);

  useEffect(() => {
    if (isLocateTag) {
      // Retorna a distância de uma etiqueta.
      console.log(distance);
      // 0 - 100
    }
  }, [isLocateTag, distance]);
}
```

## Ler uma etiqueta de cada vez

```js
import { useEffect } from 'react';
import { useReader, useSingleRead } from 'react-native-rfid8500-zebra';

function App() {
  const { isConnected } = useReader();
  const [tag, setSingleRead] = useSingleRead();

  // conecte o dispositivo antes

  useEffect(() => {
    // Ativa o modo de leitura única
    setSingleRead(true);

    // Desativa o modo de leitura única
    setSingleRead(false);
  }, [isConnected]);

  useEffect(() => {
    console.log(tag);
    // "ASDH12358012308ASD"
  }, [tag]);
}
```

## Modo código de barra

```js
import { useEffect } from 'react';
import { useReader, useBarCode } from 'react-native-rfid8500-zebra';

function App() {
  const { isConnected, setMode } = useReader();
  const barCode = useBarCode();

  // conecte o dispositivo antes

  useEffect(() => {
    // Ativa o modo de código de barras
    setMode('BARCODE');

    // Ativa o modo de RFID
    setMode('RFID');
  }, [isConnected]);

  useEffect(() => {
    console.log(barCode);
    // "12345678456123 1234567897 4145611321 46546789"
  }, [barCode]);
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
