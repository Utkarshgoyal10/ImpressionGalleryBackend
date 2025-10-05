export default function ownerNotificationTemplate({ action, customer, time }) {
  const updatedAt =
    customer?.updatedAt
      ? new Date(customer.updatedAt).toLocaleString()
      : new Date().toLocaleString();

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2b7a78;">${action}</h2>
      <p><strong>Name:</strong> ${customer?.name || "N/A"}</p>
      <p><strong>Email:</strong> ${customer?.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${customer?.phone || "N/A"}</p>
      <p><strong>Membership Tier:</strong> ${customer?.membershipTier || "N/A"}</p>
      <p><strong>Referral Count:</strong> ${customer?.referralCount || 0}</p>
      <p><strong>Last Updated:</strong> ${updatedAt}</p>
      <hr style="margin: 15px 0;" />
      <p style="font-size: 14px; color: #666;">
        <em>Notification sent at ${time}</em>
      </p>
    </div>
  `;
}
