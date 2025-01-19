import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
	accessToken: process.env.POLAR_ACCESS_TOKEN!,
	successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation`,
	server: "sandbox", // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
});
