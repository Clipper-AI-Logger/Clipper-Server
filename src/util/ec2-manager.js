const AWS = require('aws-sdk');

class EC2Manager {
    
    constructor() {
        this.ec2 = new AWS.EC2({
            accessKeyId: process.env.AWS_EC2_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_EC2_SECRET_ACCESS_KEY,
            region: process.env.AWS_EC2_REGION || process.env.AWS_REGION
        });
        this.instanceId = process.env.AWS_EC2_INSTANCE_ID;
    }

    async startInstance() {
        try {
            console.log('EC2 인스턴스 상태 확인:', this.instanceId);
            
            // 먼저 인스턴스 상태 확인
            const statusResult = await this.getInstanceStatus();
            
            // 이미 실행 중이거나 시작 중인 경우
            if (statusResult.state === 'running' || statusResult.state === 'pending') {
                console.log('인스턴스가 이미 실행 중이거나 시작 중입니다:', statusResult.state);
                return {
                    success: true,
                    state: statusResult.state,
                    instanceId: this.instanceId,
                    region: this.ec2.config.region,
                    message: '인스턴스가 이미 실행 중입니다'
                };
            }

            // 인스턴스가 중지된 상태일 때만 시작 시도
            console.log('EC2 인스턴스 시작 시도');
            const params = {
                InstanceIds: [this.instanceId]
            };

            const result = await this.ec2.startInstances(params).promise();
            const instance = result.StartingInstances[0];
            
            console.log('EC2 인스턴스 상태:', instance.CurrentState.Name);
            return {
                success: true,
                state: instance.CurrentState.Name,
                instanceId: this.instanceId,
                region: this.ec2.config.region,
                message: '인스턴스 시작 요청 완료'
            };
        } catch (error) {
            console.error('EC2 인스턴스 시작 실패:', error);
            if (error.code === 'InvalidInstanceID.NotFound') {
                console.error('인스턴스 ID가 존재하지 않거나 현재 계정에서 접근할 수 없습니다.');
                console.error('사용 중인 AWS 리전:', this.ec2.config.region);
                console.error('사용 중인 액세스 키:', process.env.AWS_EC2_ACCESS_KEY_ID);
            }
            throw new Error('EC2 인스턴스 시작 중 오류가 발생했습니다.');
        }
    }

    async getInstanceStatus() {
        try {
            const params = {
                InstanceIds: [this.instanceId]
            };

            const result = await this.ec2.describeInstances(params).promise();
            const instance = result.Reservations[0].Instances[0];
            
            return {
                success: true,
                state: instance.State.Name,
                instanceId: this.instanceId,
                publicIp: instance.PublicIpAddress
            };
        } catch (error) {
            console.error('EC2 인스턴스 상태 조회 실패:', error);
            throw new Error('EC2 인스턴스 상태 조회 중 오류가 발생했습니다.');
        }
    }
}

module.exports = EC2Manager; 