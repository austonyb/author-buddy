import type { ReadonlyURLSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
    searchParams?: { [key: string]: string | string[] | undefined };
};

function ConfirmationContent({ checkoutId, sessionToken }: { checkoutId: string, sessionToken: string }) {
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

export default async function Page({ searchParams }: Props) {
    // Await searchParams to satisfy Next.js requirements
    const params = await Promise.resolve(searchParams);
    const checkoutId = params?.checkoutId as string;
    const customer_session_token = params?.customer_session_token as string;

    if (!checkoutId || !customer_session_token) {
        return <div>Missing required parameters</div>;
    }

    // Checkout has been confirmed
    // Now, make sure to capture the Checkout.updated webhook event to update the order status in your system

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmationContent 
                checkoutId={checkoutId} 
                sessionToken={customer_session_token}
            />
        </Suspense>
    );
}
