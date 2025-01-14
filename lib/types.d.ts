type ScrapeRecord = {
    id: string;
    url: string;
    createdAt: Date;
  };

interface ProductData {
    asin: string;
    author: string;
    rating: string;
    type: string;
    title: string;
    url: string;
    price: number | string;
  }