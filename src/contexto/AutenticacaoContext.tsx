import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { Usuario } from '@/dominio/usuario';
import { encerrarSessao, iniciarSessao, lerSessao } from '@/servicos/armazenamento/sessaoServico';
import {
  atualizarCidadao,
  autenticar,
  cadastrarCidadao,
  garantirContasDemonstracao,
  obterUsuario,
  type DadosAtualizacaoCidadao,
  type DadosCadastroCidadao,
} from '@/servicos/armazenamento/usuariosServico';

/** Depois de 5 senhas erradas seguidas, o login fica bloqueado por 30 segundos. */
const MAXIMO_TENTATIVAS = 5;
const BLOQUEIO_MS = 30_000;

export class ErroLogin extends Error {}

interface EstadoAutenticacao {
  usuario: Usuario | null;
  /** Verdadeiro enquanto a sessao salva ainda esta sendo lida. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastroCidadao) => Promise<void>;
  atualizar: (dados: DadosAtualizacaoCidadao) => Promise<void>;
  sair: () => Promise<void>;
}

const AutenticacaoContext = createContext<EstadoAutenticacao | null>(null);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const falhas = useRef({ quantidade: 0, bloqueadoAte: 0 });

  // Cria as contas de demonstracao e restaura a sessao, se houver.
  useEffect(() => {
    garantirContasDemonstracao()
      .then(lerSessao)
      .then((sessao) => (sessao ? obterUsuario(sessao.usuarioId) : null))
      .then(setUsuario)
      .catch((e) => console.warn('Falha ao restaurar a sessão', e))
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const agora = Date.now();
    if (falhas.current.bloqueadoAte > agora) {
      const segundos = Math.ceil((falhas.current.bloqueadoAte - agora) / 1000);
      throw new ErroLogin(`Muitas tentativas. Aguarde ${segundos} segundos.`);
    }

    const encontrado = await autenticar(email, senha);
    if (!encontrado) {
      falhas.current.quantidade++;
      if (falhas.current.quantidade >= MAXIMO_TENTATIVAS) {
        falhas.current = { quantidade: 0, bloqueadoAte: agora + BLOQUEIO_MS };
      }
      throw new ErroLogin('E-mail ou senha incorretos.');
    }

    falhas.current = { quantidade: 0, bloqueadoAte: 0 };
    await iniciarSessao(encontrado.id);
    setUsuario(encontrado);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastroCidadao) => {
    const novo = await cadastrarCidadao(dados);
    await iniciarSessao(novo.id);
    setUsuario(novo);
  }, []);

  const atualizar = useCallback(
    async (dados: DadosAtualizacaoCidadao) => {
      if (!usuario) return;
      setUsuario(await atualizarCidadao(usuario.id, dados));
    },
    [usuario],
  );

  const sair = useCallback(async () => {
    await encerrarSessao();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, atualizar, sair }),
    [usuario, carregando, entrar, cadastrar, atualizar, sair],
  );

  return <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>;
}

export function useAutenticacao(): EstadoAutenticacao {
  const contexto = useContext(AutenticacaoContext);
  if (!contexto) throw new Error('useAutenticacao precisa estar dentro de AutenticacaoProvider.');
  return contexto;
}
