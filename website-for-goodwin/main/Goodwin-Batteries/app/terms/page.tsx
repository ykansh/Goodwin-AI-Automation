import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Goodwin Batteries",
  description: "Terms and conditions of use for Goodwin Batteries.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-8">Terms &amp; Conditions</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground dark:text-muted-foreground mb-8">
          Welcome to Goodwin Batteries. These terms and conditions outline the rules and regulations for the use of Goodwin Batteries&apos; Website, located at goodwinbatteries.in.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Goodwin Batteries if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property Rights</h2>
        <p>Unless otherwise stated, Goodwin Batteries and/or its licensors own the intellectual property rights for all material on Goodwin Batteries. All intellectual property rights are reserved. You may access this from Goodwin Batteries for your own personal use subjected to restrictions set in these terms and conditions.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Product Information and Specifications</h2>
        <p>While we strive to provide accurate product information, specifications, and descriptions, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free. Battery specifications such as AH, CCA, and dimensions may be updated without prior notice.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Warranty Limitations</h2>
        <p>All battery warranties are subject to the specific terms outlined in the warranty card provided at the time of purchase. Warranty claims must be processed through authorized Goodwin Batteries dealers or service centers. Digital warranty registration on this site is for record-keeping and does not supersede the physical warranty terms.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Dealer and Distributor Enquiries</h2>
        <p>Submitting an enquiry via our &quot;Become a Dealer&quot; or &quot;Become a Distributor&quot; forms does not guarantee appointment. All applications are subject to review, verification, and formal agreement by Goodwin Batteries management.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
        <p>In no event shall Goodwin Batteries, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Goodwin Batteries shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Governing Law & Jurisdiction</h2>
        <p>These Terms will be governed by and interpreted in accordance with the laws of India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Delhi for the resolution of any disputes.</p>
      </div>
    </div>
  );
}
