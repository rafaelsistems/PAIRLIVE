package com.pairlive

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * MainActivity untuk PAIRLIVE
 * Activity utama yang memuat React Native
 */
class MainActivity : ReactActivity() {

    /**
     * Mengembalikan nama komponen React Native yang terdaftar
     */
    override fun getMainComponentName(): String = "pairlive"

    /**
     * Mengembalikan delegate activity
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
