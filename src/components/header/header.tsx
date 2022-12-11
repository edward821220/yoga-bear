import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { AuthContext } from "../../contexts/authContext";
import { getUserData } from "../../utils/firestore";
import { orderQtyState, bearMoneyState, showMemberModalState } from "../../utils/recoil";
import BearLogo from "../../../public/bear-logo2.png";
import CartLogo from "../../../public/cart.png";
import MemberLogo from "../../../public/member.png";
import MoneyIcon from "../../../public/newMoney.png";
import PlusMoneyIcon from "../../../public/add.png";
import MenuIcon from "../../../public/menu.png";
import PaymentModal from "./paymentModal";
import MemberModal from "./memberModal";

const Wrapper = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.color5};
  height: 100px;
  position: sticky;
  top: 0;
  z-index: 66;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;
const LogoWrapper = styled.div`
  margin-right: 40px;
  margin-left: 20px;
  flex-basis: 200px;
  @media screen and (max-width: 1024px) {
    margin-right: 0;
    flex-basis: 150px;
  }
`;
const MenuLinksWrapper = styled.div`
  position: relative;
  margin-right: auto;
`;
const MenuIconWrapper = styled.div`
  position: relative;
  width: 26px;
  height: auto;
  display: none;
  @media screen and (max-width: 788px) {
    display: block;
  }
`;
const HeaderLinks = styled.ul<{ showMenu: boolean }>`
  display: flex;
  align-items: center;
  @media screen and (max-width: 788px) {
    display: ${(props) => (props.showMenu ? "block" : "none")};
    align-items: center;
    flex-direction: column;
    position: absolute;
    transform: translateX(-28px);
    background-color: ${(props) => props.theme.colors.color4};
    padding: 5px 0;
  }
`;
const HeaderLink = styled.li`
  margin-right: 20px;
  font-size: 18px;
  line-height: 40px;
  width: 80px;
  text-align: center;
  a {
    color: ${(props) => props.theme.colors.color2};
  }
  @media screen and (max-width: 1024px) {
    margin-right: 10px;
  }
  @media screen and (max-width: 788px) {
    font-size: 16px;
    margin: 0;
    padding: 0 5px;
    &:hover {
      background-color: ${(props) => props.theme.colors.color3};
      a {
        color: ${(props) => props.theme.colors.color1};
      }
      span {
        color: ${(props) => props.theme.colors.color1};
      }
    }
  }
`;
const HeaderLinkTeacher = styled(HeaderLink)`
  @media screen and (max-width: 1140px) {
    display: none;
  }
`;

const MyCoursesLink = styled.span`
  color: ${(props) => props.theme.colors.color2};
  cursor: pointer;
`;

const Member = styled.ul`
  display: flex;
  align-items: center;
  position: relative;
  @media screen and (max-width: 468px) {
    margin-bottom: 36px;
  }
`;

const MoneyDisplay = styled.div`
  width: 140px;
  height: 44px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 4px;
  margin-right: 50px;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  @media screen and (max-width: 1024px) {
    margin-right: 24px;
    width: 120px;
    height: 36px;
  }
  @media screen and (max-width: 468px) {
    position: absolute;
    transform: translate(-8px, 42px);
    width: 100px;
    height: 24px;
    margin-right: 0;
  }
`;

const MoneyIconWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 5px;
  @media screen and (max-width: 1024px) {
    width: 24px;
    height: 24px;
  }
  @media screen and (max-width: 468px) {
    width: 17px;
    height: 17px;
  }
`;
const MoneyQty = styled.p`
  font-size: 18px;
  @media screen and (max-width: 1024px) {
    font-size: 16px;
  }
`;
const MoneyPlusWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  cursor: pointer;
  @media screen and (max-width: 1024px) {
    width: 24px;
    height: 24px;
  }
  @media screen and (max-width: 468px) {
    width: 22px;
    height: 22px;
  }
`;

const CartIconWrapper = styled.li`
  margin-right: 36px;
  width: 40px;
  position: relative;
  cursor: pointer;
  &:after {
    content: "";
    width: 50px;
    height: 50px;
    position: absolute;
    bottom: 0;
    transform: translateY(1px) translateX(-5px);
    background-color: ${(props) => props.theme.colors.color4};
    border: 2px solid ${(props) => props.theme.colors.color3};
    border-radius: 50%;
    z-index: -1;
    @media screen and (max-width: 1024px) {
      width: 40px;
      height: 40px;
    }
  }
  @media screen and (max-width: 1024px) {
    width: 32px;
    margin-right: 24px;
  }
`;
const OrderQty = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  padding-top: 3px;
  text-align: center;
  font-size: 13px;
  bottom: 0;
  right: -10px;
  border-radius: 50%;
  color: ${(props) => props.theme.colors.color1};
  background-color: ${(props) => props.theme.colors.color3};
`;

const MemberIconWrapper = styled.li`
  margin-right: 36px;
  width: 40px;
  position: relative;
  cursor: pointer;
  &:after {
    content: "";
    width: 50px;
    height: 50px;
    bottom: 0;
    transform: translateY(5px) translateX(-5px);
    position: absolute;
    background-color: ${(props) => props.theme.colors.color4};
    border-radius: 50%;
    border: 2px solid ${(props) => props.theme.colors.color3};
    z-index: -1;
    @media screen and (max-width: 1024px) {
      width: 40px;
      height: 40px;
    }
  }
  @media screen and (max-width: 1024px) {
    width: 32px;
    height: 31px;
    margin-right: 24px;
  }
`;

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useRecoilState(showMemberModalState);
  const [orderQty, setOrderQty] = useRecoilState(orderQtyState);
  const [bearMoney, setBearMoney] = useRecoilState(bearMoneyState);
  const { isLogin, userData } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const getCartItems = async () => {
      if (!userData.uid) return;
      const userSnap = await getUserData(userData.uid);
      if (userSnap.exists()) {
        const cartItems = (userSnap.data().cartItems as []) || [];
        const qty = cartItems.length;
        const money = (userSnap.data()?.bearMoney as number) || 0;
        setOrderQty(qty);
        setBearMoney(money);
      }
    };
    getCartItems();
  }, [userData.uid, setOrderQty, setBearMoney]);

  return (
    <Wrapper>
      <LogoWrapper>
        <Link href="/">
          <Image src={BearLogo} alt="logo" />
        </Link>
      </LogoWrapper>
      <MenuLinksWrapper
        onMouseOver={() => {
          setShowMenu(true);
        }}
        onMouseOut={() => {
          setShowMenu(false);
        }}
      >
        <MenuIconWrapper>
          <Image src={MenuIcon} alt="menu" />
        </MenuIconWrapper>
        <HeaderLinks showMenu={showMenu}>
          <HeaderLink
            onClick={() => {
              setShowMenu(false);
            }}
          >
            <Link href="/videoCourses">探索課程</Link>
          </HeaderLink>
          <HeaderLink
            onClick={() => {
              setShowMenu(false);
            }}
          >
            <Link href="/findTeachers">預約老師</Link>
          </HeaderLink>
          <HeaderLink
            onClick={() => {
              setShowMenu(false);
            }}
          >
            <Link href="/forum">問答園地</Link>
          </HeaderLink>
          <HeaderLink
            onClick={() => {
              setShowMenu(false);
            }}
          >
            <MyCoursesLink
              onClick={() => {
                if (!isLogin) {
                  Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
                  setShowMemberModal(true);
                  return;
                }
                router.push("/myCourses/videoCourses");
              }}
            >
              我的課程
            </MyCoursesLink>
          </HeaderLink>
          {userData.identity === "teacher" && (
            <HeaderLinkTeacher>
              <Link href="/myCourses/launchVideoCourse">老師開課</Link>
            </HeaderLinkTeacher>
          )}
        </HeaderLinks>
      </MenuLinksWrapper>
      <Member>
        <MoneyDisplay>
          <MoneyIconWrapper>
            <Image src={MoneyIcon} alt="moneyIcon" fill sizes="contain" />
          </MoneyIconWrapper>
          <MoneyQty>{bearMoney}</MoneyQty>
          <MoneyPlusWrapper
            onClick={() => {
              if (!isLogin) {
                setShowPaymentModal(false);
                Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
                setShowMemberModal(true);
                return;
              }
              setShowPaymentModal(true);
            }}
          >
            <Image src={PlusMoneyIcon} alt="plus" fill sizes="contain" />
          </MoneyPlusWrapper>
        </MoneyDisplay>

        <CartIconWrapper>
          <Image
            src={CartLogo}
            alt="cart"
            onClick={() => {
              if (!isLogin) {
                Swal.fire({ title: "您還沒登入唷！", confirmButtonColor: "#5d7262", icon: "warning" });
                setShowMemberModal(true);
                return;
              }
              router.push("/cart");
            }}
          />
          {orderQty > 0 && <OrderQty>{orderQty}</OrderQty>}
        </CartIconWrapper>
        <MemberIconWrapper
          onClick={() => {
            setShowMemberModal(true);
          }}
        >
          <Image src={MemberLogo} alt="member" />
        </MemberIconWrapper>
      </Member>
      {showMemberModal && (
        <MemberModal
          setOrderQty={setOrderQty}
          setShowMemberModal={setShowMemberModal}
          isLogin={isLogin}
          userData={userData}
          setBearMoney={setBearMoney}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          bearMoney={bearMoney}
          setBearMoney={setBearMoney}
          userId={userData.uid}
        />
      )}
    </Wrapper>
  );
}

export default Header;
