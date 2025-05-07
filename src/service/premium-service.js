const db = require('../config/database');

class PremiumService {
    
    async isPartnerSchool(email) {
        try {
            const domain = email.split('@')[1];
            const query = 'SELECT * FROM partner_school WHERE email_domain = ?';
            const [rows] = await db.execute(query, [domain]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking partner school:', error);
            return false;
        }
    }

    async verifySchool(verificationCode) {
        try {
            const query = 'SELECT * FROM partner_school WHERE verification_code = ?';
            const [rows] = await db.execute(query, [verificationCode]);
            return { success: rows.length > 0, data: rows[0] };
        } catch (error) {
            console.error('Error verifying school:', error);
            return { success: false, message: error.message };
        }
    }

    async isPremiumUser(email) {
        try {
            const query = 'SELECT * FROM premium_user WHERE email = ? AND expire_date > NOW()';
            const [rows] = await db.execute(query, [email]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking premium user:', error);
            return false;
        }
    }

    async verifyPremiumUser(email) {
        try {
            const query = 'SELECT * FROM premium_user WHERE email = ? AND expire_date > NOW()';
            const [rows] = await db.execute(query, [email]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error verifying premium user:', error);
            return false;
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

    async addPremiumUser(email, verificationCode) {
        
        try {
            const beginDate = new Date();
            const expireDate = new Date(beginDate);
            expireDate.setFullYear(expireDate.getFullYear() + 1);

            const query = 'INSERT INTO premium_user (email, verification_code, begin_date, expire_date) VALUES (?, ?, ?, ?)';
            await db.execute(query, [email, verificationCode, beginDate, expireDate]);
            return true;
        } catch (error) {
            console.error('Error adding premium user:', error);
            return false;
        }
    }
}

module.exports = PremiumService;