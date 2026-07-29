
"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";

type CustomSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
  placeholder?: string;
  keepFullListUntilSubmit?: boolean;
};

type Pet = {
  petName: string;
  petSpecies: string;
  petSex: string;
  petWeight?: string;
  petBreed: string;
};

type MemberData = {
  first: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  mobile: string;
  email: string;
  subscriptionType?: string;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  pets: Pet[];
};

type HistoryItem = {
  new_dateofaction: string;
  new_description: string;
  new_actiondetail: string | null;
};

type HistoryResponse = {
  results: HistoryItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

type HistorySortField =
  | "new_dateofaction"
  | "new_description";

type HistorySortOrder = "asc" | "desc";

type SubscriptionOption = {
  subscriptionType: string;
  subscriptionPrice: number;
};

function CustomSelect({
  label,
  value,
  options,
  onChange,
  className = "",
  hasError = false,
  placeholder = "",
  keepFullListUntilSubmit = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!keepFullListUntilSubmit) {
      setSearch(value || "");
    }
  }, [value, keepFullListUntilSubmit]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);

        if (!keepFullListUntilSubmit) {
          setSearch(value || "");
        }
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);

        if (!keepFullListUntilSubmit) {
          setSearch(value || "");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [value, keepFullListUntilSubmit]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`field-group ${className}`} ref={containerRef}>
      <label>{label}</label>

      <div className="custom-select">
        <input
          type="text"
          value={keepFullListUntilSubmit && !open ? value : search}
          placeholder={placeholder}
          className={`custom-select-trigger ${hasError ? "field-error" : ""}`}
          onFocus={() => {
            setOpen(true);
            if (keepFullListUntilSubmit) {
              setSearch("");
            }
          }}
          onClick={() => {
            setOpen(true);
            if (keepFullListUntilSubmit) {
              setSearch("");
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
        />

        <span className="custom-select-chevron" />

        {open && (
          <div className="custom-select-menu">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option === value;

                return (
                  <button
                    type="button"
                    key={option}
                    className={`custom-select-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => {
                      onChange(option);
                      setSearch(option);
                      setOpen(false);
                    }}
                  >
                    {option}
                  </button>
                );
              })
            ) : (
              <div className="custom-select-empty">
                {label === "Pet Name"
                  ? "No matching pets"
                  : "No matching products"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getApiMessage(value: any): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.message ||
      value.error ||
      value.results ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

export default function Home() {
  const [lastName, setLastName] = useState("");
  const [medication, setMedication] = useState("");

  const [status, setStatus] = useState(
    "Enter Subscription ID and Last Name"
  );
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitHtml, setSubmitHtml] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [memberLoaded, setMemberLoaded] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);

  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMobilePhone, setMemberMobilePhone] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [openingBillingPortal, setOpeningBillingPortal] = useState(false);
const [partnerName, setPartnerName] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);

  const [isError, setIsError] = useState(false);

  const [lookupErrors, setLookupErrors] = useState({
    policyId: false,
    lastName: false,
  });

  const [submitErrors, setSubmitErrors] = useState({
    medication: false,
  });

  const [medicationOptions, setMedicationOptions] = useState<string[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [medsLoadError, setMedsLoadError] = useState("");

  const selectedPet = pets.length > 0 ? pets[selectedPetIndex] : null;
  
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [petSubID, setPetSubID] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(
    []
  );

  const [historyPageNumber, setHistoryPageNumber] = useState(1);
  const [historyPageSize] = useState(10);
  const [historyTotalRecords, setHistoryTotalRecords] =
    useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const [historySortBy, setHistorySortBy] =
    useState<HistorySortField>("new_dateofaction");

  const [historySortOrder, setHistorySortOrder] =
    useState<HistorySortOrder>("asc");

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const router = useRouter();

const [loadingPrices, setLoadingPrices] = useState(false);
const [priceError, setPriceError] = useState("");
  
  const [subscriptionOptions, setSubscriptionOptions] =
    useState<SubscriptionOption[]>([]);

  const currentSubscriptionIndex = subscriptionOptions.findIndex(
    (option) => option.subscriptionType === subscriptionType
  );

  const currentSubscriptionOption =
    currentSubscriptionIndex >= 0
      ? subscriptionOptions[currentSubscriptionIndex]
      : null;

  const previousSubscriptionOption =
    currentSubscriptionIndex > 0
      ? subscriptionOptions[currentSubscriptionIndex - 1]
      : null;

  const nextSubscriptionOption =
    currentSubscriptionIndex >= 0 &&
    currentSubscriptionIndex < subscriptionOptions.length - 1
      ? subscriptionOptions[currentSubscriptionIndex + 1]
      : null;

  // At the highest tier, adding another pet keeps the current subscription rate.
  const addPetSubscriptionOption =
    nextSubscriptionOption || currentSubscriptionOption;


  async function loadSubscriptionPrices(currentPartnerName: string) {
    if (!currentPartnerName.trim()) return;

    try {
      setLoadingPrices(true);
      setPriceError("");

      const response = await fetch("/api/getprice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerName: currentPartnerName,
        }),
      });

      const data = await response.json();

      if (
        !response.ok ||
        data?.success !== true ||
        !Array.isArray(data?.subscriptionOptions)
      ) {
        throw new Error(
          data?.message || "Unable to retrieve subscription pricing."
        );
      }

      const options: SubscriptionOption[] = data.subscriptionOptions
        .filter(
          (option: any) =>
            option?.subscriptionType &&
            option?.subscriptionPrice !== null &&
            option?.subscriptionPrice !== undefined
        )
        .map((option: any) => ({
          subscriptionType: String(option.subscriptionType).trim(),
          subscriptionPrice: Number(option.subscriptionPrice),
        }));

      setSubscriptionOptions(options);
    } catch (error) {
      console.error("Subscription pricing error:", error);
      setSubscriptionOptions([]);

      setPriceError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve subscription pricing."
      );
    } finally {
      setLoadingPrices(false);
    }
  }

  async function loadHistory(
    pageNumber = historyPageNumber,
    sortBy = historySortBy,
    sortOrder = historySortOrder
  ) {
    if (!petSubID?.trim()) {
      setHistoryError(
        "A Member Subscription ID is required to retrieve history."
      );
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError("");

      const response = await fetch("/api/get-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberInsID: petSubID.trim(),
          sortBy,
          pageSize: historyPageSize,
          pageNumber,
          sortOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to retrieve history."
        );
      }

      const historyData = data as HistoryResponse;

      setHistoryItems(
        Array.isArray(historyData.results)
          ? historyData.results
          : []
      );

      setHistoryPageNumber(historyData.pageNumber || pageNumber);
      setHistoryTotalRecords(historyData.totalRecords || 0);
      setHistoryTotalPages(
        Math.max(historyData.totalPages || 1, 1)
      );
    } catch (error) {
      console.error("History lookup error:", error);

      setHistoryItems([]);
      setHistoryTotalRecords(0);
      setHistoryTotalPages(1);

      setHistoryError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openHistoryDialog() {
    const initialPage = 1;
    const initialSortBy: HistorySortField =
      "new_dateofaction";
    const initialSortOrder: HistorySortOrder = "asc";

    setHistoryOpen(true);
    setHistoryPageNumber(initialPage);
    setHistorySortBy(initialSortBy);
    setHistorySortOrder(initialSortOrder);
    setHistoryItems([]);
    setHistoryError("");

    await loadHistory(
      initialPage,
      initialSortBy,
      initialSortOrder
    );
  }

  function closeHistoryDialog() {
    setHistoryOpen(false);
    setHistoryError("");
  }

  async function changeHistoryPage(newPage: number) {
    if (
      newPage < 1 ||
      newPage > historyTotalPages ||
      historyLoading
    ) {
      return;
    }

    setHistoryPageNumber(newPage);

    await loadHistory(
      newPage,
      historySortBy,
      historySortOrder
    );
  }

  async function changeHistorySortBy(
    newSortBy: HistorySortField
  ) {
    setHistorySortBy(newSortBy);
    setHistoryPageNumber(1);

    await loadHistory(
      1,
      newSortBy,
      historySortOrder
    );
  }

  async function changeHistorySortOrder(
    newSortOrder: HistorySortOrder
  ) {
    setHistorySortOrder(newSortOrder);
    setHistoryPageNumber(1);

    await loadHistory(
      1,
      historySortBy,
      newSortOrder
    );
  }

  async function loadMedicationOptions() {
    setLoadingMeds(true);
    setMedsLoadError("");

    try {
      const res = await fetch("/api/petmedlist", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to load meds: ${res.status}`);
      }

      const data = await res.json();

      setMedicationOptions(Array.isArray(data.meds) ? data.meds : []);
    } catch (error) {
      console.error(error);
      setMedicationOptions([]);
      setMedsLoadError("Unable to load product list");
    } finally {
      setLoadingMeds(false);
    }
  }

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/oauthlogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        let loginBody = data.body || data;

        if (typeof loginBody === "string") {
          try {
            loginBody = JSON.parse(loginBody);
          } catch {
            loginBody = {};
          }
        }

        if (
          res.ok &&
          loginBody?.authorized === true &&
          loginBody?.petvantagerxPortalAccess === true
        ) {
          const oauthLastName = loginBody.lastName || "";
          const oauthPetSubID = loginBody.petSubID || "";

          const oauthPartnerName = loginBody.partnerName || "";
          setPartnerName(oauthPartnerName);
          

console.log("OAuth Partner Name:", JSON.stringify(oauthPartnerName));



          setFirstName(loginBody.firstName || "");
          setLastName(oauthLastName);
          setMemberMobilePhone(loginBody.mobilePhone || "");
          setStripeCustomerId(loginBody.stripeCustomerId || "");
          setPetSubID(oauthPetSubID);

          setAccessAllowed(true);
          setAccessMessage("");

          try {
            await handleLookup(oauthLastName, oauthPetSubID);
          } catch (lookupError) {
            console.error("Member lookup failed after OAuth access check:", lookupError);
            setStatus("Access verified, but member lookup failed.");
            setIsError(true);
          }
        } else {
          setAccessAllowed(false);
          setAccessMessage(
            loginBody?.results ||
              loginBody?.message ||
              data?.message ||
              "You are not authorized to access PetVantageRx.com."
          );
        }
      } catch (err) {
        console.error("OAuth access check failed:", err);
        setAccessAllowed(false);
        setAccessMessage(
          err instanceof Error
            ? err.message
            : "Unable to verify PetVantageRx.com access."
        );
      } finally {
        setCheckingAccess(false);
      }
    }

    checkAccess();
  }, []);

  useEffect(() => {
    loadMedicationOptions();
  }, []);

  async function handleLookup(
    lookupLastName = lastName,
    lookupPetSubID = petSubID
  ) {
    setSubmitMsg("");
    setSubmitHtml("");

    const newLookupErrors = {
      policyId: !lookupPetSubID,
      lastName: !lookupLastName,
    };

    setLookupErrors(newLookupErrors);

    if (!lookupPetSubID || !lookupLastName) {
      setStatus("Unable to retrieve Subscription ID or Last Name from login.");
      setIsError(true);
      return;
    }

    setLoadingLookup(true);
    setStatus("Checking eligibility...");
    setIsError(false);

    try {
      const res = await fetch("/api/findmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: lookupLastName,
          policyId: lookupPetSubID,
        }),
      });

      const data = await res.json();

      if (!data.found) {
        setMemberLoaded(false);
        setMemberData(null);
        setPets([]);
        setSelectedPetIndex(0);
        setStatus(data.message || "Member not found");
        setIsError(true);

        return;
      }

      const member = data.member ?? null;
      const petList = Array.isArray(member?.pets) ? member.pets : [];

      setMemberLoaded(true);
      setMemberData(member);
      setPets(petList);
      setSelectedPetIndex(0);
      setFirstName(member?.first || "");
      setLastName(lookupLastName || "");
      setMemberEmail(member?.email || "");
      setMemberMobilePhone(member?.mobile || "");
      setStripeCustomerId(member?.stripeCustomerId || "");
      setSubscriptionType(member?.subscriptionType || "");
      setSubscriptionStatus(member?.status || "");

      setMedication("");
      setSubmitErrors({ medication: false });
      setSubmitMsg("");
      setSubmitHtml("");
      setHasSubmitted(false);

      await loadMedicationOptions();

      if (petList.length > 0) {
        setStatus("Select the pet name and medication from the lists below and press Submit.");
        setIsError(false);
      } else {
        setStatus("Member found, but no pets were returned.");
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setMemberLoaded(false);
      setMemberData(null);
      setPets([]);
      setSelectedPetIndex(0);
      setStatus("Lookup failed");
      setIsError(true);
    } finally {
      setLoadingLookup(false);
    }
  }

  async function openStripePaymentMethodPortal() {
    setIsError(false);

    if (!stripeCustomerId.trim()) {
      setStatus(
        "Unable to open payment settings because the Stripe Customer ID was not returned."
      );
      setIsError(true);
      return;
    }

    if (!petSubID.trim()) {
      setStatus(
        "Unable to open payment settings because the Subscription ID is missing."
      );
      setIsError(true);
      return;
    }

    try {
      setOpeningBillingPortal(true);
      setStatus("Opening secure Stripe payment settings...");

console.log("Opening Stripe portal for:", {
  stripeCustomerId,
  memberSubID: petSubID,
  memberEmail,
});

      const response = await fetch(
        "/api/stripe/create-payment-method-portal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stripeCustomerId,
            memberSubID: petSubID,
          }),
        }
      );

      const data = await response.json();

console.log(
  "Stripe portal API response:",
  data
);

      if (!response.ok || data?.success !== true || !data?.url) {
        throw new Error(
          data?.message ||
            "Unable to open Stripe payment settings."
        );
      }

console.log(
  "Redirecting to Stripe portal:",
  {
    url: data.url,
    debug: data.debug,
  }
);

      window.location.assign(data.url);
    } catch (error) {
      console.error("Stripe portal error:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to open Stripe payment settings."
      );
      setIsError(true);
    } finally {
      setOpeningBillingPortal(false);
    }
  }

  async function handleSubmit() {
    if (!memberLoaded) {
      setStatus("Lookup member first");
      return;
    }

    const newSubmitErrors = {
      medication: !medicationOptions.includes(medication),
    };

    setSubmitErrors(newSubmitErrors);

    if (newSubmitErrors.medication) {
      setStatus("");
      setSubmitHtml("");
      setSubmitMsg("Please select a product from the list");
      setIsError(true);
      return;
    }

    setLoadingSubmit(true);
    setStatus("");
    setSubmitMsg("Submitting request to auction partners...");
    setIsError(false);
    setSubmitHtml("");

    const payload = {
      memberFirst: memberData?.first || "",
      memberLast: lastName,
      memberInsID: petSubID,

      petName: selectedPet?.petName || "",
      petSpecies: selectedPet?.petSpecies || "",
      petSex: selectedPet?.petSex || "",
      petBreed: selectedPet?.petBreed || "",
      petWeight: selectedPet?.petWeight || "",

      medicationName: medication,
    };

    try {
      const res = await fetch("/api/submitmedrequestvbm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        const html = `
          <div class="success-block">
            <div>
              <strong>
                <span style="color: #c46e3a;">✓</span> Success!
              </strong>
            </div>
            <div>Partner: ${result.company || ""}</div>
            <div>Discount: ${result.discountPCT || ""}</div>
            <div>Code: ${result.discountCode || ""}</div>
            ${
              result.partnerURL
                ? `<div><a href="${result.partnerURL}" target="_blank">Click here to apply the above Coupon Code and purchase the medication.</a></div>`
                : ""
            }
          </div>
        `;
        setSubmitHtml(html);
        setSubmitMsg("");
        setStatus("");
        setHasSubmitted(false);
        track("Pet Med Submit Success", {
          medicationName: medication,
          petSpecies: selectedPet?.petSpecies || "",
        });
      } else {
          setSubmitHtml("");

          // Use results returned by Power Automate/APIM first
          const errorMessage =
            result.results ||
            result.message ||
            result.error ||
            "Failed";

          setSubmitMsg(errorMessage);
          setStatus("");
          setIsError(true);

          track("Pet Med Submit Failed", {
            reason: errorMessage,
          });
        }
      } catch (error: any) {
        console.error(error);

        setSubmitHtml("");

        setSubmitMsg(
          error?.message ||
          "Unexpected error submitting form"
        );

        setIsError(true);
      } finally {
        setLoadingSubmit(false);
      }
  }

  if (checkingAccess) {
    return <main className="pet-page">Checking access...</main>;
  }

  if (!accessAllowed) {
    return (
      <main className="pet-page">
        <div className="pet-container">
          <h1 className="page-title">Access Denied</h1>
          <p>{accessMessage}</p>
          <a href="/auth/logout" className="contact-button">
            Log Out
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="pet-page">
      <div className="pet-container">
        <div className="logo-wrap">
          <img src="/petvantagerx logo on white.png" className="logo-image" />
        </div>

        <div className="top-links">

        <button
          type="button"
          className="contact-button"
          onClick={() => router.push("/manage-subscription")}
        >
          ⚙ Account
        </button>

          <button
            type="button"
            className="contact-button"
            onClick={openStripePaymentMethodPortal}
            disabled={openingBillingPortal || !stripeCustomerId}
            title={
              stripeCustomerId
                ? "Update credit card securely through Stripe"
                : "Stripe Customer ID is unavailable"
            }
          >
            {openingBillingPortal
              ? "Opening Payment..."
              : "💳 Update Payment"}
          </button>

          {partnerName === "Direct Registration" ? null : (
            <button
              type="button"
              className="contact-button"
              onClick={() => setFaqOpen(true)}
            >
              ❓ FAQ
            </button>
          )}

          <a
            className="contact-button"
            href={`mailto:d2csupport@petvantagerx.com?subject=${encodeURIComponent(
              `PetVantageRx Support - ${partnerName || "Unknown Partner"}`
            )}&body=${encodeURIComponent(
              `Partner: ${partnerName || "Unknown Partner"}
          Subscription ID: ${petSubID}

          Please describe your issue below:

          `
            )}`}
          >
            📧 Contact Us
          </a>

          <button
            type="button"
            onClick={openHistoryDialog}
            className="contact-button"
          >
            🕘 History
          </button>

          <a href="/auth/logout" className="contact-button">
            🔓 Log Out
          </a>
                    
        </div>

        <div className="gold-line" />

        <section className="product-section">
          <h2 className="product-title">Subscription Information</h2>

          <div className="pet-info-row">
            <div className="field-group pet-field">
              <label>Subscription ID</label>
              <input value={petSubID} readOnly className="input-short readonly-field" />
            </div>

            <div className="field-group pet-field">
              <label>Subscription Type</label>
              <input value={subscriptionType} readOnly className="input-short readonly-field" />
            </div>

            <div className="field-group pet-field">
              <label>Subscription Status</label>
              <input value={subscriptionStatus} readOnly className="input-short readonly-field" />
            </div>
          </div>

          <div className="pet-info-row member-row">
            <div className="field-group member-name-field">
              <label>Member Name</label>
              <input
                value={`${firstName} ${lastName}`}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="field-group member-email-field">
              <label>Member Email</label>
              <input
                value={memberEmail}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="field-group member-phone-field">
              <label>Member Mobile Phone</label>
              <input
                value={memberMobilePhone}
                readOnly
                className="readonly-field"
              />
            </div>
          </div>
        </section>

        <div className="gold-line section-space" />

        {memberLoaded && (
          <section className="product-section">
            <h2 className="product-title">Select Pet, Medication, and click Submit</h2>

            {memberLoaded && pets.length > 0 && (
              <div className="pet-info-row">
                <CustomSelect
                  label="Pet Name"
                  value={selectedPet?.petName || ""}
                  options={pets.map((p) => p.petName)}
                  onChange={(value) => {
                    const index = pets.findIndex((p) => p.petName === value);
                    if (index !== -1) {
                      setSelectedPetIndex(index);
                      setHasSubmitted(false);
                    }
                  }}
                  className="pet-field"
                  placeholder=""
                  hasError={false}
                  keepFullListUntilSubmit={!hasSubmitted}
                />

                <div className="field-group pet-field">
                  <label>Pet Species</label>
                  <input
                    type="text"
                    value={selectedPet?.petSpecies || ""}
                    readOnly
                    className="input-short readonly-field"
                  />
                </div>

                <div className="field-group pet-field">
                  <label>Pet Sex</label>
                  <input
                    type="text"
                    value={selectedPet?.petSex || ""}
                    readOnly
                    className="input-short readonly-field"
                  />
                </div>

                <div className="field-group pet-field">
                  <label>Pet Breed</label>
                  <input
                    type="text"
                    value={selectedPet?.petBreed || ""}
                    readOnly
                    className="input-short readonly-field"
                  />
                </div>
              </div>
            )}

            <CustomSelect
              label="Medication Name"
              value={medication}
              options={medicationOptions}
              onChange={(value) => {
                setMedication(value);
                setHasSubmitted(false);
                if (value) {
                  setSubmitErrors({ medication: false });
                }
              }}
              placeholder="Type to search products"
              className="product-group"
              hasError={submitErrors.medication}
              keepFullListUntilSubmit={!hasSubmitted}
            />

            {medsLoadError && (
              <div className="submit-message error-text">{medsLoadError}</div>
            )}

            <div className="submit-row">
              <div className="submit-line" />
              <button
                className="gold-button submit-button"
                onClick={handleSubmit}
                disabled={
                  loadingSubmit ||
                  loadingMeds ||
                  medicationOptions.length === 0
                }
              >
                {hasSubmitted ? "Submitted" : "Submit"}
              </button>
            </div>

            {submitMsg && (
              <div
                className={
                  isError ? "submit-message error-text" : "submit-message"
                }
              >
                {submitMsg}
              </div>
            )}

            {submitHtml && (
              <div
                className="submit-html"
                dangerouslySetInnerHTML={{ __html: submitHtml }}
              />
            )}

         </section>
        )}

        {historyOpen && (
          <div
            className="history-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeHistoryDialog();
              }
            }}
          >
            <div
              className="history-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-dialog-title"
            >
              <div className="history-dialog-header">
                <div>
                  <h2 id="history-dialog-title">History</h2>

                  <div className="history-member-id">
                    Subscription ID: {petSubID}
                  </div>
                </div>

                <button
                  type="button"
                  className="history-close-button"
                  onClick={closeHistoryDialog}
                  aria-label="Close History"
                >
                  ×
                </button>
              </div>

              <div className="history-controls">
                <label>
                  <span>Sort By</span>

                  <select
                    value={historySortBy}
                    onChange={(event) =>
                      changeHistorySortBy(
                        event.target.value as HistorySortField
                      )
                    }
                    disabled={historyLoading}
                  >
                    <option value="new_dateofaction">
                      Action Date
                    </option>

                    <option value="new_description">
                      Description
                    </option>
                  </select>
                </label>

                <label>
                  <span>Sort Order</span>

                  <select
                    value={historySortOrder}
                    onChange={(event) =>
                      changeHistorySortOrder(
                        event.target.value as HistorySortOrder
                      )
                    }
                    disabled={historyLoading}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              </div>

              {historyError && (
                <div className="history-error">
                  {historyError}
                </div>
              )}

              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Action Date</th>
                      <th>Description</th>
                      <th>Action Detail</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="history-message-cell"
                        >
                          Loading history...
                        </td>
                      </tr>
                    ) : historyItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="history-message-cell"
                        >
                          No history records were found.
                        </td>
                      </tr>
                    ) : (
                      historyItems.map((item, index) => (
                        <tr
                          key={`${item.new_dateofaction}-${item.new_description}-${index}`}
                        >
                          <td>{item.new_dateofaction || "—"}</td>

                          <td>{item.new_description || "—"}</td>

                          <td>
                            {item.new_actiondetail?.trim() || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="history-dialog-footer">
                <div className="history-record-count">
                  {historyTotalRecords === 1
                    ? "1 record"
                    : `${historyTotalRecords} records`}
                </div>

                <div className="history-pagination">
                  <button
                    type="button"
                    onClick={() =>
                      changeHistoryPage(historyPageNumber - 1)
                    }
                    disabled={
                      historyLoading || historyPageNumber <= 1
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {historyPageNumber} of{" "}
                    {historyTotalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      changeHistoryPage(historyPageNumber + 1)
                    }
                    disabled={
                      historyLoading ||
                      historyPageNumber >= historyTotalPages
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>


    </main>
  );
}

const navy = "#1B2A41";

const logoutLinkStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid #d9e2df",
  backgroundColor: "#ffffff",
  color: navy,
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
}