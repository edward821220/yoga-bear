import React, { useState, useEffect, useContext } from "react";
import { getDoc, doc } from "firebase/firestore";
import styled from "styled-components";
import Image from "next/image";
import { AuthContext } from "../contexts/authContext";
import { db } from "../../lib/firebase";
import RemoveIcon from "../../public/trash.png";

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1280px;
  padding: 20px;
`;

const CartContainer = styled.div`
  display: flex;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const CartItems = styled.ul`
  border-top: 1px solid gray;
  padding-top: 20px;
  width: 80%;
  margin-right: 20px;
`;
const CartItem = styled.li`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
`;
const ItemInfo = styled.div`
  flex-basis: 70%;
  display: flex;
`;
const CoverWrapper = styled.div`
  width: 300px;
  height: 180px;
  position: relative;
  margin-right: 20px;
`;
const ItemName = styled.p``;

const ItemPrice = styled.p`
  flex-basis: 15%;
`;
const ItemRemove = styled.div`
  flex-basis: 10%;
`;
const RemoveIconWrapper = styled.div`
  position: relative;
  height: 20px;
  width: 20px;
  cursor: pointer;
`;

const OrderDetails = styled.div`
  flex-basis: 30%;
  border: 1px solid gray;
  padding: 20px;
  height: 50%;
`;
const DetailsTitle = styled.h3`
  font-size: 18px;
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid gray;
  margin-bottom: 30px;
`;
const DetailItem = styled.p`
  margin-bottom: 20px;
`;
const Subtotal = styled.p`
  font-size: 36px;
  color: orange;
  margin-bottom: 30px;
`;
const Button = styled.button`
  background-color: orange;
  color: white;
  padding: 10px;
  display: block;
  width: 100%;
  cursor: pointer;
`;

function Cart() {
  const [cartItems, setCartItems] = useState<{ cover: string; name: string; price: string; id: string }[]>();
  const { isLogin, userData } = useContext(AuthContext);
  const { uid } = userData;
  const subtotal = cartItems?.reduce((acc, current) => acc + Number(current.price), 0);
  useEffect(() => {
    const getCartItems = async () => {
      if (!uid) return;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap) {
        const items: { cover: string; name: string; price: string; id: string }[] = docSnap.data().cartItems;
        setCartItems(items);
      }
    };
    getCartItems();
  }, [uid]);

  return (
    <Wrapper>
      <Title>購物車</Title>
      <CartContainer>
        <CartItems>
          <CartItem>
            <ItemInfo>課程名稱</ItemInfo>
            <ItemPrice>價格</ItemPrice>
            <ItemRemove>刪除</ItemRemove>
          </CartItem>
          {cartItems?.map((item) => (
            <CartItem key={item.id}>
              <ItemInfo>
                <CoverWrapper>
                  <Image src={item.cover} alt="cover" fill />
                </CoverWrapper>
                <ItemName>{item.name}</ItemName>
              </ItemInfo>
              <ItemPrice>{item.price}</ItemPrice>
              <ItemRemove>
                <RemoveIconWrapper>
                  <Image src={RemoveIcon} alt="remove" fill />
                </RemoveIconWrapper>
              </ItemRemove>
            </CartItem>
          ))}
        </CartItems>
        <OrderDetails>
          <DetailsTitle>訂單明細</DetailsTitle>
          <DetailItem>小計</DetailItem>
          <Subtotal>NT. {subtotal}</Subtotal>
          <Button>結帳去</Button>
        </OrderDetails>
      </CartContainer>
    </Wrapper>
  );
}

export default Cart;
