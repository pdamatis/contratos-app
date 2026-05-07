export function gerarPDF(p) {
  const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

  function fmtLong(d) {
    const n = d ? new Date(d + 'T12:00:00') : new Date()
    return `${n.getDate()} de ${MESES[n.getMonth()]} de ${n.getFullYear()}`
  }

  function fmtBRL(v) {
    if (v == null || v === '') return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
  }

  const BARCO_PRODUTOS = ['Barco', 'Jet-Sky / Seabob']
  const isBarco = p.tipo_imovel === 'barco' || BARCO_PRODUTOS.includes(p.produto)

  const empresa      = p.empresa       || 'Canaã Luxo'
  const comprador    = p.nome_comprador    || '—'
  const proprietario = p.nome_proprietario || '—'
  const dataDoc      = fmtLong(p.data_retorno)

  // Logo por empresa
  const LOGO_MAP = {
    'Canaã Luxo':   { file: 'logo-canaa-luxo.png', sub: 'IMÓVEIS DE LUXO' },
    'Canaã Yatchs': { file: 'logo-yachts.jpg',     sub: 'YACHTS'          },
    'Easy':         { file: 'logo-easy.jpg',        sub: 'IMÓVEIS'         },
  }
  const logoConfig = LOGO_MAP[empresa] || LOGO_MAP['Canaã Luxo']
  const logoUrl    = window.location.origin + '/' + logoConfig.file
  const logoSub    = logoConfig.sub

  // Local do imóvel ou barco
  const localTexto = isBarco
    ? [p.nome_barco, p.marca_modelo, p.tamanho].filter(Boolean).join(', ') || '—'
    : (p.endereco_imovel || '—')
  const localPrep = isBarco ? 'identificado como' : 'localizado em'

  // Condições: cada linha vira um bullet
  const condicoes = (p.condicoes_adicionais || '')
    .split('\n')
    .map(s => s.replace(/^[\-\—•\*]\s*/, '').trim())
    .filter(Boolean)

  const condicoesHtml = condicoes.length
    ? condicoes.map(c => `<div class="cond-item">&mdash;&nbsp; ${c.replace(/\.+$/, '')}.</div>`).join('\n')
    : '<div class="cond-item">&mdash;&nbsp; (sem condições informadas)</div>'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta de Compra #${p.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Lato', Arial, sans-serif;
      color: #1a1a1a;
      font-size: 13px;
      line-height: 1.7;
      background: #fff;
    }
    .page {
      position: relative;
      max-width: 760px;
      margin: 0 auto;
      padding: 52px 72px 64px;
      min-height: 100vh;
    }
    /* Marca d'água */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 520px;
      height: 520px;
      background: url('${logoUrl}') center/contain no-repeat;
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
    .content { position: relative; z-index: 1; }
    /* Cabeçalho */
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      margin-bottom: 6px;
    }
    .header img { height: 60px; object-fit: contain; }
    .header-text {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #1a1a1a;
      text-transform: uppercase;
      line-height: 1.3;
    }
    .header-text span {
      display: block;
      font-weight: 300;
      font-size: 10px;
      letter-spacing: 3px;
      color: #555;
    }
    .sep { border: none; border-top: 1.5px solid #ccc; margin: 0 0 28px; }
    /* Título */
    .doc-title {
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #1a1a1a;
      margin-bottom: 28px;
      text-transform: uppercase;
    }
    /* Local e data */
    .location {
      text-align: right;
      color: #333;
      font-size: 12.5px;
      line-height: 1.9;
      margin-bottom: 28px;
    }
    /* Corpo */
    .body-text {
      text-align: justify;
      margin-bottom: 22px;
      line-height: 1.85;
      font-size: 13px;
    }
    /* Condições */
    .cond-item {
      margin-bottom: 16px;
      line-height: 1.75;
      font-size: 13px;
      padding-left: 12px;
    }
    /* Despedida */
    .farewell { margin: 28px 0 36px; font-size: 13px; }
    /* Assinatura */
    .sig-block { margin-top: 8px; }
    .sig-company { font-weight: 700; font-size: 13px; color: #1a1a1a; margin-bottom: 3px; }
    .sig-info { font-size: 11.5px; color: #555; line-height: 1.8; }
    /* Rodapé inferior */
    .footer-bar {
      margin-top: 56px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      text-align: left;
      font-size: 10.5px;
      color: #555;
      line-height: 1.75;
    }
    .footer-bar strong { font-weight: 700; color: #333; }
    @media print {
      html, body { margin: 0; padding: 0; }
      .page { padding: 0; max-width: 100%; }
      .watermark { position: fixed; }
      @page { margin: 14mm 18mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="watermark"></div>
  <div class="content">

    <div class="header">
      <img src="${logoUrl}" alt="${empresa}">
    </div>
    <hr class="sep">

    <div class="doc-title">Proposta de Compra</div>

    <div class="location">
      Angra dos Reis &mdash; RJ<br>
      ${dataDoc}
    </div>

    <div class="body-text">
      A ${empresa}, representando seu cliente ${comprador}, vem por meio desta apresentar uma proposta de compra recebida, para o ${isBarco ? 'barco' : 'imóvel'} ${localPrep} ${localTexto}, para seu/sua proprietário(a) ${proprietario}, nas seguintes condições:
    </div>

    ${condicoesHtml}

    <div class="farewell">Sem mais,</div>

    <div class="sig-block">
      <div class="sig-company">Canaã Yeshua Negócios e Serviços Ltda.</div>
      <div class="sig-info">
        CNPJ: 37.211.576/0001-08<br>
        CRECI-PJ RJ-009087/O
      </div>
    </div>

    <div class="footer-bar">
      <strong>canaaimoveisangra.com.br</strong><br>
      Tel.: (24) 99995-9990<br>
      Avenida Winston Maruca, loja 09, Marina Verolme, Jacuecanga, Angra dos Reis / RJ<br>
      CEP: 23914-345
    </div>

  </div>
</div>

<script>window.onload = () => { window.focus(); window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Permita pop-ups para gerar o PDF.'); return }
  win.document.write(html)
  win.document.close()
}
