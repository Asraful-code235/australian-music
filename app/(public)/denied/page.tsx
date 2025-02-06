import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineArrowRight } from 'react-icons/hi2';

export default function DeniedPage() {
  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='flex flex-col items-center gap-2'>
        <Image
          src='/image/welcome-image.png'
          width={350}
          height={350}
          alt='Access Denied'
        />
        <h1 className='text-3xl text-center font-bold'>Welcome</h1>
        <p className='text-gray-500'>
          You do not have permission to access this page.
        </p>
        <Link href='/dashboard/commercial/top'>
          <Button variant='link'>
            Go to Top 20 Track Page <HiOutlineArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
