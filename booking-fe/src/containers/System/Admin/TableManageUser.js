import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';

class TableManageUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userRedux: [],
            currentPage: 1,
            usersPerPage: 10,
            searchKeyword: ''
        }
    }

    componentDidMount() {
        this.props.fetchUserRedux();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.listUser !== this.props.listUser) {
            this.setState({
                userRedux: this.props.listUser
            })
        }
    }

    handleDeleteUser = (user) => {
        this.props.deleteUserRedux(user.id);
    }

    handleEditUser = (user) => {
        this.props.handleEditUserFromParentKey(user)
    }

    handleSearchChange = (event) => {
        this.setState({
            searchKeyword: event.target.value,
            currentPage: 1 // Reset to first page on search
        });
    }

    handlePageChange = (pageNumber) => {
        this.setState({
            currentPage: pageNumber
        });
    }

    render() {
        let { userRedux, currentPage, usersPerPage, searchKeyword } = this.state;

        // Filter users based on search keyword
        let filteredUsers = userRedux.filter(item => {
            const keyword = searchKeyword.toLowerCase();
            return (
                (item.email && item.email.toLowerCase().includes(keyword)) ||
                (item.firstName && item.firstName.toLowerCase().includes(keyword)) ||
                (item.lastName && item.lastName.toLowerCase().includes(keyword))
            );
        });

        // Calculate pagination
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

        return (
            <React.Fragment>
                <div className="mb-3 col-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by email, name..."
                        value={searchKeyword}
                        onChange={this.handleSearchChange}
                    />
                </div>

                <table id="TableManageUser">
                    <tbody>
                        <tr>
                            <th>STT</th>
                            <th>Email</th>
                            <th>Image</th>
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Address</th>
                            <th>Vai trò</th>
                            <th>Chức danh</th>
                            <th>Action</th>
                        </tr>
                        {currentUsers && currentUsers.length > 0 ? (
                            currentUsers.map((item, index) => {
                                let imageBase64 = '';
                                if (item.image) {
                                    imageBase64 = new Buffer(item.image, 'base64').toString('binary');
                                }
                                return (
                                    <tr key={index}>
                                        <td>{indexOfFirstUser + index + 1}</td>
                                        <td>{item.email}</td>
                                        <td>
                                            <div className="user-avatar"
                                                style={{
                                                    backgroundImage: `url(${imageBase64})`,
                                                    width: '30px',
                                                    height: '30px',
                                                    backgroundSize: 'cover',
                                                    borderRadius: '50%',
                                                    margin: '0 auto'
                                                }}>
                                            </div>
                                        </td>
                                        <td>{item.firstName}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.address}</td>
                                        <td>{item.roleData ? item.roleData.valueVi : ''}</td>
                                        <td>{item.positionData ? item.positionData.valueVi : ''}</td>
                                        <td>
                                            <button onClick={() => this.handleEditUser(item)}
                                                className="btn-edit" ><i className="fas fa-pencil-alt" ></i></button>
                                            <button onClick={() => this.handleDeleteUser(item)}
                                                className="btn-delete" ><i className=" fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>No data found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="user-pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => this.handlePageChange(currentPage - 1)}
                        >
                            &laquo;
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={currentPage === i + 1 ? 'active' : ''}
                                onClick={() => this.handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => this.handlePageChange(currentPage + 1)}
                        >
                            &raquo;
                        </button>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        listUser: state.admin.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
        deleteUserRedux: (id) => dispatch(actions.deleteUser(id))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
