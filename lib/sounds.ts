export const messageSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/message.mp3")
    : null;

export const notificationSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/notification.mp3")
    : null;

export const callSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/call.mp3")
    : null;