import styled from "styled-components";
import { createPortal } from "react-dom";
import Image from "next/image";
import closeIcon from "../../public/close.png";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 6666;
`;
const ModalContent = styled.div`
  position: relative;
  width: 24%;
  min-width: 300px;
  height: 60vh;
  overflow-y: auto;
  margin: 150px auto;
  background-color: ${(props) => props.theme.colors.color4};
  color: ${(props) => props.theme.colors.color2};
  padding: 20px;
  @media screen and (max-width: 1280px) {
    min-width: 300px;
  }
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
