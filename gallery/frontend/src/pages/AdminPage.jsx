import { useState } from 'react'
import { createAdminItemMultipart, updateAdminItemStock, updateAdminItemMultipart, deleteAdminItem } from '../api/client'
import { useProducts } from '../context/ProductContext'

export function AdminPage() {
  const { products, refreshProducts } = useProducts()
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: 0,
    discountPer: 0,
    stock: 0,
  })
  const [status, setStatus] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

    // 수정 모달 상태
    const [editTarget, setEditTarget] = useState(null) // { id, name, category, price, discountPer, imageUrl }
    const [editForm, setEditForm] = useState({ name: '', category: '', price: 0, discountPer: 0 })
    const [editImageFile, setEditImageFile] = useState(null)
    const [editImagePreview, setEditImagePreview] = useState(null)
    const [editIsDragging, setEditIsDragging] = useState(false)

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
    setStatus('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
      await createAdminItemMultipart(form, imageFile)
      await refreshProducts()
      setStatus('상품이 등록되었습니다.')
      setForm({ name: '', category: '', price: 0, discountPer: 0, stock: 0 })
      setImageFile(null)
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

    function openEditModal(item) {
      setEditTarget(item)
      setEditForm({
        name: item.name,
        category: item.category ?? '',
        price: item.price,
        discountPer: item.discountPer ?? 0,
      })
      setEditImageFile(null)
      setEditImagePreview(item.imageUrl || item.imgPath || null)
    }

    function closeEditModal() {
      setEditTarget(null)
      setEditImageFile(null)
      setEditImagePreview(null)
    }

    function onEditChange(e) {
      const { name, value } = e.target
      setEditForm((prev) => ({
        ...prev,
        [name]: ['price', 'discountPer'].includes(name) ? Number(value) : value,
      }))
    }

    function onEditDragOver(e) {
      e.preventDefault()
      setEditIsDragging(true)
    }

    function onEditDragLeave() {
      setEditIsDragging(false)
    }

    function onEditDrop(e) {
      e.preventDefault()
      setEditIsDragging(false)
      handleEditImageFile(e.dataTransfer.files[0])
    }

    async function handleEditImageFile(file) {
      if (!file) return
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setStatus('jpg 또는 png 파일만 업로드 가능합니다.')
        return
      }
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    }

    async function handleEditSubmit(e) {
      e.preventDefault()
      setStatus('')
      try {
        await updateAdminItemMultipart(editTarget.id, editForm, editImageFile)
        await refreshProducts()
        setStatus('상품이 수정되었습니다.')
        closeEditModal()
      } catch {
        setStatus('상품 수정에 실패했습니다.')
      }
    }

    async function handleDelete(itemId) {
      if (!window.confirm('정말 삭제하시겠습니까?')) return
      setStatus('')
      try {
        await deleteAdminItem(itemId)
        await refreshProducts()
        setStatus('상품이 삭제되었습니다.')
        closeEditModal()
      } catch {
        setStatus('상품 삭제에 실패했습니다.')
      }
    }

  return (
    <section className="section-block admin-layout">
      <article className="mypage-card">
        <h2>관리자 상품 등록</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <label htmlFor="name">상품명</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />

          <label htmlFor="category">카테고리</label>
          <select id="category" name="category" value={form.category} onChange={onChange}>
            <option value="">선택 안 함 (자동)</option>
            <option value="티셔츠">티셔츠</option>
            <option value="상의">상의</option>
            <option value="팬츠">팬츠</option>
            <option value="슈즈">슈즈</option>
            <option value="액세서리">액세서리</option>
            <option value="기타">기타</option>
          </select>

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
              <span>클릭하거나 이미지를 드래그하세요 (jpg, png)</span>
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
                <div
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => openEditModal(item)}
                  title="클릭하여 상품 수정"
                >
                <p>{item.name}</p>
                <p>현재 재고: {item.stock ?? 0}</p>
              </div>
              <div className="admin-stock-edit">
                <input
                  type="number"
                  min="0"
                  defaultValue={item.stock ?? 0}
                  onBlur={(e) => handleStockChange(item.id, e.target.value)}
                   onClick={(e) => e.stopPropagation()}
                />
              </div>
            </li>
          ))}
        </ul>
      </article>

        {editTarget && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>상품 수정</h2>
              <form onSubmit={handleEditSubmit} className="form-grid">
                <label htmlFor="edit-name">상품명</label>
                <input id="edit-name" name="name" value={editForm.name} onChange={onEditChange} required />

                <label htmlFor="edit-category">카테고리</label>
                <select id="edit-category" name="category" value={editForm.category} onChange={onEditChange}>
                  <option value="">선택 안 함 (자동)</option>
                  <option value="티셔츠">티셔츠</option>
                  <option value="상의">상의</option>
                  <option value="팬츠">팬츠</option>
                  <option value="슈즈">슈즈</option>
                  <option value="액세서리">액세서리</option>
                  <option value="기타">기타</option>
                </select>

                <label>이미지</label>
                <div
                  className={`image-drop-zone${editIsDragging ? ' dragging' : ''}`}
                  onDragOver={onEditDragOver}
                  onDragLeave={onEditDragLeave}
                  onDrop={onEditDrop}
                  onClick={() => document.getElementById('editImageFileInput').click()}
                >
                  {editImagePreview ? (
                    <img src={editImagePreview} alt="미리보기" className="image-preview" />
                  ) : (
                    <span>클릭하거나 이미지를 드래그하세요 (jpg, png)</span>
                  )}
                  <input
                    id="editImageFileInput"
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleEditImageFile(e.target.files[0])}
                  />
                </div>

                <label htmlFor="edit-price">가격</label>
                <input id="edit-price" name="price" type="number" min="0" value={editForm.price} onChange={onEditChange} required />

                <label htmlFor="edit-discountPer">할인율(%)</label>
                <input id="edit-discountPer" name="discountPer" type="number" min="0" max="100" value={editForm.discountPer} onChange={onEditChange} />

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => handleDelete(editTarget.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>
                    삭제
                  </button>
                  <button type="button" onClick={closeEditModal} style={{ background: '#888', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>
                    취소
                  </button>
                  <button type="submit" style={{ padding: '0.5rem 1.2rem' }}>저장</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  )
}
