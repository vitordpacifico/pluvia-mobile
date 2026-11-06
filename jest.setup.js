/* Substitui modulos nativos por versoes que rodam no Node durante os testes. */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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
