import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setPending(true)
    try {
      await signup({ name, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="section-block auth-card">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="name">이름</label>
        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="email">이메일</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} />

        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input id="confirmPassword" type="password" required minLength={4} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={pending}>{pending ? '가입 중...' : '가입하기'}</button>
      </form>
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </section>
  )
}
