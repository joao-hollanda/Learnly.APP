import style from "./_bolinha.module.css";

const SIZE = {
    pequena: style.pequena,
};

const Bolinha = ({ cor = "red", tamanho }) => {
    return (
        <div className={style.container}>
            <div
                className={`${style.bolinha} ${SIZE[tamanho]}`}
                style={{ backgroundColor: cor }}
            />
        </div>
    );
};

export default Bolinha;
