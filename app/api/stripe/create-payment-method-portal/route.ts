import Stripe from "stripe";
import { auth0 } from "../../../../lib/auth0";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

type PortalRequest = {
  stripeCustomerId?: string;
  memberSubID?: string;
};

export async function POST(req: Request) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message:
            "You must be logged in to update payment information.",
        },
        { status: 401 }
      );
    }

    const {
      stripeCustomerId,
      memberSubID,
    } = (await req.json()) as PortalRequest;

    const requestedCustomerId =
      stripeCustomerId?.trim() ?? "";

    const requestedMemberSubID =
      memberSubID?.trim() ?? "";

    console.log("Portal request received:", {
      auth0UserSub: session.user.sub,
      auth0UserEmail: session.user.email,
      requestedCustomerId,
      requestedMemberSubID,
      stripeKeyMode:
        process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
          ? "live"
          : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
            ? "test"
            : "unknown",
    });

    if (!requestedCustomerId) {
      return Response.json(
        {
          success: false,
          message: "Stripe Customer ID is required.",
        },
        { status: 400 }
      );
    }

    if (!requestedMemberSubID) {
      return Response.json(
        {
          success: false,
          message:
            "Member Subscription ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Identify the Stripe account associated with the
     * secret key used by this application.
     */
    const stripeAccount =
      await stripe.accounts.retrieve();

    console.log("Stripe account diagnostics:", {
      stripeAccountId: stripeAccount.id,
      stripeAccountEmail: stripeAccount.email,
      stripeAccountBusinessName:
        stripeAccount.business_profile?.name,
      stripeAccountCountry: stripeAccount.country,
    });

    const customer =
      await stripe.customers.retrieve(
        requestedCustomerId,
        {
          expand: [
            "invoice_settings.default_payment_method",
          ],
        }
      );

    if (customer.deleted) {
      return Response.json(
        {
          success: false,
          message:
            "The Stripe customer no longer exists.",
        },
        { status: 404 }
      );
    }

    const expandedDefaultPaymentMethod =
      typeof customer.invoice_settings
        .default_payment_method === "object"
        ? customer.invoice_settings
            .default_payment_method
        : null;

    console.log(
      "Stripe customer retrieved for portal:",
      {
        requestedCustomerId,
        retrievedCustomerId: customer.id,
        retrievedCustomerEmail: customer.email,
        retrievedCustomerName: customer.name,
        retrievedCustomerDescription:
          customer.description,
        retrievedCustomerPhone: customer.phone,
        livemode: customer.livemode,

        defaultPaymentMethodId:
          typeof customer.invoice_settings
            .default_payment_method === "string"
            ? customer.invoice_settings
                .default_payment_method
            : customer.invoice_settings
                  .default_payment_method?.id ?? "",

        defaultCardBrand:
          expandedDefaultPaymentMethod?.card
            ?.brand ?? "",

        defaultCardLast4:
          expandedDefaultPaymentMethod?.card
            ?.last4 ?? "",

        customerMetadata:
          customer.metadata,
      }
    );

    /*
     * Retrieve every subscription attached to this
     * customer and log the identifying information.
     */
    const subscriptions =
      await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 100,
      });

    console.log(
      "Stripe subscriptions found for customer:",
      subscriptions.data.map(
        (subscription) => ({
          subscriptionId:
            subscription.id,
          subscriptionCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          subscriptionStatus:
            subscription.status,
          memberSubID:
            subscription.metadata?.memberSubID ??
            "",
          paymentRecordId:
            subscription.metadata
              ?.paymentRecordId ?? "",
          memberEmail:
            subscription.metadata?.memberEmail ??
            "",
          metadata:
            subscription.metadata,
        })
      )
    );

    const matchingSubscription =
      subscriptions.data.find(
        (subscription) =>
          subscription.metadata?.memberSubID ===
          requestedMemberSubID
      );

    if (!matchingSubscription) {
      console.error(
        "Stripe ownership verification failed:",
        {
          auth0User:
            session.user.sub,
          auth0Email:
            session.user.email,
          stripeAccountId:
            stripeAccount.id,
          stripeCustomerId:
            customer.id,
          stripeCustomerEmail:
            customer.email,
          requestedMemberSubID,
          availableSubscriptionMemberIDs:
            subscriptions.data.map(
              (subscription) =>
                subscription.metadata
                  ?.memberSubID ?? ""
            ),
        }
      );

      return Response.json(
        {
          success: false,
          message:
            "The Stripe customer could not be verified for this PetVantageRx subscription.",
        },
        { status: 403 }
      );
    }

    const subscriptionCustomerId =
      typeof matchingSubscription.customer ===
      "string"
        ? matchingSubscription.customer
        : matchingSubscription.customer.id;

    if (
      subscriptionCustomerId !== customer.id
    ) {
      console.error(
        "Stripe subscription/customer mismatch:",
        {
          customerId:
            customer.id,
          subscriptionId:
            matchingSubscription.id,
          subscriptionCustomerId,
        }
      );

      return Response.json(
        {
          success: false,
          message:
            "The Stripe subscription belongs to a different customer.",
        },
        { status: 403 }
      );
    }

    console.log(
      "Verified Stripe portal customer:",
      {
        stripeAccountId:
          stripeAccount.id,
        customerId:
          customer.id,
        customerEmail:
          customer.email,
        customerName:
          customer.name,
        memberSubID:
          requestedMemberSubID,
        stripeSubscriptionId:
          matchingSubscription.id,
        subscriptionCustomerId,
        subscriptionStatus:
          matchingSubscription.status,
        subscriptionMetadata:
          matchingSubscription.metadata,
      }
    );

    const returnUrl =
      process.env.STRIPE_PORTAL_RETURN_URL ??
      "https://purchase.petvantagerx.com/manage-subscription";

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,

        flow_data: {
          type: "payment_method_update",

          after_completion: {
            type: "redirect",

            redirect: {
              return_url: returnUrl,
            },
          },
        },
      });

    /*
     * The portal Session is created for the exact
     * Customer ID supplied above.
     */
    console.log(
      "Stripe portal session verification:",
      {
        portalSessionId:
          portalSession.id,

        portalSessionCustomer:
          portalSession.customer,

        expectedCustomerId:
          customer.id,

        customerMatches:
          portalSession.customer ===
          customer.id,

        expectedCustomerEmail:
          customer.email,

        stripeAccountId:
          stripeAccount.id,

        livemode:
          portalSession.livemode,

        portalReturnUrl:
          portalSession.return_url,

        portalUrl:
          portalSession.url,

        flowType:
          portalSession.flow?.type,
      }
    );

    if (
      portalSession.customer !== customer.id
    ) {
      console.error(
        "CRITICAL: Portal Session customer mismatch:",
        {
          portalSessionCustomer:
            portalSession.customer,
          expectedCustomerId:
            customer.id,
        }
      );

      return Response.json(
        {
          success: false,
          message:
            "Stripe created the portal session for an unexpected customer.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      url: portalSession.url,

      debug: {
        stripeAccountId:
          stripeAccount.id,

        portalSessionId:
          portalSession.id,

        portalSessionCustomer:
          portalSession.customer,

        customerMatches:
          portalSession.customer ===
          customer.id,

        customerId:
          customer.id,

        customerEmail:
          customer.email,

        customerName:
          customer.name,

        stripeSubscriptionId:
          matchingSubscription.id,

        subscriptionCustomerId,

        memberSubID:
          matchingSubscription.metadata
            ?.memberSubID ?? "",

        livemode:
          customer.livemode,

        defaultPaymentMethodId:
          typeof customer.invoice_settings
            .default_payment_method === "string"
            ? customer.invoice_settings
                .default_payment_method
            : customer.invoice_settings
                  .default_payment_method?.id ??
              "",

        defaultCardBrand:
          expandedDefaultPaymentMethod?.card
            ?.brand ?? "",

        defaultCardLast4:
          expandedDefaultPaymentMethod?.card
            ?.last4 ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Unable to create Stripe payment-method portal session:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to open Stripe payment settings.",
      },
      { status: 500 }
    );
  }
}