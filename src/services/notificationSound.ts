let notificationAudio: HTMLAudioElement | null = null;

export async function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    notificationAudio ??= new Audio("/assets/custom_sound.wav");
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
    await notificationAudio.play();
  } catch {
    // Browsers can block audio until the user interacts with the page.
  }
}
