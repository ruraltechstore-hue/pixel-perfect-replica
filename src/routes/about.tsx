import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/about")({
  head: () => meta("About us", "About us at Angadi."),
  component: () => <Page title="About us"><p>Angadi is a rural tech store.</p></Page>,
});
