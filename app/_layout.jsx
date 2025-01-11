import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
