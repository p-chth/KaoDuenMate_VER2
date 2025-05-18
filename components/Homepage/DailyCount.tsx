import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";

interface DailyCountProps {
  dayCount: number;
}

const fireImage = require("../../assets/images/fire.png");

const screenWidth = Dimensions.get("window").width;
const size = Math.min(screenWidth * 0.36, 150); // max size 150, scale with screen

export default function DailyCount({ dayCount }: DailyCountProps) {
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
    marginVertical: 10, // add vertical margin to avoid overlap
    alignSelf: "center", // center horizontally
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
