import { Link } from "@tanstack/react-router";

const privacySections = [
  [
    "Introduction",
    `Bikaner Bakery (“we”, “our”, “us”) respects your privacy and is committed to protecting the personal information of users who use the Bikaner Bakery mobile application.

This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our application to browse or purchase bakery and food products such as biscuits, cookies, bread, cakes, snacks, and other related items.`,
  ],
  [
    "1. Information We Collect",
    `When you use Bikaner Bakery, we may collect the following information:

Personal Information

• Name
• Mobile number
• Email address
• Profile information
• Delivery address
• City, state, and postal code

Location Information

We may collect your location or delivery location when required to:

• Determine whether delivery is available in your area.
• Show nearby delivery options.
• Help deliver your order to the correct address.

Location permission is used only when necessary for app functionality.

Order Information

When you place an order, we may collect:

• Products ordered
• Quantity
• Order amount
• Delivery address
• Order status
• Order history
• Delivery instructions

Payment Information

Payments may be processed through third-party payment providers.

Bikaner Bakery does not intentionally store sensitive payment information such as your complete debit/credit card number, CVV, UPI PIN, or banking password.

Payment providers may collect and process information according to their own privacy policies.

Device and Technical Information

We may automatically collect certain information such as:

• Device type
• Operating system
• App version
• Device identifiers
• IP address
• Crash logs
• Diagnostic information
• App usage information

This information may be used to improve app performance, security, and reliability.`,
  ],
  [
    "2. How We Use Your Information",
    `We may use your information to:

• Create and manage your account.
• Process and deliver your orders.
• Contact you regarding your orders.
• Provide customer support.
• Show relevant products and services.
• Process payments.
• Maintain order history.
• Detect fraud or misuse.
• Improve the Bikaner Bakery application.
• Fix bugs and technical problems.
• Send important service-related notifications.
• Send offers or promotional notifications where permitted.`,
  ],
  [
    "3. Delivery Information",
    `Your name, phone number, delivery address, and order information may be shared with authorized delivery personnel when necessary to complete your order.

Delivery personnel should only use this information for fulfilling the relevant delivery.`,
  ],
  [
    "4. Third-Party Services",
    `Bikaner Bakery may use third-party services for features such as:

• Payment processing
• Authentication
• Cloud database and storage
• Push notifications
• Analytics
• Crash reporting
• Maps and location services

These third-party services may collect information necessary to provide their functionality and are governed by their respective privacy policies.`,
  ],
  [
    "5. Firebase and Cloud Services",
    `The application may use Firebase or other cloud services for features such as authentication, database storage, notifications, analytics, and crash reporting.

Information may be securely transmitted to and stored on servers operated by these service providers.`,
  ],
  [
    "6. Cookies and Similar Technologies",
    `If any web-based features or third-party services are used within the application, cookies or similar technologies may be used to provide functionality, improve performance, and understand usage.`,
  ],
  [
    "7. How We Share Information",
    `We do not sell or rent your personal information.

We may share information only when reasonably necessary with:

• Delivery partners
• Payment processors
• Cloud service providers
• Technology and analytics providers
• Government or legal authorities when required by law

We only share information necessary for providing or protecting our services.`,
  ],
  [
    "8. Data Security",
    `We take reasonable technical and organizational measures to protect user information against unauthorized access, loss, misuse, alteration, or disclosure.

However, no method of electronic storage or internet transmission can be guaranteed to be completely secure.`,
  ],
  [
    "9. Data Retention",
    `We may retain personal information for as long as necessary to:

• Provide our services.
• Maintain transaction and order records.
• Resolve disputes.
• Prevent fraud.
• Meet legal or regulatory requirements.

Information that is no longer required may be deleted or anonymized where reasonably possible.`,
  ],
  [
    "10. Account and Data Deletion",
    `Users may request deletion of their account and associated personal information.

To request deletion, users can contact us using the contact information provided below.

Certain information may still be retained where required for legal, accounting, fraud prevention, or transaction-record purposes.`,
  ],
  [
    "11. Children's Privacy",
    `Bikaner Bakery is intended for users who are legally permitted to purchase and order products through the application.

We do not knowingly collect personal information from children in violation of applicable law.

If we become aware that personal information belonging to a child has been collected improperly, we will take reasonable steps to delete it.`,
  ],
  [
    "12. Notifications and Promotions",
    `With appropriate permission, Bikaner Bakery may send notifications regarding:

• Order confirmations
• Order status updates
• Delivery updates
• New products
• Discounts
• Offers and promotions

Users may disable promotional notifications through their device settings where applicable.`,
  ],
  [
    "13. Your Rights",
    `Depending on applicable laws, you may have the right to:

• Access your personal information.
• Correct inaccurate information.
• Request deletion of your information.
• Withdraw certain permissions.
• Disable location access.
• Disable notifications.

Some permissions can be managed directly through your device settings.`,
  ],
  [
    "14. Changes to This Privacy Policy",
    `We may update this Privacy Policy from time to time to reflect changes in the application, our services, legal requirements, or business practices.

Any updated Privacy Policy will be made available through the application or the website where this policy is hosted.`,
  ],
  [
    "15. Contact Us",
    `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:

App Name: Bikaner Bakery
Email: bikanerbakeryhsr@gmail.com

By using Bikaner Bakery, you acknowledge that you have read and understood this Privacy Policy.`,
  ],
];

const termsSections = [
  [
    "Orders and availability",
    "Product availability, prices and delivery estimates may change. We may cancel or adjust an order when an item is unavailable or an error is identified.",
  ],
  [
    "Bulk requests",
    "A large quantity request is a request for a quotation or callback, not a confirmed order. Final pricing and fulfilment are confirmed by our team.",
  ],
  [
    "Payments and delivery",
    "Payments, delivery charges and applicable taxes are shown during checkout. Delivery is subject to serviceability of the selected address.",
  ],
  [
    "Acceptable use",
    "You must provide accurate information and use the service only for lawful purposes. We may suspend accounts that misuse the service.",
  ],
];

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacySections : termsSections;
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions";
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-2xl border bg-background p-6 shadow-sm sm:p-10">
        <div className="mb-8 border-b pb-6">
          <p className="text-sm font-medium text-primary">Bikaner Biscuit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 11, 2026
          </p>
        </div>
        <div className="space-y-7 text-sm leading-6 text-muted-foreground">
          {sections.map(([heading, text]) => (
            <section key={heading}>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {heading}
              </h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
        <footer className="mt-10 flex gap-4 border-t pt-5 text-sm">
          <Link
            to="/privacy-policy"
            className={
              isPrivacy
                ? "font-semibold text-foreground"
                : "text-primary hover:underline"
            }
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-and-conditions"
            className={
              !isPrivacy
                ? "font-semibold text-foreground"
                : "text-primary hover:underline"
            }
          >
            Terms & Conditions
          </Link>
        </footer>
      </article>
    </main>
  );
}
