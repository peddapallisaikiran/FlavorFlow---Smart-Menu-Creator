
export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  category: string;
  isBestseller?: boolean;
  createdAt: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface AIParseResult {
  title: string;
  description: string;
  price: number;
  isVeg: boolean;
  category: string;
}

export type AppView = 'merchant' | 'public';
