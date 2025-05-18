// app/(auth)/login.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig"; // Adjust path as needed

const showAlert = (message: string) => {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Message", message);
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        return showAlert("Email and password are required");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in user:", userCredential.user);
      showAlert("Login successful!");
      router.push("/home"); // Navigate to home after login
    } catch (error: any) {
      console.log("Login error:", error);
      showAlert(error.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/logo.png")} style={styles.logo} />

      <TextInput
        placeholder="Username"
        placeholderTextColor="#000"
        style={styles.input}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#000"
        style={styles.input}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    borderRadius: 20,
    marginBottom: 40,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 20,
    fontFamily: "Cochin",
    marginBottom: 15,
  },
  forgotText: {
    alignSelf: "flex-start",
    marginBottom: 20,
    fontSize: 14,
    color: "#333",
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: "flex-end",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Cochin",
  },
});
