const base = '/api'

async function req(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  getOpcoes:      ()          => req('GET',    '/opcoes'),
  addOpcao:       (tipo, valor) => req('POST', '/opcoes', { tipo, valor }),

  getPropostas:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return req('GET', `/propostas${qs ? '?' + qs : ''}`)
  },
  getProposta:    (id)        => req('GET',    `/propostas/${id}`),
  createProposta: (data)      => req('POST',   '/propostas', data),
  updateProposta: (id, data)  => req('PUT',    `/propostas/${id}`, data),
  deleteProposta: (id)        => req('DELETE', `/propostas/${id}`),
}
