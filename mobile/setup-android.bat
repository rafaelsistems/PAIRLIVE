@echo off
echo =============================================
echo   PAIRLIVE - Setup Android Development
echo =============================================
echo.

:: Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Script ini perlu dijalankan sebagai Administrator
    echo     Klik kanan dan pilih "Run as administrator"
    pause
    exit /b 1
)

:: Set JAVA_HOME
echo [1/5] Setting JAVA_HOME...
setx JAVA_HOME "C:\Program Files\Java\jdk-24" /M
if %errorLevel% equ 0 (
    echo      JAVA_HOME set to C:\Program Files\Java\jdk-24
) else (
    echo      [!] Gagal set JAVA_HOME
)

:: Check Android SDK
echo.
echo [2/5] Checking Android SDK...
set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
if exist "%SDK_PATH%" (
    echo      Android SDK ditemukan di %SDK_PATH%
    setx ANDROID_HOME "%SDK_PATH%" /M
) else (
    echo      [!] Android SDK TIDAK ditemukan!
    echo.
    echo      Silakan install Android Studio dari:
    echo      https://developer.android.com/studio
    echo.
    echo      Atau install SDK saja:
    echo      https://developer.android.com/studio#command-tools
    echo.
    pause
    exit /b 1
)

:: Download gradle-wrapper.jar if not exists
echo.
echo [3/5] Checking Gradle Wrapper...
set "WRAPPER_JAR=D:\PAIRLIVE\mobile\android\gradle\wrapper\gradle-wrapper.jar"
if not exist "%WRAPPER_JAR%" (
    echo      Downloading gradle-wrapper.jar...
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/ArcBlock/java-did/main/gradle/wrapper/gradle-wrapper.jar' -OutFile '%WRAPPER_JAR%'"
    if exist "%WRAPPER_JAR%" (
        echo      gradle-wrapper.jar downloaded successfully
    ) else (
        echo      [!] Gagal download gradle-wrapper.jar
        echo      Download manual dari:
        echo      https://github.com/ArcBlock/java-did/raw/main/gradle/wrapper/gradle-wrapper.jar
    )
) else (
    echo      gradle-wrapper.jar sudah ada
)

:: Accept licenses
echo.
echo [4/5] Accepting Android SDK Licenses...
if exist "%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo y | "%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses >nul 2>&1
    echo      Licenses accepted
) else (
    echo      [!] SDK Manager tidak ditemukan, skip license acceptance
)

:: Verify setup
echo.
echo [5/5] Verifying setup...
echo.
echo =============================================
echo   Environment Variables:
echo =============================================
echo JAVA_HOME     = %JAVA_HOME%
echo ANDROID_HOME  = %ANDROID_HOME%
echo.

echo =============================================
echo   Setup selesai!
echo =============================================
echo.
echo Langkah selanjutnya:
echo 1. RESTART terminal/command prompt
echo 2. cd D:\PAIRLIVE\mobile
echo 3. npm install --legacy-peer-deps
echo 4. cd android ^&^& gradlew.bat assembleDebug
echo.
pause
