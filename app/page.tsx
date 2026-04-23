"use client";

import { useEffect, useRef, useState } from "react";

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
  pets: Pet[];
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

export default function Home() {
  const [lastName, setLastName] = useState("");
  const [policyId, setPolicyId] = useState("");
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

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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
    loadMedicationOptions();
  }, []);

  async function handleLookup() {
    setSubmitMsg("");
    setSubmitHtml("");

    const newLookupErrors = {
      policyId: !policyId,
      lastName: !lastName,
    };

    setLookupErrors(newLookupErrors);

    if (newLookupErrors.policyId || newLookupErrors.lastName) {
      setStatus("Please enter Subscription ID and Last Name");
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
        body: JSON.stringify({ lastName, policyId }),
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
      setSubmitHtml("");
      setSubmitMsg("Please select a product from the list");
      setIsError(true);
      return;
    }

    setLoadingSubmit(true);
    setSubmitMsg("Submitting request to auction partner...");
    setIsError(false);
    setSubmitHtml("");

    const payload = {
      memberFirst: memberData?.first || "",
      memberLast: lastName,
      memberInsID: policyId,

      petName: selectedPet?.petName || "",
      petSpecies: selectedPet?.petSpecies || "",
      petSex: selectedPet?.petSex || "",
      petBreed: selectedPet?.petBreed || "",
      petWeight: selectedPet?.petWeight || "",

      medicationName: medication,
      medicationDose: "10mg",
      medicationFrequency: "Once Daily",
      medicationMethod: "Oral",
      medicationQuantity: "30",
      medicationRefill: 1,
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
            <div><strong>✅ Success!</strong></div>
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
        setHasSubmitted(true);
      } else {
        setSubmitHtml("");
        setSubmitMsg(result.message || "Failed");
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setSubmitHtml("");
      setSubmitMsg("Unexpected error submitting form");
      setIsError(true);
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <main className="pet-page">
      <div className="pet-container">
        <div className="logo-wrap">
          <img src="/exouza-logo.png" className="logo-image" />
        </div>

        <div className="gold-line" />

        <h1 className="page-title">Pet Medication Request Portal</h1>

        <section className="lookup-section">
          <div className="lookup-grid">
            <div className="field-group">
              <label>Subscription ID</label>
              <input
                type="text"
                value={policyId}
                onChange={(e) => {
                  setPolicyId(e.target.value);
                  if (e.target.value) {
                    setLookupErrors((p) => ({ ...p, policyId: false }));
                  }
                }}
                className={`input-short ${
                  lookupErrors.policyId ? "field-error" : ""
                }`}
              />
            </div>

            <div className="field-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (e.target.value) {
                    setLookupErrors((p) => ({ ...p, lastName: false }));
                  }
                }}
                className={`input-short ${
                  lookupErrors.lastName ? "field-error" : ""
                }`}
              />
            </div>

            <div className="button-wrap">
              <button
                className="gold-button"
                onClick={handleLookup}
                disabled={loadingLookup}
              >
                {loadingLookup ? "Looking..." : "Look Up"}
              </button>
            </div>
          </div>

           <div className="lookup-lower-row">
            <div className={isError ? "status-error" : "status-green"}>
              {status}
            </div>
          </div>
        </section>

        <div className="gold-line section-space" />

        {memberLoaded && (
          <section className="product-section">
            <h2 className="product-title">Submit Information</h2>

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
                  medicationOptions.length === 0 ||
                  hasSubmitted
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
      </div>
    </main>
  );
}