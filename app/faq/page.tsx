"use client";

import Image from "next/image";
import Link from "next/link";

const faqs = [
  {
    question: "What are the key benefits of our discount program?",
    answer: (
      <>
        <p>
          Transparent prices for pet parents. Save up to 50% compared with
          veterinary clinic prices.
        </p>
        <p>
          PetVantageRx works with reputable pet pharmacies that negotiate
          directly with manufacturers, allowing us to pass savings on to pet
          parents, plus an additional discount.
        </p>
        <p>
          Members receive savings on prescription pet medications, trusted
          human equivalents, vaccines, supplements, flea and tick treatments,
          heartworm prevention, and other everyday pet care products.
        </p>
      </>
    ),
  },
  {
    question: "Are your products the same ones sold at my veterinarian’s office?",
    answer: (
      <>
        <p>
          Yes. The medications and products available through PetVantageRx are
          the same trusted products available through many veterinary clinics,
          at lower prices.
        </p>
        <p>
          Our pharmacy partners are fully accredited and source products from
          manufacturers or licensed distributors. Products are stored and
          handled according to applicable standards.
        </p>
      </>
    ),
  },
  {
    question: "What does the subscription cost?",
    answer: (
      <p>
        The subscription costs $4.99 per month for your first pet and $3.99 per
        month for each additional pet.
      </p>
    ),
  },
  {
    question: "How do I enroll?",
    answer: (
      <>
        <p>To enroll:</p>
        <ul>
          <li>Visit PetVantageRx.com.</li>
          <li>Register yourself and your pet or pets.</li>
          <li>Complete your subscription purchase through the member portal.</li>
        </ul>
        <p>
          Once payment is processed, you and your pet or pets will be enrolled
          in the program.
        </p>
      </>
    ),
  },
  {
    question: "Will my subscription automatically renew each month or year?",
    answer: (
      <>
        <p>
          Yes. You can choose a monthly or annual subscription. You will be
          charged for the first term when you sign up, and the subscription will
          automatically renew using the payment method on file.
        </p>
        <p>
          To avoid the next charge, cancel before the current subscription term
          ends. After cancellation, benefits continue through the end of the
          paid term.
        </p>
      </>
    ),
  },
  {
    question: "Are there any additional savings opportunities?",
    answer: (
      <>
        <p>
          Yes. Eligible products may qualify for additional savings through a
          pharmacy partner’s Auto-Ship program.
        </p>
        <ul>
          <li>5% off prescription medications</li>
          <li>10% off over-the-counter medications</li>
        </ul>
      </>
    ),
  },
  {
    question: "Once I subscribe, how do I access the program?",
    answer: (
      <>
        <p>
          After your subscription purchase, you will receive an email and text
          message confirming your subscription and discount code.
        </p>
        <p>
          You will then be directed to the medication and product search page,
          where you can find the products prescribed for your pet and access
          discounted pricing.
        </p>
      </>
    ),
  },
  {
    question: "Can I use my discount code directly on a pharmacy partner’s website?",
    answer: (
      <>
        <p>
          No. You must access the pharmacy partner through the PetVantageRx Pet
          Parent Portal, Welcome Email, or Welcome Text so that your discount is
          applied correctly.
        </p>
      </>
    ),
  },
  {
    question: "What is your refund and cancellation policy?",
    answer: (
      <>
        <p>
          You can cancel at any time by logging into your Pet Parent account and
          selecting Cancel Subscription. Subscription fees are non-refundable
          and are not prorated except where the Terms and Conditions state
          otherwise.
        </p>
        <p>
          After cancellation, benefits remain available through the end of the
          current paid subscription term.
        </p>
      </>
    ),
  },
  {
    question: "I forgot my password. What should I do?",
    answer: (
      <p>
        Go to PetVantageRx.com, select Sign In, and then select Forgot Password.
        Enter the email address associated with your account to receive reset
        instructions.
      </p>
    ),
  },
  {
    question: "How do I change my password?",
    answer: (
      <p>
        After signing in, go to Account & Orders and select Profile. You can
        update and save your password there.
      </p>
    ),
  },
  {
    question: "Where can I see the subscription Terms and Conditions?",
    answer: (
      <p>
        The PetVantageRx Subscription Plan Terms and Conditions are displayed
        below as part of registration and can also be published at
        PetVantageRx.com/terms.
      </p>
    ),
  },
];

export default function FAQPage() {
  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <Image
            src="/petvantagerx logo on white.png"
            alt="PetVantageRx"
            width={350}
            height={130}
            priority
            style={{ height: "auto" }}
          />
          <h1 style={titleStyle}>Frequently Asked Questions</h1>
        </header>

        <div style={accentLineStyle} />

        <div style={topLinkRowStyle}>
          <Link href="/" style={topLinkButtonStyle}>
            Back to Registration
          </Link>
        </div>

        <section style={cardStyle}>
          <div style={faqListStyle}>
            {faqs.map((faq) => (
              <details key={faq.question} style={faqItemStyle}>
                <summary style={faqQuestionStyle}>{faq.question}</summary>
                <div style={faqAnswerStyle}>{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const navy = "#1B2A41";
const emerald = "#3d7a4a";
const softBg = "#f7faf9";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: softBg,
  fontFamily: "Arial, sans-serif",
  padding: "32px 16px",
  color: navy,
};

const shellStyle: React.CSSProperties = {
  maxWidth: 850,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 18,
  padding: "30px",
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(27, 42, 65, 0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 4,
  fontSize: 34,
  fontFamily: "Georgia, serif",
  color: navy,
};

const accentLineStyle: React.CSSProperties = {
  height: 5,
  width: "100%",
  background: emerald,
  borderRadius: 999,
  margin: "18px 0 20px",
};

const topLinkRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 20,
};

const topLinkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 42,
  padding: "10px 18px",
  borderRadius: 10,
  backgroundColor: emerald,
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  boxShadow: "0 4px 12px rgba(4, 120, 87, 0.25)",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2df",
  borderRadius: 18,
  padding: 26,
  marginBottom: 28,
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 24px rgba(27, 42, 65, 0.06)",
};

const faqListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const faqItemStyle: React.CSSProperties = {
  border: "1px solid #d9e2df",
  borderRadius: 10,
  backgroundColor: "#fbfdfc",
  overflow: "hidden",
};

const faqQuestionStyle: React.CSSProperties = {
  padding: "14px 16px",
  cursor: "pointer",
  fontWeight: 700,
  color: navy,
  fontSize: 15,
};

const faqAnswerStyle: React.CSSProperties = {
  padding: "0 16px 14px",
  color: "#374151",
  fontSize: 14,
  lineHeight: 1.6,
};