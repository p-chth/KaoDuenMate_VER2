import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const fireImage = require("../../assets/images/fire.png");

const screenWidth = Dimensions.get("window").width;
const size = Math.min(screenWidth * 0.36, 150);

export default function DailyCount() {
  const [dayCount, setDayCount] = useState<number>(0);

  useEffect(() => {
    const updateStreak = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);

      // Get today string
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;

      try {
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // First time user, initialize streak
          await setDoc(userDocRef, {
            dailyStreak: 1,
            lastOpenDate: todayStr,
          });
          setDayCount(1);
          return;
        }

        const data = userDocSnap.data();

        const lastOpenDateStr = data.lastOpenDate as string | undefined;
        let streak = data.dailyStreak as number | undefined;

        if (!lastOpenDateStr || !streak) {
          // No streak data, initialize
          streak = 1;
          await setDoc(
            userDocRef,
            {
              dailyStreak: streak,
              lastOpenDate: todayStr,
            },
            { merge: true }
          );
          setDayCount(streak);
          return;
        }

        const lastOpenDate = new Date(lastOpenDateStr);
        const diffTime = today.getTime() - lastOpenDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no change
        } else if (diffDays === 1) {
          // Next day, increment streak
          streak += 1;
        } else {
          // Missed days, reset streak
          streak = 1;
        }

        // Update Firestore
        await setDoc(
          userDocRef,
          {
            dailyStreak: streak,
            lastOpenDate: todayStr,
          },
          { merge: true }
        );

        setDayCount(streak);
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    updateStreak();
  }, []);

  return (
    <View
      style={[
        styles.fireBadge,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.dayCount}>{dayCount}</Text>
        <Image source={fireImage} style={styles.fireImage} />
      </View>
      <Text style={styles.streakText}>Days streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fireBadge: {
    backgroundColor: "#FFE9E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    padding: 12,
    marginVertical: 10,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5722",
    marginRight: 8,
  },
  fireImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  streakText: {
    fontSize: 18,
    color: "#FF5722",
    fontWeight: "700",
  },
});
