- Avoid writing comments
- Always try to simply the solution do not make it complicated
- Just do whatever you are told to do, avoid making additional changes.
- use `npx expo insta <dependancy-name>` to install package

- we have `.env` variable setup here
- EXPO_PUBLIC_GITHUB_CLIENT_ID
- EXPO_PUBLIC_GITHUB_SECRET_ID
- EXPO_PUBLIC_STORAGE_ENC_KEY

### State management

- use zustand as a state management library, all the stores like located inside `store` folder.
- Each Store must follow this type

```typescript
type State = {
  state: {
    // you can store all the state here
  };
  actions: {
    // here it will content all the actions based on state to be updated
  };
};

// you can separetly create a selector to return that either state or action
// always return the action like this  use<StoreName>Action() to return that action
```

### Storage

- use `react-native-mmkv` as default storage to store all the state (required), each state is represent with key.
- Always create a key inside const `Storage` object in caps `STATE_NAME` correspond to that value.
- helper type safe functions to easily save and get the key.
