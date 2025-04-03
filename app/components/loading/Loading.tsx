export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  );
}
