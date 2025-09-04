import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, userData?: any) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { error: error as Error | null };
      }

      // Profile creation should be handled automatically by the database trigger
      console.log('📝 Profile will be created automatically by database trigger');
      console.log('📧 User email:', email);
      console.log('📄 User data:', userData);

      // If user is created and confirmed, try to create profile as fallback
      // This handles cases where the database trigger might be missing or failing
      if (data.user && data.user.email_confirmed_at) {
        console.log('🔄 User confirmed, checking if profile exists...');
        
        // Check if profile was created by trigger
        const { data: profile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', data.user.id)
          .single();

        if (profileCheckError && profileCheckError.code === 'PGRST116') {
          // Profile doesn't exist, create it manually as fallback
          console.log('⚠️ Profile not found, creating manually as fallback...');
          
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              username: userData?.username || null,
              full_name: userData?.full_name || null,
              avatar_url: userData?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createProfileError) {
            console.error('❌ Failed to create profile manually:', createProfileError);
            // Don't return error here as user account was created successfully
            // The profile can be created later
          } else {
            console.log('✅ Profile created manually as fallback');
          }
        } else if (!profileCheckError && profile) {
          console.log('✅ Profile found, ensuring email is set...');
          
          // Update profile email if missing
          if (!profile.email) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                email: data.user.email,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id);

            if (updateError) {
              console.error('⚠️ Failed to update profile email:', updateError);
            } else {
              console.log('✅ Profile email updated');
            }
          }
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signOut,
      signInWithEmail,
      signUpWithEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}