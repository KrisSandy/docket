# Android Notification Reliability

## OEM Notification Killing Behavior

Many Android manufacturers implement aggressive battery optimization that can kill background processes and suppress scheduled notifications. Key offenders:

### Samsung (One UI)
- **Sleeping apps** list — apps added automatically after 3 days of inactivity
- **Deep sleeping apps** — more aggressive, nearly all background work killed
- **Fix:** Settings → Battery → Background usage limits → Never sleeping apps → Add HomeDocket

### Xiaomi (MIUI)
- **Battery saver** kills background services by default
- **Autostart** must be explicitly enabled per app
- **Fix:** Settings → Apps → Manage apps → HomeDocket → Autostart → Enable; also Settings → Battery → App battery saver → HomeDocket → No restrictions

### Huawei (EMUI)
- **App launch** management restricts background runs
- **Fix:** Settings → Battery → App launch → HomeDocket → Manage manually → Enable all toggles

### OnePlus (OxygenOS)
- **Battery optimization** — aggressive by default
- **Fix:** Settings → Battery → Battery optimization → All apps → HomeDocket → Don't optimize

### Google Pixel (Stock Android)
- **Adaptive Battery** — learns usage patterns, may delay notifications
- Generally the most reliable for scheduled notifications
- **Fix:** Usually not needed, but Settings → Battery → Battery optimization → HomeDocket → Don't optimize

## App-Level Mitigation

1. **On app foreground:** Call `rescheduleAllReminders()` to verify pending notifications still exist and reschedule any missing ones.
2. **Settings help text:** Show users a message about battery optimization if on Android.
3. **Device-specific link:** Direct users to [dontkillmyapp.com](https://dontkillmyapp.com) for their specific device manufacturer.

## References
- https://dontkillmyapp.com — Comprehensive per-device instructions
- https://capacitorjs.com/docs/apis/local-notifications — Capacitor notification docs
