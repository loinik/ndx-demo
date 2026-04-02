import type { GameResponse } from '@/app/types';

export async function fetchGame(): Promise<GameResponse> {
  const key = process.env.API_KEY;

  if (!key) {
    throw new Error('API_KEY is not set. Add it to .env.local as API_KEY=your_key');
  }

  const url = `https://api.nancydrew.me/getGame?series=mystery-adventures&id=mystery-of-the-seven-keys&key=${encodeURIComponent(key)}&lang=en&screenshots=true`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GameResponse;

  if (payload.code !== 200) {
    throw new Error(`API returned code ${payload.code}`);
  }

  return payload;
}
