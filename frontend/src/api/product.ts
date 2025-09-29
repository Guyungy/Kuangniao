import request from '@/utils/request'

export interface ProductForm {
  id?: number
  name: string
  price: number
  commission_rate: number
  status?: 'active' | 'inactive'
}

export interface ProductVO extends ProductForm {
  created_at?: string
  updated_at?: string
}

const ProductAPI = {
  getPage(params: { page: number; limit: number; keyword?: string }) {
    return request<any, { list: ProductVO[]; total: number; page: number; limit: number }>({
      url: '/products',
      method: 'get',
      params
    })
  },
  create(data: ProductForm) {
    return request({ url: '/products', method: 'post', data })
  },
  update(id: number, data: ProductForm) {
    return request({ url: `/products/${id}`, method: 'put', data })
  },
  delete(id: number) {
    return request({ url: `/products/${id}`, method: 'delete' })
  }
}

export default ProductAPI


