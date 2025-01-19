export default function Page({
	searchParams: { checkoutId, customer_session_token },
}: {
	searchParams: {
		checkoutId: string;
		customer_session_token: string;
	};
}) {
	// Checkout has been confirmed
	// Now, make sure to capture the Checkout.updated webhook event to update the order status in your system

	return (
		<div className="container max-w-6xl py-8 space-y-8">
			<div className="space-y-4">
				<h1 className="text-4xl font-bold">Thank you for your purchase!</h1>
				<p className="text-xl text-muted-foreground">
					Your checkout is now being processed. You will receive a confirmation email shortly.
				</p>
			</div>
		</div>
	);
}
