import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export type PickedImage = { uri: string; mimeType: string; width: number; height: number };

const MAX_BYTES = 8 * 1024 * 1024;

/** Lets the customer choose a photo from the gallery or take one with the camera. */
export async function pickImage(source: 'library' | 'camera'): Promise<PickedImage | { error: string } | null> {
  const perm = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { error: source === 'camera' ? 'Camera permission is needed to take a photo.' : 'Photo access is needed to choose an image.' };
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: true, exif: false };
  const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  if (a.fileSize && a.fileSize > MAX_BYTES) return { error: 'That photo is too large — please choose one under 8 MB.' };
  return { uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', width: a.width, height: a.height };
}

/**
 * Uploads to the same public `uploads` bucket and `custom-cakes/` folder the
 * website's custom-cake form uses, so staff see the photo in their dashboard.
 */
export async function uploadCustomCakeImage(img: PickedImage): Promise<string> {
  const ext = img.mimeType.includes('png') ? 'png' : img.mimeType.includes('webp') ? 'webp' : 'jpg';
  const path = `custom-cakes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const body = await (await fetch(img.uri)).arrayBuffer();
  const { error } = await supabase.storage.from('uploads').upload(path, body, { contentType: img.mimeType, upsert: false });
  if (error) throw error;
  return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
}
