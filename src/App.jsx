import { useState } from 'react'
import { FileText } from 'lucide-react'
import PropostaVenda from './pages/PropostaVenda'
import ContratoAluguel from './pages/ContratoAluguel'

const SECOES = [
  { id: 'propostas',  label: 'Propostas de Venda' },
  { id: 'aluguel',    label: 'Contratos de Aluguel' },
]

export default function App() {
  const [secao, setSecao] = useState('propostas')

  return (
    <div className="min-h-screen" style={{ background: '#0D0B0B' }}>
      {/* Header */}
      <header className="border-b border-canaa-border px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-canaa-wine/20 border border-canaa-wine/30 flex items-center justify-center">
            <FileText size={16} className="text-canaa-wine" />
          </div>
          <div>
            <p className="text-[10px] text-canaa-muted uppercase tracking-widest">Canaã Imóveis de Luxo</p>
            <p className="text-white text-sm font-semibold leading-tight">Contratos</p>
          </div>
        </div>
        <div className="ml-4 h-5 w-px bg-canaa-border" />
        <nav className="flex gap-1">
          {SECOES.map(s => (
            <button
              key={s.id}
              onClick={() => setSecao(s.id)}
              className={`px-4 py-1.5 rounded-lg text-sm transition ${
                secao === s.id
                  ? 'bg-canaa-wine/15 text-canaa-wine border border-canaa-wine/30'
                  : 'text-canaa-muted hover:text-white hover:bg-canaa-surface border border-transparent'
              }`}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto text-canaa-muted text-xs">
          Módulo Contratos · v1.0
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {secao === 'propostas' && <PropostaVenda />}
        {secao === 'aluguel'   && <ContratoAluguel />}
      </main>
    </div>
  )
}
