const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export type ApiProject = {
  id: string
  name: string
  type: string
  status: string
  color: string
  description?: string | null
  url?: string | null
  isOnline?: boolean | null
  lastCheckedAt?: string | null
  revenue: number
  expense: number
  margin: number
}

export type ApiFinanceEntry = { id: string; projectId: string; category: string; description?: string | null; amount: number; competence: string; receivedAt?: string | null; dueDate?: string | null; project: { id: string; name: string } }

export type Filters = { from?: string; to?: string; projectId?: string; category?: string }

export type CashflowMonth = { month: string; in: number; out: number; net: number; balance: number }
export type CashflowMovement = { type: 'in' | 'out'; date: string; amount: number; category: string; project: string }
export type CashflowData = { totalIn: number; totalOut: number; balance: number; pendingIn: number; pendingOut: number; months: CashflowMonth[]; movements: CashflowMovement[] }

export type MonthlySummary = { month: string; revenue: number; expense: number; profit: number }
export type MonthlyData = { months: MonthlySummary[]; trend: 'up' | 'down' | 'flat' }

export type ProjectMonthlySeries = { id: string; name: string; color: string; months: { month: string; profit: number }[] }
export type MonthlyByProjectData = { months: string[]; series: ProjectMonthlySeries[] }

function query(filters?: Filters) {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.projectId) params.set('projectId', filters.projectId)
  if (filters.category) params.set('category', filters.category)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
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
  projects: (filters?: Pick<Filters, 'from' | 'to' | 'category'>) => request<ApiProject[]>(`/projects${query(filters)}`),
  createProject: (data: Pick<ApiProject, 'name' | 'type'> & Partial<Pick<ApiProject, 'description' | 'color' | 'status' | 'url'>>) => request<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: (filters?: Filters) => request<{ projects: number; revenue: number; expense: number; profit: number; roi: number }>(`/dashboard/summary${query(filters)}`),
  cashflow: (filters?: Filters) => request<CashflowData>(`/dashboard/cashflow${query(filters)}`),
  monthly: (filters?: Filters) => request<MonthlyData>(`/dashboard/monthly${query(filters)}`),
  monthlyByProject: (filters?: Filters) => request<MonthlyByProjectData>(`/dashboard/monthly-by-project${query(filters)}`),
  categories: (kind?: 'revenue' | 'expense') => request<string[]>(`/finance/categories${kind ? `?kind=${kind}` : ''}`),
  revenues: (filters?: Filters) => request<ApiFinanceEntry[]>(`/finance/revenues${query(filters)}`),
  expenses: (filters?: Filters) => request<ApiFinanceEntry[]>(`/finance/expenses${query(filters)}`),
  createRevenue: (data: { projectId: string; category: string; description?: string; amount: number; competence: string; receivedAt?: string }) => request<ApiFinanceEntry>('/finance/revenues', { method: 'POST', body: JSON.stringify(data) }),
  createExpense: (data: { projectId: string; category: string; description?: string; amount: number; competence: string; dueDate?: string }) => request<ApiFinanceEntry>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteRevenue: (id: string) => request<{ deleted: boolean }>(`/finance/revenues/${id}`, { method: 'DELETE' }),
  deleteExpense: (id: string) => request<{ deleted: boolean }>(`/finance/expenses/${id}`, { method: 'DELETE' }),
  updateProject: (id: string, data: Record<string, unknown>) => request<ApiProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  updateRevenue: (id: string, data: Record<string, unknown>) => request<{ updated: boolean }>(`/finance/revenues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: Record<string, unknown>) => request<{ updated: boolean }>(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
