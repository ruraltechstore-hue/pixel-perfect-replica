import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/faq")({
  head: () => meta("Frequently asked questions", "Answers about orders, delivery, payments and returns at Angadi."),
  component: () => (
    <Page title="Frequently asked questions">
      <h2>How do I track my order?</h2><p>Sign in and open Track order, or go to My account to see all your orders.</p>
    </Page>
  ),
});
