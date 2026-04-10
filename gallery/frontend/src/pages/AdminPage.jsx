import { useState } from 'react'
import { createAdminItem, updateAdminItemStock } from '../api/client'
import { useProducts } from '../context/ProductContext'

export function AdminPage() {
  const { products, refreshProducts } = useProducts()
  const [form, setForm] = useState({
    name: '',
    imgPath: '',
    price: 0,
    discountPer: 0,
    stock: 0,
  })
  const [status, setStatus] = useState('')

  function onChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: ['price', 'discountPer', 'stock'].includes(name) ? Number(value) : value,
    }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setStatus('')

    try {
      await createAdminItem(form)
      await refreshProducts()
      setStatus('상품이 등록되었습니다.')
      setForm({ name: '', imgPath: '', price: 0, discountPer: 0, stock: 0 })
    } catch {
      setStatus('상품 등록에 실패했습니다.')
    }
  }

  async function handleStockChange(itemId, stock) {
    setStatus('')
    try {
      await updateAdminItemStock(itemId, Number(stock))
      await refreshProducts()
      setStatus('재고가 수정되었습니다.')
    } catch {
      setStatus('재고 수정에 실패했습니다.')
    }
  }

  return (
    <section className="section-block admin-layout">
      <article className="mypage-card">
        <h2>관리자 상품 등록</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <label htmlFor="name">상품명</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />

          <label htmlFor="imgPath">이미지 URL</label>
          <input id="imgPath" name="imgPath" value={form.imgPath} onChange={onChange} />

          <label htmlFor="price">가격</label>
          <input id="price" name="price" type="number" min="0" value={form.price} onChange={onChange} required />

          <label htmlFor="discountPer">할인율(%)</label>
          <input id="discountPer" name="discountPer" type="number" min="0" max="100" value={form.discountPer} onChange={onChange} />

          <label htmlFor="stock">재고</label>
          <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={onChange} required />

          <button type="submit">상품 등록</button>
        </form>
      </article>

      <article className="mypage-card">
        <h2>재고 관리</h2>
        {status ? <p>{status}</p> : null}
        <ul className="orders-list">
          {products.map((item) => (
            <li key={item.id} className="admin-item-row">
              <div>
                <p>{item.name}</p>
                <p>현재 재고: {item.stock ?? 0}</p>
              </div>
              <div className="admin-stock-edit">
                <input
                  type="number"
                  min="0"
                  defaultValue={item.stock ?? 0}
                  onBlur={(e) => handleStockChange(item.id, e.target.value)}
                />
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
