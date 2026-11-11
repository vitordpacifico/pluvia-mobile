import { Image } from 'react-native';

const LOGO = require('../../../assets/logo-pluvia-transparente.png');
const PROPORCAO = 357 / 657;

export function Marca({ largura = 220 }: { largura?: number }) {
  return (
    <Image
      source={LOGO}
      style={{ width: largura, height: Math.round(largura * PROPORCAO) }}
      resizeMode="contain"
      accessible
      accessibilityRole="header"
      accessibilityLabel="Pluvia"
    />
  );
}
