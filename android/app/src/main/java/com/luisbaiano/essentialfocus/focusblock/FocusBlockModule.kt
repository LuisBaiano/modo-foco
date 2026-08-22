package com.luisbaiano.essentialfocus.focusblock

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Módulo nativo exposto ao JS como "FocusBlock". Ainda é só um stub — a
 * lógica real de bloqueio (AccessibilityService/UsageStatsManager) fica
 * pra uma fase futura; ping() existe só pra validar a ponte RN<->Kotlin.
 */
class FocusBlockModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FocusBlock"

  @ReactMethod
  fun ping(promise: Promise) {
    promise.resolve("pong from Kotlin")
  }
}
