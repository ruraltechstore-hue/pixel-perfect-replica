import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms & conditions", "Terms of use for shopping at Angadi."),
  component: () => (
    <Page title="Terms & conditions">
      <p>By using Angadi you agree to these terms. Product prices and availability may change without notice.</p>
      <h2>Orders</h2><p>An order is confirmed once we accept it. We may cancel orders for stock or pricing errors and will refund any payment received.</p>
      <h2>Accounts</h2><p>You are responsible for keeping your login details safe.</p>
      <h2>Governing law</h2><p>These terms are governed by the laws of India.</p>
    </Page>
  ),
});
