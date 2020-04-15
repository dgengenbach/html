<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:tns="http://www.informatica.com/solutions/avosEmailService"
				xmlns:xhtml="http://www.w3.org/1999/xhtml"
				version="1.0">
<xsl:output encoding="UTF-8" indent="yes" method="html" version="4.0"/>
<xsl:template match="/">
<message>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <meta http-equiv="content-style-type" content="text/css; charset=utf-8"/>
    <!-- All CSS styles must be defined in-line for Gmail support -->
</head>
<body>
    <table  style="border: 1px solid #ccc; box-shadow: 0 0 4px #ccc;"  align="center" cellpadding="14" cellspacing="0" width="650">
        <tr>
            <td>
                <img width="100%" height="100%" src="images/HEADER_logos_.png" alt="Informatica Header Logo" />
            </td>
        </tr>
		<table width="625" align="center">
        <tr style="background-color: #ffffff;">
            <td style="font-family: Calibri, Helvetica, sans-sherif;">
                <p>Dear Valued Supplier,</p>
<p>We continuously improve our business processes to enhance our service and to reduce time to market.</p>
<p>To improve our supplier relationship processes, we are pleased to introduce the new [buyer_organization_name] Supplier Portal. The Supplier Portal streamlines some of our supplier relationship business processes and enables you to manage your own supplier profile and documents.</p>
<p>We invite you to register as a supplier on the [buyer_organization_name] Supplier Portal.</p>
<p>To register, click the following link:</p>
<p><a target="_blank" href="${portalUrl}">${portalUrl}</a></p>
<p>After your account is active, you can use the Supplier Portal to perform the following tasks:</p>
<ul>
	<li>Monitor our buyer-supplier relationship</li>
	<li>Maintain an accurate supplier profile</li>
	<li>Update corporate documentation</li>
    <li>Receive notifications from our supplier relationship representatives</li>
	<li>Upload product catalogs</li>
</ul>
<p>We hope that you find the Supplier Portal easy to use and a valuable communication and maintenance tool.</p>
<p>If you have any questions, you can contact us by telephone or email:</p>
<ul>
    <li>
        <strong>Telephone</strong>: [organization_telephone_number_and_business_hours]
    </li>
    <li>
        <strong>Email</strong>: [organization_email]
    </li>
</ul>
<p>Regards,</p>
<p>Supplier Onboarding Team</p>
<p>[organization_name]</p>
<p>[organization_address]</p>
<p>[organization_website]</p>
            </td>
        </tr>
		</table>
		<table width="625" cellpadding="32" align = "center" height = "90">
        <tr style="background-color: #D9D9D9;" >
            <td align="center">
			    <table style="color: #ffffff; font-size: 14px" cellpadding="2" cellspacing="0" > 
                    <tr>
                        <td>
                            <span style = "color: #3C363F ;font-family: Roboto-Light,Sans-serif; font-size: 14px;text-align: right;letter-spacing: -0.08px">Powered by</span>
                        </td>
                        <td>
                           <span style = "font-family: Roboto-Regular,Sans-serif;font-size:14px;color:#FF6500;letter-spacing: -0.08px;text-align:center;"> Informatica </span>
                        </td>
                    </tr>
				</table>	
            </td>
        </tr>
		</table>
    </table>
</body>
</html>
</message>
</xsl:template>
</xsl:stylesheet>
