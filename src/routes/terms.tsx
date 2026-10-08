import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms & conditions", "Terms & conditions at Angadi."),
  component: () => <Page title="Terms & conditions"><p>Terms & conditions have not been published.</p></Page>,
});
