import { useState, useEffect } from "react";
import styles from "../../styles/common/premium/Email.module.css";
import Step1 from "../../components/steps/step1";
import { useHandleRoute } from "../../lib/util";
import { verifyUser, verifySchool } from "../../lib/api/premium";

export default function CheckUser() {
    const { handleRoute } = useHandleRoute();

    const [email, setEmail] = useState("");
    const [verificationCode, setverificationCode] = useState("");
    const [userType, setUserType] = useState("premium");
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [premiumError, setPremiumError] = useState("");
    const [affiliatedError, setAffiliatedError] = useState("");

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    useEffect(() => {
        setIsNextDisabled(!isValidEmail(email));
    }, [email]);

    const handleEmailChange = (value) => {
        setEmail(value);
        setPremiumError("");
    };
    const handleAffiliatedCodeChange = (value) => {
        setverificationCode(value)
        setAffiliatedError("");
    };

    const changeUserType = (type) => {
        setUserType(type);
        setPremiumError("");
        setAffiliatedError("");
    };

    const checkPremium = async () => {
        try {
            const isPremium = await verifyUser(email);
            if(isPremium) {
                handleRoute("/premium/modify/1", { email });
            } else {
                setAffiliatedError("프리미엄 회원이 아닙니다");
            }
        } catch (error) {
            alert("검증 중 오류가 발생했습니다");
            handleRoute("/");
        }
    };

    const checkAffiliated = async () => {
        try {
            const isAffiliated = await verifySchool(email, verificationCode);
            if(isAffiliated) {
                handleRoute("/premium/modify/1", { email });
            } else {
                setAffiliatedError("제휴된 사용자가 아닙니다");
            }
        } catch (error) {
            setAffiliatedError("검증 중 오류가 발생했습니다");
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}> 

                {/* 사용자 구분 */}
                <div className={styles.selectionButtons}>
                    <button
                        className={`${styles.selectionButton} ${userType==='premium' ? styles.active : ""}`}
                        onClick={() => changeUserType("premium")}
                    >
                        <img className={styles.humanIcon} src="/human.svg" alt="human Icon" />
                        <span className={styles.buttonText}>프리미엄 회원</span>
                    </button>
                
                    <button
                        className={`${styles.selectionButton} ${userType==='affiliated' ? styles.active : ""}`}
                        onClick={() => changeUserType("affiliated")}
                    >
                        <img className={styles.humanIcon} src="/human.svg" alt="human Icon" />
                        <span className={styles.buttonText}>제휴 학교 학생</span>
                    </button>
                </div>
    
            </div>

            <br />

            {/* 이메일 입력란 */}
            <h2 className={styles.title}>Email</h2>
            <div className={styles.wrapper}>
                <div className={styles.inputContainer}>
                    <div className={styles.input}>
                        <img className={styles.icon} src="/email.svg" alt="Email Icon" />
                        <input
                            type="email"
                            placeholder={"Your email"}
                            className={styles.inputField}
                            onChange={(e) => handleEmailChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 인증코드 입력 필드 */}
            {userType === 'affiliated' && (
                <>
                    <h2 className={styles.title}>인증 코드</h2>
                    <div className={styles.wrapper}>
                        <div className={styles.inputContainer}>
                            <div className={styles.input}>
                                <img className={styles.icon} src="/code.svg" alt="code Icon" />
                                <input
                                    type="text"
                                    placeholder={"Verification Code"}
                                    className={styles.inputField}
                                    onChange={(e) => handleAffiliatedCodeChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/*  프리미엄 OR 제휴 사용자가 아닐 때 출력 */}
            {premiumError && <div className={styles.error}>{premiumError}</div>}
            {affiliatedError && <div className={styles.error}>{affiliatedError}</div>}

            {/*  다음 버튼 */}
            <div className={styles.buttonWrapper}>
                <button
                    className={styles.startButton}
                    disabled={isNextDisabled}
                    onClick={async () => {
                        if(userType === "premium") {
                            await checkPremium();
                        } else if(userType === "affiliated") {
                            await checkAffiliated();
                        }
                    }}
                >
                다음
                </button>
            </div>

            {/* 진행도 그래프 */}
            <div className={styles.graph}>
                <Step1 />
            </div>
        </div>
    );
}
