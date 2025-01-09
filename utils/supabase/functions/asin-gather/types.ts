export interface Product {
  asin: string;
  author?: string;
  rating?: string;
  type?: string;
  title?: string;
  url?: string;
  price?: string | number;
}

export interface Config {
  obfuscatedMarketplaceId: string;
  obfuscatedMerchantId: string;
  sessionId: string;
  slateToken: string;
  freshCartCsrfToken: string;
  amazonApiCsrfToken: string;
  visitId: string;
}

export interface AmazonProduct {
  asin: string;
  byLine?: {
    contributors?: { name?: string }[];
  };
  customerReviewsSummary?: {
    rating?: {
      shortDisplayString?: string;
    };
  };
  productCategory?: {
    productType?: string;
  };
  title?: {
    displayString?: string;
  };
  detailPageLinkURL?: string;
  buyingOptions?: {
    price?: {
      priceToPay?: {
        moneyValueOrRange?: {
          value?: {
            amount?: string;
          };
        };
      };
    };
  }[];
}