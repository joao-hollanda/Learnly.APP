import { Modal } from "react-bootstrap";
import Header from "../../components/Header/Header";
import style from "./_simulados.module.css"
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";


function Simulados() {

    const [mostrarCriar, setMostrarCriar] = useState(false);

    const handleClickCriar = () => {
        setMostrarCriar(true);
    };

    const handleFecharCriar = () => {
        setMostrarCriar(false);
    };

    return (
        <div>
            <Header children={
                <button className={style.criar} onClick={handleClickCriar}>
                    <FaPlus /><span>Novo simulado</span>
                </button>
           } />

            <Modal size="lg" centered show={mostrarCriar} onHide={handleFecharCriar}>
                <Modal.Header>
                    <Modal.Title className={style.modal_titulo}>
                        <h4></h4>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={style.modal_corpo}>
                    {(
                        <>
                            <p>
                                <strong>Objetivo:</strong>
                            </p>
                            <p>
                                <strong>Período:</strong>
                            </p>

                            <div className={style.cards}>

                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>

                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Simulados;
