import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// VAPID public key - must match the VAPID_PUBLIC_KEY backend secret
const VAPID_PUBLIC_KEY = 'BLMFvSSkW-kUGSIP_2nNBYw-K1WGrBHatCSQfuKw3pBwKt5qQ98Yp0vhWH41tW4cg_YcXNOV2W9HIUFr0cuhFeU';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || registeredRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registerPush = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = registration as any;
        const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        let subscription = await reg.pushManager.getSubscription();

        // Drop stale subscriptions created with a different server key.
        if (subscription) {
          const existing = subscription.options?.applicationServerKey as ArrayBuffer | undefined;
          const matches =
            existing &&
            new Uint8Array(existing).length === appServerKey.length &&
            new Uint8Array(existing).every((b, i) => b === appServerKey[i]);
          if (!matches) {
            await subscription.unsubscribe().catch(() => undefined);
            subscription = null;
          }
        }

        if (!subscription) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey,
          });
        }

        // Store subscription in database
        const subJson = subscription.toJSON();
        await supabase.from('push_subscriptions' as any).upsert({
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id' });

        registeredRef.current = true;
      } catch (err) {
        console.error('Push registration failed:', err);
      }
    };

    registerPush();
  }, [user]);
}
