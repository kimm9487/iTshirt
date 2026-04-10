export function guessCategory(name = '') {
  const value = name.toLowerCase()

  if (/(hood|후드|맨투맨|sweat)/.test(value)) return '상의'
  if (/(shirt|tee|반팔|긴팔|티셔츠)/.test(value)) return '티셔츠'
  if (/(pants|denim|jean|슬랙스|바지)/.test(value)) return '팬츠'
  if (/(shoe|sneaker|신발|운동화)/.test(value)) return '슈즈'
  if (/(hat|cap|모자|bag|가방|acc)/.test(value)) return '액세서리'

  return '기타'
}

export function slugifyCategory(category) {
  return encodeURIComponent(category.toLowerCase())
}

export function formatPrice(value) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function withPricing(item) {
  const discountPer = Number(item.discountPer || 0)
  const price = Number(item.price || 0)
  const salePrice = Math.max(0, Math.round(price * (1 - discountPer / 100)))

  return {
    ...item,
    category: guessCategory(item.name),
    salePrice,
    displayPrice: `${formatPrice(salePrice)}원`,
    originalDisplayPrice: `${formatPrice(price)}원`,
  }
}
