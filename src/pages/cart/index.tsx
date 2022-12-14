import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
import Head from "next/head";
import Image from "next/image";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/authContext";
import { getUserData, deleteCartItem, checkout } from "../../utils/firestore";
import { orderQtyState, bearMoneyState } from "../../utils/recoil";
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
  @media screen and (max-width: 1280px) {
    flex-direction: column;
    align-items: center;
    width: 90%;
    margin: 0 auto;
  }
`;

const CartItems = styled.ul`
  background-color: ${(props) => props.theme.colors.color1};
  width: 80%;
  border: 2px solid ${(props) => props.theme.colors.color2};
  border-radius: 5px;
  padding: 20px 10px 0px 10px;
  margin-right: 20px;
  @media screen and (max-width: 1280px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }
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
  @media screen and (max-width: 810px) {
    text-align: center;
  }
  @media screen and (max-width: 450px) {
    text-align: left;
  }
`;
const ItemInfo = styled.div`
  flex-basis: 70%;
  display: flex;
  @media screen and (max-width: 810px) {
    flex-direction: column;
  }
  @media screen and (max-width: 566px) {
    flex-basis: 60%;
  }
  @media screen and (max-width: 512px) {
    flex-basis: 50%;
  }
`;
const CoverWrapper = styled.div`
  width: 300px;
  height: 180px;
  position: relative;
  margin-right: 20px;
  @media screen and (max-width: 810px) {
    margin-bottom: 10px;
  }
  @media screen and (max-width: 566px) {
    width: 225px;
    height: 135px;
  }
  @media screen and (max-width: 512px) {
    width: 150px;
    height: 90px;
  }
  @media screen and (max-width: 450px) {
    width: 120px;
    height: 72px;
  }
`;
const ItemName = styled.p`
  @media screen and (max-width: 810px) {
    text-align: center;
  }
  @media screen and (max-width: 450px) {
    text-align: left;
  }
`;

const ItemPrice = styled.p`
  flex-basis: 15%;
  @media screen and (max-width: 512px) {
    flex-basis: 25%;
  }
`;
const ItemRemove = styled.div`
  flex-basis: 10%;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 512px) {
    flex-basis: 15%;
  }
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
  @media screen and (max-width: 1280px) {
    min-width: 350px;
    align-self: flex-end;
  }
  @media screen and (max-width: 566px) {
    min-width: 250px;
    height: 135px;
  }
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
  @media screen and (max-width: 566px) {
    font-size: 14px;
    padding: 5px;
  }
`;

function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<{ cover: string; name: string; price: string; id: string }[]>([]);
  const { userData } = useContext(AuthContext);
  const { uid } = userData;
  const subtotal = cartItems?.reduce((acc, current) => acc + Number(current.price), 0);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);

  useEffect(() => {
    const getCartItems = async () => {
      if (!uid) return;
      const userSnap = await getUserData(uid);
      if (userSnap.exists()) {
        const items = userSnap.data().cartItems as { cover: string; name: string; price: string; id: string }[];
        setCartItems(items);
      }
    };
    getCartItems();
  }, [uid]);

  const handleCheckout = () => {
    if (!subtotal) {
      Swal.fire({ title: "????????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
      return;
    }
    Swal.fire({
      text: "?????????????????????",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (subtotal > bearMoney) {
          Swal.fire({ text: "????????????????????????????????????", confirmButtonColor: "#5d7262", icon: "warning" });
        } else {
          setBearMoney((prev) => prev - subtotal);
          setCartItems([]);
          await checkout(uid, bearMoney, subtotal, cartItems);
          Swal.fire({ text: "????????????????????????????????????", confirmButtonColor: "#5d7262", icon: "success" });
          setOrderQty(0);
          const templateParams = {
            email: userData.email,
            name: userData.username,
            price: subtotal,
          };
          emailjs.send("service_b8k8uuv", "template_8utvv8h", templateParams, "ZY0JeIuS-PmILJZtR");
          router.push("/myCourses/videoCourses");
        }
      }
    });
  };

  return (
    <>
      <Head>
        <title>????????? - Yoga Bear</title>
      </Head>
      <Wrapper>
        <Container>
          <CartContainer>
            <CartItems>
              <CartItem>
                <ItemInfo>????????????</ItemInfo>
                <ItemPrice>??????</ItemPrice>
                <ItemRemove>??????</ItemRemove>
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
                    <RemoveIconWrapper
                      onClick={() => {
                        Swal.fire({
                          text: `?????????????????????`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#3085d6",
                          confirmButtonText: "Yes!",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setCartItems(cartItems?.filter((removeItem) => item.id !== removeItem.id));
                            setOrderQty(orderQty - 1);
                            deleteCartItem(uid, item);
                          }
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
              <DetailsTitle>????????????</DetailsTitle>
              {cartItems?.map((item) => (
                <DetailItems key={item.id}>
                  <DetailItem>{item.name}</DetailItem>
                  <DetailItem>NT. {item.price}</DetailItem>
                </DetailItems>
              ))}
              <Total>
                <DetailItem>??????</DetailItem>
                <DetailItem>NT. {subtotal}</DetailItem>
              </Total>
              <Button type="button" onClick={handleCheckout}>
                ?????????
              </Button>
            </OrderDetails>
          </CartContainer>
        </Container>
      </Wrapper>
    </>
  );
}

export default Cart;
