import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Goodwin Batteries",
  description: "Privacy policy and data protection guidelines for Goodwin Batteries.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground dark:text-muted-foreground mb-8">
          At Goodwin Batteries, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
        <p>We may collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products, participating in activities on the Website, or otherwise contacting us.</p>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Personal Details:</strong> Name, email address, phone number, and physical address.</li>
          <li><strong>Vehicle & Product Information:</strong> Battery serial numbers, vehicle make/model for warranty registration.</li>
          <li><strong>Dealer/Distributor Applications:</strong> Business details, GST number, PAN, and territory requirements.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use personal information collected via our Website for a variety of business purposes described below:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>To facilitate account creation and logon process.</li>
          <li>To fulfill and manage your orders, warranty registrations, and dealer enquiries.</li>
          <li>To send administrative information to you regarding our products, services, and new feature information.</li>
          <li>To protect our Services and ensure fraud prevention.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Sharing and Disclosure</h2>
        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may share your data with authorized Goodwin Battery dealers and service centers strictly for the purpose of fulfilling your service requests or warranty claims.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
        <p>We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
        <p>If you have questions or comments about this policy, you may contact our Data Protection Officer by email at <strong>customercare@goodwinbatteries.in</strong>, or by post to:</p>
        <address className="bg-surface p-6 rounded-lg border border-border mt-4 not-italic">
          <strong>Goodwin Batteries</strong><br />
          Shop No. 51, Gokhale Market,<br />
          Opposite Tis Hazari Court,<br />
          Delhi – 110054, India
        </address>
      </div>
    </div>
  );
}
