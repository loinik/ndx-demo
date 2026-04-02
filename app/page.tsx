import { fetchGame } from './actions';
import HeroClient from './components/HeroClient';

export default async function Page() {
  let initialGame = null;
  let initialError = null;

  try {
    initialGame = await fetchGame();
  } catch (err: unknown) {
    initialError = err instanceof Error ? err.message : 'Failed to load game data.';
  }

  return <HeroClient initialGame={initialGame} initialError={initialError} />;
}

