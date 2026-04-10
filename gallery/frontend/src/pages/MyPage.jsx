import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelOrder, fetchOrders } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/catalog'

export function MyPage() {
  const { user } = useAuth()
  const { totalItemCount } = useCart()
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadOrders() {
      try {
        const data = await fetchOrders()
        if (!mounted) return
        setOrders(data || [])
      } catch {
        if (!mounted) return
        setOrders([])
      }
    }

    if (user?.source === 'server') {
      loadOrders()
    }

    return () => {
      mounted = false
    }
  }, [user])

  async function handleCancel(orderId) {
    setMessage('')
    try {
      await cancelOrder(orderId, 'USER_REQUEST')
      const nextOrders = await fetchOrders()
      setOrders(nextOrders || [])
      setMessage('주문이 취소되었습니다.')
    } catch {
      setMessage('주문 취소에 실패했습니다.')
    }
  }

  return (
    <section className="section-block mypage-grid">
      <article className="mypage-card">
        <h2>내 정보</h2>
        <p>회원번호: {user?.id}</p>
        <p>이메일: {user?.email || '미등록'}</p>
        <p>회원유형: {user?.source === 'server' ? '서버 회원' : '로컬 회원'}</p>
      </article>

      <article className="mypage-card">
        <h2>쇼핑 활동</h2>
        <p>장바구니 상품 수: {totalItemCount}개</p>
        <p>누적 주문 수: {orders.length}건</p>
        <div className="hero-actions">
          <Link to="/cart" className="primary-link">장바구니 보기</Link>
          <Link to="/products" className="ghost-link">상품 보러가기</Link>
        </div>
      </article>

      <article className="mypage-card orders-card">
        <h2>주문 내역</h2>
        {message ? <p>{message}</p> : null}
        {orders.length === 0 ? <p>주문 내역이 없습니다.</p> : null}
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id}>
              <p>주문번호: {order.id}</p>
              <p>상태: {order.status}</p>
              <p>결제금액: {formatPrice(order.totalPrice)}원</p>
              {String(order.status).startsWith('PAID') ? (
                <button type="button" onClick={() => handleCancel(order.id)}>
                  주문 취소
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
