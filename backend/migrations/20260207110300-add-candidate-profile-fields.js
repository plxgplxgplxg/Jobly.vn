'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'desired_position', {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Vị trí mong muốn'
        });

        await queryInterface.addColumn('users', 'experience_level', {
            type: Sequelize.ENUM(
                'no_experience',
                'under_1_year',
                '1_2_years',
                '3_5_years',
                '5_10_years',
                'over_10_years'
            ),
            allowNull: true,
            comment: 'Kinh nghiệm làm việc'
        });

        await queryInterface.addColumn('users', 'job_level', {
            type: Sequelize.ENUM(
                'intern',
                'fresher',
                'junior',
                'middle',
                'senior',
                'leader',
                'manager',
                'director'
            ),
            allowNull: true,
            comment: 'Cấp bậc'
        });

        await queryInterface.addColumn('users', 'work_type', {
            type: Sequelize.ENUM(
                'full_time',
                'part_time',
                'freelance',
                'internship',
                'contract'
            ),
            allowNull: true,
            comment: 'Hình thức làm việc'
        });

        await queryInterface.addColumn('users', 'gender', {
            type: Sequelize.ENUM('male', 'female', 'other'),
            allowNull: true,
            comment: 'Giới tính'
        });

        await queryInterface.addColumn('users', 'expected_salary', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Mức lương mong muốn'
        });

        await queryInterface.addColumn('users', 'industry', {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Ngành nghề'
        });

        await queryInterface.addColumn('users', 'province', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Tỉnh/Thành phố'
        });

        await queryInterface.addColumn('users', 'district', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Quận/Huyện'
        });

        await queryInterface.addColumn('users', 'ward', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Phường/Xã'
        });

        await queryInterface.addColumn('users', 'willing_to_relocate', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Sẵn sàng thay đổi địa điểm làm việc'
        });

        await queryInterface.addColumn('users', 'profile_completed', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Đã hoàn thiện hồ sơ'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'desired_position');
        await queryInterface.removeColumn('users', 'experience_level');
        await queryInterface.removeColumn('users', 'job_level');
        await queryInterface.removeColumn('users', 'work_type');
        await queryInterface.removeColumn('users', 'gender');
        await queryInterface.removeColumn('users', 'expected_salary');
        await queryInterface.removeColumn('users', 'industry');
        await queryInterface.removeColumn('users', 'province');
        await queryInterface.removeColumn('users', 'district');
        await queryInterface.removeColumn('users', 'ward');
        await queryInterface.removeColumn('users', 'willing_to_relocate');
        await queryInterface.removeColumn('users', 'profile_completed');
    }
};
