import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/shipping-policy")({
  head: () => meta("Shipping policy", "Shipping policy at Angadi."),
  component: () => <Page title="Shipping policy"><p>Delivery charges, delivery areas and delivery times have not been confirmed.</p></Page>,
});
