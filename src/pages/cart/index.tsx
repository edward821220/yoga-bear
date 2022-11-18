import React, { useState, useEffect, useContext } from "react";
import { getDoc, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import styled from "styled-components";
import Image from "next/image";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/authContext";
import { db } from "../../../lib/firebase";
import { orderQtyState, bearMoneyState } from "../../../lib/recoil";
import RemoveIcon from "../../../public/trash.png";

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.colors.color1};
  min-height: calc(100vh - 100px);
`;
const Container = styled.div`
  margin: 0 auto;
  max-width: 1280px;
  padding: 20px;
`;

const CartContainer = styled.div`
  display: flex;
  color: ${(props) => props.theme.colors.color2};
`;

const CartItems = styled.ul`
  background-color: ${(props) => props.theme.colors.color1};
  width: 80%;
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  padding: 20px 10px 0px 10px;
  margin-right: 20px;
`;
const CartItem = styled.li`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #654116;
  &:last-child {
    border-bottom: none;
  }
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
  display: flex;
  justify-content: center;
`;
const RemoveIconWrapper = styled.div`
  position: relative;
  height: 20px;
  width: 20px;
  cursor: pointer;
  padding-left: 10px;
`;

const OrderDetails = styled.div`
  flex-basis: 30%;
  background-color: ${(props) => props.theme.colors.color1};
  height: 50%;
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  padding: 20px 10px;
`;
const DetailsTitle = styled.h3`
  font-size: 18px;
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #654116;
  margin-bottom: 30px;
`;
const DetailItems = styled.div`
  display: flex;
  justify-content: space-between;
`;
const DetailItem = styled.p`
  margin-bottom: 20px;
`;
const Total = styled(DetailItems)`
  border-top: 2px solid #654116;
  padding-top: 10px;
`;
const Button = styled.button`
  display: block;
  font-size: 16px;
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  padding: 10px;
  width: 30%;
  margin: 0 auto;
  cursor: pointer;
`;

function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<{ cover: string; name: string; price: string; id: string }[]>();
  const { userData } = useContext(AuthContext);
  const { uid } = userData;
  const subtotal = cartItems?.reduce((acc, current) => acc + Number(current.price), 0);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);

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

  const handleCheckout = () => {
    if (!subtotal) {
      alert("購物車沒東東唷！");
      return;
    }
    const confirm = window.confirm("確定要購買嗎？");
    if (!confirm) return;
    if (subtotal > bearMoney) {
      alert("熊幣餘額不足唷！請加值～");
    } else {
      setBearMoney((prev) => prev - subtotal);
      setCartItems([]);
      const docRef = doc(db, "users", uid);
      updateDoc(docRef, {
        cartItems: [],
        bearMoney: bearMoney - subtotal,
      });
      cartItems?.forEach((item) => {
        updateDoc(docRef, {
          boughtCourses: arrayUnion(item.id),
        });
      });
      alert("購買成功！可以去上課囉～");
      setOrderQty(0);
      router.push("/myCourses/videoCourses");
    }
  };

  return (
    <Wrapper>
      <Container>
        <CartContainer>
          <CartItems>
            <CartItem>
              <ItemInfo>課程名稱</ItemInfo>
              <ItemPrice>價格</ItemPrice>
              <ItemRemove>刪除</ItemRemove>
            </CartItem>
            {cartItems?.map((item, index) => (
              <CartItem key={item.id}>
                <ItemInfo>
                  <CoverWrapper>
                    <Image src={item.cover} alt="cover" fill />
                  </CoverWrapper>
                  <ItemName>{item.name}</ItemName>
                </ItemInfo>
                <ItemPrice>{item.price}</ItemPrice>
                <ItemRemove>
                  <RemoveIconWrapper
                    onClick={() => {
                      setCartItems(cartItems?.filter((_, removeIndex) => index !== removeIndex));
                      setOrderQty(orderQty - 1);
                      const docRef = doc(db, "users", uid);
                      updateDoc(docRef, {
                        cartItems: arrayRemove({ cover: item.cover, name: item.name, price: item.price, id: item.id }),
                      });
                    }}
                  >
                    <Image src={RemoveIcon} alt="remove" fill sizes="contain" />
                  </RemoveIconWrapper>
                </ItemRemove>
              </CartItem>
            ))}
          </CartItems>
          <OrderDetails>
            <DetailsTitle>訂單明細</DetailsTitle>
            {cartItems?.map((item) => (
              <DetailItems key={item.id}>
                <DetailItem>{item.name}</DetailItem>
                <DetailItem>NT. {item.price}</DetailItem>
              </DetailItems>
            ))}
            <Total>
              <DetailItem>總計</DetailItem>
              <DetailItem>NT. {subtotal}</DetailItem>
            </Total>
            <Button type="button" onClick={handleCheckout}>
              結帳去
            </Button>
          </OrderDetails>
        </CartContainer>
      </Container>
    </Wrapper>
  );
}

export default Cart;
