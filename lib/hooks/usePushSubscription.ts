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

    let registration: ServiceWorkerRegistration | null = null;

    async function registerAndSubscribe() {
      try {
        // Register service worker
        registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // Get existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
          console.log("Already subscribed to push notifications");
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

        console.log("Push subscription created:", subscription);

        // Send subscription to server
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        console.log("Push subscription saved to server");
      } catch (error) {
        console.error("Error registering push subscription:", error);
      }
    }

    registerAndSubscribe();

    return () => {
      // Cleanup if needed
    };
  }, [session?.user?.id]);
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
