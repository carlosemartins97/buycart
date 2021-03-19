import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productSelected = cart.find(productInCart => productInCart.id === productId);
      
      if(!productSelected){
        const productInCart = (await api.get(`/products/${productId}`)).data;
    
        if(productInCart.id === productId ){
          const updateCart = ([...cart, {...productInCart, amount: 1}])
    
          setCart(updateCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
          toast('Produto Adicionado')
        }
      }
    
      if(productSelected){
        const productInStock = (await api.get(`stock/${productId}`)).data;
        //checkar se possui stock
        if(productInStock.amount > productSelected.amount){
          //encontrar produto
          let updateCart = cart.map(product => {
            if(product.id === productId){
              //setar no carrinho
              return {...product, amount: Number(product.amount) + 1}
            } else {
              return {...product}
            }
          })
          setCart(updateCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
        }
        else {
          toast.error('Quantidade solicitada fora de estoque')
        }
      }

    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productSelected = cart.find(productInCart => productInCart.id === productId);
      if(productSelected){
          //excluir produto do array cart
        cart.forEach((product, i) => {
          productId === product.id && cart.splice(i, 1)
        })
        setCart([...cart]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      } else {
        toast.error('Erro na remoção do produto')
      }
    } catch {
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount < 1){
        return;
      } else {
        const productInStock: Stock = (await api.get(`stock/${productId}`)).data;
        if(productInStock.amount >= amount){
          let updateCart = cart.map(product => {
            if(productId === product.id){
              return {...product, amount: amount}
            } else{
              return {...product}
            }
          })
          setCart(updateCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}


