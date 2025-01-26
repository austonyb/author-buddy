import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Author Buddy',
  description: 'Terms and conditions for using Author Buddy',
}

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: January 26, 2025</p>

      <div className="prose prose-lg">
        <p>Welcome to Author Buddy! These Terms and Conditions (&quot;Terms&quot;) govern your use of the Author Buddy web application (the &quot;App&quot;), available at <Link href="/" className="text-blue-600 hover:text-blue-800">https://authorbuddy.app</Link>. By accessing or using the App, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the App.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using Author Buddy, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Changes to Terms</h2>
        <p>We reserve the right to update or modify these Terms at any time without prior notice. Any changes will be effective immediately upon posting on the App. Your continued use of the App following the posting of revised Terms constitutes your acceptance of those changes.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Registration:</strong> You may need to create an account to use certain features of the App. You agree to provide accurate, complete, and up-to-date information during registration.</li>
          <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access or use of your account.</li>
          <li><strong>Eligibility:</strong> By using the App, you affirm that you are at least 13 years old. If you are under 18, you must have parental or guardian consent to use the App.</li>
        </ul>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violate any applicable laws or regulations.</li>
          <li>Submit false, misleading, or inappropriate content.</li>
          <li>Engage in activities that could harm, disable, or impair the App&apos;s functionality.</li>
          <li>Attempt to gain unauthorized access to the App or its related systems.</li>
        </ul>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Content Ownership</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>User Content:</strong> Any content you submit, post, or display on the App remains your property. By submitting content, you grant Author Buddy a non-exclusive, royalty-free, worldwide license to use, reproduce, and display your content for the operation and promotion of the App.</li>
          <li><strong>App Content:</strong> All content provided by Author Buddy, including text, graphics, and software, is the property of Author Buddy or its licensors. You may not reproduce, distribute, or create derivative works from this content without prior written permission.</li>
        </ul>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Use of the App</h2>
        <p>The App allows users to submit a URL of an author page on Amazon. The App processes this URL to extract all associated ASINs and provides the results in a spreadsheet format. Users can sort and/or download the results. By using the App, you agree that the data you submit and retrieve will be used in compliance with applicable laws and these terms of service.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Collection and Privacy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Data Collected:</strong> The App collects and processes URLs of author pages submitted by users and the resulting ASINs. We also use Vercel Analytics for web analytics and Google for authentication purposes.</li>
          <li><strong>Data Storage:</strong> All data collected by the App is stored in the United States. By using the App, you consent to the transfer, storage, and processing of your data in the United States.</li>
          <li><strong>Privacy Policy:</strong> Your use of the App is also governed by our Privacy Policy, which explains how we collect, use, and share your personal information. By using the App, you consent to our data practices.</li>
        </ul>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Third-Party Services</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Analytics and Authentication:</strong> The App utilizes Vercel Analytics for web analytics and Google for authentication purposes. By using the App, you agree to their respective terms and privacy policies.</li>
          <li><strong>Payments:</strong> Payments, if applicable, are processed through a third-party provider, Polar. Author Buddy does not store or process payment information directly. By making a payment, you agree to Polar&apos;s terms and conditions and privacy policy.</li>
        </ul>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Third-Party Links</h2>
        <p>The App may contain links to third-party websites or services. These links are provided for your convenience, and Author Buddy is not responsible for the content or practices of these third-party sites.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Disclaimer of Warranties</h2>
        <p>The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the App will be error-free or uninterrupted.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Author Buddy and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from your use of the App.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Termination</h2>
        <p>We reserve the right to suspend or terminate your access to the App at any time, with or without cause, and without prior notice.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
        <p>These Terms are governed by and construed in accordance with the laws of the State of Utah and the United States, without regard to its conflict of law principles.</p>
        
        <hr className="my-8" />
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Us</h2>
        <p>If you have any questions or concerns about these Terms, please contact us at: [Insert Contact Email]</p>
        
        <hr className="my-8" />
        
        <p>Thank you for choosing Author Buddy! We hope you enjoy using our App.</p>
      </div>
    </div>
  )
}