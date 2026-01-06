# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a `.env` file from `.env.example`
   - Add your Firebase configuration values
   - Make sure Firebase Authentication (Email/Password) is enabled
   - Enable Firestore Database
   - Enable Firebase Storage

3. **Create Firestore Collections**
   In Firebase Console, create these collections:
   - `projects`
   - `initiatives`
   - `learningModules`
   - `events`
   - `standards`
   - `team`

4. **Set Up Admin User**
   - Go to Firebase Console > Authentication
   - Add a new user with email/password
   - This user will be able to access `/admin/login`

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Site**
   - Frontend: http://localhost:5173
   - Admin Login: http://localhost:5173/admin/login

## Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for published content
    match /{collection}/{document} {
      allow read: if resource.data.status == 'published' || 
                     !('status' in resource.data);
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Build Errors
If you encounter path issues with the ampersand (`&`) in the directory name on Windows:
- Consider renaming the directory to remove special characters
- Or use Git Bash or WSL for running commands

### Firebase Connection Issues
- Verify your `.env` file has correct Firebase credentials
- Check that Firebase services are enabled in Firebase Console
- Ensure Firestore is in production mode (not test mode) for security rules

### Admin Access Issues
- Make sure you've created a user in Firebase Authentication
- Verify the user email/password are correct
- Check browser console for authentication errors

## Next Steps

1. Add your content through the Admin Dashboard
2. Customize hero images and content
3. Configure Firebase Storage for file uploads
4. Set up deployment on Vercel or Netlify
