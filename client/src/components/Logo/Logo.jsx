import React from 'react';
import styles from "./Logo.module.css";

export default function Logo({ imgWidth = 70, textWidth = 150, style, ...rest }) {
    return (
        <div className={styles.logo} style={style} {...rest}>
            <img className={styles.logo_img} src="/logo_img.svg" alt="Logo" style={{ width: imgWidth }} />
            <img className={styles.logo_text} src="/Clipper-AI.svg" alt="Logo_Text" style={{ width: textWidth }} />
        </div>
    )
}
