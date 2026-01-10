# Unity App Deep Link Integration Guide

This guide explains how to integrate payment flow with a Unity mobile app using deep linking.

## Overview

When a user initiates a payment from your Unity app, the app opens a web browser to the payment page. After successful payment, the user is automatically redirected back to the Unity app using a custom URL scheme.

## How It Works

1. **Unity app opens payment page** with `userId` and `returnUrl` parameters
2. **User completes payment** on Stripe checkout page
3. **After successful payment**, the browser redirects to the `returnUrl` (your Unity app's custom URL scheme)
4. **Unity app receives the deep link** and can handle the payment success

## Step 1: Configure Unity App Deep Link

### iOS (Info.plist)

Add your custom URL scheme to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>kumuapp</string>
    </array>
  </dict>
</array>
```

### Android (AndroidManifest.xml)

Add intent filter to your main activity:

```xml
<activity android:name=".MainActivity">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="kumuapp" />
  </intent-filter>
</activity>
```

## Step 2: Unity Code to Open Payment Page

In your Unity C# script, open the payment page with the return URL:

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class PaymentManager : MonoBehaviour
{
    private string userId = "694400d6952212259f17af65"; // Get from your auth system
    
    public void OpenPaymentPage()
    {
        // Custom URL scheme for your app
        string returnUrl = "kumuapp://payment-success";
        
        // Encode the return URL
        string encodedReturnUrl = System.Uri.EscapeDataString(returnUrl);
        
        // Payment page URL
        string paymentUrl = $"https://passwordreset-two.vercel.app/payment?userId={userId}&returnUrl={encodedReturnUrl}";
        
        // Open in browser
        Application.OpenURL(paymentUrl);
    }
}
```

## Step 3: Handle Deep Link in Unity

Create a script to handle incoming deep links:

```csharp
using UnityEngine;
using System;

public class DeepLinkHandler : MonoBehaviour
{
    private void Awake()
    {
        Application.deepLinkActivated += OnDeepLinkActivated;
        
        // Check if app was opened via deep link
        if (!string.IsNullOrEmpty(Application.absoluteURL))
        {
            OnDeepLinkActivated(Application.absoluteURL);
        }
    }
    
    private void OnDeepLinkActivated(string url)
    {
        Debug.Log($"Deep link activated: {url}");
        
        // Parse the URL
        Uri uri = new Uri(url);
        
        if (uri.Scheme == "kumuapp" && uri.Host == "payment-success")
        {
            // Parse query parameters
            var queryParams = System.Web.HttpUtility.ParseQueryString(uri.Query);
            
            string status = queryParams["status"];
            string userId = queryParams["userId"];
            string sessionId = queryParams["session_id"];
            
            if (status == "success")
            {
                Debug.Log("Payment successful!");
                Debug.Log($"User ID: {userId}");
                Debug.Log($"Session ID: {sessionId}");
                
                // Handle payment success
                OnPaymentSuccess(userId, sessionId);
            }
        }
    }
    
    private void OnPaymentSuccess(string userId, string sessionId)
    {
        // Update user's premium status
        // Show success message
        // Refresh premium features
        
        Debug.Log($"Payment successful for user: {userId}");
        
        // Example: Update UI, enable premium features, etc.
        // PlayerPrefs.SetInt("HasPremium", 1);
        // EnablePremiumFeatures();
    }
}
```

## Step 4: Handle Deep Link on App Resume (Android)

For Android, you may need to handle the deep link when the app comes back to foreground:

```csharp
using UnityEngine;

public class AndroidDeepLinkHandler : MonoBehaviour
{
    private void OnApplicationPause(bool pauseStatus)
    {
        if (!pauseStatus) // App resumed
        {
            // Check for deep link
            CheckForDeepLink();
        }
    }
    
    private void CheckForDeepLink()
    {
        // Use native Android plugin to check intent data
        // Or use a Unity plugin like NativeShare, DeepLink, etc.
    }
}
```

## URL Format

The payment page expects these parameters:

- `userId` (required): The user's ID in your database
- `returnUrl` (optional): Custom URL scheme to return to after payment

Example URL:
```
https://passwordreset-two.vercel.app/payment?userId=694400d6952212259f17af65&returnUrl=kumuapp%3A%2F%2Fpayment-success
```

## Return URL Parameters

After successful payment, the return URL will include these query parameters:

- `status=success`: Indicates payment was successful
- `userId`: The user's ID
- `session_id`: Stripe checkout session ID

Example return URL:
```
kumuapp://payment-success?status=success&userId=694400d6952212259f17af65&session_id=cs_test_...
```

## Testing

### Local Testing

1. Test deep link manually:
   ```bash
   # iOS Simulator
   xcrun simctl openurl booted "kumuapp://payment-success?status=success&userId=test123"
   
   # Android Emulator
   adb shell am start -W -a android.intent.action.VIEW -d "kumuapp://payment-success?status=success&userId=test123" com.yourpackage.name
   ```

2. Test full flow:
   - Open Unity app
   - Click "Upgrade to Premium"
   - Payment page opens in browser
   - Complete payment with test card: `4242 4242 4242 4242`
   - App automatically reopens with success status

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0027 6000 3184`

## Troubleshooting

### App doesn't reopen after payment

1. **Check URL scheme registration**: Verify Info.plist (iOS) or AndroidManifest.xml (Android) has the correct scheme
2. **Check returnUrl format**: Ensure it's URL-encoded when passed to the payment page
3. **Check deep link handler**: Verify the Unity script is listening for deep links

### Payment succeeds but app doesn't receive status

1. **Check query parameters**: The return URL should include `status=success&userId=...&session_id=...`
2. **Check deep link parsing**: Verify your Unity code correctly parses the URL and extracts parameters
3. **Add logging**: Add debug logs to see what URL the app receives

### Browser stays open after payment

This is expected behavior. The browser will redirect to the custom URL scheme, which should open your app. If the app doesn't open, check:
- URL scheme is correctly registered
- App is installed on the device
- No typos in the returnUrl parameter

## Example Unity Integration

Complete example Unity script:

```csharp
using UnityEngine;
using UnityEngine.UI;
using System;

public class PaymentFlow : MonoBehaviour
{
    [Header("Configuration")]
    public string userId = "694400d6952212259f17af65";
    public string paymentBaseUrl = "https://passwordreset-two.vercel.app/payment";
    public string appScheme = "kumuapp://payment-success";
    
    [Header("UI")]
    public Button upgradeButton;
    public Text statusText;
    
    private void Start()
    {
        // Listen for deep links
        Application.deepLinkActivated += OnDeepLinkReceived;
        
        // Check if app opened via deep link
        if (!string.IsNullOrEmpty(Application.absoluteURL))
        {
            OnDeepLinkReceived(Application.absoluteURL);
        }
        
        // Setup upgrade button
        if (upgradeButton != null)
        {
            upgradeButton.onClick.AddListener(OpenPaymentPage);
        }
    }
    
    public void OpenPaymentPage()
    {
        string encodedReturnUrl = Uri.EscapeDataString(appScheme);
        string url = $"{paymentBaseUrl}?userId={userId}&returnUrl={encodedReturnUrl}";
        
        Debug.Log($"Opening payment page: {url}");
        Application.OpenURL(url);
    }
    
    private void OnDeepLinkReceived(string url)
    {
        Debug.Log($"Received deep link: {url}");
        
        try
        {
            Uri uri = new Uri(url);
            
            if (uri.Scheme == "kumuapp" && uri.Host == "payment-success")
            {
                var queryParams = ParseQueryString(uri.Query);
                
                if (queryParams.ContainsKey("status") && queryParams["status"] == "success")
                {
                    string userId = queryParams.ContainsKey("userId") ? queryParams["userId"] : "";
                    string sessionId = queryParams.ContainsKey("session_id") ? queryParams["session_id"] : "";
                    
                    HandlePaymentSuccess(userId, sessionId);
                }
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error parsing deep link: {e.Message}");
        }
    }
    
    private void HandlePaymentSuccess(string userId, string sessionId)
    {
        Debug.Log($"Payment successful! User: {userId}, Session: {sessionId}");
        
        // Update UI
        if (statusText != null)
        {
            statusText.text = "Premium Activated!";
            statusText.color = Color.green;
        }
        
        // Save premium status
        PlayerPrefs.SetInt("HasPremium", 1);
        PlayerPrefs.SetString("PremiumUserId", userId);
        PlayerPrefs.Save();
        
        // Enable premium features
        EnablePremiumFeatures();
    }
    
    private void EnablePremiumFeatures()
    {
        // Your code to enable premium features
        Debug.Log("Enabling premium features...");
    }
    
    private System.Collections.Generic.Dictionary<string, string> ParseQueryString(string query)
    {
        var result = new System.Collections.Generic.Dictionary<string, string>();
        
        if (string.IsNullOrEmpty(query)) return result;
        
        // Remove leading '?'
        if (query.StartsWith("?")) query = query.Substring(1);
        
        string[] pairs = query.Split('&');
        foreach (string pair in pairs)
        {
            string[] keyValue = pair.Split('=');
            if (keyValue.Length == 2)
            {
                result[Uri.UnescapeDataString(keyValue[0])] = Uri.UnescapeDataString(keyValue[1]);
            }
        }
        
        return result;
    }
}
```

## Security Considerations

1. **Validate userId**: Always verify the userId in the deep link matches the current user
2. **Verify session**: Optionally verify the Stripe session ID with your backend
3. **Handle errors**: Check for error status in the return URL and handle accordingly
4. **URL encoding**: Always URL-encode the returnUrl parameter to handle special characters

## Additional Resources

- [Unity Deep Linking](https://docs.unity3d.com/ScriptReference/Application-deepLinkActivated.html)
- [iOS URL Schemes](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app)
- [Android App Links](https://developer.android.com/training/app-links)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
