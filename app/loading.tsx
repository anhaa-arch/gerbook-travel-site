export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold font-display text-gray-900 mb-2">Уншиж байна...</h2>
        <p className="text-gray-600 font-medium">Түр хүлээнэ үү, мэдээллийг бэлтгэж байна</p>
      </div>
    </div>
  )
}
