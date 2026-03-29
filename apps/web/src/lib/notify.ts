type NotifyPayload = {
  title: string;
  message: string;
};

export function notify({ title, message }: NotifyPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.alert(`${title}\n${message}`);
}
