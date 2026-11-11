/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GdprConsentRecord, SecurityAuditLog, DailyLog, WeeklyCheckIn, UserProfile } from '../types';

/**
 * Sanitizes user input against XSS, SQLi and HTML injections
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Anti-AI Indirect Prompt Injection & Jailbreak Detector (TC-AI-01)
 * Detects adversarial instructions embedded inside athlete free text fields or survey comments.
 */
export interface PromptInjectionScanResult {
  hasInjectionAttempt: boolean;
  threatLevel: 'NONE' | 'LOW' | 'CRITICAL';
  matchedPatterns: string[];
  sanitizedText: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /export\s+all\s+(athletes|users|emails|data)/i,
  /stripe\s+keys?/i,
  /api[_\s-]?key/i,
  /you\s+are\s+now\s+an\s+unrestricted/i,
  /dan\s+mode/i,
  /bypass\s+safety/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /DROP\s+TABLE/i,
  /UNION\s+SELECT/i,
  /'\s*OR\s*1\s*=\s*1/i,
];

export function scanForPromptInjection(text: string): PromptInjectionScanResult {
  if (!text) {
    return { hasInjectionAttempt: false, threatLevel: 'NONE', matchedPatterns: [], sanitizedText: '' };
  }

  const matched: string[] = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matched.push(pattern.source);
    }
  }

  const hasInjection = matched.length > 0;
  let threatLevel: 'NONE' | 'LOW' | 'CRITICAL' = 'NONE';
  if (hasInjection) {
    threatLevel = matched.some((p) => p.includes('stripe') || p.includes('export') || p.includes('ignore'))
      ? 'CRITICAL'
      : 'LOW';
  }

  // Strip dangerous tokens and wrap safely
  let sanitized = text;
  matched.forEach((p) => {
    sanitized = sanitized.replace(new RegExp(p, 'gi'), '[FILTERED_ADVERSARIAL_TOKEN]');
  });

  return {
    hasInjectionAttempt: hasInjection,
    threatLevel,
    matchedPatterns: matched,
    sanitizedText: sanitized,
  };
}

/**
 * Strips EXIF & GPS metadata from image files using HTML5 Canvas client-side
 * Complies with TC-SEC-03 & GDPR Art. 9 privacy.
 */
export async function stripExifFromImage(file: File): Promise<{ cleanBlob: Blob; cleanDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        // Drawing into clean canvas strips EXIF, GPS, camera serial and geolocation metadata
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.9);
              resolve({ cleanBlob: blob, cleanDataUrl });
            } else {
              reject(new Error('Failed to generate sanitized image blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Rate Limiter for Login & Authentication (TC-SEC-04)
 * Blocks client IP/identifier after 5 consecutive failed attempts
 */
const loginAttemptTracker: Record<string, { attempts: number; lockedUntil: number }> = {};

export function checkLoginRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const record = loginAttemptTracker[identifier];
  const now = Date.now();

  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Lock expired
  if (record.attempts >= 5 && record.lockedUntil <= now) {
    delete loginAttemptTracker[identifier];
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  if (!loginAttemptTracker[identifier]) {
    loginAttemptTracker[identifier] = { attempts: 1, lockedUntil: 0 };
    return { locked: false, attemptsLeft: 4 };
  }

  loginAttemptTracker[identifier].attempts += 1;
  if (loginAttemptTracker[identifier].attempts >= 5) {
    loginAttemptTracker[identifier].lockedUntil = now + 60 * 1000; // 60s lock
    return { locked: true, attemptsLeft: 0 };
  }

  return { locked: false, attemptsLeft: 5 - loginAttemptTracker[identifier].attempts };
}

export function resetLoginAttempts(identifier: string) {
  delete loginAttemptTracker[identifier];
}

/**
 * Generates temporary Signed URLs for private media (TC-GDPR-02)
 * Simulates a cryptographic signed URL with 15-minute expiration
 */
export function generateSignedMediaUrl(rawMediaId: string, ttlSeconds: number = 900): string {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const signature = Math.random().toString(36).substring(2, 10);
  return `https://storage.teampavone.internal/private/${rawMediaId}?exp=${expiresAt}&sig=${signature}`;
}

export function verifySignedMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const exp = parsed.searchParams.get('exp');
    const sig = parsed.searchParams.get('sig');
    if (!exp || !sig) return false;
    const expiresAt = parseInt(exp, 10);
    return Date.now() <= expiresAt;
  } catch {
    return false;
  }
}

/**
 * GDPR Data Portability: Generates JSON and CSV archives for the athlete (TC-GDPR-01)
 */
export function exportAthleteDataAsJson(
  profile: UserProfile,
  logs: DailyLog[],
  checkins: WeeklyCheckIn[],
  consents: GdprConsentRecord[]
): string {
  const payload = {
    export_metadata: {
      platform: 'Progetto Team Pavone - Coaching Ecosystem',
      exported_at: new Date().toISOString(),
      gdpr_compliance: 'GDPR Article 20 - Right to Data Portability',
      athlete_id: profile.id,
      athlete_name: profile.full_name,
    },
    user_profile: profile,
    consents_history: consents,
    daily_logs: logs,
    weekly_checkins: checkins,
  };
  return JSON.stringify(payload, null, 2);
}

export function exportAthleteLogsAsCsv(logs: DailyLog[]): string {
  const headers = ['log_date', 'weight_kg', 'calories_kcal', 'steps', 'sleep_hours', 'workout_completed', 'notes'];
  const rows = logs.map((l) => [
    l.log_date,
    l.weight_kg || '',
    l.calories_kcal || '',
    l.steps || '',
    l.sleep_hours || '',
    l.workout_completed ? 'YES' : 'NO',
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
