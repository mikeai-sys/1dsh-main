import { supabase } from '../lib/supabase';

export const getUserAccountType = async (): Promise<'adult' | 'kids'> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 'adult'; // Default to adult for guest users or if not logged in
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user account type:', error);
    return 'adult'; // Default to adult on error
  }

  return profile?.account_type || 'adult';
};