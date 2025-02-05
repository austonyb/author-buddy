'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const CookieConsent = dynamic(
  () => import('react-cookie-consent').then((mod) => mod.default),
  { ssr: false }
);

export default function CookieConsentBanner() {
    return (
        <CookieConsent
            buttonText="Accept All Cookies"
            declineButtonText="Decline"
            enableDeclineButton
            style={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "hsl(var(--foreground))"
            }}
            buttonStyle={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "6px",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer"
            }}
            declineButtonStyle={{
                background: "transparent",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                marginRight: "8px"
            }}
            expires={365}
            containerClasses="fixed bottom-4 mx-auto max-w-[90%] left-0 right-0 rounded-lg shadow-lg"
        >
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All Cookies", you consent to our use of cookies. We collect and process personal data as described in our{" "}
            <Link href="/terms-conditions" className="font-medium underline underline-offset-4 hover:text-primary">
                Terms and Conditions
            </Link>
            . You can manage or withdraw your consent at any time.
        </CookieConsent>
    );
}