/**
 * Persistence + auth scaffolding.
 *
 * This module presents a backend-agnostic API for patch CRUD and auth.
 * All functions are stubs that return sensible defaults — plug in a real
 * backend (REST, GraphQL, IndexedDB, Firebase, Turso, etc.) by implementing
 * each function body. The public shape should not change so callers
 * (stores, components) remain unaffected.
 */

type Session = { user: { id: string; email?: string } } | null;
type AuthResponse = { error: Error | null };
type AuthStateChangeCallback = (event: string, session: Session) => void;
type Unsubscribe = () => void;

const notImplemented = (fn: string) => {
  console.warn(`[db] ${fn}() called but no backend is configured.`);
};

export const auth = {
  async getSession(): Promise<{ data: { session: Session } }> {
    notImplemented('auth.getSession');
    return { data: { session: null } };
  },

  onAuthStateChange(_callback: AuthStateChangeCallback): { data: { subscription: { unsubscribe: Unsubscribe } } } {
    notImplemented('auth.onAuthStateChange');
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  async signInWithOtp(_params: { email: string }): Promise<AuthResponse> {
    notImplemented('auth.signInWithOtp');
    return { error: null };
  },

  async signIn(_params: { email: string; password: string }): Promise<AuthResponse> {
    notImplemented('auth.signIn');
    return { error: null };
  },

  async signOut(): Promise<AuthResponse> {
    notImplemented('auth.signOut');
    return { error: null };
  },
};

/**
 * Fetch all patches for the current user.
 */
export const fetch = async (): Promise<Patch[] | null> => {
  notImplemented('fetch');
  return null;
};

/**
 * Insert a new patch.
 */
export const create = async (_data: Patch): Promise<boolean> => {
  notImplemented('create');
  return true;
};

/**
 * Update an existing patch by id.
 */
export const save = async ({ id: _id, ...data }: Patch): Promise<void> => {
  void data;
  notImplemented('save');
};

/**
 * Delete a patch by id.
 */
export const remove = async (_id: string): Promise<void> => {
  notImplemented('remove');
};

/**
 * Upsert — insert or update many patches at once.
 */
export const update = async (_data: Patch): Promise<boolean> => {
  notImplemented('update');
  return true;
};
