export default function DiagonalHatch() {
  return (
    <div className="bg-[#1a1a1a] flex items-center justify-center min-h-screen p-10">
      <div
        className="
          w-64 h-[440px]
          border border-white
          bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22%3E%3Cline%20x1=%220%22%20y1=%2220%22%20x2=%2220%22%20y2=%220%22%20stroke=%22white%22%20stroke-width=%220.8%22%20opacity=%220.7%22/%3E%3C/svg%3E')]
          bg-repeat
        "
      />
    </div>
  );
}