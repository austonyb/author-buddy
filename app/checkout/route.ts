import { Checkout } from "@polar-sh/nextjs";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ExtendedCheckoutConfig } from "@/lib/types";

export const GET = async () => {
	const supabase = await createClient();

	const { data: { session } } = await supabase.auth.getSession();
	
	if (!session?.user) {
		// Redirect to login if no session
		redirect('/login');
	}

	return Checkout({
		accessToken: process.env.POLAR_ACCESS_TOKEN!,
		successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation`,
		server: "sandbox", // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
		metadata: {
			customer_id: session.user.id,
		},
	} as ExtendedCheckoutConfig);
};
