import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Modify3.module.css";
import Step2 from "../../../../components/steps/step2";
import { useHandleRoute } from "../../../../lib/util";
import { uploadModifyVideos } from "../../../../lib/api";
import Spinner from "../../../../components/spinner/Spinner";

export default function ModifyPage3() {

    const [isLoading, setIsLoading] = useState(false);
    
	const { handleRoute } = useHandleRoute();
	const location = useLocation();
	const { email, title, uuid,  videos, subtitleChecked } = location.state || {};

	useEffect(() => {
		if (!email || !title || !uuid || !videos || videos.length === 0) {
			handleRoute("/");
		}
	}, [email, videos, title, uuid, subtitleChecked, handleRoute]);


	const [corrections, setCorrections] = useState("");
	const [plus, setPlus] = useState("");
    const [minus, setMinus] = useState("");


	const handleCorrectionsChange = (value) => {
		setCorrections(value);
	};
	const handlePlusChange = (value) => {
		setPlus(value);
	};
    const handleMinusChange = (value) => {
		setMinus(value);
	};


    const handleNext = async () => {
        try {

            setIsLoading(true);
            const response = await uploadModifyVideos(
                subtitleChecked ? 1 : 0,
                email,
				title,
				uuid,
                corrections,
                plus,
                minus,
                videos,
            );
            if (!response.success) {
                console.error("업로드 실패", response.message);
                alert(response.message);
                setIsLoading(false);
                return;
            }
            alert(response.message);
            handleRoute("/complete");

        } catch (error) {
            console.error("업로드 에러", error);
            alert("업로드 중 오류가 발생했습니다.");
            setIsLoading(false);
        }
    };

	return (
		<div className={styles.root}>
			{isLoading && (
				<div className={styles.loadingOverlay}>
					<Spinner />
				</div>
			)}

			{/* 수정 사항 입력 필드 */}
			<h2 className={styles.title}>수정 사항</h2>
			<div className={styles.subTitle}>
                편집본을 시청하신 뒤 원하는 수정사항을 자유롭게 작성해주세요.<br/>
                ex) 친구들과 이야기하는 부분이 많이 들어가면 좋겠어요.<br/>
                ex) 이동하는 장면은 모두 빼고 싶어요.
            </div>
			<div className={styles.wrapper}>
				<div className={styles.inputContainer}>
					<div className={styles.input}>
						<img className={styles.icon} src="/modify.svg" alt="Modify Icon" />
						<input
							type="text"
							placeholder={"수정 사항을 작성해주세요"}
							className={styles.inputField}
							onChange={(e) => handleCorrectionsChange(e.target.value)}
						/>
					</div>
				</div>
			</div>


			{/* 추가하거나 뺄 장면 입력 필드 */}
			<h2 className={styles.title}>시각적 수정사항</h2>
			<div className={styles.subTitle}>
                편집본을 시청하신 뒤 추가하고 싶거나 삭제하고 싶은 장면을 작성해주세요.<br/>
                ex) 친구들과 밥 먹는 장면을 추가해주세요.<br/>
                ex) 바다에서 친구들과 노는 장면을 추가해주세요.
            </div>
			<div className={styles.wrapper}>
				<div className={styles.inputContainer}>
					<div className={styles.input}>
				
						<img className={`${styles.icon} ${styles.smallIcon}`} src="/plus.svg" alt="Plus Icon" />
						<input
							type="text"
							placeholder={"추가할 장면"}
							className={styles.inputField}
							onChange={(e) => handlePlusChange(e.target.value)}
						/>
					</div>
				</div>
                <div className={styles.inputContainer}>
					<div className={styles.input}>
				
						<img className={`${styles.icon} ${styles.smallIcon}`} src="/minus.svg" alt="Minus Icon" />
						<input
							type="text"
							placeholder={"삭제할 장면"}
							className={styles.inputField}
							onChange={(e) => handleMinusChange(e.target.value)}
						/>
					</div>
				</div>
			</div>


			{/*  다음 버튼 */}
			<div className={styles.buttonWrapper}>
				<button
					className={styles.startButton}
					onClick={handleNext}
				>
				다음
				</button>
			</div>


			{/* 진행도 그래프 */}
			<div className={styles.graph}>
				<Step2 />
			</div>
		</div>
	);
}
