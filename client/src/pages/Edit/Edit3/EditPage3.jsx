import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./EditPage3.module.css";
import Step2 from "../../../components/steps/step2";
import { useHandleRoute } from "../../../lib/util";
import { uploadVideos } from "../../../lib/api";
import Spinner from "../../../components/spinner/Spinner";

export default function EditPage3() {

    const [isLoading, setIsLoading] = useState(false);
    
	const { handleRoute } = useHandleRoute();
	const location = useLocation();
	const { email, title, videos, subtitleChecked } = location.state || {};

	useEffect(() => {
		if (!email || !title || !videos || videos.length === 0) {
			handleRoute("/");
		}
		console.log(location.state);
	}, [email, videos, title, subtitleChecked, handleRoute]);

	const [bgm, setBgm] = useState("");
	const [color, setColor] = useState("");
	const [introTitle, setIntroTitle] = useState("");

	const colorOptions = [
		{ name: "green", class: "color-green" },
		{ name: "blue", class: "color-blue" },
		{ name: "yellow", class: "color-yellow" },
		{ name: "red", class: "color-red" },
		{ name: "white", class: "color-white" },
		{ name: "black", class: "color-black" },
	];

	const moodOptions = [
		{ label: "Moody", value: "moody" },
		{ label: "Chill", value: "chill" },
		{ label: "Soft & Warm", value: "soft_warm" },
		{ label: "Energetic", value: "energetic" },
	];

    const handleNext = async () => {

        try {
            setIsLoading(true);
            const response = await uploadVideos(
                subtitleChecked ? 1 : 0,
                email,
				title,
                videos,
                bgm,
                color,
                introTitle,
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


			{/* 인트로 분위기 설정 */}
			<div className={styles.subTitle}>
                인트로 분위기를 설정해주세요. (분위기에 맞는 bgm이 들어갑니다.)
            </div>

			<div className={styles.introWrapper}>
				{moodOptions.map((opt) => (
					<button
						key={opt.value}
						className={`${styles.button} ${bgm === opt.value ? styles.selected : ""}`}
						onClick={() => setBgm(opt.value)}
						type="button"
					>
						{opt.label}
					</button>
				))}
			</div>



			{/* 대표 색상 */}
			<div className={styles.subTitle}>
                대표 색상을 선택해주세요
            </div>

			<div className={styles.colorSelectWrapper}>
				{colorOptions.map((opt) => (
				<button
					key={opt.name}
					className={`${styles.colorButton} ${styles[opt.class]} ${color === opt.name ? styles.selected : ""}`}
					onClick={() => setColor(opt.name)}
					aria-label={opt.name}
					type="button"
				/>
				))}
			</div>


			{/* 대표 색상 */}
			<div className={styles.subTitle}>
                인트로에 들어갈 제목을 작성해주세요
            </div>
	
			<div className={styles.inputContainer}>
				<div className={styles.input}>
				
					<img className={styles.icon} src="/pen.svg" alt="Pen Icon" />
					<input
						type="text"
						placeholder={"Your Video Title"}
						className={styles.inputField}
						onChange={(e) => setIntroTitle(e.target.value)}
					/>
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
