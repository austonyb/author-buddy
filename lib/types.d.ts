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

  interface SharedResultsState {
    isOpen: boolean;
    productData: ProductData[];
    selectedType: string;
    isLoading: boolean;
  }

  interface UserPlan {
    usage_tracking: {
      monthly_usage: number;
    };
    plans: {
      max_usage: number;
    };
  }