"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/lib/actions/admin";
import { inputClasses } from "@/components/admin/AdminUI";

export default function SiteAnnouncementForm({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-cream rounded-2xl p-6 space-y-3 max-w-lg">
      <h3 className="font-heading text-lg text-brown">Site Announcement Bar</h3>
      <p className="text-xs text-ink/50">
        Optional short message — leave blank to hide it from the site.
      </p>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="e.g. Closed on Diwali, back Nov 2nd!"
        className={inputClasses}
      />
      <button
        onClick={() =>
          startTransition(async () => {
            await updateSiteSettingAction("announcement", value);
            setSaved(true);
          })
        }
        disabled={pending}
        className="rounded-full bg-rose text-white font-semibold px-6 py-2.5 text-sm hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {saved && <span className="text-xs text-green-700 ml-3">Saved!</span>}
    </div>
  );
}
