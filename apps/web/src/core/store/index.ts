import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';

export interface CreateStoreOptions<T> {
  name: string;
  persist?: boolean | PersistOptions<T>;
  devtools?: boolean;
}

export function createStore<T extends object>(
  initialState: T,
  actions: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState']) => object,
  options: CreateStoreOptions<T> = { name: 'store' }
): UseBoundStore<StoreApi<T>> {
  const { name, persist: persistOpt, devtools: devtoolsOpt = true } = options;

  const stateCreator: StateCreator<T, [], [], T> = (set, get) => ({
    ...initialState,
    ...actions(set, get),
  } as T);

  if (persistOpt && devtoolsOpt) {
    const persistOptions = typeof persistOpt === 'object' ? persistOpt : { name: `kaiyan-${name}` };
    return create(
      devtools(
        persist(stateCreator as StateCreator<T, [], [['zustand/persist', T]]>, persistOptions as PersistOptions<T>),
        { name }
      ) as StateCreator<T, [], []>
    );
  }

  if (persistOpt) {
    const persistOptions = typeof persistOpt === 'object' ? persistOpt : { name: `kaiyan-${name}` };
    return create(
      persist(stateCreator as StateCreator<T, [], [['zustand/persist', T]]>, persistOptions as PersistOptions<T>) as StateCreator<T>
    );
  }

  if (devtoolsOpt) {
    return create(devtools(stateCreator, { name }));
  }

  return create(stateCreator);
}

export type { StateCreator, StoreApi, UseBoundStore };
