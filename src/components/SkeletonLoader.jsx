const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="card animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-4 lg:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
      </td>
    </tr>
  );

  const TeamCardSkeleton = () => (
    <div className="card text-center animate-pulse">
      <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );

  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </>
    );
  }

  if (type === 'table') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </>
    );
  }

  if (type === 'team') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </>
    );
  }

  return null;
};

export default SkeletonLoader;
