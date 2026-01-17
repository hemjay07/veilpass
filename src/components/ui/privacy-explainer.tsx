"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PrivacyItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: string;
}

const privacyItems: PrivacyItem[] = [
  {
    id: "data-storage",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13 7H7v6h6V7z" />
        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
      </svg>
    ),
    title: "Where is my data stored?",
    content:
      "Your sensitive data - including secret keys, salt values, and claim details - is generated and stored entirely on your device. The secret file you download after creating an attestation is the only place this data exists. VeilPass servers only receive cryptographic hashes and commitments, never the raw data itself.",
  },
  {
    id: "what-veilpass-sees",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    ),
    title: "What VeilPass never sees",
    content:
      "VeilPass never sees your actual identity documents, personal information, or the specific details of your compliance claims. We only receive cryptographic commitments (hashes) that mathematically prove you have certain claims without revealing what they are. Your secret file is never uploaded anywhere - it stays on your device unless you choose to share specific fields via selective disclosure.",
  },
  {
    id: "how-crypto-works",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    title: "How does the cryptography work?",
    content:
      "VeilPass uses cryptographic commitments - a technique where your claims are combined with a random secret (salt) and hashed. Think of it like a sealed envelope: anyone can verify the envelope hasn't been tampered with, but only you can reveal what's inside. When you create a disclosure, you're essentially opening the envelope for specific claims while keeping others sealed. Auditors can mathematically verify that the revealed data matches the original commitment.",
  },
  {
    id: "selective-disclosure",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    title: "What is selective disclosure?",
    content:
      "Selective disclosure means you choose exactly which claims to share and for how long. If an auditor only needs to verify your KYC status, you don't have to reveal your accredited investor status or source of funds. Each disclosure link has an expiration date and access limit you control. This is the power of privacy-preserving compliance: prove what's necessary, nothing more.",
  },
];

/**
 * PrivacyExplainer - Educational accordion section explaining VeilPass privacy model
 */
export function PrivacyExplainer() {
  return (
    <div className="max-w-2xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        {privacyItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-3">
                <span className="text-accent">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-8">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
