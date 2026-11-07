jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const cofre = new Map();
  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    setItemAsync: jest.fn(async (chave, valor) => {
      cofre.set(chave, valor);
    }),
    getItemAsync: jest.fn(async (chave) => cofre.get(chave) ?? null),
    deleteItemAsync: jest.fn(async (chave) => {
      cofre.delete(chave);
    }),
  };
});

jest.mock('expo-crypto', () => {
  const crypto = require('crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: jest.fn(async (_algoritmo, dados) =>
      crypto.createHash('sha256').update(dados).digest('hex'),
    ),
    getRandomBytes: jest.fn((quantidade) => new Uint8Array(crypto.randomBytes(quantidade))),
    randomUUID: jest.fn(() => crypto.randomUUID()),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (efeito) => React.useEffect(efeito, [efeito]),
    useIsFocused: () => true,
    Stack: { Screen: () => null },
  };
});

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -23.5662, longitude: -46.6196 },
  })),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///foto-original.jpg', width: 4000, height: 3000 }],
  })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: jest.fn(async () => ({ uri: 'file:///foto-limpa.jpg', width: 1280, height: 960 })),
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const React = require('react');
  const MapView = React.forwardRef((props, _ref) => React.createElement(View, props));
  return { __esModule: true, default: MapView, Marker: View, Circle: View };
});
