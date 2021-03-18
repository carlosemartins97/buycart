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
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productSelected = cart.find(productInCart => productInCart.id === productId);
      const productInStock = (await api.get(`stock/${productId}`)).data;
      const productInCart = (await api.get(`/products/${productId}`)).data;

      if(!productSelected){
          if(productInCart.id === productId ){
            setCart([...cart, {...productInCart, amount: 1}])
            toast('Produto Adicionado')
          }
      }

      if(productSelected){
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
        }
        else {
          toast.error('Produto fora de estoque.')
        }
      }

    } catch {
      toast.error('Não foi possível adicionar o produto. Tenta novamente mais tarde.')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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


