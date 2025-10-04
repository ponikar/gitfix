
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Linking, Button } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AuthContext } from '../providers/with-auth';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export default function ReposScreen() {
  const { token, hasRepoScope, login } = React.useContext(AuthContext);
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    const fetchRepos = async () => {
      if (token && hasRepoScope) {
        try {
          const response = await fetch('https://api.github.com/user/repos', {
            headers: {
              Authorization: `token ${token}`,
            },
          });
          const data = await response.json();
          setRepos(data);
        } catch (error) {
          console.error('Error fetching repos:', error);
        }
      }
    };
    fetchRepos();
  }, [token, hasRepoScope]);

  return (
    <View style={styles.container}>
      {hasRepoScope ? (
        <>
          <Text style={styles.title}>Your Repositories</Text>
          <FlatList
            data={repos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.repoContainer}>
                <Text style={styles.repoName} onPress={() => Linking.openURL(item.html_url)}>{item.full_name}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>Repository Access Required</Text>
          <Text>Please grant access to your repositories to continue.</Text>
          <Button title="Grant Access" onPress={login} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  repoContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  repoName: {
    fontSize: 16,
    color: 'blue',
  },
});
