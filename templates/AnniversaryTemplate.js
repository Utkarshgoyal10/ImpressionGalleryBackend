/**
 * Generates a fully formatted Marriage Anniversary Discount Email HTML.
 * Can be used in Node.js (for email sending) or in browser (for preview).
 */

export function AnniversaryTemplate({ user, discountCode, validityDate }) {
  const customerName = user.name || "Valued Customer";
  const shopLink = "https://your-shop-link.com/accessories";

  // Define color palette
  const colorPrimary = "#10344A";
  const colorAccent = "#FFC300";
  const colorBackground = "#F8F8F8";
  const colorText = "#1F2937";

  const template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Happy Marriage Anniversary from Impression Gallery!</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${colorBackground}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: ${colorBackground};">
          <tr>
              <td align="center" style="padding: 20px 10px;">
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                      
                      <tr>
                          <td align="center" style="padding: 20px 20px 10px 20px; background-color: ${colorPrimary}; border-radius: 16px 16px 0 0;">
                              <p style="font-family: Arial, sans-serif; font-size: 28px; font-weight: 900; color: #FFFFFF; margin: 0 0 10px 0;">
                                  Impression Gallery
                              </p>
                              <div style=" width: 100%; max-width: 500px; height: 50px; background: ${colorPrimary}; color: ${colorAccent}; font-size: 18px; font-weight: bold; text-align: center; line-height: 50px; border-radius: 8px; margin: 10px auto; font-family: 'Poppins', Arial, sans-serif;
                              ">
                                🎁 A PREMIUM GIFT AWAITS YOU
                              </div> 
                              <p style="font-size: 18px; font-weight: bold; color: ${colorAccent}; margin: 8px 0 0 0; font-family: Arial, sans-serif;">Celebrating You!</p>
                          </td>
                      </tr>

                      <tr>
                          <td align="left" style="padding: 35px 40px 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: ${colorText};">
                              <h1 style="font-size: 29px; font-weight: 900; margin: 0px auto 20px auto; color: ${colorPrimary}; text-align: center;">
                                  Happy Marriage Anniversary,
                              </h1>
                              <h1 style="font-size: 36px; font-weight: 900; margin: 0 0 25px 0; color: ${colorPrimary}; text-align: center;">
                                  ${customerName}!
                              </h1>
                              <p style="margin: 0 0 25px 0; color: #4B5563; text-align: center;">
                                  As a valued customer, we are delighted to offer you an exclusive, time-sensitive gift to celebrate your special day.
                              </p>

                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #F8F8F8; border-radius: 12px; margin-bottom: 30px; border: 2px solid ${colorAccent}; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                                  <tr>
                                      <td align="center" style="padding: 30px 20px;">
                                          <h2 style="font-size: 30px; font-weight: bold; margin: 0 0 15px 0; color: ${colorAccent};">
                                              🎁 Your Premium Gift
                                          </h2>
                                          <p style="font-size: 48px; font-weight: 900; margin: 0 0 5px 0; color: ${colorPrimary}; line-height: 50px;">
                                              ₹200 OFF
                                          </p>
                                          <p style="font-size: 17px; margin: 0 0 25px 0; color: #4B5563;">
                                              when you purchase accessories worth ₹1000 or more.
                                          </p>

                                          <table border="0" cellpadding="0" cellspacing="0">
                                              <tr>
                                                  <td align="center" style="background-color: ${colorAccent}; color: ${colorPrimary}; padding: 15px 40px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">
                                                      ${discountCode}
                                                  </td>
                                              </tr>
                                          </table>
                                          
                                          <p style="font-size: 14px; margin: 25px 0 0 0; color: #D97706; font-weight: bold;">
                                              Exclusively valid **TODAY ONLY*. Offer expires at midnight on ${validityDate}.
                                          </p>
                                      </td>
                                  </tr>
                              </table>

                              <h3 style="font-size: 20px; font-weight: bold; margin: 0 0 15px 0; color: ${colorPrimary}; text-align: center;">
                                  Popular Accessories to Use Your Discount On:
                              </h3>

                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                                  <tr>
                                 
                                      <td align="center" width="33%" style="padding: 0 5px;">
                                          <img src="http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051281/ojxypn5khy4tsctqtix6.jpg" alt="Earbuds" width="150" height="150" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                          <p style="font-size: 13px; font-weight: bold; color: ${colorText}; margin: 8px 0 0 0;">Earbuds</p>
                                      </td>
                                      <td align="center" width="33%" style="padding: 0 5px;">
                                          <img src="http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051280/a43xq1yhskh7xtxlrchq.jpg" alt="Power Bank" width="150" height="150" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                          <p style="font-size: 13px; font-weight: bold; color: ${colorText}; margin: 8px 0 0 0;">Charger</p>
                                      </td>
                                      <td align="center" width="33%" style="padding: 0 5px;">
                                          <img src="http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051278/fvtfrfosbcnqlyjse2vr.webp" alt="Premium Case" width="150" height="150" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                          <p style="font-size: 13px; font-weight: bold; color: ${colorText}; margin: 8px 0 0 0;">Power Ban</p>
                                      </td>
                                  </tr>
                              </table>

                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                                  <tr>
                                      <td align="center">
                                          <table border="0" cellpadding="0" cellspacing="0">
                                              <tr>
                                                  <td align="center" style="border-radius: 8px; background-color: ${colorPrimary}; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
                                                      <a href="${shopLink}" target="_blank" style="font-size: 18px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block; letter-spacing: 0.5px; padding: 15px 40px; border-radius: 8px;">
                                                          REDEEM YOUR GIFT NOW
                                                      </a>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>

                              <p style="color: #4B5563; text-align: center;">
                                  We are honored to celebrate another year with you. Happy Marriage Anniversary from the entire Impression Gallery team!
                              </p>
                              <p style="margin-top: 15px; font-weight: bold; color: ${colorText}; text-align: center;">
                                  Sincerely, The Impression Gallery Team
                              </p>
                          </td>
                      </tr>

                      <tr>
                          <td align="center" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 12px; color: #9ca3af; border-top: 1px solid #eeeeee;">
                              <p style="margin: 0;">
                                  Impression Gallery | Opposite Devi Mandir, Nai Sadak, Siyana
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

  return template.trim();
}
