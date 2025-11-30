export interface Item {
  id: string;
  name: string;
  category: string;
  imageSeed: number; // For consistent placeholder generation
}

export interface Shop {
  id: string;
  name: string;
  price: number;
  distance: string;
  address: string;
  rating: number;
  isOpen: boolean;
  isLowestPrice: boolean;
  description: string;
}

export interface SearchResult {
  item: Item;
  shops: Shop[];
  location: string;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS'
}