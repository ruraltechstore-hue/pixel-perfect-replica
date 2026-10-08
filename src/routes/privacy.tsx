import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy policy", "Privacy policy at Angadi."),
  component: () => <Page title="Privacy policy"><p>The privacy policy has not been published.</p></Page>,
});
