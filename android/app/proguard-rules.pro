# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# WebView JS interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Facebook SDK is referenced by capacitor-firebase-authentication but not used in this project.
# Suppress R8 missing class errors for these optional provider classes.
-dontwarn com.facebook.**
