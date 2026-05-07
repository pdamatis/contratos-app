export function gerarPDF(p) {
  const fmt = v => v ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'
  const fmtDate = d => {
    if (!d) return '—'
    const [y, m, day] = d.slice(0,10).split('-')
    return `${day}/${m}/${y}`
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Proposta de Venda #${p.id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', serif;
    color: #1a1a1a;
    background: #fff;
    padding: 48px 56px;
    font-size: 13px;
    line-height: 1.6;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #7b1c1c;
    padding-bottom: 20px;
    margin-bottom: 28px;
  }
  .logo-area h1 {
    font-size: 22px;
    letter-spacing: 0.18em;
    color: #1a1a1a;
    font-weight: 700;
  }
  .logo-area p {
    font-size: 10px;
    letter-spacing: 0.25em;
    color: #7b1c1c;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .doc-info { text-align: right; }
  .doc-info .num {
    font-size: 18px;
    font-weight: bold;
    color: #7b1c1c;
  }
  .doc-info .date {
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }
  .badge {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    margin-top: 6px;
  }
  .badge-enviada  { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .badge-aceita   { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
  .badge-recusada { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .section {
    margin-bottom: 24px;
  }
  .section-title {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7b1c1c;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6px;
    margin-bottom: 14px;
    font-weight: 700;
  }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px 24px; }
  .field label {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9ca3af;
    margin-bottom: 2px;
  }
  .field span {
    font-size: 13px;
    color: #111;
    font-weight: 500;
  }
  .valor-destaque {
    font-size: 20px;
    font-weight: bold;
    color: #7b1c1c;
  }
  .condicoes {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 12.5px;
    white-space: pre-wrap;
    color: #374151;
  }
  .obs {
    background: #fffbeb;
    border-left: 3px solid #fcd34d;
    padding: 10px 14px;
    font-size: 12px;
    color: #78350f;
    font-style: italic;
  }
  .footer {
    margin-top: 48px;
    border-top: 1px solid #e5e7eb;
    padding-top: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  .assinatura {
    text-align: center;
  }
  .assinatura .linha {
    border-top: 1px solid #9ca3af;
    margin-bottom: 6px;
    margin-top: 40px;
  }
  .assinatura .nome { font-size: 12px; font-weight: 600; }
  .assinatura .cargo { font-size: 10px; color: #9ca3af; }
  .print-date {
    text-align: center;
    font-size: 10px;
    color: #9ca3af;
    margin-top: 24px;
  }
  @media print {
    body { padding: 32px 40px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo-area">
    <h1>CANAÃ</h1>
    <p>Imóveis de Luxo</p>
  </div>
  <div class="doc-info">
    <div class="num">Proposta #${String(p.id).padStart(4, '0')}</div>
    <div class="date">Emitida em ${fmtDate(p.created_at)}</div>
    <div>
      <span class="badge badge-${(p.situacao||'enviada').toLowerCase()}">${p.situacao || 'Enviada'}</span>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Partes Envolvidas</div>
  <div class="grid-2">
    <div class="field"><label>Empresa</label><span>${p.empresa || '—'}</span></div>
    <div class="field"><label>Corretor(a)</label><span>${p.corretor || '—'}</span></div>
    <div class="field"><label>Comprador</label><span>${p.nome_comprador || '—'}</span></div>
    <div class="field"><label>Proprietário</label><span>${p.nome_proprietario || '—'}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Imóvel / Produto</div>
  ${p.tipo_imovel === 'barco' ? `
  <div class="grid-3">
    <div class="field"><label>Nome do Barco</label><span>${p.nome_barco || '—'}</span></div>
    <div class="field"><label>Marca / Modelo</label><span>${p.marca_modelo || '—'}</span></div>
    <div class="field"><label>Tamanho</label><span>${p.tamanho || '—'}</span></div>
  </div>
  ` : `
  <div class="grid-2">
    <div class="field"><label>Produto</label><span>${p.produto || '—'}</span></div>
    <div class="field"><label>Endereço do Imóvel</label><span>${p.endereco_imovel || '—'}</span></div>
  </div>
  `}
</div>

<div class="section">
  <div class="section-title">Condições Financeiras</div>
  <div class="grid-3">
    <div class="field">
      <label>Valor da Proposta</label>
      <span class="valor-destaque">R$ ${fmt(p.valor_proposta)}</span>
    </div>
    <div class="field"><label>Forma de Pagamento</label><span>${p.opcao_pagamento || '—'}</span></div>
    <div class="field"><label>Comissão da Intermediadora</label><span>${p.comissao_intermediadora != null ? p.comissao_intermediadora + '%' : '—'}</span></div>
  </div>
  ${p.data_retorno ? `
  <div style="margin-top:12px" class="field"><label>Data de Retorno da Proposta</label><span>${fmtDate(p.data_retorno)}</span></div>
  ` : ''}
</div>

${p.condicoes_adicionais ? `
<div class="section">
  <div class="section-title">Condições Adicionais</div>
  <div class="condicoes">${p.condicoes_adicionais.replace(/\n/g,'<br/>')}</div>
</div>
` : ''}

${p.observacoes ? `
<div class="section">
  <div class="section-title">Observações</div>
  <div class="obs">${p.observacoes}</div>
</div>
` : ''}

<div class="footer">
  <div class="assinatura">
    <div class="linha"></div>
    <div class="nome">${p.nome_comprador || 'Comprador'}</div>
    <div class="cargo">Comprador(a)</div>
  </div>
  <div class="assinatura">
    <div class="linha"></div>
    <div class="nome">${p.nome_proprietario || 'Proprietário'}</div>
    <div class="cargo">Proprietário(a)</div>
  </div>
</div>

<div class="assinatura" style="margin-top:32px; max-width:300px; margin-left:auto; margin-right:auto;">
  <div class="linha"></div>
  <div class="nome">${p.corretor || 'Corretor(a)'}</div>
  <div class="cargo">Corretor(a) · Canaã Imóveis de Luxo</div>
</div>

<div class="print-date">
  Documento gerado em ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
</div>

<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}
