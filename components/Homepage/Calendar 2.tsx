import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session"; // <-- import this for typing
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

const clientId =
  "416999670065-pipcujhi07b2t79250jbiu7fp64ic70i.apps.googleusercontent.com";

export default function GoogleCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });

  // We assert the type of response so TS knows it has `.authentication`
  type GoogleResponse = AuthSession.AuthSessionResult & {
    authentication?: {
      accessToken?: string;
      // you can add more fields if you want
    };
  };

  const typedResponse = response as GoogleResponse | null;

  useEffect(() => {
    if (
      typedResponse?.type === "success" &&
      typedResponse.authentication?.accessToken
    ) {
      fetchEvents(typedResponse.authentication.accessToken);
    }
  }, [typedResponse]);

  const fetchEvents = async (accessToken: string) => {
    try {
      const res = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setEvents(res.data.items);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <View style={styles.container}>
      {!typedResponse?.authentication ? (
        <Button
          title="Sign in to Google Calendar"
          onPress={() => promptAsync()}
          disabled={!request}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.event}>
              <Text style={styles.eventTitle}>
                {item.summary || "No Title"}
              </Text>
              <Text style={styles.eventTime}>
                {item.start?.dateTime || item.start?.date || "No Date"}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No events found.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  event: {
    marginBottom: 12,
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  eventTime: {
    fontSize: 12,
    color: "#555",
  },
});
