/* eslint-disable */

type ScrapeRecord = {
    id: string;
    url: string;
    createdAt: Date;
  };

  interface UserPlanWithPlan {
  id: number;
  user_id: string | null;
  usage_tracking: {
    monthly_usage: number;
    last_reset: string;
    last_usage: string | null;
  } | null;
  plans: Plan;
}

interface Plan {
  id: number;
  name: string;
  description: string | null;
  max_usage: number;
}

interface ProductData {
    asin: string;
    author: string;
    rating: string;
    type: string;
    title: string;
    url: string;
    price: number | string;
  }

  interface PolarProductCardProps {
    product: Product
}

interface UrlInputFormProps {
  usage: UserPlanInfo['usage']
  maxUsage: UserPlanInfo['maxUsage']
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

interface PolarWebhookPayload {
    type: string;
    data: {
      created_at: string | null;
      modified_at: string | null;
      id: string | null;
      amount: number;
      currency: string;
      recurring_interval: string;
      status: string;
      current_period_start: string;
      current_period_end: string;
      cancel_at_period_end: boolean;
      canceled_at: string | null;
      started_at: string;
      ends_at: string | null;
      ended_at: string | null;
      customer_id: string;
      product_id: string;
      price_id: string;
      discount_id: string | null;
      checkout_id: string;
      customer_cancellation_reason: string | null;
      customer_cancellation_comment: string | null;
      metadata: {
        customer_id?: string;
      };
      // eslint-disable-next-line @typescript-eslint/ban-types
      custom_field_data: {};
      customer: {
        created_at: string | null;
        modified_at: string | null;
        id: string;
        // eslint-disable-next-line @typescript-eslint/ban-types
        "metadata": {};
        "email": string;
        "email_verified": boolean;
        "name": string;
        "billing_address": {
          "line1": string;
          "line2": string | null;
          "postal_code": string;
          "city": string;
          "state": string;
          "country": string
        };
        "tax_id": string | null;
        "organization_id": string | null;
        "avatar_url": string | null;
      };
      "user_id": string | null;
      "user": {
        "id": string | null;
        "email": string | null;
        "public_name": string | null;
        "avatar_url": string | null;
        "github_username": string | null
      },
      "product": {
        "created_at": string;
        "modified_at": string;
        "id": string;
        "name": string;
        "description": null;
        "is_recurring": true;
        "is_archived": false;
        "organization_id": string;
        // eslint-disable-next-line @typescript-eslint/ban-types
        "metadata": {};
        "prices": [
          {
            "created_at": string;
            "modified_at": null,
            "id": string;
            "amount_type": string;
            "is_archived": false,
            "product_id": string;
            "price_currency": string;
            "price_amount": number;
            "type": string;
            "recurring_interval": string
          }
        ],
        "benefits": [],
        "medias": [],
        "attached_custom_fields": []
      },
      "price": {
        "created_at": string;
        "modified_at": null;
        "id": string;
        "amount_type": string;
        "is_archived": false;
        "product_id": string;
        "price_currency": string;
        "price_amount": number;
        "type": string;
        "recurring_interval": string
      },
      "discount": null
    }
  }

interface CheckoutConfig {
  accessToken: string;
  successUrl: string;
  server?: "sandbox" | "production";
  metadata?: Record<string, any>;
}

interface ExtendedCheckoutConfig extends CheckoutConfig {
  accessToken: string;
  successUrl: string;
  server?: "sandbox" | "production";
  metadata?: {
    customer_id: string;
  };
}

interface UrlInputFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  usage: { used: number; limit: number } | null;
}

// Extend Polar webhook types
import type { Benefit, BenefitGrantWebhook, Checkout, Order, Organization, Pledge, Product, Subscription } from '@polar-sh/nextjs';

declare module '@polar-sh/nextjs' {
  interface WebhookTypes {
    data: {
      metadata?: {
        customer_id?: string;
      };
    } & (Benefit | BenefitGrantWebhook | Checkout | Order | Organization | Pledge | Product | Subscription)['data'];
  }
}