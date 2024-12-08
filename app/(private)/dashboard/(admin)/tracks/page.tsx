import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dashboard/tracks/commercial/top?page=1');
}
