import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)

    try {
      await login(email, password)
      const nextPath = location.state?.from?.pathname || '/'
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="section-block auth-card">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="email">이메일</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={pending}>{pending ? '로그인 중...' : '로그인'}</button>
      </form>
      <p>
        아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
      </p>
    </section>
  )
}
