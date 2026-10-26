import { redirect } from 'react-router';
import { Splash } from '../components/Splash';
import { db } from '../data/db';

/** "/" sends first-time visitors to onboarding and everyone else to Discover (§9.6). */
export async function clientLoader() {
  try {
    const row = await db.settings.get('prefs');
    const onboarded =
      typeof (row?.value as { onboardedAt?: unknown } | undefined)?.onboardedAt === 'string';
    return redirect(onboarded ? '/app/discover' : '/app/welcome');
  } catch {
    return redirect('/app/welcome');
  }
}

export function HydrateFallback() {
  return <Splash />;
}

export default function Index() {
  return <Splash />;
}
