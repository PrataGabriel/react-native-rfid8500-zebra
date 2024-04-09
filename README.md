# react-native-rfid8500-zebra

## Installation

```sh
npm install react-native-rfid8500-zebra
```

## Conectando a um dispositivo

```js
import { useReader, useDevicesList } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
  // Lista de dispositivos pareados.
  const devicesList = useDevicesList();

  useEffect(() => {
    console.log(devicesList.devices);
    // [{"mac": "84:C6:92:41:3C:4B", "name": "RFD850022260520100556"}]

    const { name, mac } = devicesList.devices[0];

    reader.connect(name, mac).then((status) => {
      if (status) {
        // Conectado
      } else {
        // Erro ao conectar
      }
    });
  }, [devicesList.devices]);
}
```

## Desconectando de um dispositivo

```js
import { useReader, useDevicesList } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
  // Lista de dispositivos pareados.
  const devicesList = useDevicesList();

  useEffect(() => {
    console.log(devicesList.devices);
    // [{"mac": "84:C6:92:41:3C:4B", "name": "RFD850022260520100556"}]

    const { name, mac } = devicesList.devices[0];

    reader.disconnect().then((status) => {
      if (status) {
        // Desconectado
      } else {
        // Erro ao desconectar
      }
    });
  }, [devicesList.devices]);
}
```

## Capturando informações do dispositivo

```js
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Informações do dispositivo conectado
    console.log(reader.deviceDetails);
    // {
    //   name: "RFD850022260520100556"
    //   mac: "84:C6:92:41:3C:4B"
    //   antennaLevel: 27
    //   batteryLevel: 80
    // }
  }, [reader.deviceDetails]);
}
```

## Alterar nível da antena

```js
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Altera o nível da antena
    // 1 - 30
    reader.setAntennaLevel(15).then(() => {
      // Atualizado
    });
  }, [reader.isConnected]);
}
```

## Capturar as etiquetas lidas

```js
import { useReader, useTags } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
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
import { useReader } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();

  // conecte o dispositivo antes

  useEffect(() => {
    // Forçar leitura
    reader.softRead(true).then(() => {
      // Iniciou a leitura
    });

    // Cancelar leitura
    reader.softRead(false).then(() => {
      // Cancelou a leitura
    });
  }, [reader.isConnected]);
}
```

## Localizar uma etiqueta através de distancia

```js
import { useReader, useLocateTag } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
  const locateTag = useLocateTag();

  // conecte o dispositivo antes

  useEffect(() => {
    // Inicia a busca de uma etiqueta
    locateTag.start('ASDH12358012308ASD');

    // Para a busca de uma etiqueta
    locateTag.stop();
  }, [reader.isConnected]);

  useEffect(() => {
    if (locateTag.isLocateTag) {
      // Retorna a distância de uma etiqueta.
      console.log(locateTag.distance);
      // 0 - 100
    }
  }, [locateTag.isLocateTag, locateTag.distance]);
}
```

## Ler uma etiqueta de cada vez

```js
import { useReader, useSingleRead } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
  const [tag, setSingleRead] = useSingleRead();

  // conecte o dispositivo antes

  useEffect(() => {
    // Ativa o modo de leitura única
    setSingleRead(true);

    // Desativa o modo de leitura única
    setSingleRead(false);
  }, [reader.isConnected]);

  useEffect(() => {
    console.log(tag);
    // "ASDH12358012308ASD"
  }, [tag]);
}
```

## Modo código de barra

```js
import { useReader, useBarCode } from 'react-native-rfid8500-zebra';

function App() {
  // Ao utilizar o useReader, automáticamente será requisitado as permissões necessárias do bluetooth
  const reader = useReader();
  const barCode = useBarCode();

  // conecte o dispositivo antes

  useEffect(() => {
    // Ativa o modo de código de barras
    reader.setMode('BARCODE');

    // Ativa o modo de RFID
    setSingleRead('RFID');
  }, [reader.isConnected]);

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
