const EditLog = require('../service/editLog-service');

module.exports.addList = async (req, res, next) => {
    const { uuid, cv_list, nlp_list } = req.body;

    if (!uuid || !cv_list || !nlp_list) {
        return res.status(400).json({ success: false, message: 'uuid, cv_list, nlp_list를 입력해주세요.' });
    }

    try {
        const editLogService = new EditLog();
        const result = await editLogService.addList(uuid, cv_list, nlp_list);

        if (result.success) {
            return res.status(200).json({ success: true, message: result.message });
        } else {
            return res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '리스트 추가 과정에서 오류가 발생했습니다.' });
    }
}