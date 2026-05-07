import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { gerarPDF } from '../components/PropostaPDF'
import {
  Plus, Search, Filter, X, FileText, Edit2, Trash2,
  ChevronDown, ChevronUp, Save, Printer, ArrowLeft, Check
} from 'lucide-react'

/* ── helpers ─────────────────────────────────────────── */
function fmtBRL(v) {
  if (!v && v !== 0) return '—'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.slice(0,10).split('-')
  return `${day}/${m}/${y}`
}

const EMPTY = {
  empresa: '', corretor: '', nome_comprador: '', nome_proprietario: '',
  produto: '', valor_proposta: '', opcao_pagamento: 'À vista',
  comissao_intermediadora: '', situacao: 'Enviada', data_retorno: '',
  tipo_imovel: 'imovel', endereco_imovel: '',
  nome_barco: '', marca_modelo: '', tamanho: '',
  condicoes_adicionais: '', observacoes: '',
}

function SituacaoBadge({ s }) {
  const cls = { Enviada: 'badge-enviada', Aceita: 'badge-aceita', Recusada: 'badge-recusada' }
  return <span className={cls[s] || 'badge-enviada'}>{s || 'Enviada'}</span>
}

/* ── Formulário ──────────────────────────────────────── */
function PropostaForm({ proposta, opcoes, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(proposta ? { ...EMPTY, ...proposta } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (andPrint = false) => {
    if (!form.nome_comprador.trim()) return alert('Informe o nome do comprador.')
    setSaving(true)
    try {
      let result
      if (proposta?.id) result = await api.updateProposta(proposta.id, form)
      else result = await api.createProposta(form)
      setSaved(true)
      if (andPrint) { onSave(result); gerarPDF(result) }
      else { setTimeout(() => { setSaved(false); onSave(result) }, 800) }
    } catch (e) { alert('Erro ao salvar: ' + e.message) }
    finally { setSaving(false) }
  }

  const corretores = opcoes?.corretor || []
  const empresas   = opcoes?.empresa  || []
  const pagamentos = opcoes?.pagamento || ['À vista','Financiamento bancário','Parcelado','Permuta','Outros']

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-lg text-canaa-muted hover:text-white hover:bg-canaa-surface transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {proposta?.id ? `Proposta #${String(proposta.id).padStart(4,'0')}` : 'Nova Proposta de Venda'}
          </h2>
          <p className="text-xs text-canaa-muted mt-0.5">Preencha os dados abaixo e salve</p>
        </div>
      </div>

      {/* Partes */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-canaa-wine uppercase tracking-widest border-b border-canaa-border pb-2">
          Partes Envolvidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Empresa</label>
            <select className="input" value={form.empresa} onChange={e => set('empresa', e.target.value)}>
              <option value="">Selecione...</option>
              {empresas.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Corretor(a)</label>
            <input className="input" list="corretores-list" value={form.corretor}
              onChange={e => set('corretor', e.target.value)} placeholder="Nome do corretor" />
            <datalist id="corretores-list">
              {corretores.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Nome do Comprador <span className="text-red-400">*</span></label>
            <input className="input" value={form.nome_comprador}
              onChange={e => set('nome_comprador', e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">Nome do Proprietário</label>
            <input className="input" value={form.nome_proprietario}
              onChange={e => set('nome_proprietario', e.target.value)} placeholder="Nome completo" />
          </div>
        </div>
      </div>

      {/* Imóvel / Produto */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-canaa-wine uppercase tracking-widest border-b border-canaa-border pb-2">
          Imóvel / Produto
        </h3>
        <div className="flex gap-4">
          {['imovel','barco'].map(t => (
            <button key={t} type="button"
              onClick={() => set('tipo_imovel', t)}
              className={`flex-1 py-2.5 rounded-lg border text-sm transition ${
                form.tipo_imovel === t
                  ? 'border-canaa-wine bg-canaa-wine/10 text-white'
                  : 'border-canaa-border text-canaa-muted hover:border-canaa-wine/40'
              }`}>
              {t === 'imovel' ? '🏠 Imóvel' : '⛵ Barco / Embarcação'}
            </button>
          ))}
        </div>

        {form.tipo_imovel === 'imovel' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Produto</label>
              <input className="input" value={form.produto}
                onChange={e => set('produto', e.target.value)} placeholder="Descrição do imóvel" />
            </div>
            <div>
              <label className="label">Endereço do Imóvel</label>
              <input className="input" value={form.endereco_imovel}
                onChange={e => set('endereco_imovel', e.target.value)} placeholder="Rua, número, bairro..." />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nome do Barco</label>
              <input className="input" value={form.nome_barco}
                onChange={e => set('nome_barco', e.target.value)} placeholder="Nome" />
            </div>
            <div>
              <label className="label">Marca / Modelo</label>
              <input className="input" value={form.marca_modelo}
                onChange={e => set('marca_modelo', e.target.value)} placeholder="Ex: Azimut 50" />
            </div>
            <div>
              <label className="label">Tamanho</label>
              <input className="input" value={form.tamanho}
                onChange={e => set('tamanho', e.target.value)} placeholder="Ex: 15m / 50 pés" />
            </div>
          </div>
        )}
      </div>

      {/* Condições financeiras */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-canaa-wine uppercase tracking-widest border-b border-canaa-border pb-2">
          Condições Financeiras
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Valor da Proposta (R$)</label>
            <input type="number" className="input" value={form.valor_proposta}
              onChange={e => set('valor_proposta', e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label className="label">Forma de Pagamento</label>
            <select className="input" value={form.opcao_pagamento} onChange={e => set('opcao_pagamento', e.target.value)}>
              {pagamentos.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Comissão Intermediadora (%)</label>
            <input type="number" step="0.1" className="input" value={form.comissao_intermediadora}
              onChange={e => set('comissao_intermediadora', e.target.value)} placeholder="0.0" />
          </div>
          <div>
            <label className="label">Situação</label>
            <select className="input" value={form.situacao} onChange={e => set('situacao', e.target.value)}>
              {['Enviada','Aceita','Recusada'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="md:w-1/3">
          <label className="label">Data de Retorno</label>
          <input type="date" className="input" value={form.data_retorno}
            onChange={e => set('data_retorno', e.target.value)} />
        </div>
      </div>

      {/* Condições adicionais */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-canaa-wine uppercase tracking-widest border-b border-canaa-border pb-2">
          Condições Adicionais e Observações
        </h3>
        <div>
          <label className="label">Condições Adicionais <span className="text-canaa-muted font-normal normal-case tracking-normal">(cada linha vira um bullet no PDF)</span></label>
          <textarea className="input resize-none" rows={5}
            value={form.condicoes_adicionais}
            onChange={e => set('condicoes_adicionais', e.target.value)}
            placeholder={"Valor de R$ 2.000.000,00 (dois milhões de reais)\nPagamento à vista\n30 dias para desocupação"} />
        </div>
        <div>
          <label className="label">Observações Internas</label>
          <textarea className="input resize-none" rows={3}
            value={form.observacoes}
            onChange={e => set('observacoes', e.target.value)}
            placeholder="Notas internas (não aparecem no PDF)..." />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between gap-3 pt-2 pb-6">
        <div>
          {proposta?.id && (
            <button onClick={() => onDelete(proposta.id)}
              className="btn-danger flex items-center gap-2">
              <Trash2 size={15} /> Excluir
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost">Cancelar</button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="btn-ghost flex items-center gap-2 border-canaa-wine/40 text-canaa-wine hover:text-white hover:bg-canaa-wine/20">
            <Printer size={15} /> Salvar e Gerar PDF
          </button>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="btn-primary flex items-center gap-2">
            {saved ? <><Check size={15} /> Salvo!</> : saving ? 'Salvando...' : <><Save size={15} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Lista de propostas ──────────────────────────────── */
function PropostaCard({ p, onEdit, onPrint }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-4 hover:border-canaa-wine/30 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-canaa-muted text-xs font-mono">#{String(p.id).padStart(4,'0')}</span>
          <SituacaoBadge s={p.situacao} />
          {p.tipo_imovel === 'barco' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/30">⛵ Barco</span>
          )}
        </div>
        <h3 className="text-white font-medium text-sm truncate">{p.nome_comprador || '—'}</h3>
        <p className="text-canaa-muted text-xs mt-0.5">
          {p.tipo_imovel === 'barco'
            ? [p.nome_barco, p.marca_modelo].filter(Boolean).join(' · ')
            : p.produto || p.endereco_imovel || '—'}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-canaa-muted">
          {p.empresa   && <span>{p.empresa}</span>}
          {p.corretor  && <span>Corretor: {p.corretor}</span>}
          {p.data_retorno && <span>Retorno: {fmtDate(p.data_retorno)}</span>}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <span className="text-white font-semibold text-sm whitespace-nowrap">
          {p.valor_proposta ? fmtBRL(p.valor_proposta) : '—'}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => onPrint(p)}
            className="p-2 rounded-lg text-canaa-muted hover:text-canaa-wine hover:bg-canaa-surface border border-canaa-border transition"
            title="Gerar PDF">
            <Printer size={15} />
          </button>
          <button onClick={() => onEdit(p)}
            className="p-2 rounded-lg text-canaa-muted hover:text-white hover:bg-canaa-surface border border-canaa-border transition"
            title="Editar">
            <Edit2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Ranking por Corretor ────────────────────────────── */
function RankingCorretores({ propostas }) {
  const map = {}
  propostas.forEach(p => {
    const nome = (p.corretor || '').trim() || '—'
    if (!map[nome]) map[nome] = { total: 0, aceitas: 0, recusadas: 0, enviadas: 0, volume: 0 }
    map[nome].total++
    if (p.situacao === 'Aceita')   { map[nome].aceitas++;   map[nome].volume += Number(p.valor_proposta) || 0 }
    if (p.situacao === 'Recusada') map[nome].recusadas++
    if (p.situacao === 'Enviada')  map[nome].enviadas++
  })

  const ranking = Object.entries(map)
    .map(([nome, s]) => ({ nome, ...s }))
    .sort((a, b) => b.aceitas - a.aceitas || b.volume - a.volume || b.total - a.total)

  if (ranking.length === 0) return null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-canaa-wine uppercase tracking-widest border-b border-canaa-border pb-2 mb-4">
        Ranking por Corretor
      </h3>
      <div className="space-y-2">
        {ranking.map((c, i) => {
          const pct = c.total > 0 ? Math.round((c.aceitas / c.total) * 100) : 0
          return (
            <div key={c.nome} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-canaa-surface/50 hover:bg-canaa-surface transition">
              {/* Posição */}
              <div className="w-7 text-center text-base shrink-0">
                {i < 3 ? medals[i] : <span className="text-canaa-muted text-sm font-mono">{i + 1}º</span>}
              </div>
              {/* Nome */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{c.nome}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-canaa-muted flex-wrap">
                  <span>{c.total} proposta{c.total !== 1 ? 's' : ''}</span>
                  <span className="text-emerald-400">{c.aceitas} aceita{c.aceitas !== 1 ? 's' : ''}</span>
                  {c.recusadas > 0 && <span className="text-red-400">{c.recusadas} recusada{c.recusadas !== 1 ? 's' : ''}</span>}
                  {c.enviadas  > 0 && <span className="text-amber-400">{c.enviadas} em aberto</span>}
                </div>
              </div>
              {/* Taxa de conversão */}
              <div className="text-right shrink-0">
                <p className="text-white text-sm font-semibold">
                  {c.volume > 0
                    ? c.volume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                    : '—'}
                </p>
                <p className="text-[11px] text-canaa-muted mt-0.5">{pct}% conv.</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Página principal ─────────────────────────────────── */
export default function PropostaVenda() {
  const [propostas, setPropostas] = useState([])
  const [opcoes,    setOpcoes]    = useState({})
  const [loading,   setLoading]   = useState(true)
  const [view,      setView]      = useState('list') // 'list' | 'form'
  const [editItem,  setEditItem]  = useState(null)
  const [deleteId,  setDeleteId]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [filterSit, setFilterSit] = useState('')
  const [filterEmp, setFilterEmp] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, o] = await Promise.all([api.getPropostas(), api.getOpcoes()])
      setPropostas(p)
      setOpcoes(o)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = propostas.filter(p => {
    if (filterSit && p.situacao !== filterSit) return false
    if (filterEmp && p.empresa  !== filterEmp)  return false
    if (search) {
      const q = search.toLowerCase()
      return (p.nome_comprador||'').toLowerCase().includes(q)
          || (p.corretor||'').toLowerCase().includes(q)
          || (p.produto||'').toLowerCase().includes(q)
          || (p.nome_barco||'').toLowerCase().includes(q)
          || String(p.id).includes(q)
    }
    return true
  })

  // stats
  const total    = propostas.length
  const aceitas  = propostas.filter(p => p.situacao === 'Aceita').length
  const enviadas = propostas.filter(p => p.situacao === 'Enviada').length
  const recusadas= propostas.filter(p => p.situacao === 'Recusada').length
  const totalValor = propostas.filter(p => p.situacao === 'Aceita').reduce((s,p) => s + (Number(p.valor_proposta)||0), 0)

  const handleSave = (saved) => {
    load()
    setView('list')
    setEditItem(null)
  }

  const handleDelete = async (id) => {
    await api.deleteProposta(id)
    setDeleteId(null)
    setView('list')
    setEditItem(null)
    load()
  }

  const openNew  = () => { setEditItem(null); setView('form') }
  const openEdit = (p) => { setEditItem(p);   setView('form') }
  const openPrint= (p) => gerarPDF(p)

  if (view === 'form') {
    return (
      <PropostaForm
        proposta={editItem}
        opcoes={opcoes}
        onSave={handleSave}
        onCancel={() => { setView('list'); setEditItem(null) }}
        onDelete={id => setDeleteId(id)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Propostas de Venda</h1>
          <p className="text-canaa-muted text-sm mt-0.5">Registre, acompanhe e gere PDFs das propostas</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Proposta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',     value: total,     cls: 'text-white' },
          { label: 'Enviadas',  value: enviadas,  cls: 'text-amber-400' },
          { label: 'Aceitas',   value: aceitas,   cls: 'text-emerald-400' },
          { label: 'Recusadas', value: recusadas, cls: 'text-red-400' },
          { label: 'Vol. Aceitas', value: totalValor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), cls: 'text-canaa-wine text-sm' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-canaa-muted text-[11px] uppercase tracking-widest">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ranking */}
      {!loading && propostas.length > 0 && <RankingCorretores propostas={propostas} />}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-canaa-muted" />
          <input className="input pl-9" placeholder="Buscar por comprador, corretor, produto..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36" value={filterSit} onChange={e => setFilterSit(e.target.value)}>
          <option value="">Situação</option>
          <option>Enviada</option><option>Aceita</option><option>Recusada</option>
        </select>
        <select className="input w-56" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
          <option value="">Empresa</option>
          {(opcoes?.empresa||[]).map(e => <option key={e}>{e}</option>)}
        </select>
        {(search||filterSit||filterEmp) && (
          <button onClick={() => { setSearch(''); setFilterSit(''); setFilterEmp('') }}
            className="btn-ghost flex items-center gap-1 text-canaa-muted">
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-20 text-canaa-muted">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="mx-auto text-canaa-border mb-3" />
          <p className="text-canaa-muted">Nenhuma proposta encontrada.</p>
          <button onClick={openNew} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
            <Plus size={15} /> Criar primeira proposta
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-canaa-muted text-xs">{filtered.length} proposta{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(p => (
            <PropostaCard key={p.id} p={p} onEdit={openEdit} onPrint={openPrint} />
          ))}
        </div>
      )}

      {/* Modal confirmar exclusão */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-semibold text-white mb-2">Confirmar exclusão</h3>
            <p className="text-canaa-muted text-sm mb-5">
              A proposta #{String(deleteId).padStart(4,'0')} será removida permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
