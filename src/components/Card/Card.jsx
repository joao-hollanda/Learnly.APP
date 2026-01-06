import style from "./_card.module.css";

const SIZE = {
    grande: style.grande,
    medio: style.medio,
    pequeno: style.pequeno,
};

const Card = ({
    tamanho,
    titulo,
    subtitulo,
    children,
    adicional,
    icon,
    detalhe,
}) => {

    const cardSizeClass = SIZE[tamanho] || style.medio; 

    return (
        <div className={`${style.card_example} ${cardSizeClass}`}>
            <div className={style.header}>
                {detalhe && <div className={style.detalhe}>{detalhe}</div>}
                <div>
                    <div className={style.titulo}>
                        <h4>{titulo}</h4>
                        {icon && <div className={style.icon}>{icon}</div>}
                    </div>

                    {subtitulo && (
                        <div className={style.subtitulo}>
                            <span>{subtitulo}</span>
                        </div>
                    )}
                </div>
            </div>
                    
            {children}

            {adicional && <p className={style.adicional}>{adicional}</p>}
        </div>
    );
};

export default Card;