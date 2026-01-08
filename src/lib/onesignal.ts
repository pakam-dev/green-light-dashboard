import OneSignal from 'react-onesignal';

// Initialize OneSignal
// IMPORTANT: Replace 'YOUR_ONESIGNAL_APP_ID' with your actual OneSignal App ID
export const initializeOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: 'YOUR_ONESIGNAL_APP_ID', // Replace with your OneSignal App ID
      allowLocalhostAsSecureOrigin: true, // For development
    });
    console.log('OneSignal initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize OneSignal:', error);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    await OneSignal.Slidedown.promptPush();
    return true;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

// Check if user is subscribed
export const isSubscribed = async () => {
  try {
    const isPushSupported = OneSignal.Notifications.isPushSupported();
    if (!isPushSupported) return false;
    
    const permission = await OneSignal.Notifications.permission;
    return permission;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// Set external user ID for targeting
export const setExternalUserId = async (userId: string) => {
  try {
    await OneSignal.login(userId);
    return true;
  } catch (error) {
    console.error('Failed to set external user ID:', error);
    return false;
  }
};

// Add tags for segmentation
export const addTags = async (tags: Record<string, string>) => {
  try {
    await OneSignal.User.addTags(tags);
    return true;
  } catch (error) {
    console.error('Failed to add tags:', error);
    return false;
  }
};
