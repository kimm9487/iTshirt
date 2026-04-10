import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { totalItemCount } = useCart()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-top">
        <Link to="/" className="brand-link">iTshirt Store</Link>
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="welcome-text">{user?.email || '회원'}님</span>
              <button type="button" className="link-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-link">로그인</NavLink>
              <NavLink to="/signup" className="text-link">회원가입</NavLink>
            </>
          )}
          {isAdmin ? <NavLink to="/admin" className="text-link">관리자</NavLink> : null}
          <NavLink to="/mypage" className="text-link">마이페이지</NavLink>
          <NavLink to="/cart" className="text-link cart-link">장바구니 ({totalItemCount})</NavLink>
        </div>
      </div>
      <nav className="main-nav">
        <NavLink to="/" end>홈</NavLink>
        <NavLink to="/products">전체상품</NavLink>
        <NavLink to="/category/%ED%8B%B0%EC%85%94%EC%B8%A0">티셔츠</NavLink>
        <NavLink to="/category/%EC%83%81%EC%9D%98">상의</NavLink>
        <NavLink to="/category/%ED%8C%AC%EC%B8%A0">팬츠</NavLink>
        <NavLink to="/category/%EC%8A%88%EC%A6%88">슈즈</NavLink>
        <NavLink to="/category/%EC%95%A1%EC%84%B8%EC%84%9C%EB%A6%AC">액세서리</NavLink>
      </nav>
    </header>
  )
}
