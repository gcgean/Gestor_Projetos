import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, CircleDollarSign, ClipboardList, Clock3, Command, CreditCard,
  FileText, FolderKanban, Gauge, Grid2X2, HelpCircle, Lightbulb, MoreHorizontal,
  Pencil, Plus, Search, Settings2, ShieldAlert, Sparkles, Sun, Target, Trash2, WalletCards, X,
} from 'lucide-react'
import { api, ApiFinanceEntry, ApiProject, DateRange } from './services/api'

type Summary = { projects: number; revenue: number; expense: number; profit: number; roi: number }

const nav = [
  { label: 'Visão geral', icon: Grid2X2 }, { label: 'Projetos', icon: FolderKanban },
  { label: 'Receitas', icon: CircleDollarSign }, { label: 'Despesas', icon: CreditCard },
  { label: 'Fluxo de caixa', icon: WalletCards }, { label: 'Contas a pagar', icon: ClipboardList },
  { label: 'Contas a receber', icon: FileText }, { label: 'Metas', icon: Target },
  { label: 'Planejamento', icon: CalendarDays }, { label: 'Insights IA', icon: Sparkles },
]

const statusLabels: Record<string, string> = {
  IDEA: 'Ideia', DEVELOPMENT: 'Desenvolvimento', MVP: 'MVP', LAUNCHED: 'Lançado',
  SCALING: 'Escalando', PAUSED: 'Pausado', CLOSED: 'Encerrado',
}

const emptySummary: Summary = { projects: 0, revenue: 0, expense: 0, profit: 0, roi: 0 }

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Aceita tanto "1465.20" (ponto decimal) quanto "1.465,20" (formato BR, ponto de milhar + vírgula decimal).
function parseAmount(value: string) {
  const trimmed = value.trim()
  if (trimmed.includes(',')) return Number(trimmed.replace(/\./g, '').replace(',', '.'))
  return Number(trimmed)
}

// Datas de competência são tratadas como string pura ("YYYY-MM-DD"), nunca via `new Date(iso)`,
// para não sofrer deslocamento de fuso horário (UTC x America/Sao_Paulo) na exibição.
function formatDate(value?: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function todayLocal() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function periodRange(period: string): DateRange {
  const now = new Date()
  if (period === 'Este mês') {
    return { from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)) }
  }
  if (period === 'Este trimestre') {
    const quarter = Math.floor(now.getMonth() / 3)
    return { from: toISODate(new Date(now.getFullYear(), quarter * 3, 1)), to: toISODate(new Date(now.getFullYear(), quarter * 3 + 3, 0)) }
  }
  return { from: toISODate(new Date(now.getFullYear(), now.getMonth() - 11, 1)), to: toISODate(now) }
}

function Kpi({ label, value, change, positive, icon: Icon }: { label: string; value: string; change?: string; positive?: boolean; icon: typeof Gauge }) {
  return <article className="kpi panel">
    <div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon size={16} /></span></div>
    <div className="kpi-value">{value}</div>
    {change && <div className={positive ? 'trend positive' : 'trend negative'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}</div>}
  </article>
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: { title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return <div className="modal-backdrop">
    <div className="modal panel">
      <div className="modal-head"><div><h2>{title}</h2><p>{message}</p></div><button type="button" className="icon-btn" onClick={onCancel}><X size={17} /></button></div>
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button><button type="button" className="danger-btn" onClick={onConfirm}>{confirmLabel}</button></div>
    </div>
  </div>
}

type ProjectFormData = { name: string; type: string; description: string; status: string }

function ProjectModal({ title, submitLabel, initial, saving, error, onSubmit, onClose }: {
  title: string; submitLabel: string; initial: ProjectFormData; saving: boolean; error: string
  onSubmit: (data: ProjectFormData) => void; onClose: () => void
}) {
  const [data, setData] = useState(initial)
  return <div className="modal-backdrop">
    <form className="modal panel" onSubmit={event => { event.preventDefault(); onSubmit(data) }}>
      <div className="modal-head"><div><h2>{title}</h2><p>Este registro será salvo no PostgreSQL.</p></div><button type="button" className="icon-btn" onClick={onClose}><X size={17} /></button></div>
      {error && <div className="login-error">{error}</div>}
      <label>Nome do projeto<input value={data.name} onChange={event => setData({ ...data, name: event.target.value })} placeholder="Ex.: Produto Digital" minLength={2} required autoFocus /></label>
      <label>Tipo<input value={data.type} onChange={event => setData({ ...data, type: event.target.value })} placeholder="Ex.: SaaS, Serviço" required /></label>
      <label>Status<select value={data.status} onChange={event => setData({ ...data, status: event.target.value })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Descrição<input value={data.description} onChange={event => setData({ ...data, description: event.target.value })} placeholder="Opcional" /></label>
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : submitLabel}</button></div>
    </form>
  </div>
}

type FinanceFormData = { projectId: string; category: string; description: string; amount: string; competence: string; settlementDate: string }

function FinanceModal({ kind, projects, categories, title, submitLabel, initial, saving, error, onSubmit, onClose }: {
  kind: 'revenue' | 'expense'; projects: ApiProject[]; categories: string[]; title: string; submitLabel: string
  initial: FinanceFormData; saving: boolean; error: string
  onSubmit: (data: FinanceFormData) => void; onClose: () => void
}) {
  const [data, setData] = useState(initial)
  const datalistId = `${kind}-categories`
  return <div className="modal-backdrop">
    <form className="modal panel" onSubmit={event => { event.preventDefault(); onSubmit(data) }}>
      <div className="modal-head"><div><h2>{title}</h2><p>O lançamento será salvo no PostgreSQL.</p></div><button type="button" className="icon-btn" onClick={onClose}><X size={17} /></button></div>
      {error && <div className="login-error">{error}</div>}
      <label>Projeto<select value={data.projectId} onChange={event => setData({ ...data, projectId: event.target.value })} required><option value="">Selecione um projeto</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label>Categoria<input value={data.category} onChange={event => setData({ ...data, category: event.target.value })} placeholder={kind === 'revenue' ? 'Ex.: Venda, mensalidade' : 'Ex.: Marketing, operação'} list={datalistId} required /><datalist id={datalistId}>{categories.map(category => <option key={category} value={category} />)}</datalist></label>
      <label>Valor<input type="text" inputMode="decimal" value={data.amount} onChange={event => setData({ ...data, amount: event.target.value })} placeholder="0,00" required /></label>
      <label>Data de geração / competência<input type="date" value={data.competence} onChange={event => setData({ ...data, competence: event.target.value })} required /></label>
      <label>{kind === 'revenue' ? 'Data de recebimento (opcional)' : 'Data de vencimento (opcional)'}<input type="date" value={data.settlementDate} onChange={event => setData({ ...data, settlementDate: event.target.value })} /></label>
      <label>Descrição<input value={data.description} onChange={event => setData({ ...data, description: event.target.value })} placeholder="Opcional" /></label>
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : submitLabel}</button></div>
    </form>
  </div>
}

function FinancePage({ kind, projects, search, range }: { kind: 'revenue' | 'expense'; projects: ApiProject[]; search: string; range: DateRange }) {
  const [entries, setEntries] = useState<ApiFinanceEntry[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiFinanceEntry | null>(null)
  const [deleting, setDeleting] = useState<ApiFinanceEntry | null>(null)
  const [error, setError] = useState('')
  const label = kind === 'revenue' ? 'receita' : 'despesa'
  const visibleEntries = entries.filter(entry => `${entry.project.name} ${entry.category} ${entry.description ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const lastCategoryKey = `gestor_projetos_last_category_${kind}`
  const emptyForm: FinanceFormData = { projectId: '', category: localStorage.getItem(lastCategoryKey) ?? '', description: '', amount: '', competence: todayLocal(), settlementDate: '' }

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try { setEntries(kind === 'revenue' ? await api.revenues(range) : await api.expenses(range)) } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível carregar as ${label}s.`) } finally { setLoading(false) }
  }, [kind, label, range])

  useEffect(() => { void loadEntries() }, [loadEntries])
  useEffect(() => { api.categories(kind).then(setCategories).catch(() => {}) }, [kind])

  async function create(data: FinanceFormData) {
    const amount = parseAmount(data.amount)
    if (!amount || amount <= 0) { setError('Informe um valor válido.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { projectId: data.projectId, category: data.category.trim(), description: data.description || undefined, amount, competence: data.competence }
      if (kind === 'revenue') await api.createRevenue({ ...payload, receivedAt: data.settlementDate || undefined })
      else await api.createExpense({ ...payload, dueDate: data.settlementDate || undefined })
      localStorage.setItem(lastCategoryKey, payload.category)
      setCategories(current => current.includes(payload.category) ? current : [...current, payload.category].sort())
      setShowForm(false)
      await loadEntries()
    } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível salvar a ${label}.`) } finally { setSaving(false) }
  }

  async function saveEdit(data: FinanceFormData) {
    if (!editing) return
    const amount = parseAmount(data.amount)
    if (!amount || amount <= 0) { setError('Informe um valor válido.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { projectId: data.projectId, category: data.category.trim(), description: data.description || undefined, amount, competence: data.competence, ...(kind === 'revenue' ? { receivedAt: data.settlementDate || undefined } : { dueDate: data.settlementDate || undefined }) }
      if (kind === 'revenue') await api.updateRevenue(editing.id, payload); else await api.updateExpense(editing.id, payload)
      setEditing(null)
      await loadEntries()
    } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível alterar a ${label}.`) } finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleting) return
    setError('')
    try { if (kind === 'revenue') await api.deleteRevenue(deleting.id); else await api.deleteExpense(deleting.id); setDeleting(null); await loadEntries() } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível excluir a ${label}.`) }
  }

  return <section className="panel projects-panel finance-page">
    <div className="panel-head"><div><h2>{kind === 'revenue' ? 'Receitas registradas' : 'Despesas registradas'}</h2><p>A competência define em que mês o valor entra no resultado.</p></div><button className="primary-btn" onClick={() => setShowForm(true)} disabled={!projects.length}><Plus size={16} /> Nova {label}</button></div>
    {error && <div className="login-error">{error}</div>}
    {!projects.length ? <div className="empty-state"><h2>Cadastre um projeto primeiro</h2><p>Uma {label} precisa estar vinculada a um projeto.</p></div>
      : loading ? <div className="empty-state"><p>Carregando lançamentos...</p></div>
      : visibleEntries.length ? <div className="project-table">
          <div className="table-row table-head"><span>Projeto</span><span>Categoria</span><span>Valor</span><span>{kind === 'revenue' ? 'Recebimento' : 'Vencimento'}</span><span>Competência</span><span /></div>
          {visibleEntries.map(entry => <div className="table-row" key={entry.id}>
            <div className="project-name"><span className="project-dot" style={{ background: '#7c6cff' }} /><div><b>{entry.project.name}</b><small>{entry.description || 'Sem descrição'}</small></div></div>
            <span>{entry.category}</span>
            <span className="table-money">{money(entry.amount)}</span>
            <span>{formatDate(kind === 'revenue' ? entry.receivedAt : entry.dueDate)}</span>
            <span>{formatDate(entry.competence)}</span>
            <span className="table-actions">
              <button className="row-more" onClick={() => setEditing(entry)} aria-label={`Alterar ${label}`} title={`Alterar ${label}`}><Pencil size={15} /></button>
              <button className="row-more" onClick={() => setDeleting(entry)} aria-label={`Excluir ${label}`} title={`Excluir ${label}`}><Trash2 size={15} /></button>
            </span>
          </div>)}
        </div>
      : <div className="empty-state"><div className="empty-icon"><CircleDollarSign size={24} /></div><h2>Nenhuma {label} cadastrada</h2><p>Registre o primeiro lançamento para alimentar o dashboard.</p><button className="primary-btn" onClick={() => setShowForm(true)}><Plus size={16} /> Nova {label}</button></div>}
    {showForm && <FinanceModal kind={kind} projects={projects} categories={categories} title={`Nova ${label}`} submitLabel="Salvar lançamento" initial={emptyForm} saving={saving} error={error} onSubmit={create} onClose={() => setShowForm(false)} />}
    {editing && <FinanceModal kind={kind} projects={projects} categories={categories} title={`Alterar ${label}`} submitLabel="Salvar alterações" saving={saving} error={error} onClose={() => setEditing(null)} onSubmit={saveEdit}
      initial={{ projectId: editing.projectId, category: editing.category, description: editing.description ?? '', amount: String(editing.amount), competence: editing.competence.slice(0, 10), settlementDate: ((kind === 'revenue' ? editing.receivedAt : editing.dueDate) ?? '').slice(0, 10) }} />}
    {deleting && <ConfirmDialog title={`Excluir ${label}?`} message="Esta ação não pode ser desfeita." confirmLabel="Excluir" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
  </section>
}

function App() {
  const [active, setActive] = useState('Visão geral')
  const [dark, setDark] = useState(true)
  const [period, setPeriod] = useState('Últimos 12 meses')
  const [projectFilter, setProjectFilter] = useState('Todos os projetos')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [projects, setProjects] = useState<ApiProject[]>([])
  const [summary, setSummary] = useState<Summary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<ApiProject | null>(null)
  const [deletingProject, setDeletingProject] = useState<ApiProject | null>(null)
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('gestor_projetos_user') ?? '{}') as { email?: string; role?: string } } catch { return {} }
  }, [])

  const range = useMemo(() => periodRange(period), [period])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [projectData, summaryData] = await Promise.all([api.projects(range), api.dashboard(range)])
      setProjects(projectData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados.')
    } finally { setLoading(false) }
  }, [range])

  useEffect(() => { void loadData() }, [loadData])
  useEffect(() => { if (active === 'Visão geral') void loadData() }, [active])

  const filteredProjects = useMemo(() => projects.filter(project => (projectFilter === 'Todos os projetos' || project.name === projectFilter) && `${project.name} ${project.type} ${project.status}`.toLowerCase().includes(search.toLowerCase())), [projectFilter, projects, search])
  const attentionProject = projects.find(project => project.revenue > 0 && project.margin < 20)
  const opportunityProject = [...projects].filter(project => project.revenue > 0 && project.margin >= 50).sort((a, b) => b.margin - a.margin)[0]

  async function createProject(data: ProjectFormData) {
    const name = data.name.trim()
    if (!name) { setError('Informe um nome para o projeto.'); return }
    setSaving(true)
    setError('')
    try {
      await api.createProject({ ...data, name })
      setShowModal(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o projeto.')
    } finally { setSaving(false) }
  }
  async function saveProjectEdit(data: ProjectFormData) {
    if (!editingProject) return
    const name = data.name.trim()
    if (!name) { setError('Informe um nome para o projeto.'); return }
    setSaving(true)
    setError('')
    try {
      await api.updateProject(editingProject.id, { name, type: data.type, status: data.status, description: data.description || undefined })
      setEditingProject(null)
      await loadData()
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível alterar o projeto.') } finally { setSaving(false) }
  }
  async function confirmDeleteProject() {
    if (!deletingProject) return
    setError('')
    try { await api.deleteProject(deletingProject.id); setDeletingProject(null); await loadData() } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível excluir o projeto.') }
  }

  return <div className={dark ? 'app dark' : 'app light'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BarChart3 size={17} /></div><span>Gestor_<strong>Projetos</strong></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">GP</div><div><b>Meu portfólio</b><span>Workspace principal</span></div><ChevronDown size={14} /></div>
      <nav className="nav">{nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'nav-item active' : 'nav-item'}><Icon size={17} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /><span>Configurações</span></button><button className="nav-item"><HelpCircle size={17} /><span>Ajuda e suporte</span></button><div className="user-card"><div className="user-avatar">{(user.email ?? 'AD').slice(0, 2).toUpperCase()}</div><div><b>{user.email ?? 'Usuário'}</b><span>{user.role ?? 'Usuário'}</span></div><MoreHorizontal size={16} /></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs"><span>Portfólio</span><span className="slash">/</span><b>{active}</b></div><div className="top-actions"><div className="search"><Search size={16} /><input aria-label="Pesquisar" placeholder="Pesquisar projetos e lançamentos" value={search} onChange={event => setSearch(event.target.value)} /><kbd><Command size={12} /> K</kbd></div><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={17} /> : <Sun size={17} />}</button><button className="icon-btn notification" aria-label="Notificações"><Bell size={17} /></button><div className="top-avatar">{(user.email ?? 'AD').slice(0, 2).toUpperCase()}</div></div></header>
      <div className="content">
        <section className="page-head"><div><h1>{active}</h1><p>Dados carregados do seu workspace.</p></div><div className="head-actions"><div className="select-wrap"><Clock3 size={15} /><select value={period} onChange={event => setPeriod(event.target.value)}><option>Últimos 12 meses</option><option>Este mês</option><option>Este trimestre</option></select><ChevronDown size={14} /></div>{active !== 'Receitas' && active !== 'Despesas' && <button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Novo projeto</button>}</div></section>
        {error && <div className="login-error">{error}</div>}
        {active === 'Receitas' ? <FinancePage kind="revenue" projects={projects} search={search} range={range} /> : active === 'Despesas' ? <FinancePage kind="expense" projects={projects} search={search} range={range} /> : active !== 'Visão geral' && active !== 'Projetos' ? <section className="empty-state panel"><div className="empty-icon"><BriefcaseBusiness size={24} /></div><h2>{active}</h2><p>Módulo em desenvolvimento.</p><button className="secondary-btn" onClick={() => setActive('Visão geral')}>Voltar para visão geral</button></section> : <>
          {active === 'Visão geral' && <>
            <div className="kpi-grid"><Kpi label="Projetos" value={String(summary.projects)} icon={FolderKanban} /><Kpi label="Receita total" value={money(summary.revenue)} icon={CircleDollarSign} /><Kpi label="Despesas" value={money(summary.expense)} icon={CreditCard} /><Kpi label="Lucro líquido" value={money(summary.profit)} positive={summary.profit >= 0} icon={BarChart3} /><Kpi label="ROI geral" value={summary.expense > 0 ? `${summary.roi.toFixed(1)}%` : '—'} positive={summary.roi >= 0} icon={Gauge} /></div>
            <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Resumo financeiro</h2><p>Totais registrados no período selecionado</p></div></div><div className="empty-state"><div className="empty-icon"><BarChart3 size={24} /></div><h2>{summary.revenue || summary.expense ? 'Resumo atualizado' : 'Sem movimentações financeiras'}</h2><p>{summary.revenue || summary.expense ? `Receitas de ${money(summary.revenue)} e despesas de ${money(summary.expense)} foram encontradas.` : 'Cadastre receitas e despesas para acompanhar a evolução financeira.'}</p></div></section><section className="panel insights-panel"><div className="panel-head"><div><h2>Insights</h2><p>Alertas calculados com os dados reais</p></div><span className="ai-spark"><Sparkles size={15} /></span></div>{attentionProject ? <div className="insight warning"><div className="insight-icon"><ShieldAlert size={17} /></div><div><b>Projeto em atenção</b><p>{attentionProject.name} está com margem de {attentionProject.margin.toFixed(1)}%.</p></div></div> : opportunityProject ? <div className="insight opportunity"><div className="insight-icon"><Lightbulb size={17} /></div><div><b>Boa margem identificada</b><p>{opportunityProject.name} apresenta margem de {opportunityProject.margin.toFixed(1)}%.</p></div></div> : <div className="empty-state"><p>Cadastre movimentações financeiras para gerar insights.</p></div>}</section></div>
          </>}
          <section className="panel projects-panel"><div className="panel-head"><div><h2>Projetos</h2><p>Registros pertencentes ao usuário autenticado</p></div><div className="table-actions"><div className="mini-select"><select value={projectFilter} onChange={event => setProjectFilter(event.target.value)}><option>Todos os projetos</option>{projects.map(project => <option key={project.name}>{project.name}</option>)}</select><ChevronDown size={14} /></div></div></div><div className="project-table"><div className="table-row table-head"><span>Projeto</span><span>Receita</span><span>Margem</span><span>Despesas</span><span>Status</span><span /></div>{loading ? <div className="empty-state"><p>Carregando dados...</p></div> : filteredProjects.length ? filteredProjects.map(project => <div className="table-row" key={project.id}><div className="project-name"><span className="project-dot" style={{ background: project.color }} /><div><b>{project.name?.trim() || '(sem nome)'}</b><small>{project.type}</small></div></div><span className="table-money">{money(project.revenue)}</span><span className={project.margin < 20 && project.revenue > 0 ? 'margin negative' : 'margin'}>{project.margin.toFixed(1)}%</span><span className="table-money">{money(project.expense)}</span><span className="status"><Check size={12} /> {statusLabels[project.status] ?? project.status}</span><span className="table-actions"><button className="row-more" onClick={() => setEditingProject(project)} aria-label="Alterar projeto" title="Alterar projeto"><Pencil size={15} /></button><button className="row-more" onClick={() => setDeletingProject(project)} aria-label="Excluir projeto" title="Excluir projeto"><Trash2 size={15} /></button></span></div>) : <div className="empty-state"><div className="empty-icon"><FolderKanban size={24} /></div><h2>Nenhum projeto cadastrado</h2><p>Crie seu primeiro projeto para começar a acompanhar os dados reais do portfólio.</p><button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Novo projeto</button></div>}</div></section>
        </>}
      </div>
    </main>
    {showModal && <ProjectModal title="Novo projeto" submitLabel="Criar projeto" initial={{ name: '', type: '', description: '', status: 'IDEA' }} saving={saving} error={error} onSubmit={createProject} onClose={() => setShowModal(false)} />}
    {editingProject && <ProjectModal title="Alterar projeto" submitLabel="Salvar alterações" initial={{ name: editingProject.name, type: editingProject.type, description: editingProject.description ?? '', status: editingProject.status }} saving={saving} error={error} onSubmit={saveProjectEdit} onClose={() => setEditingProject(null)} />}
    {deletingProject && <ConfirmDialog title={`Excluir ${deletingProject.name?.trim() || 'projeto'}?`} message="O projeto e seus lançamentos serão excluídos. Esta ação não pode ser desfeita." confirmLabel="Excluir" onConfirm={confirmDeleteProject} onCancel={() => setDeletingProject(null)} />}
  </div>
}

export default App
