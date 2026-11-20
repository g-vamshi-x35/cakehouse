import { Linking } from 'react-native';

export const business = {
  name: 'Cake House',
  subBrand: 'Sri Marlapolama Bakery',
  tagline: 'Great Taste In Every Bite',
  phones: ['8087481245', '8951503674'],
  whatsappNumber: '918087481245',
  address: 'New Kamlapur Main Road, Kamlapur, Golabandha, Gopalpur, Berhampur, Odisha',
  mapsUrl: 'https://share.google/wc90GTuMxzbrdNxvy',
  hours: 'Every day, 9:00 AM – 9:00 PM',
};

export function openWhatsApp(message: string, phone = business.whatsappNumber) {
  const digits = phone.replace(/\D/g, '');
  const withCode = digits.length === 10 ? `91${digits}` : digits;
  return Linking.openURL(`https://wa.me/${withCode}?text=${encodeURIComponent(message)}`);
}

export function callPhone(phone: string) {
  return Linking.openURL(`tel:${phone}`);
}
