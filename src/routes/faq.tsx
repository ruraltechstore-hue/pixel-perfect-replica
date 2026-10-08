import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/faq")({
  head: () => meta("Frequently asked questions", "Answers about orders, delivery, payments and returns at Angadi."),
  component: () => (
    <Page title="Frequently asked questions">
      <h2>Do you deliver to villages?</h2><p>Yes. We deliver to most rural pincodes in India through our courier partners.</p>
      <h2>How can I pay?</h2><p>Cash on delivery is available on all orders. Online payment by UPI and card is coming soon.</p>
      <h2>How long does delivery take?</h2><p>Usually 3–7 working days depending on your location.</p>
      <h2>Can I return a product?</h2><p>Yes, within 7 days of delivery if it is unused and in original packaging. See our returns policy.</p>
      <h2>How do I track my order?</h2><p>Sign in and open Track order, or go to My account to see all your orders.</p>
    </Page>
  ),
});
