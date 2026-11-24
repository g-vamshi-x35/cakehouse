import { supabase } from './supabase';

export type Address = {
  id: string;
  label: string | null;
  full_address: string;
  city: string | null;
  pincode: string | null;
  is_default: boolean;
};

export function addressText(a: Pick<Address, 'full_address' | 'city' | 'pincode'>) {
  return [a.full_address, a.city, a.pincode].filter((x) => x && x.trim()).join(', ');
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('id, label, full_address, city, pincode, is_default')
    .eq('customer_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Address[] | null) ?? [];
}

export async function saveAddress(
  userId: string,
  a: { id?: string; label: string; full_address: string; city: string; pincode: string; is_default: boolean }
) {
  // Only one default address per customer, like the website's address manager.
  if (a.is_default) await supabase.from('addresses').update({ is_default: false }).eq('customer_id', userId);
  const row = {
    customer_id: userId,
    label: a.label.trim() || null,
    full_address: a.full_address.trim(),
    city: a.city.trim() || null,
    pincode: a.pincode.trim() || null,
    is_default: a.is_default,
  };
  const { error } = a.id
    ? await supabase.from('addresses').update(row).eq('id', a.id)
    : await supabase.from('addresses').insert(row);
  if (error) throw error;
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}
