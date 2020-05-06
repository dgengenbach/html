@echo off
set JBOSS_HOME=C:\Jboss\EAP-7.1.0
set JBOSS_DEPLOYMENTS=%JBOSS_HOME%\standalone\deployments
set CONSENT_DIR=C:\Users\Administrator\Desktop\Demo\McD\app
echo ============================================
echo.
echo Creating war file...
jar -cvf mcd.war *
echo deploying to %JBOSS_DEPLOYMENTS%\
move %CONSENT_DIR%\mcd.war %JBOSS_DEPLOYMENTS%\
echo Done. 
pause
