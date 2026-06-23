import Header from "../../components/Header/Header";
import style from "./_redacao.module.css";
import { useState } from "react";
import RedacaoAPI from "../../services/RedacaoService";
import { getApiError } from "../../services/client";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import { FaPlus } from "react-icons/fa6";
import {
  LuPenLine,
  LuHistory,
  LuImagePlus,
  LuArrowLeft,
  LuDices,
} from "react-icons/lu";

const COMPETENCIAS = {
  1: "Norma culta",
  2: "Compreensão do tema",
  3: "Argumentação",
  4: "Coesão textual",
  5: "Proposta de intervenção",
};

const fmtData = (d) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const nivelNota = (n) =>
  n >= 800 ? "excelente" : n >= 600 ? "bom" : n >= 400 ? "regular" : "insuficiente";

export default function Redacao() {
  const queryClient = useQueryClient();

  const [compondo, setCompondo] = useState(false);
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState(null);
  const [transcrevendo, setTranscrevendo] = useState(false);
  const [gerandoTema, setGerandoTema] = useState(false);
  const [corrigindo, setCorrigindo] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [abrindoId, setAbrindoId] = useState(null);

  const { data: redacoes = [], isPending } = useQuery({
    queryKey: ["redacoes"],
    queryFn: async () => {
      const r = await RedacaoAPI.Listar();
      return Array.isArray(r) ? r : [];
    },
    staleTime: Infinity,
  });

  const novaRedacao = () => {
    setResultado(null);
    setTema("");
    setTexto("");
    setImagem(null);
    setCompondo(true);
  };

  const voltarLista = () => {
    setCompondo(false);
    setResultado(null);
  };

  const handleImagem = (e) => {
    const file = e.target.files?.[0];
    if (file) setImagem(file);
  };

  const handleGerarTema = async () => {
    try {
      setGerandoTema(true);
      const r = await RedacaoAPI.GerarTema();
      setTema(r?.tema ?? "");
      toast.success("Tema gerado! Edite à vontade antes de escrever.");
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao gerar o tema."));
    } finally {
      setGerandoTema(false);
    }
  };

  const handleTranscrever = async () => {
    if (!imagem) return toast.warning("Selecione uma imagem da redação.");

    try {
      setTranscrevendo(true);
      const r = await RedacaoAPI.Transcrever(imagem);
      setTexto(r?.texto ?? "");
      toast.success("Transcrição pronta. Revise o texto antes de corrigir.");
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao transcrever a imagem."));
    } finally {
      setTranscrevendo(false);
    }
  };

  const handleCorrigir = async () => {
    if (!tema.trim()) return toast.warning("Informe o tema da redação.");
    if (texto.trim().length < 120)
      return toast.warning("A redação está muito curta para correção.");

    try {
      setCorrigindo(true);
      const r = await RedacaoAPI.Corrigir(tema, texto);
      setResultado(r);
      setCompondo(false);
      queryClient.invalidateQueries({ queryKey: ["redacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardDesempenho"] });
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao corrigir a redação."));
    } finally {
      setCorrigindo(false);
    }
  };

  const abrirRedacao = async (red) => {
    try {
      setAbrindoId(red.redacaoId);
      const completo = await RedacaoAPI.Obter(red.redacaoId);
      setResultado(completo);
      setCompondo(false);
    } catch (erro) {
      toast.error(getApiError(erro, "Erro ao abrir a redação."));
    } finally {
      setAbrindoId(null);
    }
  };

  const ordenadas = [...redacoes].sort(
    (a, b) => new Date(b.data) - new Date(a.data),
  );
  const [destaque, ...resto] = ordenadas;
  const historico = resto.slice(0, 4);

  if (resultado) {
    const competencias = [...(resultado.competencias ?? [])].sort(
      (a, b) => a.numero - b.numero,
    );
    const nivel = nivelNota(resultado.notaFinal);

    return (
      <div className="page">
        <Header />
        <div className={style.container}>
          <button className={style.voltar} onClick={voltarLista}>
            <LuArrowLeft /> Voltar
          </button>

          <header className={style.resultHero}>
            <div className={style.resultHeroInfo}>
              <span className={style.resultKicker}>
                Correção — {fmtData(resultado.data)}
              </span>
              <h1 className={style.resultTema}>{resultado.tema}</h1>
              <span className={`${style.nivelBadge} ${style[nivel]}`}>
                {nivel}
              </span>
            </div>
            <div className={style.resultNota}>
              <span className={style.resultNotaNum}>{resultado.notaFinal}</span>
              <span className={style.resultNotaMax}>/ 1000</span>
            </div>
          </header>

          <div className={style.competencias}>
            {competencias.map((c) => (
              <div key={c.numero} className={style.compCard}>
                <div className={style.compTopo}>
                  <span className={style.compNum}>C{c.numero}</span>
                  <span className={style.compNome}>{COMPETENCIAS[c.numero]}</span>
                  <span className={style.compNota}>
                    {c.nota}
                    <em>/200</em>
                  </span>
                </div>
                <span className={style.compBarra}>
                  <span style={{ width: `${(c.nota / 200) * 100}%` }} />
                </span>
                <p className={style.compComentario}>{c.comentario}</p>
              </div>
            ))}
          </div>

          {resultado.comentarioGeral && (
            <div className={style.geralBox}>
              <h5>Comentário geral</h5>
              <p>{resultado.comentarioGeral}</p>
            </div>
          )}

          {resultado.texto && (
            <div className={style.textoBox}>
              <h5>Sua redação</h5>
              <p>{resultado.texto}</p>
            </div>
          )}

          <button
            className={`${style.enviar} ${style.full}`}
            onClick={novaRedacao}
          >
            <FaPlus /> Nova redação
          </button>
        </div>
      </div>
    );
  }

  if (compondo) {
    return (
      <div className="page">
        <Header />
        <div className={style.container}>
          <button className={style.voltar} onClick={voltarLista}>
            <LuArrowLeft /> Voltar
          </button>

          <header className={style.composeHead}>
            <span className="eyebrow">Nova redação</span>
            <h1 className={style.composeTitle}>Enviar redação</h1>
            <p className={style.composeSub}>
              Sem tema? Sorteie um baseado em tendências brasileiras. Digite o
              texto ou envie a foto da redação manuscrita — a IA transcreve e
              você revisa antes de corrigir.
            </p>
          </header>

          <div className={style.card}>
            <div className={style.temaHead}>
              <label className={style.campoLabel}>Tema</label>
              <button
                type="button"
                className={style.sortearBtn}
                onClick={handleGerarTema}
                disabled={gerandoTema}
              >
                <span className={gerandoTema ? style.hiddenText : ""}>
                  <LuDices /> Sortear tema
                </span>
                {gerandoTema && <span className={style.spinnerDark} />}
              </button>
            </div>
            <input
              className={style.input}
              type="text"
              placeholder="Ex.: Desafios para a valorização de comunidades tradicionais no Brasil"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              maxLength={300}
            />

            <div className={style.uploadRow}>
              <label className={style.uploadBtn}>
                <LuImagePlus />
                <span className={style.uploadNome}>
                  {imagem ? imagem.name : "Enviar foto da redação"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImagem}
                />
              </label>
              <button
                type="button"
                className={style.transcreverBtn}
                onClick={handleTranscrever}
                disabled={!imagem || transcrevendo}
              >
                <span className={transcrevendo ? style.hiddenText : ""}>
                  Transcrever
                </span>
                {transcrevendo && <span className={style.spinnerDark} />}
              </button>
            </div>

            <label className={style.campoLabel}>Texto da redação</label>
            <textarea
              className={style.textarea}
              placeholder="Digite ou cole sua redação aqui. Se enviou uma foto, revise a transcrição antes de corrigir."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={16}
            />
            <span className={style.contadorChars}>{texto.length} caracteres</span>

            <button
              type="button"
              className={`${style.enviar} ${style.full}`}
              onClick={handleCorrigir}
              disabled={corrigindo}
            >
              <span className={corrigindo ? style.hiddenText : ""}>
                Corrigir redação
              </span>
              {corrigindo && <span className={style.spinner} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <div className={style.lista}>
        <header className={style.pageHead}>
          <div className={style.pageHeadText}>
            <span className="eyebrow">Escreva</span>
            <h1 className={style.pageTitle}>Redação</h1>
            <p className={style.pageSub}>
              Envie sua redação dissertativo-argumentativa e receba nota por
              competência e comentários no padrão ENEM.
            </p>
          </div>
          <div className={style.pageHeadAcoes}>
            <span className={style.heroIndice}>08 / Redação</span>
            {redacoes.length > 0 && (
              <button className={style.botaoNovo} onClick={novaRedacao}>
                <FaPlus />
                <span>Nova redação</span>
              </button>
            )}
          </div>
        </header>

        {isPending ? (
          <div className={style.skeletonWrap}>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} lines={2} />
            ))}
          </div>
        ) : redacoes.length === 0 ? (
          <div className={style.vazio}>
            <div className={style.vazioIcon}>
              <LuPenLine />
            </div>
            <h3>Nenhuma redação ainda</h3>
            <p>
              Envie sua primeira redação para receber a correção por competência.
            </p>
            <button className={style.botaoCriarVazio} onClick={novaRedacao}>
              <FaPlus /> Enviar redação
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className={style.destaque}
              disabled={abrindoId === destaque.redacaoId}
              onClick={() => abrirRedacao(destaque)}
            >
              <div className={style.destaqueInfo}>
                <span className={style.destaqueKicker}>
                  Mais recente — {fmtData(destaque.data)}
                </span>
                <p className={style.destaqueTema}>{destaque.tema}</p>
                <span className={style.destaqueLink}>
                  {abrindoId === destaque.redacaoId
                    ? "Carregando..."
                    : "Ver correção →"}
                </span>
              </div>
              <div className={style.destaqueNota}>
                <span className={style.destaqueNotaNum}>
                  {destaque.notaFinal}
                </span>
                <span className={style.destaqueNotaMax}>/ 1000</span>
              </div>
            </button>

            {historico.length > 0 && (
              <div className={style.ledger}>
                <div className={style.panelHead}>
                  <div className={style.panelTitulo}>
                    <span className={style.panelIcone}>
                      <LuHistory />
                    </span>
                    <div>
                      <h3>Histórico</h3>
                      <span>Suas redações mais recentes</span>
                    </div>
                  </div>
                  <span className={style.panelBadge}>
                    {historico.length}{" "}
                    {historico.length === 1 ? "redação" : "redações"}
                  </span>
                </div>
                <div className={style.ledgerHead}>
                  <span>Data</span>
                  <span>Tema</span>
                  <span>Nota</span>
                  <span aria-hidden="true" />
                </div>
                {historico.map((red) => (
                  <button
                    type="button"
                    key={red.redacaoId}
                    className={style.ledgerRow}
                    disabled={abrindoId === red.redacaoId}
                    onClick={() => abrirRedacao(red)}
                  >
                    <span className={style.ledgerData}>{fmtData(red.data)}</span>
                    <span className={style.ledgerTema}>{red.tema}</span>
                    <span className={style.ledgerNota}>
                      {red.notaFinal}
                      <em>/1000</em>
                    </span>
                    <span className={style.ledgerLink}>
                      {abrindoId === red.redacaoId
                        ? "Carregando..."
                        : "Ver correção →"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
