import CircularProgressExample from '@/components/circularProgress';
import { View } from 'react-native'
export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAE86F', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgressExample />
    </View>
  );
}
