export const adminMenu = [
    { //dashboard
        name: 'menu.admin.dashboard',
        menus: [
            {
                name: 'menu.admin.dashboard', link: '/system/dashboard', icon: 'fas fa-tachometer-alt'
            },
        ]
    },

    { //quản lý người dùng
        name: 'menu.admin.manage-user',
        menus: [
            {
                name: 'menu.admin.crud', link: '/system/user-manage', icon: 'fas fa-user-edit'

            },
            {
                name: 'menu.admin.crud-redux', link: '/system/user-redux', icon: 'fas fa-user-cog'

            },
            {
                name: 'menu.admin.manage-doctor', link: '/system/manager-doctor', icon: 'fas fa-user-md'
            },
            // {
            //     name: 'menu.admin.manage-admin', link: '/system/user-admin',
            //     icon: 'fas fa-user-shield'
            // },
            {

                name: 'menu.doctor.manage-schedule', link: '/doctor/manage-schedule', icon: 'fas fa-calendar-alt'


            },


        ]
    },
    { //quản lý phòng khám
        name: 'menu.admin.clinic',
        menus: [
            {
                name: 'menu.admin.manage-clinic', link: '/system/manage-clinic', icon: 'fas fa-clinic-medical'
            },
            {
                name: 'menu.admin.manage-clinic-list', link: '/system/manage-clinic-list', icon: 'fas fa-list'
            },
        ]
    },
    { //quản lý chuyên khoa
        name: 'menu.admin.specialty',
        menus: [
            {
                name: 'menu.admin.manage-specialty', link: '/system/manage-specialty', icon: 'fas fa-notes-medical'
            },
            {
                name: 'menu.admin.manage-specialty-list', link: '/system/manage-specialty-list', icon: 'fas fa-list'
            },

        ]
    },
    { //quản lý cẩm nang
        name: 'menu.admin.handbook',
        menus: [
            {
                name: 'menu.admin.manage-handbook', link: '/system/manage-handbook', icon: 'fas fa-book-medical'
            },
            {
                name: 'menu.admin.manage-handbook-list', link: '/system/manage-handbook-list', icon: 'fas fa-list'
            },
        ]
    },
    { //quản lý lịch hẹn
        name: 'menu.admin.appointment',
        menus: [
            {
                name: 'menu.admin.manage-appointment', link: '/system/manage-appointment', icon: 'fas fa-calendar-check'
            },
            {
                name: 'menu.admin.manage-follow-up', link: '/system/manage-follow-up', icon: 'fas fa-redo'
            },
        ]
    },
    { //đơn thuốc
        name: 'menu.admin.prescription',
        menus: [
            {
                name: 'menu.admin.manage-prescription', link: '/system/manage-prescription', icon: 'fas fa-prescription-bottle-alt'
            },
            {
                name: 'menu.admin.manage-medicine', link: '/system/manage-medicine', icon: 'fas fa-pills'
            },
            {
                name: 'menu.admin.manage-batches', link: '/system/manage-medicine-batches', icon: 'fas fa-boxes'
            },
        ]
    },
    { //quản lý nhân sự bác sĩ
        name: 'menu.admin.doctor-hr',
        menus: [
            {
                name: 'menu.admin.manage-doctor-leave', link: '/system/manage-doctor-leave', icon: 'fas fa-calendar-times'
            },
            {
                name: 'menu.admin.manage-work-schedule', link: '/system/manage-work-schedule', icon: 'fas fa-business-time'
            },
        ]
    },
    { //thống kê & báo cáo
        name: 'menu.admin.report',
        menus: [
            {
                name: 'menu.admin.doctor-revenue', link: '/system/doctor-revenue', icon: 'fas fa-chart-bar'
            },
            {
                name: 'menu.admin.manage-payment', link: '/system/manage-payment', icon: 'fas fa-credit-card'
            },
            {
                name: 'menu.admin.manage-voucher', link: '/system/manage-voucher', icon: 'fas fa-ticket-alt'
            },
            {
                name: 'menu.admin.manage-review', link: '/system/manage-review', icon: 'fas fa-star-half-alt'
            },
            {
                name: 'menu.admin.manage-audit', link: '/system/manage-audit', icon: 'fas fa-history'
            },
            {
                name: 'menu.admin.no-show-report', link: '/system/no-show-report', icon: 'fas fa-user-slash'
            },
        ]
    },
];
export const doctorMenu = [
    {
        name: 'menu.doctor.group-work',
        menus: [
            {
                name: 'menu.doctor.manage-schedule', link: '/doctor/manage-schedule', icon: 'fas fa-calendar-alt'
            },
            {
                name: 'menu.doctor.manage-patient', link: '/doctor/manage-patient', icon: 'fas fa-user-injured'
            },
            {
                name: 'menu.doctor.queue-panel', link: '/doctor/queue-panel', icon: 'fas fa-tv'
            },
            {
                name: 'menu.admin.manage-appointment', link: '/system/manage-appointment', icon: 'fas fa-calendar-check'
            },
        ]
    },
    {
        name: 'menu.doctor.group-medical',
        menus: [
            {
                name: 'menu.admin.manage-prescription', link: '/system/manage-prescription', icon: 'fas fa-prescription-bottle-alt'
            },
            {
                name: 'menu.admin.manage-handbook-list', link: '/system/manage-handbook-list', icon: 'fas fa-book-medical'
            },
            {
                name: 'menu.admin.manage-handbook', link: '/system/manage-handbook', icon: 'fas fa-pen-fancy'
            },
        ]
    },
    {
        name: 'menu.doctor.group-comm',
        menus: [
            {
                name: 'menu.doctor.chat', link: '/system/doctor-chat', icon: 'fas fa-comments'
            },
            {
                name: 'menu.doctor.my-reviews', link: '/system/my-reviews', icon: 'fas fa-star'
            },
            {
                name: 'menu.doctor.waitlist', link: '/system/doctor-waitlist', icon: 'fas fa-user-clock'
            },
        ]
    }
];