import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { mascararTelefone } from '@/utilitarios/mascaras';

import { CampoTexto } from '../CampoTexto';

function Exemplo({ erro, senha = false }: { erro?: string; senha?: boolean }) {
  const [valor, setValor] = useState('');
  return (
    <CampoTexto
      rotulo="Celular"
      valor={valor}
      onMudar={setValor}
      mascara={mascararTelefone}
      erro={erro}
      senha={senha}
    />
  );
}

it('aplica a máscara enquanto a pessoa digita', async () => {
  await render(<Exemplo />);
  await fireEvent.changeText(screen.getByLabelText('Celular'), '11987654321');
  expect(screen.getByLabelText('Celular').props.value).toBe('(11) 98765-4321');
});

it('mostra o erro como alerta para o leitor de tela', async () => {
  await render(<Exemplo erro="Telefone incompleto." />);
  expect(screen.getByRole('alert')).toHaveTextContent('Telefone incompleto.');
});

it('mostra e esconde a senha', async () => {
  await render(<Exemplo senha />);
  expect(screen.getByLabelText('Celular').props.secureTextEntry).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(screen.getByLabelText('Celular').props.secureTextEntry).toBe(false);
  expect(screen.getByRole('button', { name: 'Esconder senha' })).toBeTruthy();
});
