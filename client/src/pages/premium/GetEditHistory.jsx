import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Step1 from "../../components/steps/step1";
import { useHandleRoute } from "../../lib/util";
import styles from "../../styles/common/premium/History.module.css";
import History from "../../components/history/History";
import { getHistory, deleteHistory } from "../../lib/api/premium";

export default function GetEditHistory() {
    const { handleRoute } = useHandleRoute();
    const location = useLocation();
    const email = location.state?.email || "";

    const [history, setHistory] = useState([]);
    const [selectedUuid, setSelectedUuid] = useState("");
    const [isNextDisabled, setIsNextDisabled] = useState(true);

    useEffect(() => {
        if (!email) {
            handleRoute("/");
        }
    }, [email, handleRoute]);

    useEffect(() => {
        if (email) {
            const fetchHistory = async () => {
                try {
                    const response = await getHistory(email);
                    setHistory(response);
                } catch (error) {
                    console.error("Failed to fetch history:", error);
                    setHistory([]);
                }
            };
            fetchHistory();
        }
    }, [email]);

    const handleSelect = (uuid) => {
        setSelectedUuid(uuid);
        setIsNextDisabled(false);
    };

    const handleRemoveFile = async (uuid) => {
        try {
            await deleteHistory(uuid);
            setHistory(prevData => {
                const newData = prevData.filter(item => item.uuid !== uuid);
                if (uuid === selectedUuid) {
                    setSelectedUuid("");
                }
                if (newData.length <= 0) setIsNextDisabled(true);
                return newData;
            });
        } catch (error) {
            console.error("Failed to delete history:", error);
        }
    };

    const handleNext = () => {
        const selectedItem = history.find(item => item.uuid === selectedUuid);
        handleRoute("/premium/modify/2", { 
            email, 
            uuid: selectedUuid,
            title: selectedItem?.video_name 
        });
    };

    return (
        <div className={styles.root}>
            <h2 className={styles.title}>수정할 영상을 선택해주세요</h2>

            <History data={history} selectedUuid={selectedUuid} onSelect={handleSelect} onRemove={handleRemoveFile} />
 
            <div className={styles.buttonWrapper}>
                <button
                    className={styles.startButton}
                    disabled={isNextDisabled}
                    onClick={handleNext}
                >
                    다음
                </button>
            </div>

            <div className={styles.graph}>
                <Step1 />
            </div>
        </div>
    );
}
