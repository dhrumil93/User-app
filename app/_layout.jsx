import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: true,
            title: 'Login',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: true,
            title: 'Sign Up',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: true,
            title: 'User Profile',
            headerBackVisible: false,
          }} 
        />
        <Stack.Screen 
          name="update" 
          options={{ 
            headerShown: true,
            title: 'Update Profile',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="tokendetails" 
          options={{ 
            headerShown: true,
            title: 'Token Details',
            headerBackTitle: 'Back',
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                <Ionicons name="log-out-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="updatewithtoken" 
          options={{ 
            headerShown: true,
            title: 'Update With Token',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="deleteaccount" 
          options={{ 
            headerShown: true,
            title: 'Delete Account',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="photos" 
          options={{ 
            headerShown: true,
            title: 'My Photos',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
