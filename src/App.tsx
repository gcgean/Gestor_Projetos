import { useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, CircleDollarSign, ClipboardList, Clock3, Command, CreditCard,
  FileText, FolderKanban, Gauge, Grid2X2, HelpCircle, Lightbulb, Moon, MoreHorizontal,
  Plus, Search, Settings2, ShieldAlert, Sparkles, Sun, Target, WalletCards, X,
} from 'lucide-react'

type Project = { name: string; type: string; color: string; revenue: string; margin: string; status: string; progress: number; risk?: string }

const nav = [
  { label: 'Visão geral', icon: Grid2X2 }, { label: 'Projetos', icon: FolderKanban },
  { label: 'Receitas', icon: CircleDollarSign }, { label: 'Despesas', icon: CreditCard },
  { label: 'Fluxo de caixa', icon: WalletCards }, { label: 'Contas a pagar', icon: ClipboardList },
  { label: 'Contas a receber', icon: FileText }, { label: 'Metas', icon: Target },
  { label: 'Planejamento', icon: CalendarDays }, { label: 'Insights IA', icon: Sparkles },
]

const projects: Project[] = [
  { name: 'SaaS Contábil', type: 'SaaS', color: '#7c6cff', revenue: 'R$ 32.480', margin: '42,8%', status: 'Escalando', progress: 82 },
  { name: 'Canal Growth', type: 'YouTube', color: '#f17878', revenue: 'R$ 11.920', margin: '31,4%', status: 'Lançado', progress: 64 },
  { name: 'Curso Pro', type: 'Produto digital', color: '#57d39b', revenue: 'R$ 8.760', margin: '58,9%', status: 'Escalando', progress: 91 },
  { name: 'Agência Nexo', type: 'Serviço', color: '#f4b860', revenue: 'R$ 6.250', margin: '18,2%', status: 'Atenção', progress: 38, risk: 'Margem abaixo da meta' },
]

const chartValues = [42, 47, 41, 55, 52, 63, 58, 71, 68, 79, 76, 90]

function money(value: string) { return value }

function Kpi({ label, value, change, positive, icon: Icon }: { label: string; value: string; change: string; positive?: boolean; icon: typeof Gauge }) {
  return <article className="kpi panel">
    <div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon size={16} /></span></div>
    <div className="kpi-value">{value}</div>
    <div className={positive ? 'trend positive' : 'trend negative'}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change} <span>vs. mês anterior</span></div>
  </article>
}

function RevenueChart() {
  const area = chartValues.map((v, i) => `${i * 8.8},${102 - v}`).join(' ')
  return <div className="chart-wrap">
    <div className="chart-legend"><span><i className="legend-dot purple" />Receita</span><span><i className="legend-dot mint" />Lucro líquido</span></div>
    <svg viewBox="0 0 100 112" preserveAspectRatio="none" className="chart" role="img" aria-label="Gráfico de receita e lucro">
      {[20, 44, 68, 92].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} className="grid-line" />)}
      <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7c6cff" stopOpacity=".28" /><stop offset="100%" stopColor="#7c6cff" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,112 ${area} 96,112`} fill="url(#areaFill)" />
      <polyline points={area} fill="none" stroke="#7c6cff" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <polyline points={chartValues.map((v, i) => `${i * 8.8},${112 - v * .72}`).join(' ')} fill="none" stroke="#57d39b" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeDasharray="2 2" />
      <circle cx="96.8" cy="12" r="2.6" fill="#7c6cff" stroke="#151b24" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
    <div className="chart-axis"><span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span></div>
  </div>
}

function App() {
  const [active, setActive] = useState('Visão geral')
  const [dark, setDark] = useState(true)
  const [period, setPeriod] = useState('Últimos 12 meses')
  const [projectFilter, setProjectFilter] = useState('Todos os projetos')
  const [showModal, setShowModal] = useState(false)
  const filteredProjects = useMemo(() => projectFilter === 'Todos os projetos' ? projects : projects.filter(p => p.name === projectFilter), [projectFilter])

  return <div className={dark ? 'app dark' : 'app light'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BarChart3 size={17} /></div><span>Gestor_<strong>Projetos</strong></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">GP</div><div><b>Meu portfólio</b><span>Workspace principal</span></div><ChevronDown size={14} /></div>
      <nav className="nav">{nav.map(({ label, icon: Icon }, index) => <button key={label} onClick={() => setActive(label)} className={active === label ? 'nav-item active' : 'nav-item'}><Icon size={17} /><span>{label}</span>{index === 9 && <span className="nav-new">3</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /><span>Configurações</span></button><button className="nav-item"><HelpCircle size={17} /><span>Ajuda e suporte</span></button><div className="user-card"><div className="user-avatar">MF</div><div><b>Marcos Freire</b><span>Administrador</span></div><MoreHorizontal size={16} /></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs"><span>Portfólio</span><span className="slash">/</span><b>{active}</b></div><div className="top-actions"><button className="search"><Search size={16} /><span>Buscar</span><kbd><Command size={12} /> K</kbd></button><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="icon-btn notification"><Bell size={17} /><i /></button><div className="top-avatar">MF</div></div></header>
      <div className="content">
        <section className="page-head"><div><h1>{active}</h1><p>Uma visão clara do que está acontecendo com seus projetos.</p></div><div className="head-actions"><div className="select-wrap"><Clock3 size={15} /><select value={period} onChange={e => setPeriod(e.target.value)}><option>Últimos 12 meses</option><option>Este mês</option><option>Este trimestre</option></select><ChevronDown size={14} /></div><button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Novo projeto</button></div></section>
        {active !== 'Visão geral' ? <section className="empty-state panel"><div className="empty-icon"><BriefcaseBusiness size={24} /></div><h2>{active}</h2><p>Este módulo está preparado para receber seus dados e conectar-se ao backend do Gestor_Projetos.</p><button className="secondary-btn" onClick={() => setActive('Visão geral')}>Voltar para visão geral</button></section> : <>
          <div className="kpi-grid"><Kpi label="Receita total" value="R$ 59.410" change="18,4%" positive icon={CircleDollarSign} /><Kpi label="Despesas" value="R$ 21.860" change="6,2%" icon={CreditCard} /><Kpi label="Lucro líquido" value="R$ 37.550" change="24,8%" positive icon={BarChart3} /><Kpi label="ROI geral" value="72,4%" change="11,6%" positive icon={Gauge} /></div>
          <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Receita e lucro</h2><p>Evolução consolidada do portfólio</p></div><button className="more-btn"><MoreHorizontal size={18} /></button></div><RevenueChart /></section><section className="panel insights-panel"><div className="panel-head"><div><h2>Insights IA</h2><p>O que merece sua atenção</p></div><span className="ai-spark"><Sparkles size={15} /></span></div><div className="insight warning"><div className="insight-icon"><ShieldAlert size={17} /></div><div><b>Projeto em atenção</b><p>Agência Nexo está com margem abaixo da meta há 2 meses.</p><button>Ver projeto <ArrowUpRight size={13} /></button></div></div><div className="insight opportunity"><div className="insight-icon"><Lightbulb size={17} /></div><div><b>Oportunidade de crescimento</b><p>O SaaS Contábil recuperou 38% do investimento inicial.</p><button>Ver análise <ArrowUpRight size={13} /></button></div></div><button className="all-insights" onClick={() => setActive('Insights IA')}>Ver todos os insights <ArrowUpRight size={14} /></button></section></div>
          <section className="panel projects-panel"><div className="panel-head"><div><h2>Saúde dos projetos</h2><p>Acompanhe a performance de cada negócio</p></div><div className="table-actions"><div className="mini-select"><select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}><option>Todos os projetos</option>{projects.map(p => <option key={p.name}>{p.name}</option>)}</select><ChevronDown size={14} /></div><button className="more-btn"><MoreHorizontal size={18} /></button></div></div><div className="project-table"><div className="table-row table-head"><span>Projeto</span><span>Receita mensal</span><span>Margem</span><span>Saúde</span><span>Status</span><span /></div>{filteredProjects.map(p => <div className="table-row" key={p.name}><div className="project-name"><span className="project-dot" style={{ background: p.color }} /><div><b>{p.name}</b><small>{p.type}</small></div></div><span className="table-money">{money(p.revenue)}</span><span className="margin">{p.margin}</span><div className="health"><div className="progress"><span style={{ width: `${p.progress}%`, background: p.risk ? '#f4b860' : p.color }} /></div><small>{p.progress}/100</small></div><span className={p.risk ? 'status risk' : 'status'}>{p.risk ? 'Atenção' : <><Check size={12} /> {p.status}</>}</span><button className="row-more"><MoreHorizontal size={16} /></button></div>)}</div></section>
        </>}
      </div>
    </main>
    {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="modal panel" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h2>Novo projeto</h2><p>Adicione uma nova empresa ao seu portfólio.</p></div><button className="icon-btn" onClick={() => setShowModal(false)}><X size={17} /></button></div><label>Nome do projeto<input placeholder="Ex.: Produto Digital" autoFocus /></label><label>Tipo<select><option>SaaS</option><option>Produto digital</option><option>Serviço</option><option>Conteúdo</option></select></label><div className="modal-actions"><button className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button><button className="primary-btn" onClick={() => setShowModal(false)}>Criar projeto</button></div></div></div>}
  </div>
}

export default App
