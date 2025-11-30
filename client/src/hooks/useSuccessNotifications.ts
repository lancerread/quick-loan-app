import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SuccessNotification {
  name: string;
  amount: number;
  phone: string;
}

const KENYAN_NAMES = [
  'James Mwangi',
  'Grace Kamau',
  'David Ochieng',
  'Ruth Kipchoge',
  'Samuel Kariuki',
  'Elizabeth Nyambura',
  'Joseph Kiplagat',
  'Mercy Koech',
  'Michael Kipkemei',
  'Patricia Ngeny',
  'Daniel Kimani',
  'Susan Kipchoge',
  'Peter Kipchoge',
  'Agnes Maina',
  'John Kipchoge',
  'Lucy Omondi',
  'Paul Kiplagat',
  'Martha Kipchoge',
  'Robert Kipkemei',
  'Faith Kiplagat',
];

const LOAN_AMOUNTS = [5500, 6800, 7800, 9800, 11200, 16800, 21200, 25600, 30000];

// Obfuscate phone number to show first 4 digits and last 2 digits
const obfuscatePhoneNumber = (phone: string): string => {
  if (phone.length !== 10) return phone;
  return `${phone.substring(0, 4)}****${phone.substring(8)}`;
};

// Generate a random Kenyan phone number in 07... format
const generatePhoneNumber = (): string => {
  const prefix = '07';
  const middleDigits = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return prefix + middleDigits;
};

// Generate random notification
const generateNotification = (): SuccessNotification => {
  const name = KENYAN_NAMES[Math.floor(Math.random() * KENYAN_NAMES.length)];
  const amount = LOAN_AMOUNTS[Math.floor(Math.random() * LOAN_AMOUNTS.length)];
  const phone = generatePhoneNumber();

  return { name, amount, phone };
};

export const useSuccessNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Generate first notification after 3 seconds
    const firstTimer = setTimeout(() => {
      const notification = generateNotification();
      toast({
        title: `${notification.name} received their loan!`,
        description: `Amount: KSh ${notification.amount.toLocaleString()} | Phone: ${obfuscatePhoneNumber(notification.phone)}`,
        duration: 5000,
      });
    }, 3000);

    // Generate subsequent notifications every 8 seconds
    const interval = setInterval(() => {
      const notification = generateNotification();
      toast({
        title: `${notification.name} received their loan!`,
        description: `Amount: KSh ${notification.amount.toLocaleString()} | Phone: ${obfuscatePhoneNumber(notification.phone)}`,
        duration: 5000,
      });
    }, 8000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [toast]);
};
