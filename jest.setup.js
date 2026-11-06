/* Substitui modulos nativos por versoes que rodam no Node durante os testes. */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Cofre falso em memória, no lugar do Keychain e do Keystore.
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

// Navegação falsa: as telas são testadas isoladas, sem o Expo Router.
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
