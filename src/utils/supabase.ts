// import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'
import { state as blank } from '@/stores/patch';
import { URL, PUBLIC_KEY } from '../../supabase.config.js';
import type { Patch } from '@/types';

const supabase = createClient(URL, PUBLIC_KEY);


  // session from beforeCreate in App
  // async function getProfile() {
  //   try {
  //     loading.value = true
  //     const { user } = session.value

  //     let { data, error, status } = await supabase
  //       .from('profiles')
  //       .select(`username, website, avatar_url`)
  //       .eq('id', user.id)
  //       .single()

  //     if (error && status !== 406) throw error

  //     if (data) {
  //       username.value = data.username
  //       website.value = data.website
  //       avatar_url.value = data.avatar_url
  //     }
  //   } catch (error) {
  //     alert(error.message)
  //   } finally {
  //     loading.value = false
  //   }
  // }



export const auth = supabase.auth;

const login = async ({ email, password }) => {};
const isLoggedIn = () => {};


/**
 * Fetches patches from the matrix
 * @returns {} The user's patches
 */
export const fetch = async () => {
  const { data, error } = await supabase
    .from('patches')
    .select();

  return data;
};

export const create = async (data: Patch) => {
  const { error } = await supabase
    .from('patches')
    .insert(data);
    // .insert({ id: 1, name: 'Denmark' })

  return true;
};

export const save = async ({ id, ...data }: Patch) => {
  const { error } = await supabase
    .from('patches')
    .update(data)
    // .update({ name: 'Australia' })
    .eq('id', id);
};

/* */
export const remove = async (id: string) => {
  const { error } = await supabase
    .from('patches')
    .delete()
    .eq('id', id);
};
/**/

// ie sync all patches
export const update = async (data: Patch) => {
  const { error } = await supabase
    .from('patches')
    .upsert(data);

  return true;
};


