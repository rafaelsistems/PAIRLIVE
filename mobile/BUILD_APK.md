# Panduan Build APK Debug - PAIRLIVE Mobile

## Persyaratan

### 1. Node.js (sudah terinstall ✓)
- Versi: 18 atau lebih baru
- Cek: `node --version`

### 2. Java JDK (sudah terinstall ✓)
- Lokasi: `C:\Program Files\Java\jdk-24`
- Cek: `java -version`

### 3. Android SDK (BELUM TERINSTALL ❌)

**Opsi A: Install Android Studio (Direkomendasikan)**
1. Download dari: https://developer.android.com/studio
2. Install Android Studio
3. Buka Android Studio → SDK Manager
4. Install:
   - Android SDK Platform 34 (Android 14)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - Android Emulator (opsional)

**Opsi B: Install Command-line Tools Saja**
1. Download dari: https://developer.android.com/studio#command-tools
2. Extract ke `C:\Android\cmdline-tools\latest\`
3. Jalankan: `sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"`

## Setup Environment Variables

Buka PowerShell sebagai Administrator dan jalankan:

```powershell
# Set JAVA_HOME
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-24", "User")

# Set ANDROID_HOME (sesuaikan path jika berbeda)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

# Tambah ke PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$androidPaths = "$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools"
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$androidPaths", "User")
```

**Restart terminal setelah setting environment variables!**

## Langkah Build APK

### Metode 1: Menggunakan Script (Setelah Setup)

```cmd
cd D:\PAIRLIVE\mobile
build-apk.bat
```

### Metode 2: Manual Step-by-Step

Buka **Command Prompt** atau **PowerShell** BARU (bukan dari Cursor):

```powershell
# 1. Masuk ke folder mobile
cd D:\PAIRLIVE\mobile

# 2. Set environment (jika belum permanent)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Masuk ke folder android
cd android

# 5. Build debug APK
.\gradlew.bat assembleDebug

# 6. APK akan ada di:
# android\app\build\outputs\apk\debug\app-debug.apk
```

## Troubleshooting

### Error: SDK location not found

Buat file `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\NAMA_USER\\AppData\\Local\\Android\\Sdk
```
Ganti `NAMA_USER` dengan username Windows Anda.

### Error: Could not determine the dependencies

Jalankan:
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug --refresh-dependencies
```

### Error: Gradle wrapper not found

Download gradle-wrapper.jar manual:
1. Download dari: https://github.com/ArcBlock/java-did/raw/main/gradle/wrapper/gradle-wrapper.jar
2. Simpan ke: `android/gradle/wrapper/gradle-wrapper.jar`

### Error: JAVA_HOME is not set

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
```

### Error: license not accepted

```powershell
cd $env:ANDROID_HOME\tools\bin
.\sdkmanager --licenses
```
Ketik `y` untuk menerima semua licenses.

## Setelah Build Berhasil

APK debug akan tersedia di:
```
D:\PAIRLIVE\mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

Untuk install ke device:
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## Catatan Penting

1. **Gunakan terminal di luar Cursor** - Cursor sandbox memiliki pembatasan jaringan
2. **Pastikan koneksi internet stabil** - Dependencies akan didownload (~500MB+)
3. **First build memakan waktu lama** - Gradle akan download banyak dependencies
4. **JDK 17 lebih stabil** - Jika ada masalah, pertimbangkan install JDK 17 dari Adoptium

## Quick Check

Jalankan ini untuk verifikasi setup:

```powershell
Write-Output "=== Environment Check ==="
Write-Output "Node: $(node --version)"
Write-Output "Java: $(java -version 2>&1 | Select-Object -First 1)"
Write-Output "JAVA_HOME: $env:JAVA_HOME"
Write-Output "ANDROID_HOME: $env:ANDROID_HOME"
Write-Output "ADB: $(adb --version 2>&1 | Select-Object -First 1)"
```
