import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/shipping-policy")({
  head: () => meta("Shipping policy", "Delivery times and charges for Angadi orders."),
  component: () => (
    <Page title="Shipping policy">
      <p>Delivery is free on orders above ₹999. A ₹79 delivery charge applies below that.</p>
      <h2>Delivery time</h2><p>Orders are shipped within 1–2 working days and usually arrive within 3–7 working days.</p>
      <h2>Large items</h2><p>Solar pumps and large kits may take a few extra days and may need a phone call to arrange delivery.</p>
    </Page>
  ),
});
