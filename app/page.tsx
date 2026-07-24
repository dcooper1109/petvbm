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

type ManagePet = {
  oldPetName: string;
  petName: string;
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

  const [faqOpen, setFaqOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageFirstName, setManageFirstName] = useState("");
  const [manageLastName, setManageLastName] = useState("");
  const [manageMobilePhone, setManageMobilePhone] = useState("");
  const [manageEmail, setManageEmail] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [managePets, setManagePets] = useState<ManagePet[]>([]);
  const [loadingMemberPetUpdate, setLoadingMemberPetUpdate] = useState(false);

  const [partnerName, setPartnerName] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);

  const [isError, setIsError] = useState(false);
  const [confirmCancelService, setConfirmCancelService] = useState(false);

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
  

  const [cancelServiceChecked, setCancelServiceChecked] = useState(false);
  const [removePetChecked, setRemovePetChecked] = useState(false);
  const [addPetChecked, setAddPetChecked] = useState(false);
  const [petsToRemove, setPetsToRemove] = useState<string[]>([]);

  const [newPetName, setNewPetName] = useState("");
  const [newPetSpecies, setNewPetSpecies] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetSex, setNewPetSex] = useState("");

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

  const [cancelReason, setCancelReason] = useState("");

  const router = useRouter();

  const cancellationReasons = [
    "Found Better Medication Pricing Elsewhere",
    "My Pet No Longer Requires Medication",
    "No Longer Have Pet",
    "Only Needed for a One Time Issue",
    "Product(s) Needed Frequently Out of Stock",
    "Replacing with Pet Insurance",
    "Shipping Takes Too Long",
    "Subscription Too Expensive",
    "Unable to Find Medication/Product Needed",
    "Website is Too Difficult",
    "Other",
  ];

  const [subscriptionOptions, setSubscriptionOptions] =
    useState<SubscriptionOption[]>([]);

  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [confirmNewRate, setConfirmNewRate] = useState(false);

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
          await loadSubscriptionPrices(oauthPartnerName);

          setFirstName(loginBody.firstName || "");
          setLastName(oauthLastName);
          setMemberMobilePhone(loginBody.mobilePhone || "");
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

  async function handleMemberPetUpdate() {
    setManageMessage("");

    if (!partnerName || !petSubID) {
      setManageMessage("Unable to update. Partner Name or Subscription ID is missing.");
      return;
    }

    if (!manageFirstName || !manageLastName || !manageMobilePhone) {
      setManageMessage("First Name, Last Name, and Mobile Phone are required.");
      return;
    }

    setLoadingMemberPetUpdate(true);
    setManageMessage("Updating member and pet information...");

    const payload = {
      partnerName,
      memberSubID: petSubID,
      memberFirst: manageFirstName,
      memberLast: manageLastName,
      mobilePhone: manageMobilePhone,
      pets: managePets
        .filter((pet) => pet.oldPetName || pet.petName)
        .map((pet) => ({
          oldPetName: pet.oldPetName,
          petName: pet.petName,
        })),
    };

    try {
      const res = await fetch("/api/petmemberupdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        setManageMessage(
          getApiMessage(data?.message) ||
            getApiMessage(data?.response?.message) ||
            getApiMessage(data?.response?.error) ||
            getApiMessage(data?.response) ||
            "Member and pet update failed."
        );
        setManageMessage("Update successful! Refreshing...");

        setTimeout(() => {
          handleLookup();
          setManageOpen(false);
        }, 5000);
      }

      const apiResultMessage =
        data?.body?.results ||
        data?.results ||
        data?.message ||
        "Member and pet information updated successfully.";

      setManageMessage(`${apiResultMessage} Refreshing in 5 seconds...`);

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      setManageMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error updating member and pet information."
      );
    } finally {
      setLoadingMemberPetUpdate(false);
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
  ⚙ Manage Subscr.
</button>

          <button
            type="button"
            className="contact-button"
            onClick={() => {
              setManageFirstName(firstName || "");
              setManageLastName(lastName || "");
              setManageMobilePhone(memberMobilePhone || "");
              setManageEmail(memberEmail || "");
              setManagePets(
                pets.map((pet) => ({
                  oldPetName: pet.petName || "",
                  petName: pet.petName || "",
                }))
              );

              setCancelServiceChecked(false);
              setCancelReason("");
              setRemovePetChecked(false);
              setAddPetChecked(false);
              setPetsToRemove([]);
              setNewPetName("");
              setNewPetSpecies("");
              setNewPetBreed("");
              setNewPetSex("");
              setManageMessage("");
              setManageOpen(true);
              setConfirmNewRate(false);
            }}
          >
            ⚙ Manage Subscr.
          </button>

          <button
            type="button"
            className="contact-button"
            onClick={() => setFaqOpen(true)}
          >
            ❓ FAQ
          </button>

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

        {faqOpen && (
          <div
            className="modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setFaqOpen(false);
              }
            }}
          >
            <div
              className="manage-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="faq-dialog-title"
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <h2 id="faq-dialog-title" className="product-title" style={{ margin: 0 }}>
                  Frequently Asked Questions
                </h2>

                <button
                  type="button"
                  className="dialog-close"
                  onClick={() => setFaqOpen(false)}
                  aria-label="Close Frequently Asked Questions"
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    style={{
                      border: "1px solid #d9e2df",
                      borderRadius: 10,
                      backgroundColor: "#fbfdfc",
                      overflow: "hidden",
                    }}
                  >
                    <summary
                      style={{
                        padding: "14px 16px",
                        cursor: "pointer",
                        fontWeight: 700,
                        color: navy,
                        fontSize: 15,
                      }}
                    >
                      {faq.question}
                    </summary>

                    <div
                      style={{
                        padding: "0 16px 14px",
                        color: "#374151",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {manageOpen && (
          <div className="modal-overlay">
            <div className="manage-modal">
              <h2 className="product-title">Manage Subscription</h2>

              <div className="manage-subsection">
                <h3>Update Member and Pet Names</h3>

                <div className="manage-grid">
                  <div className="field-group">
                    <label>
                      🔒 Member Subscription ID
                    </label>

                    <input
                      value={petSubID}
                      readOnly
                      className="readonly-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>First Name</label>
                    <input
                      value={manageFirstName}
                      onChange={(e) => setManageFirstName(e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label>Last Name</label>
                    <input
                      value={manageLastName}
                      onChange={(e) => setManageLastName(e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label>Mobile Phone</label>
                    <input
                      value={manageMobilePhone}
                      onChange={(e) => setManageMobilePhone(e.target.value)}
                    />
                  </div>

                  {managePets.map((pet, index) => (
                    <div className="field-group" key={`${pet.oldPetName}-${index}`}>
                      <label>Pet {index + 1} Name</label>
                      <input
                        value={pet.petName}
                        onChange={(e) => {
                          const updatedPets = [...managePets];
                          updatedPets[index] = {
                            ...updatedPets[index],
                            petName: e.target.value,
                          };
                          setManagePets(updatedPets);
                        }}
                      />
                    </div>
                  ))}
                </div>


                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button
                    type="button"
                    className="gold-button"
                    disabled={loadingMemberPetUpdate}
                    onClick={handleMemberPetUpdate}
                  >
                    {loadingMemberPetUpdate ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>

              <div className="manage-options">
                <label className="manage-option">
                  <input
                    type="checkbox"
                    checked={cancelServiceChecked}
                    disabled={removePetChecked || addPetChecked}
                    onChange={(e) => {
                      setManageMessage("");
                      const checked = e.target.checked;
                      setCancelServiceChecked(checked);

                      if (!checked) {
                        setCancelReason("");
                        setConfirmCancelService(false);
                      }

                      if (checked) {
                        setRemovePetChecked(false);
                        setAddPetChecked(false);
                        setConfirmCancelService(false);
                        setPetsToRemove([]);
                      }
                    }}
                  />
                  Cancel Service
                </label>

                <label className="manage-option">
                  <input
                    type="checkbox"
                    checked={removePetChecked}
                    disabled={cancelServiceChecked || addPetChecked}
                    onChange={(e) => {
                      setManageMessage("");
                      setConfirmNewRate(false);

                      if (pets.length <= 1) {
                        setRemovePetChecked(false);
                        setAddPetChecked(false);
                        setPetsToRemove([]);
                        setManageMessage("You cannot remove a pet when there is only one pet.");
                        return;
                      }

                      const checked = e.target.checked;

                      setRemovePetChecked(checked);
                      if (checked) {
                        setCancelServiceChecked(false);
                        setAddPetChecked(false);
                      } else {
                        setPetsToRemove([]);
                      }
                    }}
                  />
                  Remove Pet
                </label>

                <label className="manage-option">
                  <input
                    type="checkbox"
                    checked={addPetChecked}
                    disabled={cancelServiceChecked || removePetChecked}
                    onChange={(e) => {
                      setManageMessage("");
                      setConfirmNewRate(false);
                      
                      const checked = e.target.checked;

                      setAddPetChecked(checked);
                      if (checked) {
                        setCancelServiceChecked(false);
                        setRemovePetChecked(false);
                        setPetsToRemove([]);
                      }
                    }}
                  />
                  Add Pet
                </label>
              </div>

              {removePetChecked && (
                <div className="manage-subsection">
                  <h3>Remove Pet (select one)</h3>

                  <div className="remove-pet-row">
                    {pets.map((pet) => (
                      <label key={pet.petName} className="pet-checkbox-row">
                        <input
                          type="checkbox"
                          checked={petsToRemove.includes(pet.petName)}
                          onChange={(e) => {
                            setConfirmNewRate(false);

                            if (e.target.checked) {
                              // Only one pet may be removed at a time.
                              setPetsToRemove([pet.petName]);
                            } else {
                              setPetsToRemove((prev) =>
                                prev.filter((name) => name !== pet.petName)
                              );
                            }
                          }}
                        />
                        <span>{pet.petName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {addPetChecked && (
                <div className="manage-subsection">
                  <h3>Add Pet</h3>

                  <div className="manage-grid">
                    <div className="field-group">
                      <label>Pet Name *</label>
                      <input
                        value={newPetName}
                        onChange={(e) => {
                          setManageMessage("");
                          setNewPetName(e.target.value);
                        }}
                      />
                    </div>

                    <div className="field-group">
                      <label>Pet Species *</label>
                      <input
                        value={newPetSpecies}
                        onChange={(e) => {
                          setManageMessage("");
                          setNewPetSpecies(e.target.value);
                        }}
                      />
                    </div>

                    <div className="field-group">
                      <label>Pet Breed</label>
                      <input
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                      />
                    </div>

                    <div className="field-group">
                      <label>Pet Sex *</label>
                        <select
                          value={newPetSex}
                          onChange={(e) => setNewPetSex(e.target.value)}
                          className="input-short"
                        >
                        <option value="">Select Pet Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {addPetChecked && addPetSubscriptionOption && (
                <div className="manage-subsection">
                  <h3>New Subscription Rate</h3>

                  <div className="rate-change-box">
                    <div>
                      <strong>Current Subscription:</strong>{" "}
                      {currentSubscriptionOption?.subscriptionType || subscriptionType}
                      {currentSubscriptionOption && (
                        <>
                          {" — "}
                          {currentSubscriptionOption.subscriptionPrice.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <strong>New Subscription:</strong>{" "}
                      {addPetSubscriptionOption.subscriptionType}
                      {" — "}
                      {addPetSubscriptionOption.subscriptionPrice.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}
                    </div>

                    <label className="confirm-cancel-label">
                      <input
                        type="checkbox"
                        checked={confirmNewRate}
                        onChange={(e) => setConfirmNewRate(e.target.checked)}
                      />

                      <span>
                        I agree to the new subscription rate of{" "}
                        {addPetSubscriptionOption.subscriptionPrice.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )}
                        .
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {removePetChecked && !previousSubscriptionOption && (
                <div className="submit-message error-text">
                  A lower subscription option is not available.
                </div>
              )}

              {removePetChecked && previousSubscriptionOption && (
                <div className="manage-subsection">
                  <h3>New Subscription Rate</h3>

                  <div className="rate-change-box">
                    <div>
                      <strong>Current Subscription:</strong>{" "}
                      {currentSubscriptionOption?.subscriptionType || subscriptionType}
                      {currentSubscriptionOption && (
                        <>
                          {" — "}
                          {currentSubscriptionOption.subscriptionPrice.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <strong>New Subscription:</strong>{" "}
                      {previousSubscriptionOption.subscriptionType}
                      {" — "}
                      {previousSubscriptionOption.subscriptionPrice.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}
                    </div>

                    <label className="confirm-cancel-label">
                      <input
                        type="checkbox"
                        checked={confirmNewRate}
                        onChange={(e) => setConfirmNewRate(e.target.checked)}
                      />

                      <span>
                        I agree to the new subscription rate of{" "}
                        {previousSubscriptionOption.subscriptionPrice.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )}
                        .
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {manageMessage && (
                <div className="submit-message">{manageMessage}</div>
              )}

              {cancelServiceChecked && (
                <div className="manage-subsection">
                  <h3>Cancellation Reason</h3>

                  <div className="field-group">
                    <label>Reason *</label>
                    <select
                      value={cancelReason}
                      onChange={(e) => {
                        setManageMessage("");
                        setCancelReason(e.target.value);
                      }}
                      className="input-short"
                    >
                      <option value="">Select a cancellation reason</option>
                      {cancellationReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

               {cancelServiceChecked && (
                 <div className="confirm-cancel-box">
                   <label className="confirm-cancel-label">
                     <input
                       type="checkbox"
                       checked={confirmCancelService}
                       onChange={(e) => setConfirmCancelService(e.target.checked)}
                     />
                     <span>
                       Are you sure you want to cancel your subscription?
                     </span>
                   </label>
                 </div>
               )}
                
              <div className="modal-actions">
                <button
                  type="button"
                  className="dialog-close"
                  onClick={() => setManageOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>

                <button
                  type="button"
                  className="gold-button"
                  disabled={
                    (cancelServiceChecked &&
                      (!confirmCancelService || !cancelReason.trim())) ||
                    (removePetChecked &&
                      (!confirmNewRate ||
                        !previousSubscriptionOption ||
                        petsToRemove.length !== 1)) ||
                    (addPetChecked &&
                      (!confirmNewRate ||
                        !addPetSubscriptionOption ||
                        !newPetName.trim() ||
                        !newPetSpecies.trim() ||
                        !newPetSex.trim()))
                  }
                  onClick={async () => {
                    setManageMessage("");

                    if (cancelServiceChecked) {
                      if (!cancelReason.trim()) {
                        setManageMessage("Please select a cancellation reason.");
                        return;
                      }

                      if (!confirmCancelService) {
                        setManageMessage(
                          "Please confirm that you want to cancel your subscription."
                        );
                        return;
                      }

                      try {
                        setManageMessage("Cancelling service...");

                        const payload = {
                          memberFirst: firstName,             // from oauthlogin
                          memberLast: lastName,               // from oauthlogin
                          memberSubID: petSubID,              // from oauthlogin
                          subscriptionType: subscriptionType, // current state value

                          petName: "",
                          petSpecies: "",
                          petBreed: "",
                          petSex: "",

                          cancelService: "Y",
                          reason: cancelReason,
                        };

                        const res = await fetch("/api/pet-service", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            action: "cancelService",
                            payload,
                          }),
                        });

                        const data = await res.json();

                        if (!res.ok || !data.success) {
                          setManageMessage(
                            getApiMessage(data.message) ||
                            getApiMessage(data.response?.message) ||
                            getApiMessage(data.response?.error) ||
                            getApiMessage(data.response) ||
                            "Cancel service failed."
                          );
                          return;
                        }
                          const apiResultMessage =
                            data.response?.body?.results ||
                            data.response?.results ||
                            data.response?.body?.message ||
                            data.message ||
                            "Submit completed successfully.";

                          setManageMessage(`${apiResultMessage} Refreshing in 5 seconds...`);
 
                          setTimeout(() => {
                            window.location.reload();
                          }, 5000);

                        return;
                      } catch (error) {
                        setManageMessage(
                          error instanceof Error
                            ? error.message
                            : "Unexpected error cancelling service."
                        );
                        return;
                      }
                    }

                    if (removePetChecked) {
                      if (petsToRemove.length !== 1) {
                        setManageMessage("Please select one pet to remove.");
                        return;
                      }

                      if (!previousSubscriptionOption) {
                        setManageMessage(
                          "A lower subscription option is not available."
                        );
                        return;
                      }

                      if (!confirmNewRate) {
                        setManageMessage(
                          "Please agree to the new subscription rate."
                        );
                        return;
                      }

                      try {
                        setManageMessage("Removing pet...");

                        const selectedPetName = petsToRemove[0] || "";

                        const payload = {
                          memberFirst: firstName,
                          memberLast: lastName,
                          memberSubID: petSubID,
                          subscriptionType:
                            previousSubscriptionOption.subscriptionType,
                          subscriptionPrice:
                            previousSubscriptionOption.subscriptionPrice,

                          petName: selectedPetName,
                          petSpecies: "",
                          petBreed: "",
                          petSex: "",

                          cancelService: "",
                        };

                        const res = await fetch("/api/pet-service", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            action: "removePet",
                            payload,
                          }),
                        });

                        const data = await res.json();

                        if (!res.ok || !data.success) {
                          setManageMessage(
                            getApiMessage(data.message) ||
                            getApiMessage(data.response?.message) ||
                            getApiMessage(data.response?.error) ||
                            getApiMessage(data.response) ||
                            "Remove pet failed."
                          );
                          return;
                        }

                        let responseBody = data.response?.body;

                        if (typeof responseBody === "string") {
                          try {
                            responseBody = JSON.parse(responseBody);
                          } catch {
                            responseBody = {};
                          }
                        }

                        const apiResultMessage =
                          responseBody?.results ||
                          data.response?.results ||
                          data.results ||
                          "Pet removed successfully.";

                        setManageMessage(
                          `${apiResultMessage} Refreshing in 5 seconds...`
                        );

                        setTimeout(() => {
                          window.location.reload();
                        }, 5000);

                        return;
                      } catch (error) {
                        setManageMessage(
                          error instanceof Error
                            ? error.message
                            : "Unexpected error removing pet."
                        );
                        return;
                      }
                    }
                    
                    if (addPetChecked) {
                      try {
                        setManageMessage("");

                        if (
                          !newPetName.trim() ||
                          !newPetSpecies.trim() ||
                          !newPetSex.trim()
                        ) {
                          setManageMessage(
                            "Pet Name, Pet Species, and Pet Sex are required."
                          );
                          return;
                        }

                        if (!addPetSubscriptionOption) {
                          setManageMessage(
                            "A subscription rate is not available for adding a pet."
                          );
                          return;
                        }

                        if (!confirmNewRate) {
                          setManageMessage(
                            "Please agree to the new subscription rate."
                          );
                          return;
                        }

                        setManageMessage("Adding pet...");

                        const payload = {
                          memberFirst: firstName,
                          memberLast: lastName,
                          memberSubID: petSubID,
                          subscriptionType:
                            addPetSubscriptionOption.subscriptionType,
                          subscriptionPrice:
                            addPetSubscriptionOption.subscriptionPrice,

                          petName: newPetName,
                          petSpecies: newPetSpecies,
                          petBreed: newPetBreed,
                          petSex: newPetSex,

                          cancelService: "",
                        };

                        const res = await fetch("/api/pet-service", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            action: "addSubsequentPet",
                            payload,
                          }),
                        });

                        const data = await res.json();

                        if (!res.ok || !data.success) {
                          setManageMessage(
                            getApiMessage(data.message) ||
                              getApiMessage(data.response?.message) ||
                              getApiMessage(data.response?.error) ||
                              getApiMessage(data.response) ||
                              "Add pet failed."
                          );
                          return;
                        }

                        let responseBody = data.response?.body;

                        if (typeof responseBody === "string") {
                          try {
                            responseBody = JSON.parse(responseBody);
                          } catch {
                            responseBody = {};
                          }
                        }

                        const apiResultMessage =
                          responseBody?.results ||
                          data.response?.results ||
                          data.results ||
                          "Pet added successfully.";

                        setManageMessage(`${apiResultMessage} Refreshing in 5 seconds...`);

                        setTimeout(() => {
                          window.location.reload();
                        }, 5000);

                        return;
                      } catch (error) {
                        setManageMessage(
                          error instanceof Error
                            ? error.message
                            : "Unexpected error adding pet."
                        );
                        return;
                      }
                    }

                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
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