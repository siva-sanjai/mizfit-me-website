import { useState } from 'react'
import { supabase } from '@/services/supabase'
import { formatPrice, formatDate } from '@/utils/helpers'
import type { OrderWithItems, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  printing: 'Printing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'printing', 'packed', 'shipped', 'delivered']

export default function OrderTrackingPage() {
  const [inputValue, setInputValue] = useState('')
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setOrder(null)

    const { data, error: err } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', trimmed)
      .single()

    if (err || !data) {
      setError('Order not found. Please check your order number and try again.')
      setLoading(false)
      return
    }

    setOrder({ ...data, items: data.order_items } as unknown as OrderWithItems)
    setLoading(false)
  }

  const currentIndex = order ? ACTIVE_STATUSES.indexOf(order.order_status as OrderStatus) : -1
  const isCancelled = order?.order_status === 'cancelled'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 min-h-[70vh]">
      <h1 className="text-3xl font-bold text-mz-dark mb-2">Track Order</h1>
      <p className="text-mz-gray-500 mb-8">Enter your order number to check the status.</p>

      <form onSubmit={handleTrack} className="flex gap-3 mb-12">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Order number (e.g. MIZ-XXXXX)"
          className="flex-1 px-4 py-3 border border-mz-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mz-dark/10 focus:border-mz-dark transition-shadow"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-6 py-3 bg-mz-dark text-white text-sm font-medium rounded-lg hover:bg-mz-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {order && (
        <div className="space-y-8">
          <div className="border border-mz-gray-200 rounded-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-mz-dark">Order #{order.order_number}</h2>
                <p className="text-sm text-mz-gray-500 mt-0.5">Placed on {formatDate(order.created_at)}</p>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                isCancelled ? 'bg-red-100 text-red-700' : 'bg-mz-gray-100 text-mz-gray-700'
              }`}>
                {STATUS_LABELS[order.order_status as OrderStatus]}
              </span>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-800 text-sm">Order Cancelled</p>
                  <p className="text-xs text-red-600 mt-0.5">This order has been cancelled and will not be processed.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-mz-gray-200" />
                <div className="space-y-0">
                  {ACTIVE_STATUSES.map((status, idx) => {
                    const isCompleted = idx <= currentIndex
                    const isCurrent = idx === currentIndex
                    return (
                      <div key={status} className="flex items-start gap-5 relative pb-6 last:pb-0">
                        <div className="relative z-10">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-mz-dark flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          ) : isCurrent ? (
                            <div className="w-10 h-10 rounded-full border-2 border-mz-dark flex items-center justify-center bg-white">
                              <span className="w-2.5 h-2.5 rounded-full bg-mz-dark" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-mz-gray-200 flex items-center justify-center bg-white">
                              <span className="w-2.5 h-2.5 rounded-full bg-mz-gray-200" />
                            </div>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-mz-dark' : isCompleted ? 'text-mz-gray-700' : 'text-mz-gray-400'
                          }`}>
                            {STATUS_LABELS[status]}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-mz-gray-500 mt-0.5">Current status</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border border-mz-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-base font-semibold text-mz-dark mb-5">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[10px] text-mz-gray-500 uppercase tracking-[0.15em] font-medium mb-1">Name</p>
                <p className="text-sm text-mz-dark">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-mz-gray-500 uppercase tracking-[0.15em] font-medium mb-1">Email</p>
                <p className="text-sm text-mz-dark">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-[10px] text-mz-gray-500 uppercase tracking-[0.15em] font-medium mb-1">Phone</p>
                <p className="text-sm text-mz-dark">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-mz-gray-500 uppercase tracking-[0.15em] font-medium mb-1">Address</p>
                <p className="text-sm text-mz-dark">
                  {order.address}, {order.city}, {order.state} &ndash; {order.postal_code}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-mz-dark mb-3">Items</h3>
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-mz-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-mz-dark">{item.product_name}</p>
                    <p className="text-xs text-mz-gray-500 mt-0.5">
                      {item.color} / {item.size} &times; {item.quantity}
                      {item.design_file_name && ` \u2014 ${item.design_file_name}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-mz-dark">{formatPrice(item.item_price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-mz-gray-200">
              <p className="text-sm font-semibold text-mz-dark">Total</p>
              <p className="text-xl font-bold text-mz-dark">{formatPrice(order.total_amount)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
