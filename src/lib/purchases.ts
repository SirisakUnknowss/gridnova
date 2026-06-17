// =====================================================================
// Purchases — RevenueCat abstraction for Web + Capacitor (iOS/Android)
//
// Web: uses @revenuecat/purchases-js  (VITE_RC_API_KEY required)
// Mobile: uses @revenuecat/purchases-capacitor (handled at native layer)
//
// Setup:
//   1. Set VITE_RC_API_KEY in .env (web billing API key from RC dashboard)
//   2. Set VITE_RC_APP_USER_ID_PREFIX (optional, default "gridnova_")
// =====================================================================
import { Purchases, type CustomerInfo } from '@revenuecat/purchases-js';

const RC_API_KEY = import.meta.env.VITE_RC_API_KEY as string | undefined;

export const ENTITLEMENT_PREMIUM = 'premium';

export const OFFERINGS = {
  MONTHLY: 'gridnova_premium_monthly',
  YEARLY:  'gridnova_premium_yearly',
} as const;

let _initialized = false;

export async function initPurchases(userId: string): Promise<void> {
  if (!RC_API_KEY || _initialized) return;
  try {
    Purchases.configure(RC_API_KEY, userId);
    _initialized = true;
  } catch (err) {
    console.warn('[purchases] RC init failed:', err);
  }
}

export async function isPremiumEntitled(): Promise<boolean> {
  if (!RC_API_KEY) return false;
  try {
    const info: CustomerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    return ENTITLEMENT_PREMIUM in info.entitlements.active;
  } catch {
    return false;
  }
}

export interface OfferingPackage {
  identifier: string;
  product: { title: string; priceString: string; price: number; currencyCode: string };
}

export async function getOfferings(): Promise<OfferingPackage[]> {
  if (!RC_API_KEY) return [];
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages.map((pkg) => ({
      identifier: pkg.identifier,
      product: {
        title: pkg.rcBillingProduct.title ?? pkg.identifier,
        priceString: pkg.rcBillingProduct.currentPrice.formattedPrice,
        price: pkg.rcBillingProduct.currentPrice.amountMicros / 1_000_000,
        currencyCode: pkg.rcBillingProduct.currentPrice.currency,
      },
    }));
  } catch (err) {
    console.warn('[purchases] getOfferings failed:', err);
    return [];
  }
}

export async function purchasePackage(packageIdentifier: string): Promise<{ success: boolean; cancelled?: boolean; error?: string }> {
  if (!RC_API_KEY) return { success: false, error: 'RC not configured' };
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    const current = offerings.current;
    const pkg = current?.availablePackages.find((p) => p.identifier === packageIdentifier);
    if (!pkg) return { success: false, error: 'Package not found' };

    await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
    return { success: true };
  } catch (err: any) {
    if (err?.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: String(err?.message ?? err) };
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!RC_API_KEY) return false;
  try {
    const rc = Purchases.getSharedInstance() as any;
    const info: CustomerInfo = await (rc.restorePurchases ?? rc.restoreProductsAndroid ?? rc.restore)?.();
    if (!info) return false;
    return ENTITLEMENT_PREMIUM in info.entitlements.active;
  } catch {
    return false;
  }
}
