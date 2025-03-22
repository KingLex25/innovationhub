import bcrypt from 'bcrypt';

// Utility function to hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Utility function to compare a password with a hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate a random placeholder image URL
export const getPlaceholderImage = (type: string, seed?: string): string => {
  const seedValue = seed || Math.random().toString(36).substring(7);
  
  switch (type) {
    case 'person':
      return `https://source.unsplash.com/random/200x200/?portrait&${seedValue}`;
    case 'event':
      return `https://source.unsplash.com/random/800x600/?tech,event&${seedValue}`;
    case 'project':
      return `https://source.unsplash.com/random/800x600/?technology,science&${seedValue}`;
    case 'article':
      return `https://source.unsplash.com/random/800x600/?technology,innovation&${seedValue}`;
    default:
      return `https://source.unsplash.com/random/800x600/?technology&${seedValue}`;
  }
};

// Format date in a user-friendly way
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Create a slug from a title
export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Truncate text to a specific length and add ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
