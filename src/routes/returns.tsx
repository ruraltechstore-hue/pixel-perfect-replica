import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/returns")({
  head: () => meta("Returns, cancellation & refunds", "Angadi return, cancellation and refund policy."),
  component: () => (
    <Page title="Returns, cancellation & refunds">
      <h2>Cancellation</h2><p>You can cancel any order before it is shipped by contacting us.</p>
      <h2>Returns</h2><p>Unused products in original packaging can be returned within 7 days of delivery. Damaged or wrong items are replaced free of cost.</p>
      <h2>Refunds</h2><p>Refunds are processed within 5–7 working days after we receive the returned item, to your bank account or UPI.</p>
    </Page>
  ),
});
