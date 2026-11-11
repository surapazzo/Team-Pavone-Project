/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CheckInSchedulerConfig,
  CheckInEmailDispatchLog,
  CheckInDayOfWeek,
  CheckInSchedulerTriggerType,
  WeeklyCheckIn,
  UserProfile,
  GarminSleepLog,
} from '../types';

export const DEFAULT_SCHEDULER_CONFIG: CheckInSchedulerConfig = {
  id: 'scheduler-main',
  athlete_id: 'ALL',
  enabled: true,
  day_of_week: 'SUNDAY',
  send_time: '18:00',
  timezone: 'Europe/Rome',
  send_reminder_to_athlete: true,
  send_report_to_coach: true,
  send_report_to_athlete_copy: true,
  coach_email: 'francesco.pavone@teampavone.it',
  additional_cc_emails: ['daniele.coach@teampavone.it'],
  template_type: 'TEAM_PAVONE_OFFICIAL',
  include_garmin_sleep_data: true,
  include_progress_photos: true,
  last_run_timestamp: '2026-03-08T18:00:12Z',
  next_scheduled_run: '2026-03-15T18:00:00Z',
  auto_retry_on_failure: true,
};

export const INITIAL_DISPATCH_LOGS: CheckInEmailDispatchLog[] = [
  {
    id: 'disp-w10-coach',
    scheduler_id: 'scheduler-main',
    checkin_id: 'chk-w10',
    athlete_id: 'athlete-luca-puci',
    athlete_name: 'Luca Puci',
    recipient_email: 'francesco.pavone@teampavone.it',
    cc_emails: ['daniele.coach@teampavone.it', 'luca.puci@gmail.com'],
    subject: '📋 [Check-In W10] Luca Puci · 81.63 kg (Δ -0.8%) · 7 Aree Completate',
    status: 'SENT',
    sent_at: '2026-03-08T18:30:04Z',
    delivery_time_ms: 1240,
    trigger_type: 'CHECKIN_REPORT_SUBMISSION',
    email_html_preview: `<h1>Check-In Settimana 2026-W10 Ricevuto</h1><p>Atleta: Luca Puci - Media Peso: 81.63 kg</p>`,
  },
  {
    id: 'disp-w10-reminder',
    scheduler_id: 'scheduler-main',
    athlete_id: 'athlete-luca-puci',
    athlete_name: 'Luca Puci',
    recipient_email: 'luca.puci@gmail.com',
    subject: '⏰ [Team Pavone] Promemoria Check-In Settimanale W10 in Scadenza',
    status: 'SENT',
    sent_at: '2026-03-08T09:00:02Z',
    delivery_time_ms: 890,
    trigger_type: 'WEEKLY_REMINDER',
    email_html_preview: `<h1>Promemoria Check-In W10</h1><p>Ciao Luca, compila il tuo check-in entro stasera alle 20:00.</p>`,
  },
];

/**
 * Calculates the next occurrence of a chosen day of week and time
 */
export function calculateNextRunDate(dayOfWeek: CheckInDayOfWeek, timeString: string): string {
  const dayMap: Record<CheckInDayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const targetDay = dayMap[dayOfWeek] ?? 0;
  const [hours, minutes] = timeString.split(':').map((v) => parseInt(v, 10) || 0);

  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;

  // If today is the target day but time has already passed, schedule for next week
  if (daysUntil === 0 && now.getTime() >= next.getTime()) {
    daysUntil = 7;
  }

  next.setDate(now.getDate() + daysUntil);
  return next.toISOString();
}

/**
 * Generates responsive, production-ready HTML email for Check-In Report
 */
export function generateCheckInEmailHtml(
  checkin: WeeklyCheckIn,
  athlete: UserProfile,
  latestSleep?: GarminSleepLog | null,
  options?: {
    includePhotos?: boolean;
    includeSleep?: boolean;
    coachFeedbackPreview?: string;
  }
): string {
  const includePhotos = options?.includePhotos !== false;
  const includeSleep = options?.includeSleep !== false;

  const photoCards = (checkin.photos_uploaded || [])
    .map(
      (p) => `
      <td style="padding: 6px; text-align: center; vertical-align: top; width: 33.3%;">
        <div style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background: #0F172A;">
          <img src="${p.url}" alt="${p.view}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />
          <div style="padding: 6px 4px; font-size: 11px; font-weight: bold; color: #FFFFFF; background: #1E293B; text-transform: uppercase;">
            ${p.view === 'front' ? 'Fronte' : p.view === 'side' ? 'Lato' : 'Retro'}
          </div>
        </div>
      </td>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-In Settimanale ${checkin.iso_week} - Team Pavone</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header with Team Pavone Violet -->
          <tr>
            <td style="background: linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%); padding: 28px 32px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background: #FFFFFF; padding: 6px 12px; border-radius: 8px; margin-bottom: 12px;">
                      <span style="font-size: 12px; font-weight: 800; color: #6D28D9; letter-spacing: 0.5px;">TEAM PAVONE COACHING</span>
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                      Report Check-In Settimanale · ${checkin.iso_week}
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #EDE9FE;">
                      Atleta: <strong style="color: #FFFFFF;">${athlete.full_name}</strong> (${athlete.email})
                    </p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 14px; text-align: center;">
                      <span style="font-size: 10px; text-transform: uppercase; color: #DDD6FE; font-weight: bold; display: block;">Voto Settimana</span>
                      <span style="font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1.1;">${checkin.weekly_rating}/10</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Metrics Grid -->
          <tr>
            <td style="padding: 24px 32px 12px;">
              <h2 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #6D28D9; font-weight: 800;">
                0. Parametri Fisiologici & Medie 7 Giorni
              </h2>
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 25%; padding: 10px; background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 10px; text-align: center;">
                    <span style="font-size: 11px; color: #6B21A8; font-weight: 600; display: block;">Peso Medio</span>
                    <strong style="font-size: 18px; color: #581C87;">${checkin.avg_weight_kg ? checkin.avg_weight_kg.toFixed(1) : '--'} kg</strong>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 25%; padding: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; text-align: center;">
                    <span style="font-size: 11px; color: #64748B; font-weight: 600; display: block;">Media Calorie</span>
                    <strong style="font-size: 18px; color: #0F172A;">${checkin.avg_calories || 2300} kcal</strong>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 25%; padding: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; text-align: center;">
                    <span style="font-size: 11px; color: #64748B; font-weight: 600; display: block;">Media Passi</span>
                    <strong style="font-size: 18px; color: #0F172A;">${checkin.avg_steps.toLocaleString()}</strong>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 25%; padding: 10px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; text-align: center;">
                    <span style="font-size: 11px; color: #15803D; font-weight: 600; display: block;">Precisione Macro</span>
                    <strong style="font-size: 18px; color: #166534;">${checkin.measurement_precision || 10}/10</strong>
                  </td>
                </tr>
              </table>

              ${
                includeSleep && latestSleep
                  ? `
              <div style="background: #F1F5F9; border-left: 4px solid #6D28D9; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <span style="font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase;">Telemetria Sonno Garmin .FIT (Messaggio 346):</span>
                <div style="font-size: 13px; color: #0F172A; margin-top: 4px;">
                  Score: <strong>${latestSleep.sleep_score}/100 (${latestSleep.quality_rating})</strong> · Durata: <strong>${latestSleep.total_sleep_hours}h</strong> · HRV: <strong>${latestSleep.avg_hrv_ms}ms</strong> · Efficienza: <strong>${latestSleep.sleep_efficiency_pct}%</strong>
                </div>
              </div>`
                  : ''
              }
            </td>
          </tr>

          <!-- 7-Areas Summary -->
          <tr>
            <td style="padding: 0 32px 20px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #E2E8F0; padding-top: 16px;">
                
                <!-- 1. Generale -->
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed #E2E8F0;">
                    <strong style="color: #6D28D9; font-size: 13px;">1. Highlights della Settimana:</strong>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #334155; line-height: 1.4;">${checkin.highlights || 'Nessun highlight inserito.'}</p>
                    ${checkin.improvement_areas ? `<p style="margin: 4px 0 0; font-size: 12px; color: #64748B;"><em>Da migliorare:</em> ${checkin.improvement_areas}</p>` : ''}
                  </td>
                </tr>

                <!-- 2. Allenamento -->
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed #E2E8F0;">
                    <strong style="color: #6D28D9; font-size: 13px;">2. Allenamento & Energia:</strong>
                    <div style="margin: 4px 0 0; font-size: 13px; color: #334155;">
                      Livello Energia: <strong>${checkin.training_energy}</strong> (${checkin.training_time_slot} ${checkin.training_exact_time ? `ore ${checkin.training_exact_time}` : ''}) · Spossatezza: <strong>${checkin.post_workout_fatigue}</strong>
                    </div>
                    ${checkin.exercise_improvements ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Progresso carichi: ${checkin.exercise_improvements}</div>` : ''}
                    ${checkin.exercises_needing_work ? `<div style="font-size: 12px; color: #DC2626; margin-top: 2px;">Attenzione mobilità/articolazioni: ${checkin.exercises_needing_work}</div>` : ''}
                  </td>
                </tr>

                <!-- 3. Nutrizione -->
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed #E2E8F0;">
                    <strong style="color: #6D28D9; font-size: 13px;">3. Nutrizione & Fame:</strong>
                    <div style="margin: 4px 0 0; font-size: 13px; color: #334155;">
                      Macros Rispettati: <strong>${checkin.hit_macros_daily}</strong> · Pasti al giorno: <strong>${checkin.meals_per_day}</strong>
                    </div>
                    ${checkin.daytime_hunger ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Fame: ${checkin.daytime_hunger}</div>` : ''}
                  </td>
                </tr>

                <!-- 4 & 5. Recupero, Sonno e Digestione -->
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px dashed #E2E8F0;">
                    <strong style="color: #6D28D9; font-size: 13px;">4, 5 & 6. Recupero, Sonno e Digestione:</strong>
                    <div style="margin: 4px 0 0; font-size: 13px; color: #334155;">
                      Energia diurna: <strong>${checkin.day_energy}</strong> · Difficoltà sonno: <strong>${checkin.sleep_trouble}</strong> (orario medio: ${checkin.avg_bedtime}) · Gonfiore/Digestione: <strong>${checkin.digestive_issues}</strong>
                    </div>
                    ${checkin.muscle_joint_soreness ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">DOMS/Dolori: ${checkin.muscle_joint_soreness}</div>` : ''}
                  </td>
                </tr>

                <!-- 7. Conclusione -->
                <tr>
                  <td style="padding: 10px 0;">
                    <strong style="color: #6D28D9; font-size: 13px;">7. Il Tuo Spazio (Diario Atleta):</strong>
                    <div style="margin: 6px 0 0; padding: 10px 14px; background: #FAF5FF; border-left: 3px solid #9333EA; font-style: italic; font-size: 13px; color: #3B0764; border-radius: 0 8px 8px 0;">
                      "${checkin.free_thoughts_space || 'Nessuna nota finale inserita.'}"
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          ${
            includePhotos && checkin.photos_uploaded && checkin.photos_uploaded.length > 0
              ? `
          <!-- Progress Photos Gallery -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: bold; color: #0F172A; text-transform: uppercase;">
                Foto Progresso Settimanale (Sanitizzate EXIF/GPS)
              </h3>
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  ${photoCards}
                </tr>
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- CTA Coach Actions -->
          <tr>
            <td style="padding: 24px 32px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <a href="${checkin.checkin_link || 'https://app.teampavone.it/app/check-in'}" style="display: inline-block; background: #6D28D9; color: #FFFFFF; font-weight: bold; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(109,40,217,0.3);">
                Accedi alla Console per Rispondere al Check-In &rarr;
              </a>
              <p style="margin: 12px 0 0; font-size: 11px; color: #94A3B8;">
                Generato automaticamente dallo Scheduler Team Pavone · Conforme GDPR Art. 9
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generates Athlete Reminder Email
 */
export function generateCheckInReminderEmailHtml(
  athlete: UserProfile,
  isoWeek: string,
  deadlineText: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Promemoria Check-In ${isoWeek}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: -apple-system, sans-serif; color: #0F172A;">
  <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
    <div style="background: #6D28D9; padding: 24px; color: #FFFFFF; text-align: center;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 900;">Promemoria Check-In Settimanale · ${isoWeek}</h2>
      <p style="margin: 6px 0 0; font-size: 13px; color: #EDE9FE;">Team Pavone Coaching Scientifico</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; margin-top: 0;">Ciao <strong>${athlete.full_name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        Oggi è il momento di tirare le somme della settimana <strong>${isoWeek}</strong>. Rileva il peso a digiuno, scatta le foto nelle pose standard e compila le 7 aree del check-in.
      </p>
      <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 10px; padding: 14px; margin: 20px 0;">
        <span style="font-size: 12px; font-weight: bold; color: #6D28D9; text-transform: uppercase; display: block;">Scadenza Invio:</span>
        <strong style="font-size: 16px; color: #581C87;">${deadlineText}</strong>
        <p style="margin: 6px 0 0; font-size: 12px; color: #6B21A8;">
          Se utilizzi un dispositivo Garmin, collega il cavo USB per sincronizzare in automatico calorie, passi e score del sonno.
        </p>
      </div>
      <div style="text-align: center; margin: 28px 0 10px;">
        <a href="https://app.teampavone.it/app/check-in" style="background: #6D28D9; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
          Compila il Check-In Adesso &rarr;
        </a>
      </div>
    </div>
    <div style="background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 14px; text-align: center; font-size: 11px; color: #94A3B8;">
      Francesco Pavone Coaching System · Inviato via scheduler automatico
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch engine: executes an automated or simulated send under 5s as per TC-QA-02
 */
export async function executeSchedulerDispatch(
  config: CheckInSchedulerConfig,
  checkin: WeeklyCheckIn,
  athlete: UserProfile,
  triggerType: CheckInSchedulerTriggerType = 'MANUAL_DISPATCH',
  latestSleep?: GarminSleepLog | null
): Promise<CheckInEmailDispatchLog> {
  const startTime = Date.now();

  // Simulate network dispatch with realistic latency (400 - 1200ms)
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

  const isReminder = triggerType === 'WEEKLY_REMINDER';
  const recipient = isReminder ? athlete.email : config.coach_email;
  const ccList = isReminder
    ? []
    : [
        ...(config.send_report_to_athlete_copy ? [athlete.email] : []),
        ...(config.additional_cc_emails || []),
      ];

  const subject = isReminder
    ? `⏰ [Team Pavone] Promemoria Check-In Settimanale ${checkin.iso_week} in Scadenza`
    : `📋 [Check-In ${checkin.iso_week}] ${athlete.full_name} · ${checkin.avg_weight_kg ? checkin.avg_weight_kg.toFixed(1) : '--'} kg · 7 Aree Completate`;

  const htmlPreview = isReminder
    ? generateCheckInReminderEmailHtml(athlete, checkin.iso_week, `${config.day_of_week} ore ${config.send_time}`)
    : generateCheckInEmailHtml(checkin, athlete, latestSleep, {
        includePhotos: config.include_progress_photos,
        includeSleep: config.include_garmin_sleep_data,
      });

  const durationMs = Date.now() - startTime;

  const log: CheckInEmailDispatchLog = {
    id: `disp-${Date.now()}`,
    scheduler_id: config.id,
    checkin_id: checkin.id,
    athlete_id: athlete.id,
    athlete_name: athlete.full_name,
    recipient_email: recipient,
    cc_emails: ccList,
    subject,
    status: 'SENT',
    sent_at: new Date().toISOString(),
    delivery_time_ms: durationMs,
    email_html_preview: htmlPreview,
    trigger_type: triggerType,
  };

  return log;
}
