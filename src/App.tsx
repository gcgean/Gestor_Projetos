import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, CircleDollarSign, ClipboardList, Clock3, Command, CreditCard,
  FileText, FolderKanban, Gauge, Grid2X2, HelpCircle, Lightbulb, MoreHorizontal,
  Pencil, Plus, Search, Settings2, ShieldAlert, Sparkles, Sun, Target, Trash2, WalletCards, X,
} from 'lucide-react'
import { api, ApiFinanceEntry, ApiProject } from './services/api'

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

function Kpi({ label, value, change, positive, icon: Icon }: { label: string; value: string; change?: string; positive?: boolean; icon: typeof Gauge }) {
  return <article className="kpi panel">
    <div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon size={16} /></span></div>
    <div className="kpi-value">{value}</div>
    {change && <div className={positive ? 'trend positive' : 'trend negative'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}</div>}
  </article>
}

function FinancePage({ kind, projects, search }: { kind: 'revenue' | 'expense'; projects: ApiProject[]; search: string }) {
  const [entries, setEntries] = useState<ApiFinanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ projectId: '', category: '', description: '', amount: '', competence: new Date().toISOString().slice(0, 10), settlementDate: '' })
  const label = kind === 'revenue' ? 'receita' : 'despesa'
  const visibleEntries = entries.filter(entry => `${entry.project.name} ${entry.category} ${entry.description ?? ''}`.toLowerCase().includes(search.toLowerCase()))

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try { setEntries(kind === 'revenue' ? await api.revenues() : await api.expenses()) } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível carregar as ${label}s.`) } finally { setLoading(false) }
  }, [kind, label])

  useEffect(() => { void loadEntries() }, [loadEntries])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = { projectId: form.projectId, category: form.category, description: form.description || undefined, amount: Number(form.amount), competence: form.competence }
      if (kind === 'revenue') await api.createRevenue({ ...data, receivedAt: form.settlementDate || undefined })
      else await api.createExpense({ ...data, dueDate: form.settlementDate || undefined })
      setShowForm(false)
      setForm({ projectId: projects[0]?.id ?? '', category: '', description: '', amount: '', competence: new Date().toISOString().slice(0, 10), settlementDate: '' })
      await loadEntries()
    } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível salvar a ${label}.`) } finally { setSaving(false) }
  }

  async function removeEntry(id: string) {
    if (!window.confirm(`Excluir esta ${label}? Esta ação não pode ser desfeita.`)) return
    setError('')
    try { if (kind === 'revenue') await api.deleteRevenue(id); else await api.deleteExpense(id); await loadEntries() } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível excluir a ${label}.`) }
  }
  async function editEntry(entry: ApiFinanceEntry) {
    const category = window.prompt('Categoria:', entry.category)
    if (!category) return
    const amountText = window.prompt('Valor:', String(entry.amount))
    if (!amountText) return
    const data = { projectId: entry.projectId, category, description: entry.description ?? undefined, amount: Number(amountText), competence: entry.competence.slice(0, 10), ...(kind === 'revenue' ? { receivedAt: entry.receivedAt?.slice(0, 10) } : { dueDate: entry.dueDate?.slice(0, 10) }) }
    try { if (kind === 'revenue') await api.updateRevenue(entry.id, data); else await api.updateExpense(entry.id, data); await loadEntries() } catch (err) { setError(err instanceof Error ? err.message : `Não foi possível alterar a ${label}.`) }
  }

  return <section className="panel projects-panel finance-page"><div className="panel-head"><div><h2>{kind === 'revenue' ? 'Receitas registradas' : 'Despesas registradas'}</h2><p>A data de geração é registrada como competência no PostgreSQL.</p></div><button className="primary-btn" onClick={() => { setForm(current => ({ ...current, projectId: current.projectId || projects[0]?.id || '' })); setShowForm(true) }} disabled={!projects.length}><Plus size={16} /> Nova {label}</button></div>{error && <div className="login-error">{error}</div>}{!projects.length ? <div className="empty-state"><h2>Cadastre um projeto primeiro</h2><p>Uma {label} precisa estar vinculada a um projeto.</p></div> : loading ? <div className="empty-state"><p>Carregando lançamentos...</p></div> : visibleEntries.length ? <div className="project-table"><div className="table-row table-head"><span>Projeto</span><span>Categoria</span><span>Valor</span><span>Data de geração</span><span>Data adicional</span><span /></div>{visibleEntries.map(entry => <div className="table-row" key={entry.id}><div className="project-name"><span className="project-dot" style={{ background: '#7c6cff' }} /><div><b>{entry.project.name}</b><small>{entry.description || 'Sem descrição'}</small></div></div><span>{entry.category}</span><span className="table-money">{money(entry.amount)}</span><span>{new Date(entry.competence).toLocaleDateString('pt-BR')}</span><span>{(kind === 'revenue' ? entry.receivedAt : entry.dueDate) ? new Date((kind === 'revenue' ? entry.receivedAt : entry.dueDate) as string).toLocaleDateString('pt-BR') : '—'}</span><span className="table-actions"><button className="row-more" onClick={() => void editEntry(entry)} aria-label={`Alterar ${label}`} title={`Alterar ${label}`}><Pencil size={15} /></button><button className="row-more" onClick={() => void removeEntry(entry.id)} aria-label={`Excluir ${label}`} title={`Excluir ${label}`}><Trash2 size={15} /></button></span></div>)}</div> : <div className="empty-state"><div className="empty-icon"><CircleDollarSign size={24} /></div><h2>Nenhuma {label} cadastrada</h2><p>Registre o primeiro lançamento para alimentar o dashboard.</p><button className="primary-btn" onClick={() => setShowForm(true)}><Plus size={16} /> Nova {label}</button></div>}{showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="modal panel" onSubmit={submit} onClick={event => event.stopPropagation()}><div className="modal-head"><div><h2>Nova {label}</h2><p>O lançamento será salvo no PostgreSQL.</p></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={17} /></button></div><label>Projeto<select value={form.projectId} onChange={event => setForm({ ...form, projectId: event.target.value })} required><option value="">Selecione um projeto</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Categoria<input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder={kind === 'revenue' ? 'Ex.: Venda, mensalidade' : 'Ex.: Marketing, operação'} required /></label><label>Valor<input type="number" min="0.01" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="0,00" required /></label><label>Data de geração / competência<input type="date" value={form.competence} onChange={event => setForm({ ...form, competence: event.target.value })} required /></label><label>{kind === 'revenue' ? 'Data de recebimento (opcional)' : 'Data de vencimento (opcional)'}<input type="date" value={form.settlementDate} onChange={event => setForm({ ...form, settlementDate: event.target.value })} /></label><label>Descrição<input value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Opcional" /></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar lançamento'}</button></div></form></div>}</section>
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
  const [newProject, setNewProject] = useState({ name: '', type: '', description: '', status: 'IDEA' })
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('gestor_projetos_user') ?? '{}') as { email?: string; role?: string } } catch { return {} }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [projectData, summaryData] = await Promise.all([api.projects(), api.dashboard()])
      setProjects(projectData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const filteredProjects = useMemo(() => projects.filter(project => (projectFilter === 'Todos os projetos' || project.name === projectFilter) && `${project.name} ${project.type} ${project.status}`.toLowerCase().includes(search.toLowerCase())), [projectFilter, projects, search])
  const attentionProject = projects.find(project => project.revenue > 0 && project.margin < 20)
  const opportunityProject = projects.find(project => project.revenue > 0 && project.margin >= 50)

  async function createProject(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createProject(newProject)
      setNewProject({ name: '', type: '', description: '', status: 'IDEA' })
      setShowModal(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o projeto.')
    } finally { setSaving(false) }
  }
  async function editProject(project: ApiProject) {
    const name = window.prompt('Nome do projeto:', project.name)
    if (!name || name === project.name) return
    try { await api.updateProject(project.id, { name, type: project.type, status: project.status, color: project.color, description: project.description ?? undefined }); await loadData() } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível alterar o projeto.') }
  }
  async function removeProject(project: ApiProject) {
    if (!window.confirm(`Excluir o projeto ${project.name} e seus lançamentos?`)) return
    try { await api.deleteProject(project.id); await loadData() } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível excluir o projeto.') }
  }

  return <div className={dark ? 'app dark' : 'app light'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BarChart3 size={17} /></div><span>Gestor_<strong>Projetos</strong></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">GP</div><div><b>Meu portfólio</b><span>Workspace principal</span></div><ChevronDown size={14} /></div>
      <nav className="nav">{nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'nav-item active' : 'nav-item'}><Icon size={17} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /><span>Configurações</span></button><button className="nav-item"><HelpCircle size={17} /><span>Ajuda e suporte</span></button><div className="user-card"><div className="user-avatar">{(user.email ?? 'AD').slice(0, 2).toUpperCase()}</div><div><b>{user.email ?? 'Usuário'}</b><span>{user.role ?? 'Usuário'}</span></div><MoreHorizontal size={16} /></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs"><span>Portfólio</span><span className="slash">/</span><b>{active}</b></div><div className="top-actions"><div className="search"><Search size={16} /><input aria-label="Pesquisar" placeholder="Pesquisar projetos e lançamentos" value={search} onChange={event => setSearch(event.target.value)} /><kbd><Command size={12} /> K</kbd></div><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={17} /> : <Sun size={17} />}</button><button className="icon-btn notification"><Bell size={17} /></button><div className="top-avatar">{(user.email ?? 'AD').slice(0, 2).toUpperCase()}</div></div></header>
      <div className="content">
        <section className="page-head"><div><h1>{active}</h1><p>Dados carregados do seu workspace e do banco de produção.</p></div><div className="head-actions"><div className="select-wrap"><Clock3 size={15} /><select value={period} onChange={event => setPeriod(event.target.value)}><option>Últimos 12 meses</option><option>Este mês</option><option>Este trimestre</option></select><ChevronDown size={14} /></div>{active !== 'Receitas' && active !== 'Despesas' && <button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Novo projeto</button>}</div></section>
        {error && <div className="login-error">{error}</div>}
        {active === 'Receitas' ? <FinancePage kind="revenue" projects={projects} search={search} /> : active === 'Despesas' ? <FinancePage kind="expense" projects={projects} search={search} /> : active !== 'Visão geral' && active !== 'Projetos' ? <section className="empty-state panel"><div className="empty-icon"><BriefcaseBusiness size={24} /></div><h2>{active}</h2><p>Este módulo ainda não possui operações conectadas à API. Os dados exibidos no dashboard são reais.</p><button className="secondary-btn" onClick={() => setActive('Visão geral')}>Voltar para visão geral</button></section> : <>
          {active === 'Visão geral' && <>
            <div className="kpi-grid"><Kpi label="Projetos" value={String(summary.projects)} icon={FolderKanban} /><Kpi label="Receita total" value={money(summary.revenue)} icon={CircleDollarSign} /><Kpi label="Despesas" value={money(summary.expense)} icon={CreditCard} /><Kpi label="Lucro líquido" value={money(summary.profit)} positive={summary.profit >= 0} icon={BarChart3} /><Kpi label="ROI geral" value={`${summary.roi.toFixed(1)}%`} positive={summary.roi >= 0} icon={Gauge} /></div>
            <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Resumo financeiro</h2><p>Totais registrados no banco de dados</p></div></div><div className="empty-state"><div className="empty-icon"><BarChart3 size={24} /></div><h2>{summary.revenue || summary.expense ? 'Resumo atualizado' : 'Sem movimentações financeiras'}</h2><p>{summary.revenue || summary.expense ? `Receitas de ${money(summary.revenue)} e despesas de ${money(summary.expense)} foram encontradas.` : 'Cadastre receitas e despesas para acompanhar a evolução financeira.'}</p></div></section><section className="panel insights-panel"><div className="panel-head"><div><h2>Insights</h2><p>Alertas calculados com os dados reais</p></div><span className="ai-spark"><Sparkles size={15} /></span></div>{attentionProject ? <div className="insight warning"><div className="insight-icon"><ShieldAlert size={17} /></div><div><b>Projeto em atenção</b><p>{attentionProject.name} está com margem de {attentionProject.margin.toFixed(1)}%.</p></div></div> : opportunityProject ? <div className="insight opportunity"><div className="insight-icon"><Lightbulb size={17} /></div><div><b>Boa margem identificada</b><p>{opportunityProject.name} apresenta margem de {opportunityProject.margin.toFixed(1)}%.</p></div></div> : <div className="empty-state"><p>Cadastre movimentações financeiras para gerar insights.</p></div>}</section></div>
          </>}
          <section className="panel projects-panel"><div className="panel-head"><div><h2>Projetos</h2><p>Registros pertencentes ao usuário autenticado</p></div><div className="table-actions"><div className="mini-select"><select value={projectFilter} onChange={event => setProjectFilter(event.target.value)}><option>Todos os projetos</option>{projects.map(project => <option key={project.name}>{project.name}</option>)}</select><ChevronDown size={14} /></div></div></div><div className="project-table"><div className="table-row table-head"><span>Projeto</span><span>Receita</span><span>Margem</span><span>Despesas</span><span>Status</span><span /></div>{loading ? <div className="empty-state"><p>Carregando dados...</p></div> : filteredProjects.length ? filteredProjects.map(project => <div className="table-row" key={project.id}><div className="project-name"><span className="project-dot" style={{ background: project.color }} /><div><b>{project.name}</b><small>{project.type}</small></div></div><span className="table-money">{money(project.revenue)}</span><span className={project.margin < 20 && project.revenue > 0 ? 'margin negative' : 'margin'}>{project.margin.toFixed(1)}%</span><span className="table-money">{money(project.expense)}</span><span className="status"><Check size={12} /> {statusLabels[project.status] ?? project.status}</span><span className="table-actions"><button className="row-more" onClick={() => void editProject(project)} aria-label="Alterar projeto" title="Alterar projeto"><Pencil size={15} /></button><button className="row-more" onClick={() => void removeProject(project)} aria-label="Excluir projeto" title="Excluir projeto"><Trash2 size={15} /></button></span></div>) : <div className="empty-state"><div className="empty-icon"><FolderKanban size={24} /></div><h2>Nenhum projeto cadastrado</h2><p>Crie seu primeiro projeto para começar a acompanhar os dados reais do portfólio.</p><button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Novo projeto</button></div>}</div></section>
        </>}
      </div>
    </main>
    {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><form className="modal panel" onSubmit={createProject} onClick={event => event.stopPropagation()}><div className="modal-head"><div><h2>Novo projeto</h2><p>Este registro será salvo no PostgreSQL.</p></div><button type="button" className="icon-btn" onClick={() => setShowModal(false)}><X size={17} /></button></div><label>Nome do projeto<input value={newProject.name} onChange={event => setNewProject({ ...newProject, name: event.target.value })} placeholder="Ex.: Produto Digital" minLength={2} required autoFocus /></label><label>Tipo<input value={newProject.type} onChange={event => setNewProject({ ...newProject, type: event.target.value })} placeholder="Ex.: SaaS, Serviço" required /></label><label>Status<select value={newProject.status} onChange={event => setNewProject({ ...newProject, status: event.target.value })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Descrição<input value={newProject.description} onChange={event => setNewProject({ ...newProject, description: event.target.value })} placeholder="Opcional" /></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : 'Criar projeto'}</button></div></form></div>}
  </div>
}

export default App
