import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * TuristaDo usa somente Firebase Authentication.
 * NÃO existe Firestore, Realtime Database ou Storage neste projeto.
 *
 * No Firebase Console:
 * 1. Crie um projeto.
 * 2. Adicione um app Web.
 * 3. Copie os dados do firebaseConfig abaixo.
 * 4. Em Authentication > Sign-in method, ative "E-mail/senha".
 */
const firebaseConfig = {
  apiKey: 'COLE_SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_PROJETO.firebasestorage.app',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
};

export const firebaseConfigured =
  !firebaseConfig.apiKey.startsWith('COLE_') &&
  !firebaseConfig.projectId.startsWith('SEU_') &&
  !firebaseConfig.appId.startsWith('SEU_');

const app = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app
  ? Platform.OS === 'web'
    ? getAuth(app)
    : (() => {
        try {
          return getReactNativeAuth(app);
        } catch {
          return getAuth(app);
        }
      })()
  : (null as any);

function getReactNativeAuth(firebaseApp: ReturnType<typeof initializeApp>) {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}
