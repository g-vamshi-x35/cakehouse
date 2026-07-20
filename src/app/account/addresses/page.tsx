import AddressManager from "@/components/account/AddressManager";
import { createClient } from "@/lib/supabase/server";

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, label, full_address, city, pincode, is_default")
    .eq("customer_id", user!.id)
    .order("is_default", { ascending: false });

  return <AddressManager addresses={addresses ?? []} />;
}
