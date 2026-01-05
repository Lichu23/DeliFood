export interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  }
  
  export interface Store {
    id: string;
    name: string;
    slug: string;
    currency: 'EUR' | 'ARS';
    role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'DELIVERY';
    isActive: boolean;
  }
  
  export interface LoginResponse {
    user: User;
    stores: Store[];
    token: string;
  }
  
  export interface RegisterResponse {
    user: User;
    store: {
      id: string;
      name: string;
      slug: string;
      currency: string;
    };
    token: string;
  }