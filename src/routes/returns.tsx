import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/returns")({
  head: () => meta("Returns, cancellation & refunds", "Returns, cancellation & refunds at Angadi."),
  component: () => <Page title="Returns, cancellation & refunds"><p>The return, cancellation and refund policy has not been published.</p></Page>,
});
