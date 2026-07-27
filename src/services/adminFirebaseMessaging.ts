import { getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let foregroundListenerStarted = false;
let setupPromise: Promise<string | null> | null = null;

const hasFirebaseConfig = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      firebaseVapidKey,
  );

const getFirebaseApp = () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp(firebaseConfig);
};

const getServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(
    new URL("../firebase-messaging-sw.js", import.meta.url),
    { type: "module" },
  );
};

const showForegroundNotification = async (payload: any) => {
  const title =
    payload.notification?.title || payload.data?.title || "Admin notification";
  const body = payload.notification?.body || payload.data?.body || "";
  const link = payload.data?.click_action || payload.fcmOptions?.link || "/";
  const options: NotificationOptions = {
    body,
    icon: "/assets/favicon.ico",
    data: { link },
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  } catch {
    new Notification(title, options);
  }
};

const startForegroundListener = async () => {
  if (foregroundListenerStarted) {
    return;
  }

  const supported = await isSupported();

  if (!supported || !hasFirebaseConfig()) {
    return;
  }

  foregroundListenerStarted = true;
  const messaging = getMessaging(getFirebaseApp());

  onMessage(messaging, (payload) => {
    if (Notification.permission === "granted") {
      showForegroundNotification(payload);
    }

    window.dispatchEvent(
      new CustomEvent("admin-fcm-notification", { detail: payload }),
    );
  });
};

export const setupAdminFirebaseNotifications = async () => {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !hasFirebaseConfig()
    ) {
      return null;
    }

    const supported = await isSupported();

    if (!supported) {
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return null;
    }

    const serviceWorkerRegistration = await getServiceWorkerRegistration();

    if (!serviceWorkerRegistration) {
      return null;
    }

    const messaging = getMessaging(getFirebaseApp());
    const fcmToken = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration,
    });

    await startForegroundListener();

    return fcmToken || null;
  })().catch((error) => {
    console.error("Failed to setup admin Firebase notifications:", error);
    setupPromise = null;
    return null;
  });

  return setupPromise;
};
