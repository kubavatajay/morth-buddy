// ============================================================
// MOrth Buddy — Google Apps Script Backend
// Handles: Registration logging, admin alerts, welcome emails
// Deploy as: Web App → Execute as ME → Access: Anyone
// ------------------------------------------------------------
// SETUP INSTRUCTIONS (read carefully):
// 1. Go to https://script.google.com → New Project
// 2. Paste this entire file, replacing the default code
// 3. Click the floppy disk icon to save (name it "MOrth Buddy Backend")
// 4. Click Deploy → New Deployment → Web App
//    - Execute as: Me (your Google account)
//    - Who has access: Anyone
// 5. Click Deploy → Copy the Web App URL
// 6. Paste that URL into index.html where it says GOOGLE_SCRIPT_URL
// 7. Create a Google Sheet and copy its ID into SHEET_ID below
//    (Sheet ID is the long string in the URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
// ============================================================

// ── CONFIG — FILL THESE IN ──────────────────────────────────
const ADMIN_EMAIL    = "kubavatajay@gmail.com";         // Your email for alerts
const ADMIN_NAME     = "Dr. Ajay Kubavat";              // Your name
const SHEET_ID       = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE"; // From your Google Sheet URL
const SHEET_TAB      = "Registrations";                 // Tab/sheet name
const APP_NAME       = "MOrth Buddy";
const APP_URL        = "https://kubavatajay.github.io/morth-buddy/";
const LINKEDIN_URL   = "https://www.linkedin.com/in/dr-ajay-kubavat-708205210";
const WA_AI_ORTHO    = "https://chat.whatsapp.com/JdJbzUIiVPlE2aEQI7Z2qd";
const WA_MORTH       = "https://chat.whatsapp.com/BmlKwHA9xpi9i50iCM6yid";
// ────────────────────────────────────────────────────────────

// ── MAIN HANDLER ────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Log to Google Sheet
    logToSheet(data);
    
    // 2. Alert admin (you)
    sendAdminAlert(data);
    
    // 3. Send welcome email to registrant
    sendWelcomeEmail(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", app: APP_NAME }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── LOG TO GOOGLE SHEET ──────────────────────────────────────
function logToSheet(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Get or create the Registrations tab
  let sheet = ss.getSheetByName(SHEET_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB);
    // Add headers
    sheet.appendRow([
      "Timestamp",
      "Full Name",
      "Email",
      "Institution",
      "Country",
      "Training Stage",
      "Status"
    ]);
    // Style headers
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#0d1b2a").setFontColor("#00c9a7");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 220);
    sheet.setColumnWidth(4, 200);
  }
  
  // Append registration row
  sheet.appendRow([
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    data.name     || "—",
    data.email    || "—",
    data.inst     || "—",
    data.country  || "—",
    data.stage    || "—",
    "Pending Approval"
  ]);
}

// ── ADMIN ALERT EMAIL ────────────────────────────────────────
function sendAdminAlert(data) {
  const subject = `🦷 New MOrth Buddy Registration — ${data.name}`;
  
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f4f4;padding:20px;">
      <div style="background:linear-gradient(135deg,#0d1b2a,#1a3a5c);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#00c9a7;margin:0;font-size:24px;">🦷 MOrth Buddy</h1>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;">New Registration Request</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
        <h2 style="color:#0d1b2a;margin-top:0;">Hello ${ADMIN_NAME},</h2>
        <p style="color:#555;">A new user has registered for <strong>MOrth Buddy</strong> and is awaiting your approval.</p>
        
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr style="background:#f0f8ff;">
            <td style="padding:10px 14px;font-weight:bold;color:#0d1b2a;width:35%;border-bottom:1px solid #e0e0e0;">Full Name</td>
            <td style="padding:10px 14px;color:#333;border-bottom:1px solid #e0e0e0;">${data.name || "—"}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;color:#0d1b2a;border-bottom:1px solid #e0e0e0;">Email</td>
            <td style="padding:10px 14px;color:#333;border-bottom:1px solid #e0e0e0;"><a href="mailto:${data.email}">${data.email || "—"}</a></td>
          </tr>
          <tr style="background:#f0f8ff;">
            <td style="padding:10px 14px;font-weight:bold;color:#0d1b2a;border-bottom:1px solid #e0e0e0;">Institution</td>
            <td style="padding:10px 14px;color:#333;border-bottom:1px solid #e0e0e0;">${data.inst || "—"}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;color:#0d1b2a;border-bottom:1px solid #e0e0e0;">Country</td>
            <td style="padding:10px 14px;color:#333;border-bottom:1px solid #e0e0e0;">${data.country || "—"}</td>
          </tr>
          <tr style="background:#f0f8ff;">
            <td style="padding:10px 14px;font-weight:bold;color:#0d1b2a;">Training Stage</td>
            <td style="padding:10px 14px;color:#333;">${data.stage || "—"}</td>
          </tr>
        </table>
        
        <p style="color:#555;">To approve this user, simply reply to their email <strong>(${data.email})</strong> with your approval, or view all registrations in your <a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}" style="color:#1a6b9a;">Google Sheet</a>.</p>
        
        <div style="margin:24px 0;text-align:center;">
          <a href="mailto:${data.email}?subject=MOrth Buddy — Access Approved&body=Dear ${data.name},%0D%0A%0D%0AThank you for registering for MOrth Buddy!%0D%0A%0D%0AYour access has been approved. You can access the platform at:%0D%0A${APP_URL}%0D%0A%0D%0AWelcome to the MOrth Buddy community!%0D%0A%0D%0ABest regards,%0D%0A${ADMIN_NAME}%0D%0AAI in Orthodontics" 
             style="background:#00c9a7;color:#fff;padding:12px 28px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
            ✅ Approve This User
          </a>
        </div>
        
        <p style="color:#888;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
          © 2026 MOrth Buddy | Built by ${ADMIN_NAME} | AI in Orthodontics
        </p>
      </div>
    </div>
  `;
  
  GmailApp.sendEmail(ADMIN_EMAIL, subject, "", { htmlBody: htmlBody });
}

// ── WELCOME EMAIL TO REGISTRANT ──────────────────────────────
function sendWelcomeEmail(data) {
  if (!data.email) return;
  
  const subject = `Welcome to MOrth Buddy — Registration Received 🦷`;
  
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f4f4;padding:20px;">
      <div style="background:linear-gradient(135deg,#0d1b2a,#1a3a5c);padding:30px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#00c9a7;margin:0;font-size:28px;">🦷 MOrth Buddy</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">World's First AI-Powered MOrth RCS Exam Prep Platform</p>
      </div>
      <div style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;">
        <h2 style="color:#0d1b2a;margin-top:0;">Dear ${data.name},</h2>
        
        <p style="color:#444;line-height:1.7;">Thank you for registering for <strong>MOrth Buddy</strong>! Your registration has been received and is currently <strong style="color:#f0a500;">pending approval</strong> by <strong>Dr. Ajay Kubavat</strong>.</p>
        
        <p style="color:#444;line-height:1.7;">You will receive a separate confirmation email once your access is approved. This usually happens within 24–48 hours.</p>
        
        <div style="background:#f0faf8;border:1px solid #00c9a7;border-radius:10px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 8px;font-weight:bold;color:#0d1b2a;">Your Registration Details:</p>
          <p style="margin:3px 0;color:#555;font-size:13px;">📛 Name: <strong>${data.name}</strong></p>
          <p style="margin:3px 0;color:#555;font-size:13px;">✉️ Email: <strong>${data.email}</strong></p>
          <p style="margin:3px 0;color:#555;font-size:13px;">🏥 Institution: <strong>${data.inst || "—"}</strong></p>
          <p style="margin:3px 0;color:#555;font-size:13px;">🌍 Country: <strong>${data.country || "—"}</strong></p>
          <p style="margin:3px 0;color:#555;font-size:13px;">🎓 Stage: <strong>${data.stage || "—"}</strong></p>
        </div>
        
        <p style="color:#444;line-height:1.7;">While you wait, you can already access the platform and explore available study resources:</p>
        
        <div style="text-align:center;margin:24px 0;">
          <a href="${APP_URL}" style="background:linear-gradient(135deg,#00c9a7,#1a6b9a);color:#fff;padding:13px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
            🚀 Visit MOrth Buddy
          </a>
        </div>
        
        <p style="color:#444;line-height:1.7;">Join our learning communities for updates, discussions and resources:</p>
        
        <table style="width:100%;margin:12px 0;">
          <tr>
            <td style="padding:6px 4px;">
              <a href="${WA_AI_ORTHO}" style="background:#25d366;color:#fff;padding:10px 16px;border-radius:22px;text-decoration:none;font-size:13px;font-weight:bold;display:block;text-align:center;">
                💬 AI in Orthodontics WhatsApp
              </a>
            </td>
            <td style="padding:6px 4px;">
              <a href="${WA_MORTH}" style="background:#25d366;color:#fff;padding:10px 16px;border-radius:22px;text-decoration:none;font-size:13px;font-weight:bold;display:block;text-align:center;">
                💬 MOrth Buddy WhatsApp
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:6px 4px;">
              <a href="${LINKEDIN_URL}" style="background:#0077b5;color:#fff;padding:10px 16px;border-radius:22px;text-decoration:none;font-size:13px;font-weight:bold;display:block;text-align:center;">
                💼 Connect on LinkedIn — Dr. Ajay Kubavat
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color:#888;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
          © 2026 MOrth Buddy | Built by <strong>Dr. Ajay Kubavat</strong> | AI in Orthodontics<br>
          Open Source for Orthodontic Excellence
        </p>
      </div>
    </div>
  `;
  
  GmailApp.sendEmail(data.email, subject, "", { htmlBody: htmlBody });
}
