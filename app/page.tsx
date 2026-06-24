"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

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

  const [manageOpen, setManageOpen] = useState(false);
  const [manageFirstName, setManageFirstName] = useState("");
  const [manageLastName, setManageLastName] = useState("");
  const [manageMobilePhone, setManageMobilePhone] = useState("");
  const [manageEmail, setManageEmail] = useState("");
  const [manageMessage, setManageMessage] = useState("");

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
  const [mobilePhone, setMobilePhone] = useState("");
  const [petSubID, setPetSubID] = useState("");


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

        const loginBody =
          typeof data.body === "string"
            ? JSON.parse(data.body)
            : data.body || data;

      if (
        res.ok &&
        loginBody?.petvantagerxPortalAccess === true
      ) {
        const oauthLastName = loginBody.lastName || "";
        const oauthPetSubID = loginBody.petSubID || "";

        setFirstName(loginBody.firstName || "");
        setLastName(oauthLastName);
        setMobilePhone(loginBody.mobilePhone || "");
        setPetSubID(oauthPetSubID);

        setAccessAllowed(true);
        setAccessMessage("");

        await handleLookup(oauthLastName, oauthPetSubID);
        
      } else {
        setAccessAllowed(false);
        setAccessMessage(
          loginBody?.results ||
          data?.message ||
          "You are not authorized to access PetVantageRx.com."
        );
      }
      } catch (err) {
        setAccessAllowed(false);
        setAccessMessage("Unable to verify PetVantageRx.com access.");
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
            onClick={() => {
              setManageFirstName(firstName || "");
              setManageLastName(lastName || "");
              setManageMobilePhone(memberMobilePhone || "");
              setManageEmail(memberEmail || "");

              setCancelServiceChecked(false);
              setRemovePetChecked(false);
              setAddPetChecked(false);
              setPetsToRemove([]);

              setNewPetName("");
              setNewPetSpecies("");
              setNewPetBreed("");
              setNewPetSex("");

              setManageMessage("");
              setManageOpen(true);
            }}
          >
            ⚙ Manage Subscr.
          </button>

          <a href="/auth/logout" className="contact-button">
            🔓 Log Out
          </a>
          
          <a
            href="mailto:d2csupport@petvantagerx.com?subject=PetVantageRx.com Support Request&body=Please describe your issue."
            className="contact-button"
          >
            ✉ Contact Us
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

        {manageOpen && (
          <div className="modal-overlay">
            <div className="manage-modal">
              <h2 className="product-title">Manage Subscription</h2>

              <div className="manage-grid">
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

                <div className="field-group">
                  <label>Email</label>
                  <input
                    value={manageEmail}
                    onChange={(e) => setManageEmail(e.target.value)}
                  />
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
                      setCancelServiceChecked(e.target.checked);
                      if (e.target.checked) {
                        setRemovePetChecked(false);
                        setAddPetChecked(false);
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

                      if (pets.length <= 1) {
                        setRemovePetChecked(false);
                        setAddPetChecked(false);
                        setPetsToRemove([]);
                        setManageMessage("You cannot remove a pet when there is only one pet.");
                        return;
                      }

                      setRemovePetChecked(e.target.checked);
                        if (e.target.checked) {
                          setCancelServiceChecked(false);
                          setAddPetChecked(false);
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
                      setAddPetChecked(e.target.checked);
                      if (e.target.checked) {
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
                  <h3>Remove Pet</h3>

                  <div className="remove-pet-row">
                    {pets.map((pet) => (
                      <label key={pet.petName} className="pet-checkbox-row">
                        <input
                          type="checkbox"
                          checked={petsToRemove.includes(pet.petName)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPetsToRemove((prev) => [...prev, pet.petName]);
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

              {manageMessage && (
                <div className="submit-message">{manageMessage}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-button close-button"
                  onClick={() => setManageOpen(false)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="gold-button"
                  onClick={async () => {
                    setManageMessage("");

                    if (cancelServiceChecked) {
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
                      try {
                        setManageMessage("Removing pet...");

                        const selectedPetName = petsToRemove[0] || "";

                        const payload = {
                          memberFirst: firstName,
                          memberLast: lastName,
                          memberSubID: petSubID,
                          subscriptionType: subscriptionType,

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

                        if (!newPetName || !newPetSpecies || !newPetSex) {
                          setManageMessage("Pet Name, Pet Species, and Pet Sex are required.");
                          return;
                        }

                        setManageMessage("Adding pet...");

                        const payload = {
                          memberFirst: firstName,
                          memberLast: lastName,
                          memberSubID: petSubID,
                          subscriptionType: subscriptionType,

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