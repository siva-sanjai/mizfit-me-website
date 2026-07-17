import { useParams, Link } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-mz-green/10 animate-scale-in" />
            <div className="absolute inset-0 rounded-full bg-mz-green/5 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-20 h-20 rounded-full bg-mz-green/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-mz-green"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 24,
                  animation: 'checkmark-draw 0.5s ease-out 0.2s forwards',
                  opacity: 0,
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-mz-dark mb-3 tracking-tight">
          ORDER CONFIRMED!
        </h1>
        <p className="text-mz-gray-500 mb-8 leading-relaxed">
          Thank you for your order. We&rsquo;ll start printing right away. A confirmation
          email has been sent to your inbox with all the details.
        </p>

        <div className="bg-mz-gray-50 rounded-xl px-6 py-4 mb-10 inline-block">
          <p className="text-[10px] text-mz-gray-500 uppercase tracking-[0.15em] font-medium mb-1">
            Order Number
          </p>
          <p className="text-lg font-mono font-bold text-mz-dark tracking-wider">
            {orderNumber}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/track"
            className="px-8 py-3 bg-mz-dark text-white text-sm font-medium rounded-lg hover:bg-mz-gray-900 transition-colors text-center"
          >
            Track Order
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3 border border-mz-gray-200 text-mz-gray-700 text-sm font-medium rounded-lg hover:bg-mz-gray-50 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        <style>{`
          @keyframes checkmark-draw {
            0% { stroke-dashoffset: 24; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
