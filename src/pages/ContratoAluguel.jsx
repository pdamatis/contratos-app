import { FileText, Clock } from 'lucide-react'

export default function ContratoAluguel() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-canaa-wine/10 border border-canaa-wine/20 flex items-center justify-center">
        <FileText size={28} className="text-canaa-wine" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Emissão de Contratos de Aluguel</h2>
        <p className="text-canaa-muted text-sm mt-2 max-w-sm">
          Seção em construção. Em breve você poderá emitir e gerenciar contratos de aluguel por aqui.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-canaa-surface border border-canaa-border text-canaa-muted text-xs">
        <Clock size={13} />
        Em desenvolvimento
      </div>
    </div>
  )
}
