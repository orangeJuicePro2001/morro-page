import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

// 初始化 Firebase Admin SDK
const apps = getApps();

if (!apps.length) {
  try {
    let serviceAccount;
    
    if (process.env.NODE_ENV === 'development') {
      // 在开发环境中从文件读取
      try {
        const serviceAccountPath = join(process.cwd(), 'config', 'serviceAccountKey.json');
        const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountFile);
      } catch (error) {
        console.error('Error reading service account file:', error);
        throw new Error('Failed to read service account file');
      }
    } else {
      // 在生产环境中从环境变量读取
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountStr) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      }
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (error) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
      }
    }

    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // 在开发环境中，我们可以使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock Firebase Admin in development mode');
      initializeApp({
        projectId: 'mock-project',
      });
    } else {
      throw error;
    }
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth(); 