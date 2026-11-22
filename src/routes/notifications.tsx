import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import emptyBag from "@/assets/empty-bag.png";
import pPerfume from "@/assets/p-perfume.jpg";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Centre — Beauty Retail Demo" },
      { name: "description", content: "Back-in-stock alerts, App Fest offers and Beauty Pass updates in one place." },
      { property: "og:title", content: "Notification Centre — Beauty Retail Demo" },
      { property: "og:description", content: "Manage your back-in-stock alerts and offers." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, addNotification, markNotificationRead, tier, openOffer } = useStore();

  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-3xl font-black">Notification Centre</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            addNotification({
              title: "Rose Atlas Eau de Parfum is back in stock",
              body: "Only 40 units restocked online. Tap to shop now.",
              channel: "Push",
            });
            track("Receive Back-in-Stock Alert", { "Alert Channel": "Push", "Beauty Pass Tier": tier });
            toast.success("Back-in-stock alert received");
          }}
          className="rounded-sm bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
        >
          Simulate back-in-stock alert
        </button>
        <button
          onClick={() => openOffer("Feedback")}
          className="rounded-sm border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest"
        >
          Open feedback offer
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-12 text-center">
          <img src={emptyBag} alt="Illustration of an empty bag" width={700} height={700} loading="lazy" className="mx-auto w-48" />
          <p className="mt-4 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {notifications.map((n) => (
            <li key={n.id} className="flex gap-4 py-5">
              <img src={pPerfume} alt="Pink perfume bottle" width={800} height={800} loading="lazy" className="size-16 object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {n.title} {!n.read && <span className="ml-2 rounded-full bg-sephora-red px-2 py-0.5 text-[10px] uppercase text-primary-foreground">New</span>}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{n.channel}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      markNotificationRead(n.id);
                      track("View Back-in-Stock Alert", { "Alert Channel": n.channel, "Beauty Pass Tier": tier });
                    }}
                    className="text-xs font-semibold uppercase tracking-widest text-sephora-red"
                  >
                    Open alert
                  </button>
                  <Link to="/products/$id" params={{ id: "rose-atlas-edp" }} className="text-xs font-semibold uppercase tracking-widest">
                    Shop product
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}