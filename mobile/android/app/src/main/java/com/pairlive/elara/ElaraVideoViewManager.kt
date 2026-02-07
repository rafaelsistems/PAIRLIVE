package com.pairlive.elara

import android.view.SurfaceView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * View Manager untuk menampilkan video ELARA
 * 
 * Digunakan untuk menampilkan local dan remote video stream
 */
class ElaraVideoViewManager : SimpleViewManager<SurfaceView>() {
    
    companion object {
        const val REACT_CLASS = "ElaraVideoView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): SurfaceView {
        return SurfaceView(reactContext)
    }

    /**
     * Set session ID untuk video view ini
     */
    @ReactProp(name = "sessionId")
    fun setSessionId(view: SurfaceView, sessionId: String?) {
        // TODO: Bind video stream ke surface
    }

    /**
     * Set apakah ini local atau remote video
     */
    @ReactProp(name = "isLocal")
    fun setIsLocal(view: SurfaceView, isLocal: Boolean) {
        // TODO: Setup local vs remote video
    }

    /**
     * Set mirror mode (untuk local video)
     */
    @ReactProp(name = "mirror")
    fun setMirror(view: SurfaceView, mirror: Boolean) {
        // TODO: Setup mirror mode
    }

    /**
     * Set object fit mode
     */
    @ReactProp(name = "objectFit")
    fun setObjectFit(view: SurfaceView, objectFit: String?) {
        // TODO: Setup object fit (cover, contain, fill)
    }
}
