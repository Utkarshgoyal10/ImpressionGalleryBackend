export default function ownerNotificationTemplate({
  action,
  customer,
  previousCount,
  newCount,
  performedBy,
  item,
  role
}) {
  const updatedAt = customer?.updatedAt
    ? new Date(customer.updatedAt).toLocaleString()
    : new Date().toLocaleString();

  return `
  <div style="
    font-family: 'Segoe UI', Arial, sans-serif;
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
          Activity Notification
        </p>
      </div>

      <!-- Body -->
      <div style="padding:24px; color:#333;">

        <h3 style="
          margin-top:0;
          color:#111827;
          border-left:4px solid #2563eb;
          padding-left:10px;
        ">
          ${action}
        </h3>

        <!-- Customer Info -->
        <table style="width:100%; font-size:14px; border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;"><strong>Name</strong></td>
            <td style="padding:6px 0;">${customer?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Email</strong></td>
            <td style="padding:6px 0;">${customer?.email || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Phone</strong></td>
            <td style="padding:6px 0;">${customer?.phone || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Purchased Item</strong></td>
            <td style="padding:6px 0;">${item}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Membership Tier</strong></td>
            <td style="padding:6px 0;">
              <span style="
                background:#eef2ff;
                color:#1e3a8a;
                padding:4px 10px;
                border-radius:6px;
                font-weight:600;
              ">
                ${customer?.membershipTier || "N/A"}
              </span>
            </td>
          </tr>
        </table>

        ${
          previousCount !== undefined
            ? `
        <!-- Count Change -->
        <div style="
          margin-top:16px;
          padding:12px;
          background:#f9fafb;
          border-radius:8px;
          border:1px solid #e5e7eb;
        ">
          <strong>Count Update:</strong>
          <span style="
            font-size:16px;
            font-weight:600;
            margin-left:8px;
          ">
            ${previousCount} → ${newCount}
          </span>
        </div>
        `
            : ""
        }

        <!-- Action Info -->
        <div style="margin-top:18px; font-size:13px; color:#555;">
          <p><strong>Performed By:</strong> ${performedBy || "System"} (${role || "-"})</p>
          <p><strong>Last Updated:</strong> ${updatedAt}</p>
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