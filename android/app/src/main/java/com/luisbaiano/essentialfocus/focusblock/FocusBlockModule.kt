package com.luisbaiano.essentialfocus.focusblock

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FocusBlockModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FocusBlock"

  @ReactMethod
  fun ping(promise: Promise) {
    promise.resolve("pong from Kotlin")
  }
}
