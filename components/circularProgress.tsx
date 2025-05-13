import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function CircularProgressExample() {
  return (
    <View style={{ alignItems: 'center', marginTop: 50 }}>
      <AnimatedCircularProgress
        size={120}
        width={15}
        fill={70}
        tintColor="green"
        backgroundColor="lightgrey"
        rotation={0}
      >
        {(fill: number) => (
          <View>
            <Text>Progress Bar{`${Math.round(fill)}%`}</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
}
