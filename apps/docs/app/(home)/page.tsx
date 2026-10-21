import { redirect } from 'next/navigation';

// The docs are the whole site; the marketing site is a separate project.
export default function HomePage() {
  redirect('/docs');
}
