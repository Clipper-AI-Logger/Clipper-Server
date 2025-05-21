const db = require('../config/database');

class EditLog {
    
    async saveEditLog(uuid, email, introTitle) {
        try {
            const query = 'INSERT INTO edit_log (uuid, email, title) VALUES (?, ?, ?)';
            await db.execute(query, [uuid, email, introTitle]);
            return true;
        } catch (error) {
            console.error('Error saving edit log:', error);
            return false;
        }
    }

    async getEditHistory(email) {
        try {
            const query = 'SELECT uuid, title, timestamp FROM edit_log WHERE email = ? ORDER BY timestamp DESC';
            const [rows] = await db.execute(query, [email]);
            return rows
        } catch (error) {
            console.error('Error getting edit history:', error);
            return [];
        }
    }

    async deleteHistory(uuid) {
        try {
            const query = 'DELETE FROM edit_log WHERE uuid = ?';
            const [result] = await db.execute(query, [uuid]);
            if (result.affectedRows > 0) {
                return { success: true, message: '기록이 삭제되었습니다.' };
            }
            return { success: false, message: '해당하는 기록을 찾을 수 없습니다.' };
        } catch (error) {
            console.error('Error deleting history:', error);
            return { success: false, message: error.message };
        }
    }

    async addList(uuid, cv_list, nlp_list) {
        try {
            const query = 'UPDATE edit_log SET nlp_list = ?, cv_list = ? WHERE uuid = ?';
            const [result] = await db.execute(query, [nlp_list, cv_list, uuid]);
            if (result.affectedRows > 0) {
                return { success: true, message: 'update list success' };
            }
            return { success: false, message: 'no Record' };
        } catch (error) {
            console.error('Error deleting history:', error);
            return { success: false, message: error.message };
        }
    }

}

module.exports = EditLog;