import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Forgot password modal state
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStage, setForgotStage] = useState("email"); // "email" | "verify"
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIN HANDLER ---
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.log("Additional steps required:", signInAttempt);
      }
    } catch (err) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError("Password is incorrect. Please try again.");
      } else {
        setError(err.errors?.[0]?.message || "Something went wrong.");
      }
    }
  };

  // --- FORGOT PASSWORD FLOW ---
  const handlePasswordReset = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);

      if (forgotStage === "email") {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: forgotEmail,
        });
        Alert.alert("Check your email", "We sent you a reset code.");
        setForgotStage("verify");
      } else if (forgotStage === "verify") {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode,
          password: newPassword,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          Alert.alert("Success", "Your password has been reset!");
          setForgotVisible(false);
          setForgotStage("email");
          setForgotEmail("");
          setResetCode("");
          setNewPassword("");
        } else {
          console.log("Reset incomplete:", result);
        }
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        enableOnAndroid: true,
        enableAutomaticScroll: true,
        extraScrollHeight: 30,
      }}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i4.png")}
          style={styles.illustration}
        />
        <Text style={styles.title}>Welcome Back</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={setEmailAddress}
          textContentType="username"
          autoComplete="email"
          keyboardType="email-address"
        />

        <View style={{ position: "relative", width: "100%" }}>
          <TextInput
            style={[
              styles.input,
              error && styles.errorInput,
              { paddingRight: 40 },
            ]}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            textContentType="password"
            autoComplete="password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={{ position: "absolute", right: 15, top: "22%" }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Forgot Password Button */}
        <TouchableOpacity
          onPress={() => setForgotVisible(true)}
          style={{ alignSelf: "center", marginTop: 25 }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={forgotVisible}
          onRequestClose={() => setForgotVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                width: "100%",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}
              >
                {forgotStage === "email"
                  ? "Reset Password"
                  : "Enter Verification Code"}
              </Text>

              {forgotStage === "email" ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  {/* Emaiil */}
                  {/* <TextInput
                    style={styles.input}
                    value={forgotEmail}
                    editable={false}
                    textContentType="username"
                    autoComplete="username"
                    autoCapitalize="none"
                  /> */}

                  {/* Enter Verification Code */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter the code sent to your email"
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="numeric"
                  />
                  {/* Old Enter New Password */}
                  {/* <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  /> */}

                  <View style={{ position: "relative", width: "100%" }}>
                    <TextInput
                      style={[
                        styles.input,
                        error && styles.errorInput,
                        { paddingRight: 40 },
                      ]}
                      value={newPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="#9A8478"
                      secureTextEntry={!showNewPassword}
                      onChangeText={setNewPassword}
                      textContentType="newPassword" // iOS: tells system this is a signup field
                      autoComplete="new-password" // Android: triggers "save password" prompt
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword((prev) => !prev)}
                      style={{ position: "absolute", right: 15, top: "22%" }}
                    >
                      <Ionicons
                        name={showNewPassword ? "eye-off" : "eye"}
                        size={22}
                        //color="#9A8478"
                        color={COLORS.text}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={handlePasswordReset}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? "Please wait..."
                    : forgotStage === "email"
                    ? "Send Reset Code"
                    : "Confirm Reset"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setForgotVisible(false);
                  setForgotStage("email");
                }}
                style={{ marginTop: 10, alignSelf: "center" }}
              >
                <Text style={{ color: COLORS.textLight }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAwareScrollView>
  );
}
