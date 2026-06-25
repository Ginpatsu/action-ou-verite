import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { colors, font, spacing } from '../theme';

// Conditions Générales d'Utilisation (CGU). Accessible depuis le menu principal.
// Important pour ce type de jeu (contenu adulte + publication sur les réseaux).
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.p}>{children}</Text>
    </View>
  );
}

export default function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen scroll>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>‹ Retour</Text>
      </Pressable>
      <Text style={styles.h1}>Conditions Générales d'Utilisation</Text>
      <Text style={styles.updated}>Dernière mise à jour : juin 2026</Text>

      <Section title="1. Objet">
        Action ou Vérité Hardcore (« l'application ») est un jeu de soirée humoristique destiné à être joué entre amis
        consentants. En utilisant l'application, tu acceptes les présentes conditions.
      </Section>

      <Section title="2. Âge et contenu adulte">
        L'application est réservée aux personnes de 18 ans ou plus. Le jeu peut générer ou inciter à des contenus adultes,
        provocants ou embarrassants. Tu déclares avoir l'âge requis et jouer de ton plein gré.
      </Section>

      <Section title="3. Responsabilité des contenus">
        Les actions, vérités et publications sont écrites et publiées par les joueurs eux-mêmes. L'application n'écrit ni
        ne publie rien automatiquement : elle se contente d'ouvrir le réseau social que tu choisis. Tu es seul·e
        responsable de ce que tu écris, publies ou fais publier, ainsi que des conséquences éventuelles.
      </Section>

      <Section title="4. Consentement et respect">
        Joue uniquement avec des personnes consentantes. Sont interdits : le harcèlement, les menaces, la diffamation,
        les contenus haineux, sexuels non consentis, ou tout contenu illégal. Ne publie jamais sur le compte d'une
        personne sans son accord.
      </Section>

      <Section title="5. Données personnelles">
        En mode local, aucune donnée ne quitte le téléphone. En mode en ligne, l'application enregistre uniquement un
        pseudo, un identifiant technique et des statistiques de jeu (parties, malus). Les parties terminées sont
        supprimées automatiquement après quelques jours. Aucun mot de passe ni e-mail n'est demandé, et aucune donnée
        n'est vendue.
      </Section>

      <Section title="6. Disponibilité">
        L'application et son serveur sont fournis « en l'état », sans garantie de disponibilité ni d'absence de bugs. Le
        service peut être interrompu ou modifié à tout moment.
      </Section>

      <Section title="7. Limitation de responsabilité">
        Dans les limites permises par la loi, les auteurs de l'application ne peuvent être tenus responsables des
        dommages, conflits ou conséquences résultant de l'utilisation du jeu ou des contenus publiés par les joueurs.
      </Section>

      <Section title="8. Modifications">
        Ces conditions peuvent évoluer. La poursuite de l'utilisation après une mise à jour vaut acceptation des
        nouvelles conditions.
      </Section>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.textMuted, fontSize: 16, fontWeight: font.semibold, marginBottom: spacing.lg },
  h1: { color: colors.text, fontSize: 26, fontWeight: font.black },
  updated: { color: colors.textFaint, fontSize: 13, marginTop: spacing.xs, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  h2: { color: colors.text, fontSize: 17, fontWeight: font.bold, marginBottom: spacing.xs },
  p: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
});
