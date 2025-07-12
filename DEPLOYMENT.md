# 🌬️ BreatheMate - Multi-Platform Health Tracker

A comprehensive AI-powered breathing health tracker that works seamlessly across **Android**, **iOS**, and **Web** platforms.

## 🚀 Platform Support

✅ **Android** - Expo Go + Google Play Store  
✅ **iOS** - Expo Go + Apple App Store  
✅ **Web** - Desktop/Laptop browsers  
✅ **Cross-platform** - Shared codebase with React Native

## 📱 Quick Start

### For Users

#### 🌐 **Web Version (Laptops/Desktops)**
1. Visit: `http://localhost:3000` (when running locally)
2. Use demo credentials: `demo@breathemate.com` / `demo123`
3. Full desktop experience with web audio recording

#### 📱 **Mobile Version (Expo Go)**
1. Install **Expo Go** from App Store (iOS) or Google Play (Android)
2. Scan QR code when running `npm start`
3. Instant access without app store approval

#### 🏪 **App Store Versions**
- **Android**: Search "BreatheMate" on Google Play Store
- **iOS**: Search "BreatheMate" on Apple App Store

## 🛠️ Development Setup

### Prerequisites
```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for app store builds
npm install -g eas-cli
```

### Installation
```bash
# Clone and install dependencies
cd /Users/geetheswarreddy/Breathemate
npm install

# Start development server
npm start
```

### Platform-Specific Development

#### 🌐 **Web Development**
```bash
# Start web version
npm run web

# Build for web deployment
npm run build:web
```

#### 📱 **Mobile Development**
```bash
# Start with Expo Go
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios
```

## 🏗️ Building for App Stores

### Android (Google Play Store)

1. **Setup EAS Build**
```bash
# Login to Expo
eas login

# Configure project
eas build:configure
```

2. **Build APK/AAB**
```bash
# Build for internal testing (APK)
eas build --platform android --profile preview

# Build for Play Store (AAB)
eas build --platform android --profile production
```

3. **Submit to Play Store**
```bash
# Auto-submit to Play Store
eas submit --platform android
```

### iOS (Apple App Store)

1. **Build for iOS**
```bash
# Build for TestFlight/App Store
eas build --platform ios --profile production
```

2. **Submit to App Store**
```bash
# Auto-submit to App Store Connect
eas submit --platform ios
```

## 🌍 Backend Deployment

### Local Development
```bash
# Start backend (from another terminal)
cd backend
mvn spring-boot:run
# Backend runs on http://localhost:8081
```

### Production Deployment
Update `BACKEND_URL` in `App.js`:
```javascript
// Replace with your deployed backend URL
const getBackendUrl = () => {
  return __DEV__ 
    ? 'http://localhost:8081'           // Development
    : 'https://your-backend-url.com';    // Production
};
```

## 🔧 Configuration Files

### Key Configuration Files:
- `app.json` - Expo configuration for all platforms
- `eas.json` - Build and submission configuration
- `package.json` - Dependencies and scripts
- `App.js` - Main app entry with platform detection

### Environment Variables:
```javascript
// Automatic platform detection
Platform.OS === 'web'     // Web browser
Platform.OS === 'ios'     // iPhone/iPad
Platform.OS === 'android' // Android devices
```

## 📋 Features by Platform

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| 🎙️ Audio Recording | ✅ WebRTC | ✅ Native | ✅ Native |
| 📁 File Upload | ✅ | ✅ | ✅ |
| 🔐 Authentication | ✅ | ✅ | ✅ |
| 📊 Dashboard | ✅ | ✅ | ✅ |
| 📝 Journal | ✅ | ✅ | ✅ |
| 📈 Reports | ✅ | ✅ | ✅ |
| ⚙️ Settings | ✅ | ✅ | ✅ |
| 🔄 Offline Mode | ✅ | ✅ | ✅ |

## 🎯 Demo Credentials

For testing across all platforms:
- **Email**: `demo@breathemate.com`
- **Password**: `demo123`

## 📱 App Store Information

### App Store Listing
- **App Name**: BreatheMate
- **Bundle ID**: `com.breathemate.app`
- **Version**: 1.0.0
- **Category**: Health & Fitness
- **Age Rating**: 4+ (Safe for all ages)

### Required Permissions
- **Microphone**: For breathing analysis recording
- **Storage**: For saving audio files and app data

## 🔄 Update Strategy

### Over-the-Air Updates (OTA)
```bash
# Publish OTA update
eas update --branch production --message "Bug fixes and improvements"
```

### App Store Updates
```bash
# Version bump in app.json, then rebuild
eas build --platform all --profile production
```

## 🐛 Troubleshooting

### Common Issues:

#### **Audio Recording Not Working**
- ✅ Check microphone permissions
- ✅ Test on device (not simulator for iOS)
- ✅ Use HTTPS for web version

#### **Backend Connection Failed**
- ✅ Update `BACKEND_URL` in App.js
- ✅ Check CORS settings in backend
- ✅ Verify backend is running

#### **Expo Go Issues**
- ✅ Clear Expo cache: `expo start -c`
- ✅ Restart Metro bundler
- ✅ Check Expo CLI version

### Platform-Specific:

#### **Web**
```bash
# Clear web cache
expo start --web --clear
```

#### **iOS**
```bash
# Clear iOS build cache
expo start --ios --clear
```

#### **Android**
```bash
# Clear Android cache
expo start --android --clear
```

## 📦 Distribution Checklist

### Pre-Launch
- [ ] Test on real devices (iOS/Android)
- [ ] Test web version on major browsers
- [ ] Verify backend connectivity
- [ ] Test offline functionality
- [ ] Check app store assets (icons, screenshots)

### App Store Submission
- [ ] Update version in `app.json`
- [ ] Generate builds with `eas build`
- [ ] Submit for review
- [ ] Monitor app store reviews

## 🤝 Support

### For Users
- 📧 **Email**: support@breathemate.com
- 🌐 **Web**: Visit the web version for troubleshooting
- 📱 **Mobile**: Use Expo Go for quick access

### For Developers
- 📚 **Expo Docs**: https://docs.expo.dev/
- 🛠️ **EAS Build**: https://docs.expo.dev/build/introduction/
- 🔄 **Updates**: https://docs.expo.dev/eas-update/introduction/

---

## 🎉 Ready to Deploy!

Your BreatheMate app is now configured for:
- ✅ **Expo Go** testing
- ✅ **Web** deployment  
- ✅ **Google Play Store** release
- ✅ **Apple App Store** release

Run `npm start` and scan the QR code to test immediately!