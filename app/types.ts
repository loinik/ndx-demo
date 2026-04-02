export type Screenshot = {
  id: number;
  title: string;
  link: string;
};

export type GameResponse = {
  id_game: number;
  ordninal: number;
  id_serie: number;
  serie_url: string;
  abbreviation: string;
  is_selling: number;
  age: number;
  ordinal?: number;
  link_steam: string;
  link_her: string;
  url: string;
  date: string;
  series_title: string;
  title: string;
  slogan: string;
  story: string;
  yt_link: string;
  features: string;
  requirements: string;
  cover: string;
  thumbnail: string;
  buy: Record<string, string>;
  screenshots: Record<string, Screenshot>;
  template: string;
  code: number;
  lang: string;
};
