// Mock news data to avoid API key issues
const mockNewsData = [
  {
    source: { id: 'forex-news', name: 'Forex News' },
    author: 'Trading Analyst',
    title: 'EUR/USD Reaches New Weekly High Amid ECB Policy Speculation',
    description: 'The Euro strengthened against the Dollar as markets anticipate potential ECB policy changes in the upcoming meeting.',
    url: 'https://example.com/news/1',
    urlToImage: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
    publishedAt: new Date().toISOString(),
    content: 'European Central Bank policy speculation drives EUR/USD higher...'
  },
  {
    source: { id: 'market-watch', name: 'Market Watch' },
    author: 'Financial Reporter',
    title: 'Gold Prices Surge on Safe Haven Demand',
    description: 'Gold futures climb as investors seek safe haven assets amid global economic uncertainty.',
    url: 'https://example.com/news/2',
    urlToImage: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    content: 'Gold prices continue their upward trajectory as global tensions rise...'
  },
  {
    source: { id: 'trading-central', name: 'Trading Central' },
    author: 'Market Strategist',
    title: 'USD/JPY Technical Analysis: Key Support Levels to Watch',
    description: 'Technical analysis reveals critical support and resistance levels for the USD/JPY currency pair.',
    url: 'https://example.com/news/3',
    urlToImage: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    content: 'USD/JPY faces key technical levels as traders watch for breakout signals...'
  }
];

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export const getNews = async (query: string = 'forex'): Promise<Article[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data filtered by query if needed
  return mockNewsData.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.description.toLowerCase().includes(query.toLowerCase()) ||
    query === 'forex' // Default query returns all articles
  );
};
