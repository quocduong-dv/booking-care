import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './UserManage.scss';
import { getAllUsers, createNewUserService, deleteUserService, editUserService } from '../../services/userService';
import ModalUser from './ModalUser';
import { emitter } from "../../utils/emitter";
import ModalEditUser from './ModalEditUser';
class UserManage extends Component {

    // state = {

    // }
    constructor(props) {
        super(props);
        this.state = {
            arrUsers: [], //  value khơi tạo là mảng rỗng
            isOpenModalUses: false,
            isOpenModalEditUser: false,
            userEdit: {}
        }
    }
    async componentDidMount() {
        await this.getAllUserFromReact();

    }
    getAllUserFromReact = async () => {
        let response = await getAllUsers('ALL', 'R3');
        if (response && response.errCode === 0) {
            this.setState({
                arrUsers: response.users
            })
        }
    }
    handleAddNewUser = () => {
        this.setState({
            isOpenModalUses: true,
        })

    }
    toggleUseModal = () => {
        this.setState({
            isOpenModalUses: !this.state.isOpenModalUses,
        })

    }
    toggleUseEditModal = () => {
        this.setState({
            isOpenModalEditUser: !this.state.isOpenModalEditUser,

        })
    }
    createNewUser = async (data) => {
        try {
            data.roleId = 'R3'; // Default to Patient
            let response = await createNewUserService(data);
            if (response && response.errCode !== 0) {
                alert(response.errMessage)
            } else {
                await this.getAllUserFromReact();
                this.setState({
                    isOpenModalUses: false  // add modal tu tat khi add user
                })
                emitter.emit('EVENT_CLEAR_MODAL_DATA', { 'id': 'your id' })
            }

        } catch (e) {
            console.log(e)
        }

    }
    handleDeleteUser = async (user) => {
        console.log('click delete', user)
        try {
            let res = await deleteUserService(user.id);
            if (res && res.errCode === 0) {
                await this.getAllUserFromReact(); // tự load lại trang
            } else {
                alert(res.errMessage)
            }
        } catch (e) {
            console.log(e)
        }
    }
    handleEditUser = (user) => {
        console.log('check edit user:', user);
        this.setState({
            isOpenModalEditUser: true,
            userEdit: user
        })
    }
    doEditUser = async (user) => {
        try {
            let res = await editUserService(user);
            if (res && res.errCode === 0) {
                this.setState({
                    isOpenModalEditUser: false
                })
                await this.getAllUserFromReact() // reset all user
            } else {
                alert(res.errCode)
            }
        } catch (e) {
            console.log(e);
        }


    }
    /** Life cycle
     * run component:
     * 1.Run construct -> init state
     * 2. Did mount(set state)
     * 3. Render
     * 
     */

    render() {

        let arrUsers = this.state.arrUsers;
        //properties
        return (
            <div className="users-container">
                <ModalUser isOpen={this.state.isOpenModalUses}
                    toggleFromParent={this.toggleUseModal}
                    createNewUser={this.createNewUser} />

                {/* if isOpenModalEditUser== true -> run colum 112 to 116 .and if = else --> not show modal
                     */}
                {this.state.isOpenModalEditUser &&
                    <ModalEditUser isOpen={this.state.isOpenModalEditUser}
                        toggleFromParent={this.toggleUseEditModal}
                        currentUser={this.state.userEdit}
                        editUser={this.doEditUser}
                    />
                }
                <div className="title text-center" > Mange user with Quốc Dương</div>
                <div className="mx-1">
                    <button className="btn btn-primary px-3"
                        onClick={() => this.handleAddNewUser()}><i className="fas fa-plus"></i>Add new users</button>
                </div>
                <div className="users-table mt-3 mx-1">
                    <table id="customers">
                        <tbody>
                            <tr>
                                <th>Email</th>
                                <th>First name</th>
                                <th>Last name</th>
                                <th> Address</th>
                                <th>Action</th>
                            </tr>

                            {arrUsers && arrUsers.map((item, index) => {

                                return (
                                    <tr key={index}>
                                        <td>{item.email}</td>
                                        <td>{item.firstName}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.address}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => this.handleEditUser(item)}><i className="fas fa-pencil-alt" ></i></button>
                                            <button className="btn-delete" onClick={() => this.handleDeleteUser(item)}><i className=" fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                )
                            })
                            }


                        </tbody>
                    </table>

                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
