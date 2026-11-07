import { Image } from 'react-native';

import { estilos } from './estilos';

const LOGO = require('../../../assets/logo-pluvia.png');

export function Marca() {
  return (
    <Image
      source={LOGO}
      style={estilos.logo}
      resizeMode="contain"
      accessible
      accessibilityRole="header"
      accessibilityLabel="Pluvia"
    />
  );
}
