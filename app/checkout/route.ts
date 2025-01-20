import { Checkout } from "@polar-sh/nextjs";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
	const { searchParams } = new URL(request.url);
	const productId = searchParams.get('productId');
	const email = searchParams.get('email');
	
	if (!email) {
		return NextResponse.json(
			{ error: 'Email is required' },
			{ status: 400 }
		);
	}

	if (!productId) {
		return NextResponse.json(
			{ error: 'Product ID is required' },
			{ status: 400 }
		);
	}

	const config = {
		accessToken: process.env.POLAR_ACCESS_TOKEN!,
		successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?checkoutId={CHECKOUT_ID}&customer_session_token={CUSTOMER_SESSION_TOKEN}`,
		server: "sandbox",
		metadata: {
			customer_id: email,
			product_id: productId,
			email: email,
		},
	};

	return Checkout(config as any)(request);
};
