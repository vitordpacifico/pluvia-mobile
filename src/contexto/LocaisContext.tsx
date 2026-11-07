import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LocalMonitorado } from '@/dominio/local';
import { ehCidadao } from '@/dominio/usuario';
import {
  adicionarFavorito as adicionarFavoritoSalvo,
  listarLocais,
  removerLocal as removerLocalSalvo,
  salvarCarro as salvarCarroSalvo,
  type DadosLocal,
} from '@/servicos/armazenamento/locaisServico';

import { useAutenticacao } from './AutenticacaoContext';

type DadosNovoLocal = Omit<DadosLocal, 'tipo'>;

interface EstadoLocais {
  locais: LocalMonitorado[];
  carro: LocalMonitorado | null;
  favoritos: LocalMonitorado[];
  carregando: boolean;
  salvarCarro: (dados: DadosNovoLocal) => Promise<void>;
  adicionarFavorito: (dados: DadosNovoLocal) => Promise<void>;
  removerLocal: (localId: string) => Promise<void>;
}

const LocaisContext = createContext<EstadoLocais | null>(null);

export function LocaisProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  const usuarioId = usuario && ehCidadao(usuario) ? usuario.id : null;
  const [locais, setLocais] = useState<LocalMonitorado[]>([]);
  const [carregadoPara, setCarregadoPara] = useState<string | null | undefined>(undefined);

  const recarregar = useCallback(async () => {
    const lista = usuarioId ? await listarLocais(usuarioId) : [];
    setLocais(lista);
    setCarregadoPara(usuarioId);
  }, [usuarioId]);

  useEffect(() => {
    let ativo = true;
    (usuarioId ? listarLocais(usuarioId) : Promise.resolve([]))
      .then((lista) => {
        if (!ativo) return;
        setLocais(lista);
        setCarregadoPara(usuarioId);
      })
      .catch((e) => {
        console.warn('Falha ao ler os locais monitorados', e);
        if (ativo) setCarregadoPara(usuarioId);
      });
    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  const carregando = carregadoPara !== usuarioId;

  const exigirUsuario = useCallback(() => {
    if (!usuarioId) throw new Error('Entre com uma conta de cidadão.');
    return usuarioId;
  }, [usuarioId]);

  const salvarCarro = useCallback(
    async (dados: DadosNovoLocal) => {
      await salvarCarroSalvo(exigirUsuario(), dados);
      await recarregar();
    },
    [exigirUsuario, recarregar],
  );

  const adicionarFavorito = useCallback(
    async (dados: DadosNovoLocal) => {
      await adicionarFavoritoSalvo(exigirUsuario(), dados);
      await recarregar();
    },
    [exigirUsuario, recarregar],
  );

  const removerLocal = useCallback(
    async (localId: string) => {
      await removerLocalSalvo(exigirUsuario(), localId);
      await recarregar();
    },
    [exigirUsuario, recarregar],
  );

  const valor = useMemo(
    () => ({
      locais,
      carro: locais.find((l) => l.tipo === 'CARRO') ?? null,
      favoritos: locais.filter((l) => l.tipo === 'FAVORITO'),
      carregando,
      salvarCarro,
      adicionarFavorito,
      removerLocal,
    }),
    [locais, carregando, salvarCarro, adicionarFavorito, removerLocal],
  );

  return <LocaisContext.Provider value={valor}>{children}</LocaisContext.Provider>;
}

export function useLocais(): EstadoLocais {
  const contexto = useContext(LocaisContext);
  if (!contexto) throw new Error('useLocais precisa estar dentro de LocaisProvider.');
  return contexto;
}
