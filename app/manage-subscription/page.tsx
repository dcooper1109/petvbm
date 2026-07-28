"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  first?: string;
  firstName?: string;
  memberFirst?: string;
  last?: string;
  lastName?: string;
  memberLast?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  mobile?: string;
  mobilePhone?: string;
  memberPhone?: string;
  email?: string;
  memberEmail?: string;
  subscriptionType?: string;
  subscriptionStatus?: string;
  status?: string;
  pets?: Pet[];
};

type SubscriptionOption = {
  subscriptionType: string;
  subscriptionPrice: number;
};

function getApiMessage(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    const item = value as {
      message?: string;
      error?: string;
      results?: string;
    };

    return (
      item.message ||
      item.error ||
      item.results ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getSuccessMessage(
  data: any,
  fallback: string
): string {
  let responseBody = data?.response?.body;

  if (typeof responseBody === "string") {
    try {
      responseBody = JSON.parse(responseBody);
    } catch {
      responseBody = {};
    }
  }

  return (
    responseBody?.results ||
    responseBody?.message ||
    data?.response?.results ||
    data?.results ||
    data?.message ||
    fallback
  );
}

export default function ManageSubscriptionPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  const [partnerName, setPartnerName] = useState("");
  const [affinityGroup, setAffinityGroup] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [petSubID, setPetSubID] = useState("");

  const [memberData, setMemberData] =
    useState<MemberData | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");

  const [manageFirstName, setManageFirstName] = useState("");
  const [manageLastName, setManageLastName] = useState("");
  const [manageMobilePhone, setManageMobilePhone] = useState("");
  const [manageEmail, setManageEmail] = useState("");
  const [managePets, setManagePets] = useState<ManagePet[]>([]);
  const [manageMessage, setManageMessage] = useState("");

  const [loadingMemberPetUpdate, setLoadingMemberPetUpdate] =
    useState(false);

  const [cancelServiceChecked, setCancelServiceChecked] =
    useState(false);

  const [removePetChecked, setRemovePetChecked] =
    useState(false);

  const [addPetChecked, setAddPetChecked] =
    useState(false);

  const [confirmCancelService, setConfirmCancelService] =
    useState(false);

  const [petsToRemove, setPetsToRemove] = useState<string[]>([]);

  const [newPetName, setNewPetName] = useState("");
  const [newPetSpecies, setNewPetSpecies] = useState("");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetSex, setNewPetSex] = useState("");

  const [cancelReason, setCancelReason] = useState("");
  const [submittingChange, setSubmittingChange] = useState(false);

  const [subscriptionOptions, setSubscriptionOptions] =
    useState<SubscriptionOption[]>([]);

  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [confirmNewRate, setConfirmNewRate] = useState(false);

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

  useEffect(() => {
    async function checkAccess() {
      try {
        setCheckingAccess(true);
        setAccessMessage("");

        const res = await fetch("/api/oauthlogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          !res.ok ||
          loginBody?.authorized !== true ||
          loginBody?.petvantagerxPortalAccess !== true
        ) {
          setAccessAllowed(false);
          setAccessMessage(
            loginBody?.results ||
              loginBody?.message ||
              data?.message ||
              "You do not have access to this page."
          );
          return;
        }

        const oauthFirstName = loginBody.firstName || "";
        const oauthLastName = loginBody.lastName || "";
        const oauthPetSubID = loginBody.petSubID || "";
        const oauthPartnerName =
        loginBody.partnerName ||
        loginBody.PartnerName ||
        loginBody.partner ||
        "";

        const oauthAffinityGroup =
        loginBody.affinityGroup ||
        loginBody.AffinityGroup ||
        loginBody.affinityName ||
        loginBody.group ||
        "";

        setPartnerName(oauthPartnerName);
        setAffinityGroup(oauthAffinityGroup);
        setFirstName(oauthFirstName);
        setLastName(oauthLastName);
        setPetSubID(oauthPetSubID);
        setAccessAllowed(true);

        await Promise.all([
          loadMember(oauthLastName, oauthPetSubID),
          loadSubscriptionPrices(oauthPartnerName),
        ]);
      } catch (error) {
        console.error("Manage Account access error:", error);

        setAccessAllowed(false);
        setAccessMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your subscription information."
        );
      } finally {
        setCheckingAccess(false);
      }
    }

    checkAccess();
    
  }, []);

  async function loadSubscriptionPrices(
    currentPartnerName: string
  ) {
    if (!currentPartnerName.trim()) {
      setSubscriptionOptions([]);
      setPriceError(
        "Partner Name is missing, so subscription pricing could not be loaded."
      );
      return;
    }

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
          data?.message ||
            "Unable to retrieve subscription pricing."
        );
      }

      const options: SubscriptionOption[] =
        data.subscriptionOptions
          .filter(
            (option: any) =>
              option?.subscriptionType &&
              option?.subscriptionPrice !== null &&
              option?.subscriptionPrice !== undefined
          )
          .map((option: any) => ({
            subscriptionType: String(
              option.subscriptionType
            ).trim(),
            subscriptionPrice: Number(
              option.subscriptionPrice
            ),
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

  async function loadMember(
    lookupLastName: string,
    lookupPetSubID: string
  ) {
    if (!lookupPetSubID || !lookupLastName) {
      setManageMessage(
        "Unable to retrieve the Subscription ID or Last Name from login."
      );
      return;
    }

    try {
      setManageMessage("Loading subscription information...");

      const res = await fetch("/api/findmember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastName: lookupLastName,
          policyId: lookupPetSubID,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.found) {
        setMemberData(null);
        setPets([]);
        setManagePets([]);
        setManageMessage(data.message || "Member not found.");
        return;
      }

      const member = data.member ?? null;
      const loadedPets: Pet[] = Array.isArray(member?.pets)
        ? member.pets
        : [];

      setMemberData(member);
      setPets(loadedPets);

      const loadedFirstName =
        member?.first ||
        member?.firstName ||
        member?.memberFirst ||
        "";

      const loadedLastName =
        member?.last ||
        member?.lastName ||
        member?.memberLast ||
        lookupLastName;

      const loadedMobilePhone =
        member?.mobile ||
        member?.mobilePhone ||
        member?.memberPhone ||
        "";

      const loadedEmail =
        member?.email ||
        member?.memberEmail ||
        "";

      const loadedSubscriptionType =
        member?.subscriptionType || "";

      const loadedSubscriptionStatus =
        member?.subscriptionStatus ||
        member?.status ||
        "";

console.log("Partner Name:", partnerName);

      setManageFirstName(loadedFirstName);
      setManageLastName(loadedLastName);
      setManageMobilePhone(loadedMobilePhone);
      setManageEmail(loadedEmail);

      setSubscriptionType(loadedSubscriptionType);
      setSubscriptionStatus(loadedSubscriptionStatus);

      setManagePets(
        loadedPets.map((pet) => ({
          oldPetName: pet.petName || "",
          petName: pet.petName || "",
        }))
      );

      setManageMessage("");
    } catch (error) {
      console.error("Member lookup error:", error);

      setMemberData(null);
      setPets([]);
      setManagePets([]);

      setManageMessage(
        error instanceof Error
          ? error.message
          : "Unable to retrieve subscription information."
      );
    }
  }

  async function handleMemberPetUpdate() {
    setManageMessage("");

    if (!partnerName || !petSubID) {
      setManageMessage(
        "Unable to update. Partner Name or Subscription ID is missing."
      );
      return;
    }

    if (
      !manageFirstName.trim() ||
      !manageLastName.trim() ||
      !manageMobilePhone.trim()
    ) {
      setManageMessage(
        "First Name, Last Name, and Mobile Phone are required."
      );
      return;
    }

    try {
      setLoadingMemberPetUpdate(true);
      setManageMessage(
        "Updating member and pet information..."
      );

      const payload = {
        partnerName,
        memberSubID: petSubID,
        memberFirst: manageFirstName.trim(),
        memberLast: manageLastName.trim(),
        mobilePhone: manageMobilePhone.trim(),
        pets: managePets
          .filter(
            (pet) =>
              pet.oldPetName.trim() ||
              pet.petName.trim()
          )
          .map((pet) => ({
            oldPetName: pet.oldPetName.trim(),
            petName: pet.petName.trim(),
          })),
      };

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
        return;
      }

      const apiResultMessage =
        data?.body?.results ||
        data?.results ||
        data?.message ||
        "Member and pet information updated successfully.";

      setManageMessage(
        `${apiResultMessage} Refreshing in 5 seconds...`
      );

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

  async function handleSubscriptionChange() {
    setManageMessage("");

    if (!petSubID) {
      setManageMessage(
        "Member Subscription ID is missing."
      );
      return;
    }

    let action = "";
    let payload: Record<string, unknown>;
    let successFallback = "Subscription updated successfully.";

    if (cancelServiceChecked) {
      if (!cancelReason.trim()) {
        setManageMessage(
          "Please select a cancellation reason."
        );
        return;
      }

      if (!confirmCancelService) {
        setManageMessage(
          "Please confirm that you want to cancel your subscription."
        );
        return;
      }

      action = "cancelService";
      successFallback = "Subscription cancelled successfully.";

      payload = {
        memberFirst: firstName,
        memberLast: lastName,
        memberSubID: petSubID,
        subscriptionType,

        petName: "",
        petSpecies: "",
        petBreed: "",
        petSex: "",

        cancelService: "Y",
        reason: cancelReason,
      };
    } else if (removePetChecked) {
      if (petsToRemove.length !== 1) {
        setManageMessage(
          "Please select one pet to remove."
        );
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

      action = "removePet";
      successFallback = "Pet removed successfully.";

      payload = {
        memberFirst: firstName,
        memberLast: lastName,
        memberSubID: petSubID,
        subscriptionType:
          previousSubscriptionOption.subscriptionType,
        subscriptionPrice:
          previousSubscriptionOption.subscriptionPrice,

        petName: petsToRemove[0],
        petSpecies: "",
        petBreed: "",
        petSex: "",

        cancelService: "",
      };
    } else if (addPetChecked) {
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

      action = "addSubsequentPet";
      successFallback = "Pet added successfully.";

      payload = {
        memberFirst: firstName,
        memberLast: lastName,
        memberSubID: petSubID,
        subscriptionType:
          addPetSubscriptionOption.subscriptionType,
        subscriptionPrice:
          addPetSubscriptionOption.subscriptionPrice,

        petName: newPetName.trim(),
        petSpecies: newPetSpecies.trim(),
        petBreed: newPetBreed.trim(),
        petSex: newPetSex.trim(),

        cancelService: "",
      };
    } else {
      setManageMessage(
        "Please select Cancel Service, Remove Pet, or Add Pet."
      );
      return;
    }

    try {
      setSubmittingChange(true);

      if (action === "cancelService") {
        setManageMessage("Cancelling service...");
      } else if (action === "removePet") {
        setManageMessage("Removing pet...");
      } else {
        setManageMessage("Adding pet...");
      }

      const res = await fetch("/api/pet-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          payload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setManageMessage(
          getApiMessage(data?.message) ||
            getApiMessage(data?.response?.message) ||
            getApiMessage(data?.response?.error) ||
            getApiMessage(data?.response) ||
            "Subscription update failed."
        );
        return;
      }

      const apiResultMessage = getSuccessMessage(
        data,
        successFallback
      );

      setManageMessage(
        `${apiResultMessage} Refreshing in 5 seconds...`
      );

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      setManageMessage(
        error instanceof Error
          ? error.message
          : "Unexpected subscription update error."
      );
    } finally {
      setSubmittingChange(false);
    }
  }

  const saveDisabled =
    submittingChange ||
    loadingPrices ||
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
        !newPetSex.trim()));

  if (checkingAccess) {
    return (
      <main className="manage-page">
        <div className="manage-page-card">
          <h1>Manage Account</h1>
          <p>Loading account information...</p>
        </div>
      </main>
    );
  }

  if (!accessAllowed) {
    return (
      <main className="manage-page">
        <div className="manage-page-card">
          <h1>Manage Account</h1>

          <div className="submit-message error-text">
            {accessMessage}
          </div>

          <Link href="/" className="gold-button">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="manage-page">
      <div className="manage-page-card">
        <header className="manage-page-header">
          <div className="manage-brand">
            <img
              src="/petvantagerx logo on white.png"
              alt="PetVantageRx"
              className="manage-logo"
            />

            <div>
              <p className="manage-eyebrow">Pet Parent Portal</p>
              <h1 className="product-title">Manage Account</h1>
              <p className="manage-page-subtitle">
                Update member information, manage pets, or change your subscription.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="manage-return-button"
            aria-label="Return to PetVantageRx"
          >
            ← Back to Portal
          </Link>
        </header>

        <section className="manage-subsection manage-summary-section">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Account overview</p>
              <h2>Subscription Information</h2>
            </div>

            <span className="subscription-status-badge">
              {subscriptionStatus || "Status unavailable"}
            </span>
          </div>

          <div className="manage-grid">
            <div className="field-group">
              <label>Member Subscription ID</label>
              <input
                value={petSubID}
                readOnly
                className="readonly-input"
              />
            </div>

            {partnerName.trim() !== "" &&
            partnerName.trim().toLowerCase() !== "direct registration" && (
              <>
                <div className="field-group">
                <label>Partner Name</label>

                <input
                    value={partnerName}
                    readOnly
                    className="readonly-input"
                />
                </div>

                <div className="field-group">
                <label>Affinity Group</label>

                <input
                    value={affinityGroup}
                    readOnly
                    className="readonly-input"
                />
                </div>
            </>
            )}

            <div className="field-group">
              <label>Current Subscription Type</label>
              <input
                value={subscriptionType}
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="field-group">
              <label>Subscription Status</label>
              <input
                value={subscriptionStatus}
                readOnly
                className="readonly-input"
              />
            </div>


          </div>
        </section>

        <section className="manage-subsection manage-edit-section">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Member details</p>
              <h2>Update Member and Pet Names</h2>
            </div>
          </div>

          <div className="manage-grid">
            <div className="field-group">
              <label>First Name</label>

              <input
                value={manageFirstName}
                onChange={(e) =>
                  setManageFirstName(e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Last Name</label>

              <input
                value={manageLastName}
                onChange={(e) =>
                  setManageLastName(e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Mobile Phone</label>

              <input
                value={manageMobilePhone}
                onChange={(e) =>
                  setManageMobilePhone(e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Email</label>

              <input
                type="email"
                value={manageEmail}
                readOnly
                className="readonly-input"
                onChange={(e) =>
                  setManageEmail(e.target.value)
                }
              />
            </div>

            {managePets.map((pet, index) => (
              <div
                className="field-group"
                key={`${pet.oldPetName}-${index}`}
              >
                <label>Pet {index + 1} Name</label>

                <input
                  value={pet.petName}
                  onChange={(e) => {
                    setManagePets((currentPets) =>
                      currentPets.map(
                        (currentPet, currentIndex) =>
                          currentIndex === index
                            ? {
                                ...currentPet,
                                petName: e.target.value,
                              }
                            : currentPet
                      )
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <div className="manage-update-actions">
            <button
              type="button"
              className="gold-button"
              disabled={loadingMemberPetUpdate}
              onClick={handleMemberPetUpdate}
            >
              {loadingMemberPetUpdate
                ? "Updating..."
                : "Update"}
            </button>
          </div>
        </section>

        <section className="manage-subsection manage-change-section">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Plan management</p>
              <h2>Subscription Changes</h2>
              <p className="section-description">
                Select one option below. Rate changes must be confirmed before saving.
              </p>
            </div>
          </div>

          {loadingPrices && (
            <div className="submit-message">
              Loading subscription pricing...
            </div>
          )}

          {priceError && (
            <div className="submit-message error-text">
              {priceError}
            </div>
          )}

          <div className="manage-options">
            <label className="manage-option">
              <input
                type="checkbox"
                checked={cancelServiceChecked}
                disabled={
                  removePetChecked || addPetChecked
                }
                onChange={(e) => {
                  const checked = e.target.checked;

                  setManageMessage("");
                  setCancelServiceChecked(checked);
                  setConfirmNewRate(false);

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
                disabled={
                  cancelServiceChecked || addPetChecked
                }
                onChange={(e) => {
                  setManageMessage("");
                  setConfirmNewRate(false);

                  if (pets.length <= 1) {
                    setRemovePetChecked(false);
                    setAddPetChecked(false);
                    setPetsToRemove([]);

                    setManageMessage(
                      "You cannot remove a pet when there is only one pet."
                    );

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
                disabled={
                  cancelServiceChecked ||
                  removePetChecked
                }
                onChange={(e) => {
                  const checked = e.target.checked;

                  setManageMessage("");
                  setConfirmNewRate(false);
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
                  <label
                    key={pet.petName}
                    className="pet-checkbox-row"
                  >
                    <input
                      type="checkbox"
                      checked={petsToRemove.includes(
                        pet.petName
                      )}
                      onChange={(e) => {
                        setConfirmNewRate(false);

                        if (e.target.checked) {
                          setPetsToRemove([pet.petName]);
                        } else {
                          setPetsToRemove((current) =>
                            current.filter(
                              (name) =>
                                name !== pet.petName
                            )
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
                    onChange={(e) =>
                      setNewPetBreed(e.target.value)
                    }
                  />
                </div>

                <div className="field-group">
                  <label>Pet Sex *</label>

                  <select
                    value={newPetSex}
                    onChange={(e) =>
                      setNewPetSex(e.target.value)
                    }
                    className="input-short"
                  >
                    <option value="">
                      Select Pet Sex
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>
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
                  {currentSubscriptionOption?.subscriptionType ||
                    subscriptionType}

                  {currentSubscriptionOption && (
                    <>
                      {" — "}
                      {formatCurrency(
                        currentSubscriptionOption.subscriptionPrice
                      )}
                    </>
                  )}
                </div>

                <div>
                  <strong>New Subscription:</strong>{" "}
                  {addPetSubscriptionOption.subscriptionType}
                  {" — "}
                  {formatCurrency(
                    addPetSubscriptionOption.subscriptionPrice
                  )}
                </div>

                <label className="confirm-cancel-label">
                  <input
                    type="checkbox"
                    checked={confirmNewRate}
                    onChange={(e) =>
                      setConfirmNewRate(e.target.checked)
                    }
                  />

                  <span>
                    I agree to the new subscription rate of{" "}
                    {formatCurrency(
                      addPetSubscriptionOption.subscriptionPrice
                    )}
                    .
                  </span>
                </label>
              </div>
            </div>
          )}

          {removePetChecked &&
            !loadingPrices &&
            !previousSubscriptionOption && (
              <div className="submit-message error-text">
                A lower subscription option is not available.
              </div>
            )}

          {removePetChecked &&
            previousSubscriptionOption && (
              <div className="manage-subsection">
                <h3>New Subscription Rate</h3>

                <div className="rate-change-box">
                  <div>
                    <strong>Current Subscription:</strong>{" "}
                    {currentSubscriptionOption
                      ?.subscriptionType ||
                      subscriptionType}

                    {currentSubscriptionOption && (
                      <>
                        {" — "}
                        {formatCurrency(
                          currentSubscriptionOption.subscriptionPrice
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <strong>New Subscription:</strong>{" "}
                    {
                      previousSubscriptionOption.subscriptionType
                    }
                    {" — "}
                    {formatCurrency(
                      previousSubscriptionOption.subscriptionPrice
                    )}
                  </div>

                  <label className="confirm-cancel-label">
                    <input
                      type="checkbox"
                      checked={confirmNewRate}
                      onChange={(e) =>
                        setConfirmNewRate(e.target.checked)
                      }
                    />

                    <span>
                      I agree to the new subscription rate of{" "}
                      {formatCurrency(
                        previousSubscriptionOption.subscriptionPrice
                      )}
                      .
                    </span>
                  </label>
                </div>
              </div>
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
                  <option value="">
                    Select a cancellation reason
                  </option>

                  {cancellationReasons.map((reason) => (
                    <option
                      key={reason}
                      value={reason}
                    >
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
                  onChange={(e) =>
                    setConfirmCancelService(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Are you sure you want to cancel your
                  subscription?
                </span>
              </label>
            </div>
          )}

          {manageMessage && (
            <div className="submit-message">
              {manageMessage}
            </div>
          )}

          <div className="modal-actions">
            <Link
              href="/"
              className="secondary-button"
            >
              Back
            </Link>

            <button
              type="button"
              className="gold-button"
              disabled={saveDisabled}
              onClick={handleSubscriptionChange}
            >
              {submittingChange
                ? "Submitting..."
                : "Save Subscription Change"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}