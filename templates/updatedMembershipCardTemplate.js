
export const updatedMembershipCardTemplate = ({ user, productImages = [] }) => {
    const tierConfig = {
        Silver: {
            color: '#3B82F6',
            bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961769/knq3mmu0zqvkgfbdsm44.jpg',
            textColor: '#000000ff',
            perks: 'Continue enjoying *10% off all repairs*, a Birthday gift, and priority customer support as our valued Silver Member.',
        },
        Gold: {
            color: '#D97706',
            bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961767/xrrvllowwpn1bekbhne8.jpg',
            textColor: '#000000',
            perks: 'As a Gold Member, your premium benefits include *20% off all repairs*, FREE screen protector, and a dedicated support manager for top-tier service.',
        },
        default: {
            color: '#9333EA',
            bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961768/nhxkhckxufohgajbropd.jpg',
            textColor: '#ffffff',
            perks: 'Your Platinum status ensures *30% off all repairs*, VIP assistance, exclusive early product access, and invites to special events.',
        },
    };

    const tier = user.membershipTier || 'default';
    const config = tierConfig[tier] || tierConfig.default;

    // Format expiry date
    const date = user.cardExpiry instanceof Date ? user.cardExpiry : new Date(user.cardExpiry);
    const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
    const rawId = user.membershipID ? user.membershipID.toString().slice(-16).padStart(16, '0') : '0000000000000000';
    const cardNumber = rawId.match(/.{1,4}/g).join(' ');
    const customerName = user.name || 'Valued Member';

    // Product grid
    const productHtml = productImages.slice(0, 3).map((imageUrl, index) => `
         <td width="33.33%" align="center" style="padding: 10px; vertical-align: top;">
            <img src="${imageUrl}" alt="Product ${index + 1}" width="160" style="display: block; border: 0; max-width: 160px; height: 160px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9CA3AF;">
                Shop Now
            </p>
        </td>
    `).join('');

    // Main template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Updated ${tier} Membership Card</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F8F8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F8F8;">
<tr><td align="center" style="padding:20px 10px;">
<table width="100%" style="max-width:600px;background:#fff;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,0.15);">
<tr><td align="center" style="padding:30px 20px 15px 20px;">
    <img src="http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759699191/h4vf39ipjzczxkvoetwr.png" alt="Logo" width="160" style="display:block;border:0;">
</td></tr>

<tr><td style="padding:35px 40px;font-family:Arial,sans-serif;color:#1F2937;">
    <h1 style="font-size:26px;font-weight:bold;margin:0 0 15px;">Your ${tier} Membership Has Been Updated!</h1>
    <p style="margin:0 0 25px;color:#4B5563;">
        Great news, ${customerName}! Your membership details have been successfully updated. Your latest ${tier} card is ready — with refreshed benefits and a renewed validity period.
    </p>

    <table width="100%" style="margin:20px 0;">
        <tr><td align="center">
            <table width="400" height="250" style="background-image:url('${config.bgColor}');background-size:cover;background-position:center;border-radius:12px;color:${config.textColor};box-shadow:0 5px 15px rgba(0,0,0,0.4);">
                <tr><td style="padding:25px;">
                    <table width="100%">
                        <tr>
                            <td align="left">
                                <p style="margin:0;font-size:18px;font-weight:bold;">Impression Gallery</p>
                                <p style="margin:0;font-size:12px;opacity:0.8;">${tier} Member Card</p>
                            </td>
                            <td align="right">
                                <img src="${user.cardUrl}" alt="QR" width="60" height="60" style="border-radius:4px;background:#fff;">
                            </td>
                        </tr>
                    </table>

                    <div style="height:50px;"></div>

                    <p style="font-family:'Courier New',monospace;font-size:20px;font-weight:bold;letter-spacing:2px;margin:0;">${cardNumber}</p>
                    <table width="100%" style="margin-top:10px;">
                        <tr>
                            <td style="font-size:10px;opacity:0.8;">
                                <p style="margin:0;">Card Holder</p>
                                <p style="margin:0;font-size:14px;font-weight:bold;text-transform:uppercase;">${customerName}</p>
                            </td>
                            <td align="right" style="font-size:10px;opacity:0.8;">
                                <p style="margin:0;">Valid Thru</p>
                                <p style="margin:0;font-size:14px;font-weight:bold;">${expiryDate}</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </td></tr>
    </table>

    <h2 style="font-size:22px;font-weight:bold;margin:30px 0 10px;color:${config.color};">Your Continued Benefits</h2>
    <div style="background-color:#F3F8FF;border-radius:8px;padding:20px 25px;margin-bottom:30px;font-size:16px;line-height:24px;color:#4B5563;">
        ${config.perks}
    </div>

    <table align="center"><tr><td style="background-color:#06A77D;border-radius:8px;">
        <a href="https://your-account-link.com" target="_blank" style="color:#fff;font-weight:bold;font-size:16px;text-decoration:none;display:inline-block;padding:14px 35px;">VIEW UPDATED CARD</a>
    </td></tr></table>

    <div style="height:40px;"></div>

    <h2 style="font-size:22px;font-weight:bold;margin:0 0 15px;color:#1F2937;">Recommended Accessories</h2>
    <table width="100%"><tr>${productHtml}</tr></table>

    <div style="height:30px;"></div>

    <p style="margin:0;color:#4B5563;">Thank you for continuing your journey with Impression Gallery. We’re proud to have you as a loyal member.</p>
    <p style="margin:15px 0 0;font-weight:bold;color:#1F2937;">The Impression Gallery Team</p>
</td></tr>

<tr><td align="center" style="padding:20px 40px;font-size:12px;color:#9ca3af;border-top:1px solid #eeeeee;">
    Impression Gallery | Opposite Devi Mandir, Nai Sadak, Siyana Bulandshahr
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`.trim();
};
