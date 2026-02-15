export default function referralOwnerTemplate({
  refUser,
  newUser,
  oldTier,
  oldReferralCount,
  performedBy,
  role,
  time
}) {
  return `
  <div style="
    font-family:'Segoe UI', Arial, sans-serif;
    background:#f4f6f9;
    padding:30px;
  ">

    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
      overflow:hidden;
    ">

      <!-- Header -->
      <div style="
        background:#1e3a8a;
        color:white;
        padding:18px 24px;
      ">
        <h2 style="margin:0;">Impression Gallery</h2>
        <p style="margin:4px 0 0 0; font-size:13px;">
          Referral Activity Notification
        </p>
      </div>

      <!-- Body -->
      <div style="padding:24px; color:#333;">

        <h3 style="
          margin-top:0;
          color:#111827;
          border-left:4px solid #10b981;
          padding-left:10px;
        ">
          New Referral Added
        </h3>

        <!-- Referrer Info -->
        <div style="
          background:#f9fafb;
          padding:14px;
          border-radius:8px;
          border:1px solid #e5e7eb;
          margin-bottom:16px;
        ">
          <p style="margin:4px 0;"><strong>Referrer:</strong> ${refUser.name}</p>
          <p style="margin:4px 0;"><strong>Phone:</strong> ${refUser.phone}</p>
        </div>

        <!-- Tier Change -->
        <table style="width:100%; font-size:14px; border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;"><strong>Tier</strong></td>
            <td style="padding:6px 0;">
              ${oldTier}
              <span style="margin:0 6px;">→</span>
              <span style="
                background:#eef2ff;
                color:#1e3a8a;
                padding:4px 10px;
                border-radius:6px;
                font-weight:600;
              ">
                ${refUser.membershipTier}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:6px 0;"><strong>Referrals</strong></td>
            <td style="padding:6px 0;">
              ${oldReferralCount}
              <span style="margin:0 6px;">→</span>
              <strong>${refUser.referralCount}</strong>
            </td>
          </tr>
        </table>

        <!-- New Customer -->
        <div style="
          margin-top:16px;
          padding:14px;
          background:#ecfdf5;
          border-radius:8px;
          border:1px solid #d1fae5;
        ">
          <strong>New Customer Added:</strong>
          <p style="margin:6px 0 0 0;">${newUser.name}</p>
        </div>

        <!-- Action Info -->
        <div style="
          margin-top:18px;
          font-size:13px;
          color:#555;
        ">
          <p><strong>Performed By:</strong> ${performedBy || "System"} (${role || "-"})</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>

      </div>

      <!-- Footer -->
      <div style="
        background:#f9fafb;
        padding:14px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
      ">
        This is an automated notification from Impression Gallery.<br/>
        Please do not reply to this email.
      </div>

    </div>
  </div>
  `;
}