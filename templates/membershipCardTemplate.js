export const membershipCardTemplate = (user) => {
  const themeColor =
    user.membershipTier === "Gold"
      ? "#d4af37"
      : user.membershipTier === "Platinum"
      ? "#e5e4e2"
      : "#4e4376"; // default for Silver/basic

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Your Digital Membership Card</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f7;
        padding: 20px;
        color: #333;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        overflow: hidden;
        border: 2px solid ${themeColor};
      }
      .header {
        background: ${themeColor};
        color: #fff;
        text-align: center;
        padding: 20px 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .card-body {
        padding: 20px;
        text-align: center;
      }
      .profile-img {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid ${themeColor};
        margin-bottom: 10px;
      }
      .qr-code {
        margin-top: 10px;
      }
      .tier {
        font-size: 18px;
        color: ${themeColor};
        font-weight: bold;
        margin: 5px 0;
      }
      .expiry {
        color: #777;
        font-size: 14px;
      }
      .footer {
        background: #f1f1f1;
        text-align: center;
        padding: 10px;
        font-size: 13px;
        color: #555;
      }
      .footer a {
        color: ${themeColor};
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Mobile Shop Membership</h1>
      </div>

      <div class="card-body">
        <img src="${user.photo}" alt="Profile Photo" class="profile-img" />
        <h2>${user.name}</h2>
        <p class="tier">${user.membershipTier} Member</p>

        <div class="qr-code">
          <img src="${user.cardUrl}" alt="QR Code" width="120" />
        </div>

        <p class="expiry">Card Expiry: <strong>${new Date(
          user.cardExpiry
        ).toDateString()}</strong></p>
      </div>

      <div class="footer">
        <p>Thank you for being a valued member!<br>
        Visit us again at <a href="#">Mobile Shop</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
};
