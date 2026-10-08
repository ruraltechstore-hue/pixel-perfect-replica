import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy policy", "How Angadi collects and protects your personal information."),
  component: () => (
    <Page title="Privacy policy">
      <p>We collect only what we need to deliver your orders: your name, email, phone number and address.</p>
      <h2>How we use it</h2><p>To process orders, deliver products and contact you about your order. We never sell your data.</p>
      <h2>Your choices</h2><p>You can ask us to update or delete your information at any time through the contact page.</p>
    </Page>
  ),
});
