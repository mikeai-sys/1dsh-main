const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 sm:w-48">
    <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
    <div className="h-4 mt-2 bg-gray-800 rounded w-3/4 animate-pulse"></div>
  </div>
);

const SkeletonCarousel = () => (
  <div className="py-8 px-4">
    <div className="h-8 bg-gray-800 rounded w-1/4 mb-6 animate-pulse"></div>
    <div className="flex space-x-4 overflow-hidden">
      {[...Array(7)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <>
    <div className="h-64 sm:h-80 md:h-96 lg:h-[450px] bg-gray-800 m-4 rounded-xl animate-pulse"></div>
    <SkeletonCarousel />
    <SkeletonCarousel />
    <SkeletonCarousel />
  </>
);