import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  onBackgroundMessage(messaging, (payload) => {
    const title =
      payload.notification?.title ||
      payload.data?.title ||
      "Admin notification";
    const body = payload.notification?.body || payload.data?.body || "";
    const link = payload.data?.click_action || "/";

    self.registration.showNotification(title, {
      body,
      icon: "/assets/favicon.ico",
      data: { link },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existingClient = clientList.find((client) =>
          client.url.includes(self.location.origin),
        );

        if (existingClient) {
          existingClient.focus();
          existingClient.navigate(link);
          return;
        }

        return self.clients.openWindow(link);
      }),
  );
});
