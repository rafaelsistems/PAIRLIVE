@echo off
setlocal enabledelayedexpansion

echo =============================================
echo   PAIRLIVE - Build Debug APK
echo =============================================
echo.

:: Set working directory
cd /d D:\PAIRLIVE\mobile

:: Check JAVA_HOME
echo [1/6] Checking Java...
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-24" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-24"
    ) else if exist "C:\Program Files\Java\jdk-17" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    ) else (
        echo [!] JAVA_HOME tidak diset dan JDK tidak ditemukan
        echo     Install JDK dari https://adoptium.net/
        goto :error
    )
)
echo      JAVA_HOME = %JAVA_HOME%

:: Check ANDROID_HOME
echo.
echo [2/6] Checking Android SDK...
if not defined ANDROID_HOME (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    ) else (
        echo [!] ANDROID_HOME tidak diset dan SDK tidak ditemukan
        echo.
        echo     Install Android Studio dari:
        echo     https://developer.android.com/studio
        echo.
        goto :error
    )
)
echo      ANDROID_HOME = %ANDROID_HOME%

:: Check gradle wrapper
echo.
echo [3/6] Checking Gradle Wrapper...
set "WRAPPER_JAR=android\gradle\wrapper\gradle-wrapper.jar"
if not exist "%WRAPPER_JAR%" (
    echo      gradle-wrapper.jar tidak ditemukan, mencoba download...
    
    :: Try curl first
    curl -L -o "%WRAPPER_JAR%" "https://github.com/ArcBlock/java-did/raw/main/gradle/wrapper/gradle-wrapper.jar" 2>nul
    
    if not exist "%WRAPPER_JAR%" (
        :: Try PowerShell
        powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/ArcBlock/java-did/raw/main/gradle/wrapper/gradle-wrapper.jar' -OutFile '%WRAPPER_JAR%' } catch { }" 2>nul
    )
    
    if not exist "%WRAPPER_JAR%" (
        echo [!] Gagal download gradle-wrapper.jar
        echo.
        echo     Download manual dari URL berikut dan simpan ke:
        echo     android\gradle\wrapper\gradle-wrapper.jar
        echo.
        echo     URL: https://github.com/ArcBlock/java-did/raw/main/gradle/wrapper/gradle-wrapper.jar
        echo.
        goto :error
    )
    echo      gradle-wrapper.jar downloaded
) else (
    echo      gradle-wrapper.jar OK
)

:: Check node_modules
echo.
echo [4/6] Checking dependencies...
if not exist "node_modules" (
    echo      Installing npm dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [!] npm install gagal
        goto :error
    )
) else (
    echo      node_modules OK
)

:: Create local.properties if not exists
echo.
echo [5/6] Checking local.properties...
if not exist "android\local.properties" (
    echo sdk.dir=%ANDROID_HOME:\=\\%> android\local.properties
    echo      local.properties created
) else (
    echo      local.properties OK
)

:: Build APK
echo.
echo [6/6] Building Debug APK...
echo      Ini mungkin memakan waktu beberapa menit...
echo.
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo [!] Build gagal!
    cd ..
    goto :error
)
cd ..

:: Success
echo.
echo =============================================
echo   BUILD BERHASIL!
echo =============================================
echo.
echo APK tersedia di:
echo D:\PAIRLIVE\mobile\android\app\build\outputs\apk\debug\app-debug.apk
echo.

:: Open folder
echo Membuka folder output...
start "" "android\app\build\outputs\apk\debug"

goto :end

:error
echo.
echo =============================================
echo   BUILD GAGAL
echo =============================================
echo.
echo Lihat pesan error di atas untuk detail.
echo Baca BUILD_APK.md untuk panduan lengkap.
echo.

:end
pause
endlocal
