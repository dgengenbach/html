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
                <p>Dear <xsl:value-of select="tns:sendEmail/properties/property[@name='loginName']"/> ,</p>
<p>Your supplier application cannot be processed because of incorrect or insufficient information. We have sent back the application to you. We request you to review your details, update your application with the correct information, and then submit again.</p>
<p>If you have any questions, you can contact us by telephone or email:</p>
<p><strong>Telephone:</strong> (650) 385-5000  8:00A-5:00P PT<br/>
    <strong>Email:</strong> supplier.management@jnj.com
</p>
<p>Regards,</p>
<p>Portal Team,<br/>Johnson &amp; Johnson<br/>1 Johnson And Johnson Plaza, New Brunswick NJ 08933<br/>http://www.jnj.com</p>

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
