import Image from 'next/image';

export default function NoDataFound() {
  return (
    <div className='p-10 flex justify-center'>
      <div>
        <Image
          src='/image/no-data-found.webp'
          alt='No data found'
          width={300}
          height={300}
        />

        <h2 className='-mt-4 text-center font-bold text-2xl text-gray-500'>
          No Data Found
        </h2>
      </div>
    </div>
  );
}
