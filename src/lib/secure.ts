import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'eni.profiles';
const ACTIVE_KEY = 'eni.activeProfile';

export async function savePassword(profileId: string, password: string) {
  await SecureStore.setItemAsync(`eni.conn.${profileId}.pass`, password);
}

export async function getPassword(profileId: string): Promise<string | null> {
  return SecureStore.getItemAsync(`eni.conn.${profileId}.pass`);
}

export async function deletePassword(profileId: string) {
  await SecureStore.deleteItemAsync(`eni.conn.${profileId}.pass`);
}

export async function saveProfiles(profiles: any[]) {
  // strip passwords before writing to AsyncStorage
  const safe = profiles.map(({ password, ...rest }) => rest);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(safe));
}

export async function loadProfiles(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function setActiveProfileId(id: string | null) {
  if (id) await AsyncStorage.setItem(ACTIVE_KEY, id);
  else await AsyncStorage.removeItem(ACTIVE_KEY);
}

export async function getActiveProfileId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_KEY);
}
