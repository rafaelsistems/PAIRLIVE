package com.pairlive.elara

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.ConcurrentHashMap

/**
 * ELARA Native Module untuk React Native
 * 
 * Menyediakan binding ke ELARA Protocol untuk komunikasi
 * real-time yang lebih baik dari WebRTC.
 * 
 * Fitur ELARA:
 * - Graceful Degradation: Kualitas turun, koneksi tetap
 * - NAT Hostile Ready: Bekerja di balik firewall ketat
 * - Event-Driven: Lebih efisien dan responsif
 */
class ElaraModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val TAG = "ElaraModule"
        private const val MODULE_NAME = "ElaraModule"
    }

    private val sessions = ConcurrentHashMap<String, ElaraSession>()
    private var nodeId: String? = null
    private var isInitialized = false

    override fun getName(): String = MODULE_NAME

    /**
     * Inisialisasi ELARA node
     */
    @ReactMethod
    fun initialize(config: ReadableMap?, promise: Promise) {
        try {
            Log.d(TAG, "Menginisialisasi ELARA node...")
            
            // Parse config
            val stunServers = config?.getArray("stunServers")?.toArrayList() 
                ?: listOf("stun:stun.l.google.com:19302")
            val turnServers = config?.getArray("turnServers")?.toArrayList() 
                ?: emptyList<String>()
            
            // Generate node ID
            nodeId = java.util.UUID.randomUUID().toString()
            
            // TODO: Inisialisasi ELARA Rust library via JNI
            // ElaraNative.initialize(nodeId, stunServers, turnServers)
            
            isInitialized = true
            
            val result = Arguments.createMap().apply {
                putString("nodeId", nodeId)
                putBoolean("success", true)
            }
            promise.resolve(result)
            
            Log.d(TAG, "ELARA node diinisialisasi: $nodeId")
        } catch (e: Exception) {
            Log.e(TAG, "Gagal menginisialisasi ELARA", e)
            promise.reject("INIT_ERROR", "Gagal menginisialisasi ELARA: ${e.message}")
        }
    }

    /**
     * Buat sesi baru
     */
    @ReactMethod
    fun createSession(sessionId: String, peerId: String, promise: Promise) {
        try {
            if (!isInitialized) {
                promise.reject("NOT_INITIALIZED", "ELARA belum diinisialisasi")
                return
            }
            
            Log.d(TAG, "Membuat sesi: $sessionId dengan peer: $peerId")
            
            val session = ElaraSession(
                sessionId = sessionId,
                localPeerId = nodeId!!,
                remotePeerId = peerId,
                context = reactApplicationContext
            )
            
            sessions[sessionId] = session
            
            // Setup event listeners
            session.setEventListener(object : ElaraSession.EventListener {
                override fun onConnected() {
                    sendEvent("elara:connected", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                    })
                }
                
                override fun onDisconnected(reason: String) {
                    sendEvent("elara:disconnected", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                        putString("reason", reason)
                    })
                }
                
                override fun onQualityChanged(quality: Int) {
                    sendEvent("elara:qualityChanged", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                        putInt("quality", quality)
                    })
                }
                
                override fun onMessage(message: String) {
                    sendEvent("elara:message", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                        putString("message", message)
                    })
                }
            })
            
            val result = Arguments.createMap().apply {
                putString("sessionId", sessionId)
                putBoolean("success", true)
            }
            promise.resolve(result)
            
        } catch (e: Exception) {
            Log.e(TAG, "Gagal membuat sesi", e)
            promise.reject("CREATE_ERROR", "Gagal membuat sesi: ${e.message}")
        }
    }

    /**
     * Mulai koneksi sesi
     */
    @ReactMethod
    fun connectSession(sessionId: String, promise: Promise) {
        try {
            val session = sessions[sessionId]
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan: $sessionId")
                return
            }
            
            Log.d(TAG, "Menghubungkan sesi: $sessionId")
            
            session.connect(object : ElaraSession.ConnectCallback {
                override fun onSuccess() {
                    promise.resolve(true)
                }
                
                override fun onError(error: String) {
                    promise.reject("CONNECT_ERROR", error)
                }
            })
            
        } catch (e: Exception) {
            Log.e(TAG, "Gagal menghubungkan sesi", e)
            promise.reject("CONNECT_ERROR", "Gagal menghubungkan: ${e.message}")
        }
    }

    /**
     * Toggle video
     */
    @ReactMethod
    fun toggleVideo(sessionId: String, promise: Promise) {
        try {
            val session = sessions[sessionId]
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan")
                return
            }
            
            val enabled = session.toggleVideo()
            promise.resolve(enabled)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Toggle audio
     */
    @ReactMethod
    fun toggleAudio(sessionId: String, promise: Promise) {
        try {
            val session = sessions[sessionId]
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan")
                return
            }
            
            val enabled = session.toggleAudio()
            promise.resolve(enabled)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Kirim pesan
     */
    @ReactMethod
    fun sendMessage(sessionId: String, message: String, promise: Promise) {
        try {
            val session = sessions[sessionId]
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan")
                return
            }
            
            session.sendMessage(message)
            promise.resolve(true)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Dapatkan statistik sesi
     */
    @ReactMethod
    fun getSessionStats(sessionId: String, promise: Promise) {
        try {
            val session = sessions[sessionId]
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan")
                return
            }
            
            val stats = session.getStats()
            val result = Arguments.createMap().apply {
                putInt("quality", stats.quality)
                putInt("latencyMs", stats.latencyMs)
                putDouble("packetLoss", stats.packetLoss.toDouble())
                putInt("bandwidthKbps", stats.bandwidthKbps)
                putDouble("duration", stats.duration.toDouble())
                putString("transportType", stats.transportType)
            }
            promise.resolve(result)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Tutup sesi
     */
    @ReactMethod
    fun closeSession(sessionId: String, promise: Promise) {
        try {
            val session = sessions.remove(sessionId)
            if (session == null) {
                promise.reject("NOT_FOUND", "Sesi tidak ditemukan")
                return
            }
            
            Log.d(TAG, "Menutup sesi: $sessionId")
            session.close()
            promise.resolve(true)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Shutdown ELARA node
     */
    @ReactMethod
    fun shutdown(promise: Promise) {
        try {
            Log.d(TAG, "Mematikan ELARA node...")
            
            // Tutup semua sesi
            sessions.forEach { (_, session) ->
                session.close()
            }
            sessions.clear()
            
            // TODO: Shutdown ELARA native library
            // ElaraNative.shutdown()
            
            isInitialized = false
            nodeId = null
            
            promise.resolve(true)
            
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Kirim event ke JavaScript
     */
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
