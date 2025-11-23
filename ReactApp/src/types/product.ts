export interface Product {
  _id: string;
  // Lowercase fields (new format)
  name?: string;
  price?: number;
  category?: string;
  brand?: string;
  stock?: number;
  description?: string;
  currency?: string;
  color?: string;
  size?: string;
  availability?: string;
  image?: string;
  // Capitalized fields (existing format)
  Name?: string;
  Price?: number;
  Category?: string;
  Brand?: string;
  Stock?: number;
  Description?: string;
  Currency?: string;
  Color?: string;
  Size?: string;
  Availability?: string;
  Image?: string;
  // Other fields
  index?: number;
  Index?: number;
  ean?: number;
  EAN?: number;
  internalId?: number;
  'Internal ID'?: number;
  createdAt?: string;
  updatedAt?: string;
}
