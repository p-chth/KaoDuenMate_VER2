import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Dimensions, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { AppText } from "@/components/AppText";

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
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;

      try {
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
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
        } else if (diffDays === 1) {
          streak += 1;
        } else {
          streak = 1;
        }

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
        <AppText style={styles.dayCount} bold>{dayCount}</AppText>
        <Image source={fireImage} resizeMode="contain" style={styles.fireImage} />
      </View>
      <AppText style={styles.streakText} bold>Days streak</AppText>
    </View>
  );
}

const styles = StyleSheet.create<{
  fireBadge: ViewStyle;
  row: ViewStyle;
  dayCount: TextStyle;
  fireImage: ImageStyle;
  streakText: TextStyle;
}>({
  fireBadge: {
    backgroundColor: "#FFE9E2",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Replaced shadow*
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
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
    color: "#FF5722",
    marginRight: 8,
  },
  fireImage: {
    width: 30,
    height: 30,
  },
  streakText: {
    fontSize: 18,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "700",
    color: "#FF5722",
  },
});