import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/about")({
  head: () => meta("About us", "Angadi brings reliable technology to rural India."),
  component: () => (
    <Page title="About us">
      <p>Angadi — meaning “shop” — was started to bring trusted, fairly priced technology to villages and small towns across India.</p>
      <p>We carefully pick solar energy kits, rugged smartphones, farm tools and water solutions that work in real rural conditions, and deliver them to your doorstep with cash on delivery.</p>
      <h2>Our promise</h2>
      <p>Genuine products, honest prices, and support in your language.</p>
    </Page>
  ),
});
