export default function MapLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 font-display">Интерактив газрын зургийг уншиж байна...</h2>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Монгол орны үзвэрүүд болон баазуудыг бэлтгэж байна</p>
      </div>
    </div>
  )
}
