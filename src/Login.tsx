import { FormEvent, useState } from 'react'
import { ArrowRight, BarChart3, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { api } from './services/api'
import './login.css'

export default function Login({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [email, setEmail] = useState('admin@gestorprojetos.local')
  const [password, setPassword] = useState('Gestor@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api.login(email, password)
      localStorage.setItem('gestor_projetos_token', result.accessToken)
      onSuccess(result.accessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar agora.')
    } finally { setLoading(false) }
  }

  return <div className="login-page"><div className="login-brand"><span className="login-mark"><BarChart3 size={18} /></span><span>Gestor_<strong>Projetos</strong></span></div><div className="login-shell"><div className="login-copy"><div className="login-orb" /><span className="login-eyebrow"><ShieldCheck size={14} /> Seu portfólio, sob controle</span><h1>Decisões melhores começam com <em>clareza.</em></h1><p>Entre no seu espaço de gestão para acompanhar projetos, finanças e oportunidades em um só lugar.</p><div className="login-points"><span><ShieldCheck size={15} /> Dados protegidos</span><span><BarChart3 size={15} /> Visão consolidada</span></div></div><form className="login-card" onSubmit={submit}><div className="login-card-head"><h2>Bem-vindo de volta</h2><p>Entre para acessar seu portfólio.</p></div><label>E-mail<div className="login-input"><Mail size={16} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com" required /></div></label><label>Senha<div className="login-input"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" minLength={8} required /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <div className="login-error">{error}</div>}<button className="login-submit" disabled={loading}>{loading ? 'Entrando...' : <>Entrar no workspace <ArrowRight size={16} /></>}</button><small className="login-hint">Acesso de teste: admin@gestorprojetos.local</small></form></div></div>
}
