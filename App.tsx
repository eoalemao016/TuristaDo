import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, firebaseConfigured } from './firebaseConfig';

type Destination = {
  id: number;
  name: string;
  country: string;
  category: string;
  image: string;
  description: string;
  tag: string;
};

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Rio de Janeiro',
    country: 'Brasil',
    category: 'Praia',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200',
    description: 'Praias, montanhas e uma energia única entre o mar e a cidade.',
    tag: 'Destino queridinho',
  },
  {
    id: 2,
    name: 'Fernando de Noronha',
    country: 'Brasil',
    category: 'Natureza',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
    description: 'Águas cristalinas, trilhas e paisagens para guardar na memória.',
    tag: 'Paraíso brasileiro',
  },
  {
    id: 3,
    name: 'Santorini',
    country: 'Grécia',
    category: 'Romântico',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200',
    description: 'Casas brancas, pôr do sol inesquecível e o azul do Mediterrâneo.',
    tag: 'Experiência premium',
  },
  {
    id: 4,
    name: 'Bali',
    country: 'Indonésia',
    category: 'Cultura',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
    description: 'Templos, praias, natureza exuberante e uma cultura fascinante.',
    tag: 'Viva diferente',
  },
  {
    id: 5,
    name: 'Patagônia',
    country: 'Argentina',
    category: 'Aventura',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200',
    description: 'Montanhas gigantes e paisagens selvagens para quem ama aventura.',
    tag: 'Aventure-se',
  },
  {
    id: 6,
    name: 'Paris',
    country: 'França',
    category: 'Cultura',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200',
    description: 'Arte, gastronomia, história e lugares que parecem sair de um filme.',
    tag: 'Clássico mundial',
  },
];

const categories = [
  { name: 'Todos', icon: '✦' },
  { name: 'Praia', icon: '⌁' },
  { name: 'Natureza', icon: '♧' },
  { name: 'Aventura', icon: '↗' },
  { name: 'Cultura', icon: '◈' },
  { name: 'Romântico', icon: '♡' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [category, setCategory] = useState('Todos');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  const filteredDestinations = useMemo(
    () =>
      category === 'Todos'
        ? destinations
        : destinations.filter((item) => item.category === category),
    [category]
  );

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthMessage('');
    setPassword('');
    setAuthVisible(true);
  };

  const handleAuth = async () => {
    if (!firebaseConfigured) {
      setAuthMessage('Configure o Firebase em firebaseConfig.ts antes de usar o login.');
      return;
    }

    if (!email.trim() || password.length < 6) {
      setAuthMessage('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }

      setAuthVisible(false);
      setPassword('');
    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
        'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
        'auth/invalid-email': 'Digite um e-mail válido.',
        'auth/network-request-failed': 'Sem conexão. Tente novamente.',
      };
      setAuthMessage(messages[error?.code] || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!firebaseConfigured) {
      setAuthMessage('Configure o Firebase primeiro.');
      return;
    }

    if (!email.trim()) {
      setAuthMessage('Digite seu e-mail para receber o link de recuperação.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthMessage('Enviamos um link de recuperação para seu e-mail.');
    } catch {
      setAuthMessage('Não foi possível enviar o link. Confira o e-mail.');
    }
  };

  const handleLogout = async () => {
    if (firebaseConfigured) await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      <View style={styles.header}>
        <Pressable onPress={() => setSelected(null)} style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>✦</Text>
          </View>
          <View>
            <Text style={styles.brandName}>TuristaDo</Text>
            <Text style={styles.brandCaption}>TRAVEL & DISCOVER</Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          {user ? (
            <Pressable onPress={handleLogout} style={styles.userButton}>
              <Text style={styles.userButtonText}>Sair</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => openAuth('login')} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600' }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>EXPLORE • DESCUBRA • VIVA</Text>
            <Text style={styles.heroTitle}>O mundo está esperando por você.</Text>
            <Text style={styles.heroText}>
              Encontre destinos incríveis, inspire-se e comece a planejar sua próxima aventura.
            </Text>
            <Pressable
              style={styles.heroButton}
              onPress={() => {
                setCategory('Todos');
                setSelected(null);
              }}
            >
              <Text style={styles.heroButtonText}>Explorar destinos  →</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>TOP DESTINOS</Text>
              <Text style={styles.sectionTitle}>Lugares que inspiram</Text>
              <Text style={styles.sectionSubtitle}>Escolha uma experiência e descubra algo novo.</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((item) => (
              <Pressable
                key={item.name}
                onPress={() => setCategory(item.name)}
                style={[styles.categoryChip, category === item.name && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryIcon, category === item.name && styles.categoryTextActive]}>
                  {item.icon}
                </Text>
                <Text style={[styles.categoryText, category === item.name && styles.categoryTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationList}
          >
            {filteredDestinations.map((destination) => (
              <Pressable
                key={destination.id}
                style={styles.destinationCard}
                onPress={() => setSelected(destination)}
              >
                <Image source={{ uri: destination.image }} style={styles.cardImage} />
                <View style={styles.cardShade} />

                <Pressable
                  onPress={() => toggleFavorite(destination.id)}
                  style={styles.favoriteButton}
                >
                  <Text style={styles.favoriteText}>
                    {favorites.includes(destination.id) ? '♥' : '♡'}
                  </Text>
                </Pressable>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardTag}>{destination.tag.toUpperCase()}</Text>
                  <Text style={styles.cardTitle}>{destination.name}</Text>
                  <Text style={styles.cardLocation}>⌖ {destination.country}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inspirationSection}>
          <Text style={styles.eyebrow}>PLANEJE SUA VIAGEM</Text>
          <Text style={styles.sectionTitle}>Qual experiência combina com você?</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha um estilo e encontre lugares para sua próxima viagem.
          </Text>

          <View style={styles.experienceGrid}>
            {[
              {
                title: 'Aventura',
                text: 'Trilhas, montanhas e experiências fora da rotina.',
                category: 'Aventura',
                image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900',
              },
              {
                title: 'Relaxamento',
                text: 'Praias, hotéis e dias para desacelerar.',
                category: 'Praia',
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900',
              },
              {
                title: 'Cultura',
                text: 'História, gastronomia e novos costumes.',
                category: 'Cultura',
                image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=900',
              },
            ].map((item) => (
              <Pressable
                key={item.title}
                style={styles.experienceCard}
                onPress={() => {
                  setCategory(item.category);
                  setSelected(null);
                }}
              >
                <Image source={{ uri: item.image }} style={styles.experienceImage} />
                <View style={styles.experienceOverlay} />
                <View style={styles.experienceContent}>
                  <Text style={styles.experienceTitle}>{item.title}</Text>
                  <Text style={styles.experienceText}>{item.text}</Text>
                  <Text style={styles.experienceLink}>Explorar  →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.newsletter}>
          <View style={styles.newsletterIcon}>
            <Text style={styles.newsletterIconText}>✉</Text>
          </View>
          <View style={styles.newsletterCopy}>
            <Text style={styles.newsletterTitle}>Mais inspiração para sua viagem</Text>
            <Text style={styles.newsletterText}>
              Salve seus destinos favoritos e continue descobrindo novos lugares.
            </Text>
          </View>
          {!user && (
            <Pressable onPress={() => openAuth('signup')} style={styles.newsletterButton}>
              <Text style={styles.newsletterButtonText}>Criar conta</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>TuristaDo</Text>
          <Text style={styles.footerText}>Descubra. Planeje. Viva.</Text>
          <Text style={styles.footerCopyright}>© 2026 TuristaDo • Feito para quem ama viajar.</Text>
        </View>
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <SafeAreaView style={styles.modalSafe}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailHero}>
                <Image source={{ uri: selected.image }} style={styles.detailImage} />
                <View style={styles.detailShade} />
                <Pressable onPress={() => setSelected(null)} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
                <View style={styles.detailHeroText}>
                  <Text style={styles.detailTag}>{selected.tag.toUpperCase()}</Text>
                  <Text style={styles.detailTitle}>{selected.name}</Text>
                  <Text style={styles.detailLocation}>⌖ {selected.country}</Text>
                </View>
              </View>

              <View style={styles.detailBody}>
                <Text style={styles.detailHeading}>Sobre o destino</Text>
                <Text style={styles.detailDescription}>{selected.description}</Text>

                <View style={styles.detailInfoRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailInfoIcon}>◈</Text>
                    <Text style={styles.detailInfoTitle}>Experiência</Text>
                    <Text style={styles.detailInfoText}>{selected.category}</Text>
                  </View>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailInfoIcon}>♡</Text>
                    <Text style={styles.detailInfoTitle}>Favorito</Text>
                    <Text style={styles.detailInfoText}>
                      {favorites.includes(selected.id) ? 'Salvo' : 'Ainda não'}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.primaryAction}
                  onPress={() => toggleFavorite(selected.id)}
                >
                  <Text style={styles.primaryActionText}>
                    {favorites.includes(selected.id) ? '♥  Remover dos favoritos' : '♡  Salvar destino'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={authVisible} transparent animationType="fade" onRequestClose={() => setAuthVisible(false)}>
        <View style={styles.authBackdrop}>
          <View style={styles.authCard}>
            <Pressable onPress={() => setAuthVisible(false)} style={styles.authClose}>
              <Text style={styles.authCloseText}>×</Text>
            </Pressable>

            <View style={styles.authLogo}>
              <Text style={styles.authLogoText}>✦</Text>
            </View>
            <Text style={styles.authTitle}>
              {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </Text>
            <Text style={styles.authSubtitle}>
              {authMode === 'login'
                ? 'Entre para continuar sua jornada pelo mundo.'
                : 'Tenha seus destinos e experiências sempre por perto.'}
            </Text>

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              placeholderTextColor="#9AA3A0"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor="#9AA3A0"
              secureTextEntry
              style={styles.input}
            />

            {authMode === 'login' && (
              <Pressable onPress={handleResetPassword} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </Pressable>
            )}

            {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

            <Pressable onPress={handleAuth} style={styles.authButton} disabled={authLoading}>
              {authLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {authMode === 'login' ? 'Entrar na TuristaDo' : 'Criar minha conta'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthMessage('');
              }}
              style={styles.switchAuth}
            >
              <Text style={styles.switchAuthText}>
                {authMode === 'login'
                  ? 'Ainda não tenho uma conta'
                  : 'Já tenho uma conta'}
              </Text>
            </Pressable>

            {!firebaseConfigured && (
              <Text style={styles.configWarning}>
                Firebase ainda não configurado. Veja firebaseConfig.ts.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const COLORS = {
  dark: '#063D39',
  darker: '#022E2B',
  green: '#0A5750',
  cream: '#F6F0E4',
  gold: '#D9B65D',
  goldLight: '#F2D889',
  white: '#FFFFFF',
  text: '#173B38',
  muted: '#6F7E79',
  line: '#E5E1D7',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  scrollContent: { paddingBottom: 0 },

  header: {
    height: 76,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandMarkText: { color: COLORS.goldLight, fontSize: 19 },
  brandName: { color: COLORS.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.4 },
  brandCaption: { color: COLORS.goldLight, fontSize: 7, letterSpacing: 2.2, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  loginButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  loginButtonText: { color: COLORS.darker, fontWeight: '800', fontSize: 13 },
  userButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.45)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
  },
  userButtonText: { color: COLORS.white, fontWeight: '700' },

  hero: {
    height: 455,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1,34,31,.48)',
  },
  heroContent: { padding: 26, maxWidth: 570 },
  heroEyebrow: {
    color: COLORS.goldLight,
    fontSize: 11,
    letterSpacing: 3.1,
    fontWeight: '700',
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  heroText: {
    color: 'rgba(255,255,255,.9)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 500,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 22,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 25,
  },
  heroButtonText: { color: COLORS.darker, fontWeight: '900', fontSize: 13 },

  section: { backgroundColor: COLORS.dark, paddingTop: 34, paddingBottom: 38 },
  sectionHeader: { paddingHorizontal: 22 },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 2.7,
    fontWeight: '800',
    marginBottom: 7,
  },
  sectionTitle: { color: COLORS.text, fontSize: 28, lineHeight: 33, fontWeight: '900' },
  section: { backgroundColor: COLORS.dark, paddingTop: 34, paddingBottom: 38 },
  sectionSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionHeader: { paddingHorizontal: 22 },
  sectionTitle: { color: COLORS.white, fontSize: 28, lineHeight: 33, fontWeight: '900' },
  categoryList: { paddingHorizontal: 20, paddingVertical: 22, gap: 9 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.22)',
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  categoryChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  categoryIcon: { color: COLORS.goldLight, marginRight: 7, fontSize: 14 },
  categoryText: { color: 'rgba(255,255,255,.82)', fontSize: 12, fontWeight: '700' },
  categoryTextActive: { color: COLORS.darker },
  destinationList: { paddingLeft: 20, paddingRight: 8, gap: 14 },
  destinationCard: {
    width: 245,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.green,
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,.18)',
  },
  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(3,37,34,.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteText: { color: COLORS.white, fontSize: 22 },
  cardBottom: { position: 'absolute', left: 17, right: 17, bottom: 17 },
  cardTag: { color: COLORS.goldLight, fontSize: 8, letterSpacing: 1.4, fontWeight: '800' },
  cardTitle: { color: COLORS.white, fontSize: 25, fontWeight: '900', marginTop: 4 },
  cardLocation: { color: 'rgba(255,255,255,.9)', fontSize: 12, marginTop: 5 },

  inspirationSection: { backgroundColor: COLORS.cream, padding: 24, paddingTop: 40 },
  inspirationSection: { backgroundColor: COLORS.cream, padding: 24, paddingTop: 40 },
  experienceGrid: { marginTop: 22, gap: 14 },
  experienceCard: { height: 205, borderRadius: 18, overflow: 'hidden' },
  experienceImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  experienceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,.34)',
  },
  experienceContent: { position: 'absolute', left: 18, right: 18, bottom: 17 },
  experienceTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  experienceText: { color: 'rgba(255,255,255,.9)', fontSize: 12, lineHeight: 18, marginTop: 4 },
  experienceLink: { color: COLORS.goldLight, fontSize: 11, fontWeight: '900', marginTop: 10 },

  newsletter: {
    backgroundColor: COLORS.darker,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  newsletterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsletterIconText: { color: COLORS.goldLight, fontSize: 18 },
  newsletterCopy: { flex: 1, minWidth: 210 },
  newsletterTitle: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  newsletterText: { color: 'rgba(255,255,255,.65)', fontSize: 11, lineHeight: 16, marginTop: 3 },
  newsletterButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  newsletterButtonText: { color: COLORS.darker, fontWeight: '900', fontSize: 12 },
  footer: { backgroundColor: COLORS.darker, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.08)', padding: 26, alignItems: 'center' },
  footerBrand: { color: COLORS.goldLight, fontSize: 18, fontWeight: '900' },
  footerText: { color: 'rgba(255,255,255,.7)', fontSize: 11, marginTop: 4 },
  footerCopyright: { color: 'rgba(255,255,255,.42)', fontSize: 9, marginTop: 16, textAlign: 'center' },

  modalSafe: { flex: 1, backgroundColor: COLORS.cream },
  detailHero: { height: 420, position: 'relative' },
  detailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  detailShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.34)' },
  closeButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: COLORS.white, fontSize: 30, lineHeight: 32, fontWeight: '300' },
  detailHeroText: { position: 'absolute', left: 24, right: 24, bottom: 26 },
  detailTag: { color: COLORS.goldLight, fontSize: 9, letterSpacing: 2, fontWeight: '900' },
  detailTitle: { color: COLORS.white, fontSize: 38, fontWeight: '900', marginTop: 5 },
  detailLocation: { color: COLORS.white, fontSize: 14, marginTop: 5 },
  detailBody: { padding: 24 },
  detailHeading: { color: COLORS.text, fontSize: 23, fontWeight: '900' },
  detailDescription: { color: COLORS.muted, fontSize: 15, lineHeight: 23, marginTop: 10 },
  detailInfoRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  detailInfo: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 15 },
  detailInfoIcon: { color: COLORS.gold, fontSize: 20 },
  detailInfoTitle: { color: COLORS.text, fontSize: 12, fontWeight: '800', marginTop: 9 },
  detailInfoText: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  primaryAction: { backgroundColor: COLORS.dark, borderRadius: 25, padding: 15, alignItems: 'center', marginTop: 24 },
  primaryActionText: { color: COLORS.white, fontWeight: '900', fontSize: 13 },

  authBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.62)', justifyContent: 'center', padding: 18 },
  authCard: { backgroundColor: COLORS.cream, borderRadius: 25, padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  authClose: { position: 'absolute', top: 12, right: 15, zIndex: 2, width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  authCloseText: { color: COLORS.muted, fontSize: 27 },
  authLogo: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  authLogoText: { color: COLORS.goldLight, fontSize: 24 },
  authTitle: { color: COLORS.text, fontSize: 26, fontWeight: '900' },
  authSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 22 },
  inputLabel: { color: COLORS.text, fontSize: 11, fontWeight: '800', marginBottom: 7, marginTop: 11 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 14 },
  forgotButton: { alignSelf: 'flex-end', marginTop: 9 },
  forgotText: { color: COLORS.green, fontSize: 11, fontWeight: '800' },
  authMessage: { color: '#A33A30', backgroundColor: '#F8E8E5', borderRadius: 10, padding: 10, fontSize: 11, lineHeight: 16, marginTop: 14 },
  authButton: { backgroundColor: COLORS.dark, borderRadius: 13, padding: 14, alignItems: 'center', marginTop: 18 },
  authButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  switchAuth: { alignItems: 'center', paddingVertical: 16 },
  switchAuthText: { color: COLORS.green, fontSize: 12, fontWeight: '800' },
  configWarning: { color: '#8A6416', backgroundColor: '#FFF4CF', borderRadius: 10, padding: 10, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
