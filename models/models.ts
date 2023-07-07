
export interface Book {
    id: string;
    name: string;
    author: string;
    image: string;
    description: string;
    price: string;
    categoryID: string;
}

export interface Books {
    books: Book[];
}

export interface User {
    username: string;
    password: string[];
}

export interface Users {
    users: User[]
}

export interface OrderBook {
    bookID: string;
    numBook: string;
    price: string;
}

export interface Order {
    orderID: string;
    books: OrderBook[];
}

export interface Category {
    id: string;
    name: string;
}

export interface Categories {
    categories: Category[]
}



