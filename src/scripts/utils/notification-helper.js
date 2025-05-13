import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscriptionOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return null;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return await getPushSubscription();
  }

  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const pushSubscription = await registration.pushManager.subscribe(
      generateSubscriptionOptions(),
    );
    const subscriptionJson = pushSubscription.toJSON();
    const { endpoint, keys } = subscriptionJson;

    // Call API to store subscription on server
    const response = await subscribePushNotification({ endpoint, keys });

    if (response.error) {
      throw new Error(response.message || 'Failed to store subscription on server');
    }

    console.log('Push subscription successful:', { endpoint, keys });
    alert(successSubscribeMessage);
    return pushSubscription;
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);
    return null;
  }
}

export async function unsubscribe() {
  try {
    const subscription = await getPushSubscription();

    if (!subscription) {
      alert('Anda belum berlangganan push notification.');
      return false;
    }

    const endpoint = subscription.endpoint;

    const response = await unsubscribePushNotification(endpoint);

    if (response.error) {
      throw new Error(response.message || 'Failed to unsubscribe on server');
    }

    await subscription.unsubscribe();

    alert('Berhasil berhenti berlangganan push notification.');
    return true;
  } catch (error) {
    console.error('unsubscribe: error:', error);
    alert('Gagal berhenti berlangganan push notification.');
    return false;
  }
}

export async function getSubscriptionStatus() {
  const isAvailable = isNotificationAvailable();
  const isPermissionGranted = isNotificationGranted();
  const isSubscribed = await isCurrentPushSubscriptionAvailable();

  return {
    isAvailable,
    isPermissionGranted,
    isSubscribed,
  };
}
