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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('gestor_projetos_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message ?? 'Erro ao comunicar com a API')
  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) => request<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  projects: () => request<ApiProject[]>('/projects'),
  createProject: (data: Pick<ApiProject, 'name' | 'type'> & Partial<Pick<ApiProject, 'description' | 'color' | 'status'>>) => request<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: () => request<{ projects: number; revenue: number; expense: number; profit: number; roi: number }>('/dashboard/summary'),
}
