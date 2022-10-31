import styled from "styled-components";
import { createPortal } from "react-dom";
import React from "react";
import Image from "next/image";
import closeIcon from "../../public/close.png";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);
`;
const ModalContent = styled.div`
  position: relative;
  width: 24%;
  height: 50%;
  overflow-y: auto;
  margin: 200px auto;
  background-color: #fff;
  padding: 20px;
`;
const CloseButton = styled.div`
  width: 24px;
  height: 24px;
  position: absolute;
  top: 24px;
  right: 32px;
  cursor: pointer;
`;

function Modal({ children, handleClose }: { children: React.ReactNode; handleClose: () => void }) {
  const modalRoot = document.getElementById("modal-root") as HTMLElement;

  return createPortal(
    <ModalBackdrop>
      <ModalContent>
        <CloseButton>
          <Image src={closeIcon} alt="close" onClick={handleClose} />
        </CloseButton>
        {children}
      </ModalContent>
    </ModalBackdrop>,
    modalRoot
  );
}
export default Modal;