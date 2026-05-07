import express from 'express'
import Database from 'better-sqlite3'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// ── Banco de dados ───────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'contratos.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS propostas (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa                TEXT,
    corretor               TEXT,
    nome_comprador         TEXT,
    nome_proprietario      TEXT,
    produto                TEXT,
    valor_proposta         REAL,
    opcao_pagamento        TEXT DEFAULT 'À vista',
    comissao_intermediadora REAL,
    situacao               TEXT DEFAULT 'Enviada',
    data_retorno           TEXT,
    tipo_imovel            TEXT DEFAULT 'imovel',
    endereco_imovel        TEXT,
    nome_barco             TEXT,
    marca_modelo           TEXT,
    tamanho                TEXT,
    condicoes_adicionais   TEXT,
    observacoes            TEXT,
    created_at             TEXT DEFAULT (datetime('now','localtime')),
    updated_at             TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS opcoes (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo     TEXT NOT NULL,
    valor    TEXT NOT NULL UNIQUE
  );
`)

// Seed opções padrão
const seedOpcoes = (tipo, valores) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO opcoes (tipo, valor) VALUES (?, ?)')
  valores.forEach(v => stmt.run(tipo, v))
}
seedOpcoes('empresa',  ['Canaã Yeshua Negócios Imobiliários'])
seedOpcoes('situacao', ['Enviada', 'Aceita', 'Recusada'])
seedOpcoes('pagamento',['À vista', 'Financiamento bancário', 'Parcelado', 'Permuta', 'Outros'])

// ── Opções ───────────────────────────────────────────────────────
app.get('/api/opcoes', (req, res) => {
  const rows = db.prepare('SELECT tipo, valor FROM opcoes ORDER BY tipo, valor').all()
  const map = {}
  rows.forEach(r => { if (!map[r.tipo]) map[r.tipo] = []; map[r.tipo].push(r.valor) })
  res.json(map)
})

app.post('/api/opcoes', (req, res) => {
  const { tipo, valor } = req.body
  if (!tipo || !valor) return res.status(400).json({ error: 'tipo e valor obrigatórios' })
  try {
    db.prepare('INSERT OR IGNORE INTO opcoes (tipo, valor) VALUES (?, ?)').run(tipo, valor.trim())
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Propostas ────────────────────────────────────────────────────
app.get('/api/propostas', (req, res) => {
  const { empresa, corretor, situacao, data_inicio, data_fim } = req.query
  let sql = 'SELECT * FROM propostas WHERE 1=1'
  const params = []
  if (empresa)     { sql += ' AND empresa = ?';              params.push(empresa) }
  if (corretor)    { sql += ' AND corretor LIKE ?';          params.push(`%${corretor}%`) }
  if (situacao)    { sql += ' AND situacao = ?';             params.push(situacao) }
  if (data_inicio) { sql += ' AND date(created_at) >= ?';   params.push(data_inicio) }
  if (data_fim)    { sql += ' AND date(created_at) <= ?';   params.push(data_fim) }
  sql += ' ORDER BY id DESC'
  res.json(db.prepare(sql).all(...params))
})

app.get('/api/propostas/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM propostas WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Não encontrado' })
  res.json(row)
})

app.post('/api/propostas', (req, res) => {
  const d = req.body
  const stmt = db.prepare(`
    INSERT INTO propostas
      (empresa, corretor, nome_comprador, nome_proprietario, produto,
       valor_proposta, opcao_pagamento, comissao_intermediadora, situacao, data_retorno,
       tipo_imovel, endereco_imovel, nome_barco, marca_modelo, tamanho,
       condicoes_adicionais, observacoes)
    VALUES
      (@empresa, @corretor, @nome_comprador, @nome_proprietario, @produto,
       @valor_proposta, @opcao_pagamento, @comissao_intermediadora, @situacao, @data_retorno,
       @tipo_imovel, @endereco_imovel, @nome_barco, @marca_modelo, @tamanho,
       @condicoes_adicionais, @observacoes)
  `)
  const info = stmt.run(d)
  res.json(db.prepare('SELECT * FROM propostas WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/propostas/:id', (req, res) => {
  const d = req.body
  db.prepare(`
    UPDATE propostas SET
      empresa=@empresa, corretor=@corretor, nome_comprador=@nome_comprador,
      nome_proprietario=@nome_proprietario, produto=@produto,
      valor_proposta=@valor_proposta, opcao_pagamento=@opcao_pagamento,
      comissao_intermediadora=@comissao_intermediadora, situacao=@situacao,
      data_retorno=@data_retorno, tipo_imovel=@tipo_imovel,
      endereco_imovel=@endereco_imovel, nome_barco=@nome_barco,
      marca_modelo=@marca_modelo, tamanho=@tamanho,
      condicoes_adicionais=@condicoes_adicionais, observacoes=@observacoes,
      updated_at=datetime('now','localtime')
    WHERE id=@id
  `).run({ ...d, id: req.params.id })
  res.json(db.prepare('SELECT * FROM propostas WHERE id = ?').get(req.params.id))
})

app.delete('/api/propostas/:id', (req, res) => {
  db.prepare('DELETE FROM propostas WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// SPA fallback
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`Contratos rodando na porta ${PORT}`))
