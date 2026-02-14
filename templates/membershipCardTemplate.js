/**
 * Generates the full HTML content for the digital membership card email.
 * This function handles all dynamic data insertion, tier configuration, and HTML structure.
 *
 * @param {object} data - The data object containing user and product information.
 * @param {object} data.user - The customer user object (must contain name, membershipTier, cardExpiry, membershipID, cardUrl).
 * @param {Date} data.user.cardExpiry - The expiry date (used to calculate MM/YY).
 * @param {string} data.user.membershipTier - The tier (e.g., "Silver", "Gold") to determine styling and perks.
 * @param {string} data.user.membershipID - The unique ID used for the formatted card number.
 * @param {string} data.user.cardUrl - The base64 Data URL for the QR code image.
 * @param {string[]} data.productImages - Array of product image URLs for the featured section.
 * @returns {string} The complete HTML string for the email body.
 */
export const membershipCardTemplate = ({ user, productImages = [] }) => {
    // --- 1. CONFIGURATION BASED ON TIER ---

    // Define styling and perks based on the membership tier
    const tierConfig = {
    Silver: {
        color: '#3B82F6', // Blue
        bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961769/knq3mmu0zqvkgfbdsm44.jpg',
        textColor: '#000000',
        perks: 'As a Silver member, you enjoy *10% off all repairs*, a special Birthday gift, and access to our priority service line.',
        filter: 'brightness(60%)',
        font2:'#000000'
    },
    Gold: {
        color: '#D97706', // Amber/Gold
        bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961767/xrrvllowwpn1bekbhne8.jpg',
        textColor: '#000000',
        perks: 'Your Gold status grants you *20% off all repairs*, a FREE screen protector, a Birthday gift, and a dedicated account manager for premium support.',
    },
    default: {
        color: '#9333EA', // Purple
        bgColor: 'http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759961768/nhxkhckxufohgajbropd.jpg',
        textColor: '#ffffff',
        perks: 'Platinum members enjoy *30% off all repairs*, VIP support, early access to new products, and exclusive invites to events.',
    },
};


    const tier = user.membershipTier || 'default';
    const config = tierConfig[tier] || tierConfig.default;


    // --- 2. DATA PROCESSING ---

    // Format Expiry Date (Date object to MM/YY string)
    let expiryDate = 'N/A';
    if (user.cardExpiry) {
        // Ensure user.cardExpiry is treated as a Date object or string parsable by Date
        const date = user.cardExpiry instanceof Date ? user.cardExpiry : new Date(user.cardExpiry);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        expiryDate = `${month}/${year}`;
    }

    // Use the membershipID (which is the user._id) and format it
    const rawId = user.membershipID ? user.membershipID.toString().slice(-16).padStart(16, '0') : '0000000000000000';
    const cardNumber = rawId.match(/.{1,4}/g).join(' '); // Format as XXXX XXXX XXXX XXXX

    const customerName = user.name || 'Valued Customer';


    // --- 3. GENERATE PRODUCT IMAGES HTML BLOCK ---

    const productHtml = productImages.slice(0, 3).map((imageUrl, index) => `
        <td width="33.33%" align="center" style="padding: 10px; vertical-align: top;">
            <img src="${imageUrl}" alt="Product ${index + 1}" width="160" style="display: block; border: 0; max-width: 160px; height: 160px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9CA3AF;">
                Shop Now
            </p>
        </td>
    `).join('');


    // --- 4. TEMPLATE REPLACEMENT ---

    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Your Exclusive ${tier} Membership!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F8F8; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

    <!-- 1. Master Table (Centers content) -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #F8F8F8; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                
                <!-- 2. Content Container (Max width for desktop, fluid for mobile) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    
                    <!-- Header/Logo Area -->
                    <tr>
                        <td align="center" style="padding: 30px 20px 15px 20px; border-bottom: 1px solid #f0f0f0;">
                            <!-- Placeholder for your Company Logo -->
                            <img src="http://res.cloudinary.com/dvh3ndrgx/image/upload/v1759699191/h4vf39ipjzczxkvoetwr.png" alt="Company Logo" width="160" style="display: block; border: 0; max-width: 160px; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                        </td>
                    </tr>

                    <!-- Main Content Area -->
                    <tr>
                        <td align="left" style="padding: 35px 40px 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #1F2937;">
                                                <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 15px 0; color: #1F2937;">
                                Congratulations, ${customerName}!
                            </h1>

                            <p style="margin: 0 0 25px 0; color: #4B5563;">
                                We're thrilled to officially welcome you to the *${tier}* tier of our Impression Gallery membership program. Your dedication deserves exclusive benefits and recognition.
                            </p>
                            
                            <!-- Card Image Area (The core of the email) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 20px 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td align="center" style="padding: 10px 0; ">
                                        <!-- Card container: uses background image and sets a fixed dimension for card appearance -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="400" height="250" style="width: 400px; height: 250px; border-collapse: collapse; background-image: url('${config.bgColor}'); background-size: cover; background-position: center; border-radius: 12px; font-family: Arial, sans-serif; color: ${config.textColor}; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4); mso-table-lspace: 0pt; mso-table-rspace: 0pt; filter: ${config.filter || 'none'};">
                                            <tr>
                                                <td style="padding: 25px;">
                                                
                                                    <!-- Top Row: Card Title and QR Code -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <!-- Card Titles -->
                                                            <td align="left" style="font-size: 14px; line-height: 18px; color: ${config.textColor};">
                                                                <p style="margin: 0; padding: 0; font-size: 18px; font-weight: bold; margin-bottom: 5px;">Impression Gallery</p>
                                                                <p style="margin: 0; padding: 0; font-size: 12px; opacity: 0.8;">${tier} Member Card</p>
                                                            </td>
                                                            <!-- QR Code -->
                                                            <td align="right" width="60" style="padding-left: 15px;">
                                                                <img src="${user.cardUrl}" alt="QR Code" width="60" height="60" style="display: block; border: 0; border-radius: 4px; background-color: #ffffff; max-width: 60px; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Spacer -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr><td height="50" style="line-height: 50px; font-size: 1px;">&nbsp;</td></tr>
                                                    </table>

                                                    <!-- Middle Row: Card Number and Holder Info -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <!-- Card Number -->
                                                            <td align="left" style="font-size: 20px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 2px; color: ${config.textColor}; padding-bottom: 10px;">
                                                                <p style="margin: 0; padding: 0;">${cardNumber}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <!-- Card Holder and Expiry -->
                                                            <td>
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td align="left" style="width: 70%; font-size: 10px; line-height: 14px; opacity: 0.7; color: ${config.font2 || config.textColor};">
                                                                            <p style="margin: 0; padding: 0; margin-bottom: 2px;">Card Holder</p>
                                                                            <p style="margin: 0; padding: 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">${customerName}</p>
                                                                        </td>
                                                                        <td align="right" style="width: 30%; font-size: 10px; line-height: 14px; opacity: 0.7; color: ${config.font2 || config.textColor};">
                                                                            <p style="margin: 0; padding: 0; margin-bottom: 2px;">Valid Thru</p>
                                                                            <p style="margin: 0; padding: 0; font-size: 14px; font-weight: bold;">${expiryDate}</p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                </td>
                                            </tr>
                                        </table>
                                        <!-- End Card Container -->
                                    </td>
                                </tr>
                            </table>
                            <!-- End Card Image Area -->

                            <h2 style="font-size: 22px; font-weight: bold; margin: 30px 0 10px 0; color: ${config.color};">
                                Your Exclusive Benefits:
                            </h2>

                            <!-- Benefits Summary Block -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #F3F8FF; border-radius: 8px; margin-bottom: 30px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td align="left" style="padding: 20px 25px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
                                        <p style="margin: 0; padding: 0;">
                                            ${config.perks}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Call to Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #06A77D; padding: 0;">
                                        <a href="https://your-account-link.com" target="_blank" style="font-size: 17px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block; letter-spacing: 0.5px; padding: 15px 35px; border-radius: 8px;">
                                            EXPLORE YOUR BENEFITS
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Product Section Spacer -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr><td height="40" style="line-height: 40px; font-size: 1px;">&nbsp;</td></tr>
                            </table>
                            
                            <!-- Featured Products Section -->
                            <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 15px 0; color: #1F2937;">
                                Shop Our Featured Accessories
                            </h2>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    ${productHtml}
                                </tr>
                            </table>
                            <!-- End Featured Products Section -->
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr><td height="30" style="line-height: 30px; font-size: 1px;">&nbsp;</td></tr>
                            </table>

                            <p style="margin: 0 0 0 0; color: #4B5563;">
                                Thank you for being a valued member of Impression Gallery. We are committed to providing you with the best technology and service.
                            </p>
                            <p style="margin: 15px 0 0 0; font-weight: bold; color: #1F2937;">
                                The Impression Gallery Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #9ca3af; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0;">
                                Impression Gallery | Opposite devi mandir, Nai sadak, Siyana Bulandshahr
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Content Container -->

            </td>
        </tr>
    </table>
    <!-- End Master Table -->

</body>
</html>
    `;

    return template.trim();
};
