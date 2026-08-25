import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function usePushSubscription() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser");
      return;
    }

    // Check if push manager is supported
    if (!("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser");
      return;
    }

    // Check if VAPID key is configured
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn("VAPID public key is not configured");
      return;
    }

    async function subscribeToPush() {
      try {
        // Wait for service worker to be ready (registered by ServiceWorkerRegister component)
        const registration = await navigator.serviceWorker.ready;

        // Get existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
          // Sync existing subscription with server
          await syncSubscription(existingSubscription);
          return;
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied");
          return;
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey!),
        });

        console.log("Push subscription created");

        // Sync new subscription with server
        await syncSubscription(subscription);
      } catch (error) {
        console.error("Error in push subscription:", error);
      }
    }

    subscribeToPush();

    return () => {
      // Cleanup if needed
    };
  }, [session?.user?.id]);
}

// Helper function to sync subscription with server
async function syncSubscription(subscription: PushSubscription) {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to sync push subscription:", error);
    } else {
      const data = await response.json();
      console.log("Push subscription synced:", data.subscriptionId || "success");
    }
  } catch (error) {
    console.error("Error syncing push subscription:", error);
  }
}

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
