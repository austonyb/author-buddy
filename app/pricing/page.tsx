import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the perfect plan for your publishing needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-x-8 max-w-5xl mx-auto">
        {/* Lite Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Lite Plan</CardTitle>
            <CardDescription>Perfect for aspiring indie-authors</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$25</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Up to 100 ASIN lookups/month
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Email support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/sign-up" className="w-full">
              <Button className="w-full" size="lg">Get Started</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Max Plan */}
        <Card className="flex flex-col relative border-primary">
          <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle>Max Plan</CardTitle>
            <CardDescription>For serious authors and self-publishers</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$95</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Up to 500 ASIN lookups/month
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                First access to new features
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/sign-up" className="w-full">
              <Button className="w-full" size="lg" variant="default">Get Started</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I switch plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Please reach out to us via email for more information and/or assistance.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards and process payments securely through Polar.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How do I cancel my subscription?</h3>
            <p className="text-muted-foreground">
              You can cancel your subscription at any time from your account settings.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to level up your author research?</h2>
        <p className="text-muted-foreground mb-8">
          Get started today!
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="px-8">
            Sign up and subscribe
          </Button>
        </Link>
      </div>
    </div>
  )
}