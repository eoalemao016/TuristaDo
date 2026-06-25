import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

export default function App() {
  const [destinoSelecionado, setDestinoSelecionado] = useState<any>(null);

  const destinos = [
    {
      id: 1,
      nome: 'Rio de Janeiro',
      imagem:
        'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      descricao:
        'Conheça o Cristo Redentor, Pão de Açúcar e as praias mais famosas do Brasil.',
    },
    {
      id: 2,
      nome: 'Foz do Iguaçu',
      imagem:
        'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      descricao:
        'Visite as impressionantes Cataratas do Iguaçu e aproveite a natureza.',
    },
    {
      id: 3,
      nome: 'Salvador',
      imagem:
        'https://images.unsplash.com/photo-1544989164-31b0c6459874?w=800',
      descricao:
        'História, cultura, música e praias paradisíacas na Bahia.',
    },
  ];

  if (destinoSelecionado) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌎 TuristaDo</Text>
        </View>

        <ScrollView>
          <Image
            source={{ uri: destinoSelecionado.imagem }}
            style={styles.imagemDetalhe}
          />

          <Text style={styles.tituloDetalhe}>
            {destinoSelecionado.nome}
          </Text>

          <Text style={styles.descricao}>
            {destinoSelecionado.descricao}
          </Text>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => setDestinoSelecionado(null)}
          >
            <Text style={styles.botaoTexto}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Text>© 2026 TuristaDo</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌎 TuristaDo</Text>
        <Text style={styles.subtitulo}>
          Descubra lugares incríveis
        </Text>
      </View>

      <ScrollView>
        <Text style={styles.tituloSecao}>
          Destinos em Destaque
        </Text>

        {destinos.map((destino) => (
          <View key={destino.id} style={styles.card}>
            <Image
              source={{ uri: destino.imagem }}
              style={styles.imagem}
            />

            <Text style={styles.cardTitulo}>
              {destino.nome}
            </Text>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => setDestinoSelecionado(destino)}
            >
              <Text style={styles.botaoTexto}>
                Ver Destino
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text>© 2026 TuristaDo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  header: {
    backgroundColor: '#0099ff',
    padding: 20,
    alignItems: 'center',
  },

  logo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#fff',
    marginTop: 5,
  },

  tituloSecao: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },

  imagem: {
    width: '100%',
    height: 180,
  },

  cardTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },

  botao: {
    backgroundColor: '#0099ff',
    margin: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },

  imagemDetalhe: {
    width: '100%',
    height: 250,
  },

  tituloDetalhe: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 15,
  },

  descricao: {
    fontSize: 16,
    marginHorizontal: 15,
    marginBottom: 20,
  },

  footer: {
    backgroundColor: '#ddd',
    padding: 12,
    alignItems: 'center',
  },
});