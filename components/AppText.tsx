import React from 'react';
import { Text, TextProps } from 'react-native';

export const AppText: React.FC<TextProps & { bold?: boolean }> = ({ style, bold, ...props }) => {
  return (
    <Text
      style={[{ fontFamily: bold ? 'CheapAsChipsDEMO-Bold' : 'CheapAsChipsDEMO' }, style]}
      {...props}
    />
  );
};