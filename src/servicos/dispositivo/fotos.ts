import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export class ErroFoto extends Error {}

export type OrigemFoto = 'camera' | 'galeria';

const LARGURA_MAXIMA = 1280;

export async function limparFoto(uri: string, largura: number): Promise<string> {
  const resultado = await manipulateAsync(
    uri,
    largura > LARGURA_MAXIMA ? [{ resize: { width: LARGURA_MAXIMA } }] : [],
    { compress: 0.7, format: SaveFormat.JPEG },
  );
  return resultado.uri;
}

export async function escolherFoto(origem: OrigemFoto): Promise<string | null> {
  const permissao =
    origem === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    throw new ErroFoto(
      origem === 'camera' ? 'Sem permissão para usar a câmera.' : 'Sem permissão para abrir a galeria.',
    );
  }

  const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, exif: false };
  const resultado =
    origem === 'camera'
      ? await ImagePicker.launchCameraAsync(opcoes)
      : await ImagePicker.launchImageLibraryAsync(opcoes);
  if (resultado.canceled || resultado.assets.length === 0) return null;

  const foto = resultado.assets[0];
  return limparFoto(foto.uri, foto.width);
}
