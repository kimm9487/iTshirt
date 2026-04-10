import { useState } from 'react'
import { createAdminItem, updateAdminItemStock, uploadAdminImage } from '../api/client'
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
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  function onChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: ['price', 'discountPer', 'stock'].includes(name) ? Number(value) : value,
    }))
  }

  async function handleImageFile(file) {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setStatus('jpg 또는 png 파일만 업로드 가능합니다.')
      return
    }
    setUploading(true)
    setStatus('')
    try {
      const { url } = await uploadAdminImage(file)
      setForm((prev) => ({ ...prev, imgPath: url }))
      setImagePreview(URL.createObjectURL(file))
    } catch {
      setStatus('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  function onDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleImageFile(file)
  }

  function onFileInputChange(e) {
    handleImageFile(e.target.files[0])
  }

  async function handleCreate(event) {
    event.preventDefault()
    setStatus('')

    try {
      await createAdminItem(form)
      await refreshProducts()
      setStatus('상품이 등록되었습니다.')
      setForm({ name: '', imgPath: '', price: 0, discountPer: 0, stock: 0 })
      setImagePreview(null)
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

          <label>이미지</label>
          <div
            className={`image-drop-zone${isDragging ? ' dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('imageFileInput').click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="미리보기" className="image-preview" />
            ) : (
              <span>{uploading ? '업로드 중...' : '클릭하거나 이미지를 드래그하세요 (jpg, png)'}</span>
            )}
            <input
              id="imageFileInput"
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={onFileInputChange}
            />
          </div>

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
