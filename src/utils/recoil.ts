import { atom } from "recoil";

export const orderQtyState = atom({
  key: "orderQty",
  default: 0,
});
export const bearMoneyState = atom({
  key: "bearMoney",
  default: 0,
});
export const showMemberModalState = atom({
  key: "showMemberModal",
  default: false,
});
