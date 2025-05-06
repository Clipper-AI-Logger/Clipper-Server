import styles from "../../styles/common/Complete.module.css";
import Step3 from "../../components/steps/step3";
import { useHandleRoute } from "../../lib/util";

export default function CompletePage() {

    const { handleRoute } = useHandleRoute();

    return (
        <div className={styles.root}>

            <div className={styles.completeContent}>
                <img src="/check.svg" alt="Completion Checkmark" className={styles.checkIcon} />
                <h2 className={styles.completeText}>Complete</h2>
            </div>

            {/* Home Button */}
            <div className={styles.buttons}>
                <button className={styles.homeButton} onClick={() => handleRoute("/")}>
                    홈으로 돌아가기
                </button>
            </div>

            {/* Progress Graph */}
            <div className={styles.graph}>
                <Step3 />
            </div>
        </div>
    );
}
