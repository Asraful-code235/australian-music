export default function CommercialTrackItemSkeleton() {
  return (
    <div className='relative h-[77px] px-8 flex items-center gap-2 lg:gap-4 shadow bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  touch-none'>
      <div className='w-2 h-4 bg-gray-300 rounded'></div>
      <div className='w-2/6 h-4 bg-gray-300 rounded'></div>
      <div className='w-2/6 h-4 bg-gray-300 rounded'></div>
      <div className='w-1/6 h-4 bg-gray-300 rounded'></div>
    </div>
  );
}
