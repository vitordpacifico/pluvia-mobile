import { Alert, Platform } from 'react-native';

export function pedirConfirmacao(titulo: string, mensagem: string, rotuloAcao: string, acao: () => void): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) acao();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: rotuloAcao, style: 'destructive', onPress: acao },
  ]);
}
