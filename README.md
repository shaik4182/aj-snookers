# 🎱 AJ Snooker Booking App

A simple mobile app for managing snooker and 8-ball pool bookings, memberships, and player tracking for your snooker shop.

## 📦 Installation

1. **Clone the repo:**
   ```bash
   git clone git@github.com:<your-username>/aj-snooker.git
   cd aj-snooker

2. **Install Node.js dependencies:**
    npm install
3. **Install React Navigation (correct version):**
    npm install @react-navigation/native
    npm install @react-navigation/native-stack

4. **Install Required Peer Dependencies:**
    npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-vector-icons

5. **Run the app:**
    npm start

📋 Features
Booking slots for Snooker and 8-Ball Pool

User registration with contact details

Membership system (₹5000 → ₹4000 with ID proof)

Auto-expiry of membership after 30 days

Track no-shows to call and confirm

Game pricing:

Snooker: ₹80 per game

8-Ball Pool: ₹120 per hour

🪪 Membership Rules
Members get ₹1000 discount on monthly booking

Membership requires Govt ID proof upload

Membership auto-expires after 30 days

🔐 SSH Key Setup for GitHub
Generate SSH key:
ssh-keygen -t ed25519 -C "your_email@example.com"

Add the key to GitHub:

Copy the key:
cat ~/.ssh/id_ed25519.pub
Go to GitHub > Settings > SSH and GPG Keys > New SSH Key

💡 Notes
If you change your system, just run npm install to reinstall all dependencies.

All required packages are listed in package.json.


## Expo build .aab and apk files


1. **Make sure you have EAS CLI installed**
 
    npm install -g eas-cli

2. **Log in to your Expo account**
    eas login

3. **Build an .aab (Google Play requirement)**
    eas build -p android --profile production 

-p android → Platform
--profile production → Uses the production config from eas.json

If you don’t have an eas.json, Expo will guide you to create one.
Example eas.json:

{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}

4. **If you want an APK for testing**   
    eas build -p android --profile preview

Example eas.json entry for APK:

{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}

5. **Download the file**
When the build finishes, Expo will give you a URL to download the .aab or .apk.
You can then upload the .aab to the Google Play Console.


