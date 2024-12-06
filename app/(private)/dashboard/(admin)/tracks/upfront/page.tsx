import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dashboard/tracks/upfront/top?page=1');
}
