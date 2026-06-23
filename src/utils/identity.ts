import AsyncStorage from '@react-native-async-storage/async-storage';

// Identité de compte PERSISTANTE : un identifiant stable est généré une fois et
// gardé sur le téléphone, pour que le serveur reconnaisse le même joueur d'une
// partie/lancement à l'autre (sans login). Le pseudo est mémorisé aussi.
const ID_KEY = 'aov.accountId';
const PSEUDO_KEY = 'aov.pseudo';

export async function getAccountId(): Promise<string> {
  let id = await AsyncStorage.getItem(ID_KEY).catch(() => null);
  if (!id) {
    id = `acc_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    await AsyncStorage.setItem(ID_KEY, id).catch(() => {});
  }
  return id;
}

export async function getSavedPseudo(): Promise<string> {
  return (await AsyncStorage.getItem(PSEUDO_KEY).catch(() => null)) ?? '';
}

export async function savePseudo(pseudo: string): Promise<void> {
  await AsyncStorage.setItem(PSEUDO_KEY, pseudo).catch(() => {});
}
