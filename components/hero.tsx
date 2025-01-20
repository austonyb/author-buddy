// React and Next.js imports
import Link from "next/link";
import Image from "next/image";

// Third-party library imports
import Balancer from "react-wrap-balancer";

// Local component imports
import { Section, Container } from "@/components/craft";

// Asset imports
import Logo from "@/public/Logo.jpg";

const Hero = () => {
  return (
    <Section>
      <Container className="flex flex-col items-center text-center">
        <Image
          src={Logo}
          width={172}
          height={72}
          alt="Company Logo"
          className="not-prose mb-6 dark:invert md:mb-8 rounded-[10px]"
        />
        <h1 className="!mb-0">
          <Balancer>
            Welcome to{" "}
            <span className="font-bold text-blue-400">AuthorBuddy</span>,
            welcome to saving time.
          </Balancer>
        </h1>
        <h3 className="text-muted-foreground">
          <Balancer>
            Your one stop shop for scraping and analyzing data for marketing
            your books.
          </Balancer>
        </h3>
        <Link
          href="https://youtu.be/i6wBy_oxgnM"
          className="mt-4 text-md font-medium hover:text-gray-500 underline decoration-2 underline-offset-4"
        >
          Watch a tutorial →
        </Link>
        <div className="not-prose mt-6 flex gap-2 md:mt-12">
          <Link 
            href="/sign-in" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Get Started →
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default Hero;
