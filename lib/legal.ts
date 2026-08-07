import { ENV } from "@/lib/env";

/**
 * The three public policy documents, kept as data so all three pages share one
 * renderer and one voice. They describe what this codebase actually does — the
 * storage list in the cookie policy, for instance, is the set of keys the app
 * really writes — so anything changed here has to be changed in the app too.
 *
 * Written for Ghana: the Data Protection Act, 2012 (Act 843) is the governing
 * privacy statute, and the payment methods listed are the ones the checkout
 * offers.
 */

export interface LegalSection {
  heading: string;
  /** Rendered as paragraphs, in order. */
  body?: string[];
  /** Rendered as a bulleted list after the paragraphs. */
  bullets?: string[];
}

export interface LegalDocument {
  slug: "terms" | "privacy" | "cookies";
  title: string;
  /** Used for the page description and the card blurb. */
  description: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
}

/** Changing a document's text means changing this date with it. */
const UPDATED = "6 August 2026";

export const TERMS_DOCUMENT: LegalDocument = {
  slug: "terms",
  title: "Terms & conditions",
  description:
    "The agreement between you and Tormame when you browse, order or pay through our app and website.",
  updated: UPDATED,
  intro: [
    "These terms apply every time you use the Tormame app, website or any of our ordering services. By placing an order you accept them, so please read them before you do.",
    `If anything here is unclear, write to us at ${ENV.CONTACT_EMAIL} before you order.`,
  ],
  sections: [
    {
      heading: "1. Who we are and what we do",
      body: [
        "Tormame is an online marketplace. We connect you with restaurants, shops, pharmacies and other vendors near you, take your order, pass it to the vendor, and arrange delivery to the address you give us.",
        "We are not the manufacturer, preparer or seller of the items you order. The vendor is. We are responsible for the ordering, payment and delivery service we provide, and for dealing fairly with you when something goes wrong.",
      ],
    },
    {
      heading: "2. Your account",
      body: [
        "You need an account to place an order. You must give us a phone number you control, keep your details accurate, and keep your sign-in code to yourself.",
        "You are responsible for orders placed from your account. Tell us straight away if you think someone else is using it.",
        "You must be old enough to enter a contract under Ghanaian law to hold an account. Some items, where the vendor sells them, may carry their own age restrictions.",
      ],
    },
    {
      heading: "3. Placing an order",
      body: [
        "When you place an order you are making an offer to buy from the vendor. The order is accepted when the vendor confirms it. Until then it can be declined, most often because an item has run out or the vendor has closed.",
        "We show vendor menus, prices and opening hours as the vendor gives them to us. Occasionally an item is unavailable after you have ordered; when that happens the vendor or our support team will contact you to substitute or refund it.",
      ],
    },
    {
      heading: "4. Prices, fees and payment",
      body: [
        "Item prices are set by the vendor. Delivery fees depend on the vendor and your delivery address, and are shown before you pay. Any service charge is shown separately on the checkout screen. The total you see before confirming is the total you pay.",
        "We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Cash, Visa and Mastercard. Card and mobile-money payments are processed by Paystack; we never see or store your full card number or your mobile-money PIN.",
        "If a payment is authorised but the order cannot be fulfilled, the amount is returned to the account it came from.",
      ],
    },
    {
      heading: "5. Delivery",
      body: [
        "Give us a delivery address someone can find, and stay reachable on the number on your account. Delivery times shown in the app are estimates and depend on the vendor, traffic and weather.",
        "If nobody can be reached at the address and the courier has waited a reasonable time, the order may be returned to the vendor. Food orders returned this way cannot usually be refunded.",
      ],
    },
    {
      heading: "6. Cancellations and refunds",
      body: [
        "You can cancel free of charge until the vendor starts preparing your order. After that, a cancellation may be charged in full, because the vendor has already spent time and ingredients on it.",
        "If your order arrives damaged, incomplete, or is never delivered, contact us within 24 hours with your order number and, where you can, a photograph. We will investigate with the vendor and courier and put it right with a refund, a redelivery or a credit, depending on what happened.",
        "Refunds go back to the payment method you used. Mobile-money and card refunds usually take between one and ten working days to appear, depending on your provider.",
      ],
    },
    {
      heading: "7. Using the service properly",
      body: ["When you use Tormame you agree not to:"],
      bullets: [
        "place orders you do not intend to pay for or receive",
        "abuse, threaten or discriminate against vendors, couriers or our staff",
        "misuse promotional codes, or open multiple accounts to claim them",
        "copy, scrape or resell any part of the service, or interfere with how it runs",
      ],
    },
    {
      heading: "8. Vendors and partners",
      body: [
        `Businesses that want to sell on Tormame apply through our vendor site at ${ENV.VENDOR_URL}. A separate partner agreement governs that relationship; these terms cover customers.`,
      ],
    },
    {
      heading: "9. Our responsibility to you",
      body: [
        "We take reasonable care to keep the service running and to describe vendors and items accurately, but we do not promise the service will be uninterrupted or free of errors.",
        "We are responsible for loss you suffer as a direct result of our failure to provide the service with reasonable care and skill. We are not responsible for the quality, safety or legality of items a vendor sells, for a vendor's own delays, or for losses we could not reasonably have foreseen.",
        "Nothing in these terms limits any right you have under Ghanaian consumer law that cannot lawfully be limited.",
      ],
    },
    {
      heading: "10. Your privacy",
      body: [
        "How we collect and use your personal data is set out in our privacy policy, and the storage we use in your browser is set out in our cookie policy. Both form part of these terms.",
      ],
    },
    {
      heading: "11. Changes to these terms",
      body: [
        "We may update these terms as the service changes. The date at the top of this page shows when it was last updated. Continuing to use Tormame after a change means you accept the updated terms; the terms in force when you placed an order are the ones that apply to that order.",
      ],
    },
    {
      heading: "12. Law and disputes",
      body: [
        "These terms are governed by the laws of the Republic of Ghana, and the courts of Ghana have jurisdiction over any dispute.",
        `Talk to us first. Most problems are settled the same day at ${ENV.CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const PRIVACY_DOCUMENT: LegalDocument = {
  slug: "privacy",
  title: "Privacy policy",
  description:
    "What personal data Tormame collects, why we collect it, who we share it with, and the rights you have over it.",
  updated: UPDATED,
  intro: [
    "This policy explains what we do with your personal data when you use Tormame. We collect what an ordering service needs to work, and nothing that only exists to be sold on.",
    "We handle personal data in line with the Data Protection Act, 2012 (Act 843) of Ghana.",
  ],
  sections: [
    {
      heading: "1. What we collect",
      body: ["Depending on how you use Tormame, we hold:"],
      bullets: [
        "Account details: your name, phone number and email address.",
        "Delivery details: the addresses you save, and any note you leave for the courier.",
        "Order details: what you ordered, from whom, when, and what you paid.",
        "Payment details: the method used and the reference our payment processor returns. We never receive your full card number, your card's security code or your mobile-money PIN.",
        "Support messages: what you tell us when you contact us about an order.",
        "Technical data: device type, browser, approximate location derived from your address, and error reports that tell us when something broke.",
      ],
    },
    {
      heading: "2. Why we use it",
      bullets: [
        "To take, pass on and deliver your orders, and to keep you updated on them.",
        "To take payment and, where it is due, to make a refund.",
        "To answer your questions and investigate problems with an order.",
        "To keep the service secure by spotting fraudulent orders and abusive use.",
        "To improve the service, using aggregated figures rather than individual histories.",
        "To send you service messages. Marketing messages are only sent if you ask for them, and every one has a way to stop them.",
      ],
    },
    {
      heading: "3. Our legal grounds",
      body: [
        "We process your data to perform the contract you enter when you order; to meet legal obligations such as tax and accounting records; for our legitimate interests in running and securing the service; and, for anything else, on the consent you give us and can withdraw at any time.",
      ],
    },
    {
      heading: "4. Who we share it with",
      body: ["We share only what each party needs to do its job:"],
      bullets: [
        "The vendor you ordered from: your first name, order contents and delivery details.",
        "The courier delivering your order: your name, phone number and address.",
        "Paystack, our payment processor, which handles card and mobile-money transactions.",
        "Google reCAPTCHA, which checks that payment-confirmation pages are opened by a person and not a bot.",
        "Our hosting and error-reporting providers, which store data on our behalf under contract.",
        "A public authority, where the law requires us to disclose something.",
      ],
    },
    {
      heading: "5. We do not sell your data",
      body: [
        "We do not sell personal data, and we do not share it with advertising networks to profile you.",
      ],
    },
    {
      heading: "6. How long we keep it",
      body: [
        "Order and payment records are kept for as long as tax and accounting law requires. Account details are kept while your account is open and for a reasonable period afterwards in case of a dispute. Support messages are kept for two years. Anything we no longer need is deleted or anonymised.",
      ],
    },
    {
      heading: "7. Keeping it safe",
      body: [
        "Data travels over encrypted connections, access is limited to staff who need it, and payment details are handled by our payment processor rather than by us. No service can promise perfect security, but we take these obligations seriously and will tell you promptly if a breach affects you.",
      ],
    },
    {
      heading: "8. Your rights",
      body: ["Under Act 843 you can ask us to:"],
      bullets: [
        "give you a copy of the personal data we hold about you",
        "correct anything that is wrong or out of date",
        "delete data we no longer have a reason to keep",
        "stop using your data for direct marketing",
        "restrict or object to particular processing",
      ],
    },
    {
      heading: "9. Children",
      body: [
        "Tormame is not intended for children under 18. We do not knowingly collect their data; if you believe a child has given us data, contact us and we will remove it.",
      ],
    },
    {
      heading: "10. Where your data is held",
      body: [
        "Our systems and some of our providers operate outside Ghana. Where data leaves the country we require the receiving party to protect it to the standard Act 843 sets.",
      ],
    },
    {
      heading: "11. Changes and contact",
      body: [
        "We will update this policy as the service changes, and the date at the top shows when we last did.",
        `To exercise any right above, or to ask how your data is handled, write to ${ENV.CONTACT_EMAIL}. If you are not satisfied with our answer you can complain to the Data Protection Commission of Ghana.`,
      ],
    },
  ],
};

export const COOKIES_DOCUMENT: LegalDocument = {
  slug: "cookies",
  title: "Cookie policy",
  description:
    "The cookies and browser storage Tormame uses, what each one is for, and how to clear them.",
  updated: UPDATED,
  intro: [
    "This policy covers cookies and the other storage we use in your browser. Local storage works much like a cookie, so we describe both here.",
    "We use no advertising or cross-site tracking cookies.",
  ],
  sections: [
    {
      heading: "1. What we store, and why",
      body: [
        "Everything below is strictly necessary: remove it and the site stops being able to keep you signed in or remember your basket.",
      ],
      bullets: [
        "Sign-in session: keeps you signed in between visits so you do not re-enter a code on every page.",
        "Basket: remembers what you added, so it survives a refresh.",
        "Delivery address: remembers the address you chose, including the device-only address a guest sets.",
        "Onboarding: remembers the town you picked and that you have finished the introduction.",
        "Appearance: remembers whether you chose the light or dark theme.",
      ],
    },
    {
      heading: "2. Third-party cookies",
      body: [
        "Google reCAPTCHA sets its own cookies on the payment-confirmation page to tell people from bots. Google acts as an independent controller for those cookies; its own privacy terms apply to them.",
        "Paystack may set cookies on its payment pages, which are hosted on Paystack's own domain rather than ours.",
      ],
    },
    {
      heading: "3. Controlling storage",
      body: [
        "Every browser lets you clear cookies and site data, usually under privacy or site settings. Clearing ours signs you out and empties your basket; nothing else is lost, because your orders and saved addresses live on our servers and come back when you sign in.",
        "Blocking storage for this site entirely will stop sign-in from working.",
      ],
    },
    {
      heading: "4. Changes and contact",
      body: [
        "If we start using a new kind of storage we will list it here and update the date at the top.",
        `Questions about this policy go to ${ENV.CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = [
  TERMS_DOCUMENT,
  PRIVACY_DOCUMENT,
  COOKIES_DOCUMENT,
] as const;
