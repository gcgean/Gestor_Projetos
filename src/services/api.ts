const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export type ApiProject = {
  id: string
  name: string
  type: string
  status: string
  color: string
  description?: string | null
  revenue: number
  expense: number
  margin: number
}

export type ApiFinanceEntry = { id: string; projectId: string; category: string; description?: string | null; amount: number; competence: string; receivedAt?: string | null; dueDate?: string | null; project: { id: string; name: string } }

export type DateRange = { from?: string; to?: string }

function query(range?: DateRange) {
  if (!range || (!range.from && !range.to)) return ''
  const params = new URLSearchParams()
  if (range.from) params.set('from', range.from)
  if (range.to) params.set('to', range.to)
  return `?${params.toString()}`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('gestor_projetos_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  if (response.status === 401) {
    localStorage.removeItem('gestor_projetos_token')
    localStorage.removeItem('gestor_projetos_user')
    window.location.reload()
    throw new Error('Sessão expirada. Faça login novamente.')
  }
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message ?? 'Erro ao comunicar com a API')
  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) => request<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  projects: (range?: DateRange) => request<ApiProject[]>(`/projects${query(range)}`),
  createProject: (data: Pick<ApiProject, 'name' | 'type'> & Partial<Pick<ApiProject, 'description' | 'color' | 'status'>>) => request<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: (range?: DateRange) => request<{ projects: number; revenue: number; expense: number; profit: number; roi: number }>(`/dashboard/summary${query(range)}`),
  revenues: (range?: DateRange) => request<ApiFinanceEntry[]>(`/finance/revenues${query(range)}`),
  expenses: (range?: DateRange) => request<ApiFinanceEntry[]>(`/finance/expenses${query(range)}`),
  createRevenue: (data: { projectId: string; category: string; description?: string; amount: number; competence: string; receivedAt?: string }) => request<ApiFinanceEntry>('/finance/revenues', { method: 'POST', body: JSON.stringify(data) }),
  createExpense: (data: { projectId: string; category: string; description?: string; amount: number; competence: string; dueDate?: string }) => request<ApiFinanceEntry>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteRevenue: (id: string) => request<{ deleted: boolean }>(`/finance/revenues/${id}`, { method: 'DELETE' }),
  deleteExpense: (id: string) => request<{ deleted: boolean }>(`/finance/expenses/${id}`, { method: 'DELETE' }),
  updateProject: (id: string, data: Record<string, unknown>) => request<ApiProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  updateRevenue: (id: string, data: Record<string, unknown>) => request<{ updated: boolean }>(`/finance/revenues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: Record<string, unknown>) => request<{ updated: boolean }>(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
