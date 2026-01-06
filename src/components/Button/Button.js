import style from "./_button.module.css";

const COLOR = {
    orange: style.orange,
    blue: style.blue,
    black: style.black,
};

const SIZE = {
    large: style.large,
    medium: style.medium,
    small: style.small,
};

const POSITION = {
    esquerda: style.esquerda,
};

const Button = ({ children, label, color, size, page, position }) => {
    function handleClick() {
        if (page) {
            window.location.replace("http://localhost:3000/" + page);
        }
    }

    return (
        <>
            <label>{label}</label>
            <button
                onClick={handleClick}
                className={`${style.button_example} ${COLOR[color]} ${SIZE[size]} ${POSITION[position]}`}
            >
                <div className={style.content}>{children}</div>
            </button>
        </>
    );
};

export default Button;
