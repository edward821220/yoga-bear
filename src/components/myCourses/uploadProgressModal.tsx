import Image from "next/image";
import Swal from "sweetalert2";
import Modal from "../modal";
import Bear from "../../../public/bear.png";

function UploadProgressModal({ progressBar }: { progressBar: { file: string; progress: number } }) {
  const handleClose = () => {
    Swal.fire({ text: "課程上傳中，請勿關閉視窗！", confirmButtonColor: "#5d7262", icon: "warning" });
  };
  return (
    <Modal handleClose={handleClose}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2
          style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
        >{`Uploading ${progressBar.file}`}</h2>
        <h2
          style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
        >{`Upload is ${progressBar.progress}% done`}</h2>
        <h2 style={{ textAlign: "center", fontSize: "20px", color: "#075866", marginBottom: "10px" }}>
          頭倒立為體位法之王
        </h2>
        <h2 style={{ textAlign: "center", fontSize: "20px", color: "#075866", marginBottom: "10px" }}>
          每天三分鐘，宿便、失眠不再有
        </h2>
        <Image src={Bear} alt="bear" width={300} />
      </div>
    </Modal>
  );
}
export default UploadProgressModal;
