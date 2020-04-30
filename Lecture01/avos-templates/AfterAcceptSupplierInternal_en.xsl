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
                <img width="100%" height="100%" src="http://localhost/Custom/images/portal_header_jj.png" alt="Informatica Header Logo" />
            </td>
        </tr>
		<table width="625" align="center">
        <tr style="background-color: #ffffff;">
            <td style="font-family: Calibri, Helvetica, sans-sherif;">
                <p>Dear <xsl:value-of select="tns:sendEmail/properties/property[@name='firstName']"/>&#160;<xsl:value-of select="tns:sendEmail/properties/property[@name='lastName']"/>,</p>
<p>We continuously improve our business processes to enhance our service and to reduce time to market.</p>
<p>To improve our supplier relationship processes, we are pleased to introduce the new Johnson &amp; Johnson Supplier Portal. The Supplier Portal streamlines some of our supplier relationship business processes and enables you to manage your own supplier profile and documents.</p>
<p>To sign in to the Supplier Portal, click the following link:</p>
<p><a target="_blank" href="${loginPage}">${loginPage}</a></p>
<p>Your user name is: <strong><xsl:value-of select="tns:sendEmail/properties/property[@name='loginName']"/></strong></p>
<p>You will receive a link to set a new Supplier Portal password.</p>
<p>After your account is active, you can use the Supplier Portal to perform the following tasks:</p>
<ul>
	<li>Monitor our buyer-supplier relationship</li>
	<li>Maintain an accurate supplier profile</li>
	<li>Update corporate documentation</li>
	<li>Receive notifications from  our supplier relationship representatives</li>
	<li>Upload product catalogs</li>
</ul>
<p>If other people in your organization are authorized to manage your supplier relationship with us, please take a few minutes to  add them as contacts in the Supplier Portal. Each person will receive an automated welcome email from the Supplier Portal that contains a user name and instructions for signing in.</p>
<p>We hope that you find the Supplier Portal easy to use and a valuable communication and maintenance tool.</p>
<p>If you have any questions, you can contact us by telephone or email:</p>
<ul>
    <li>
        <strong>Telephone</strong>: (650) 385-5000  8:00A-5:00P PT
    </li>
    <li>
        <strong>Email</strong>: supplier.management@jnj.com
    </li>
</ul>
<p>We look forward to working with you.</p>
<p>Regards,</p>
<p>Supplier Onboarding Team</p>
<p>Johnson &amp; Johnson</p>
<p>1 Johnson And Johnson Plaza, New Brunswick NJ 08933</p>
<p>http://www.jnj.com</p>
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
